/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const test = require('node:test');
const { createWhatsAppWorkerRunner, boundedInterval } = require('../server/whatsapp-worker-runner.cjs');

test('runtime runner performs provider preflight before loading worker or touching DB', async () => {
  let providerCreates = 0;
  let workerCreates = 0;
  const runner = createWhatsAppWorkerRunner({
    providerStatus: () => ({ status: 'PROVIDER_UNAVAILABLE', persistence: 'PERSISTENCE_UNAVAILABLE' }),
    createProvider: async () => { providerCreates += 1; },
    createWorker: () => { workerCreates += 1; },
  });
  assert.deepEqual(await runner.tick(), { processed: false, reason: 'PROVIDER_UNAVAILABLE' });
  assert.equal(providerCreates, 0);
  assert.equal(workerCreates, 0);
});

test('runtime runner prevents overlapping worker executions', async () => {
  let release;
  let workerCalls = 0;
  const waiting = new Promise((resolve) => { release = resolve; });
  const runner = createWhatsAppWorkerRunner({
    providerStatus: () => ({ status: 'CONNECTED', persistence: 'PERSISTENCE_CONFIGURED' }),
    createProvider: async () => ({ sendMessage: async () => ({ queued: false }) }),
    createWorker: () => ({
      drainOnce: async () => {
        workerCalls += 1;
        await waiting;
        return { processed: false, reason: 'NO_DUE_WORK' };
      },
    }),
  });
  const first = runner.tick();
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(await runner.tick(), { processed: false, reason: 'OVERLAP_OR_STOPPED' });
  release();
  await first;
  assert.equal(workerCalls, 1);
});

test('stop waits for an in-flight drain and prevents new ticks', async () => {
  let release;
  let workerCalls = 0;
  let intervalCallback;
  let cleared = false;
  const waiting = new Promise((resolve) => { release = resolve; });
  const runner = createWhatsAppWorkerRunner({
    providerStatus: () => ({ status: 'CONNECTED', persistence: 'PERSISTENCE_CONFIGURED' }),
    createProvider: async () => ({}),
    createWorker: () => ({
      drainOnce: async () => {
        workerCalls += 1;
        await waiting;
        return { processed: false, reason: 'NO_DUE_WORK' };
      },
    }),
    setIntervalFn: (callback) => {
      intervalCallback = callback;
      return { unref() {} };
    },
    clearIntervalFn: () => { cleared = true; },
  });
  runner.start();
  await new Promise((resolve) => setImmediate(resolve));
  const stopping = runner.stop({ timeoutMs: 3000 });
  assert.deepEqual(await runner.tick(), { processed: false, reason: 'OVERLAP_OR_STOPPED' });
  intervalCallback();
  assert.deepEqual(await runner.tick(), { processed: false, reason: 'OVERLAP_OR_STOPPED' });
  release();
  const result = await stopping;
  assert.deepEqual(result, { settled: true, timedOut: false });
  assert.equal(workerCalls, 1);
  assert.equal(cleared, true);
});

test('runner interval is bounded to safe pacing limits', () => {
  assert.equal(boundedInterval(100), 3000);
  assert.equal(boundedInterval(999999), 60000);
});