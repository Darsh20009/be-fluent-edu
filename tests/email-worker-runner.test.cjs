/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const test = require('node:test');
const { createEmailWorkerRunner, boundedInterval } = require('../server/email-worker-runner.cjs');

function readyOptions(overrides = {}) {
  return {
    enabled: () => true,
    databaseEnabled: () => true,
    providerStatus: () => ({ configured: true, environment: 'test' }),
    createWorker: () => ({ drainOnce: async () => ({ processed: false, reason: 'NO_DUE_WORK' }) }),
    ...overrides,
  };
}

test('email runner remains disabled unless explicitly enabled', async () => {
  let workerCreates = 0;
  const runner = createEmailWorkerRunner({
    ...readyOptions({ enabled: () => false }),
    createWorker: () => { workerCreates += 1; },
  });
  assert.deepEqual(await runner.tick(), { processed: false, reason: 'DISABLED' });
  assert.equal(workerCreates, 0);
});

test('email runner requires database and Qirox readiness before loading a worker', async () => {
  let workerCreates = 0;
  const dbDisabled = createEmailWorkerRunner({
    ...readyOptions({ databaseEnabled: () => false }),
    createWorker: () => { workerCreates += 1; },
  });
  assert.deepEqual(await dbDisabled.tick(), { processed: false, reason: 'DATABASE_UNAVAILABLE' });
  const providerDisabled = createEmailWorkerRunner({
    ...readyOptions({ providerStatus: () => ({ configured: false, reason: 'MISSING_API_KEY' }) }),
    createWorker: () => { workerCreates += 1; },
  });
  assert.deepEqual(await providerDisabled.tick(), { processed: false, reason: 'PROVIDER_UNAVAILABLE' });
  assert.equal(workerCreates, 0);
});

test('email runner handles a ready outbox batch', async () => {
  let calls = 0;
  const runner = createEmailWorkerRunner(readyOptions({
    batchSize: 2,
    createWorker: () => ({
      drainOnce: async () => {
        calls += 1;
        return calls <= 2
          ? { processed: true, status: 'SENT' }
          : { processed: false, reason: 'NO_DUE_WORK' };
      },
    }),
  }));
  assert.deepEqual(await runner.tick(), { processed: true, batchCount: 2 });
  assert.equal(calls, 2);
});

test('email runner prevents overlapping drains', async () => {
  let release;
  let calls = 0;
  const waiting = new Promise((resolve) => { release = resolve; });
  const runner = createEmailWorkerRunner(readyOptions({
    createWorker: () => ({
      drainOnce: async () => {
        calls += 1;
        await waiting;
        return { processed: false, reason: 'NO_DUE_WORK' };
      },
    }),
  }));
  const first = runner.tick();
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(await runner.tick(), { processed: false, reason: 'OVERLAP_OR_STOPPED' });
  release();
  await first;
  assert.equal(calls, 1);
});

test('email runner backs off after worker failure without logging error details', async () => {
  let clock = 1000;
  let calls = 0;
  const errors = [];
  const runner = createEmailWorkerRunner(readyOptions({
    now: () => clock,
    intervalMs: 3000,
    onError: (code) => errors.push(code),
    createWorker: () => ({
      drainOnce: async () => {
        calls += 1;
        throw new Error('student@example.test PRIVATE MESSAGE API KEY');
      },
    }),
  }));
  assert.deepEqual(await runner.tick(), { processed: false, reason: 'WORKER_ERROR' });
  assert.deepEqual(await runner.tick(), { processed: false, reason: 'BACKOFF' });
  assert.equal(calls, 1);
  assert.deepEqual(errors, ['WORKER_ERROR']);
  clock += 6000;
  assert.deepEqual(await runner.tick(), { processed: false, reason: 'WORKER_ERROR' });
});

test('email runner stop clears its timer and waits for in-flight work', async () => {
  let release;
  let intervalCallback;
  let cleared = false;
  const waiting = new Promise((resolve) => { release = resolve; });
  const runner = createEmailWorkerRunner(readyOptions({
    createWorker: () => ({ drainOnce: async () => {
      await waiting;
      return { processed: false, reason: 'NO_DUE_WORK' };
    } }),
    setIntervalFn: (callback) => {
      intervalCallback = callback;
      return { unref() {} };
    },
    clearIntervalFn: () => { cleared = true; },
  }));
  runner.start();
  await new Promise((resolve) => setImmediate(resolve));
  const stopping = runner.stop({ timeoutMs: 3000 });
  intervalCallback();
  assert.deepEqual(await runner.tick(), { processed: false, reason: 'OVERLAP_OR_STOPPED' });
  release();
  assert.deepEqual(await stopping, { settled: true, timedOut: false });
  assert.equal(cleared, true);
  assert.equal(runner.isRunning(), false);
});

test('email runner interval is bounded', () => {
  assert.equal(boundedInterval(100), 3000);
  assert.equal(boundedInterval(999999), 60000);
});