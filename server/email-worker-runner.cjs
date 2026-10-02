/* eslint-disable @typescript-eslint/no-require-imports */

const MIN_INTERVAL_MS = 3000;
const MAX_INTERVAL_MS = 60000;
const DEFAULT_INTERVAL_MS = 10000;
const MAX_BATCH_SIZE = 10;
const DEFAULT_MAX_TICK_MS = 30000;
const MAX_TICK_MS = 60000;
const SINGLETON_KEY = Symbol.for('befluent.emailOutboxRunner');

function boundedInterval(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return DEFAULT_INTERVAL_MS;
  return Math.max(MIN_INTERVAL_MS, Math.min(MAX_INTERVAL_MS, Math.floor(parsed)));
}

function boundedBatchSize(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return MAX_BATCH_SIZE;
  return Math.max(1, Math.min(MAX_BATCH_SIZE, Math.floor(parsed)));
}

function boundedTickMs(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return DEFAULT_MAX_TICK_MS;
  return Math.max(1000, Math.min(MAX_TICK_MS, Math.floor(parsed)));
}

function loadEmailModule() {
  return require('../lib/email.ts');
}

function loadWorkerModule() {
  return require('../lib/email-outbox-worker.ts');
}

function createEmailWorkerRunner(options = {}) {
  const enabled = options.enabled !== undefined
    ? options.enabled
    : () => process.env.EMAIL_OUTBOX_AUTORUN === 'true';
  const databaseEnabled = options.databaseEnabled || (() => process.env.PHASE5_DATABASE_ENABLED === 'true');
  const providerStatus = options.providerStatus || (() => loadEmailModule().qiroxEmailProviderStatus());
  const createWorker = options.createWorker || (() => {
    const { EmailOutboxWorker } = loadWorkerModule();
    return new EmailOutboxWorker();
  });
  const setIntervalFn = options.setIntervalFn || setInterval;
  const clearIntervalFn = options.clearIntervalFn || clearInterval;
  const now = options.now || Date.now;
  const onError = options.onError || ((code) => console.error(`⚠️ Email worker ${code}`));
  const intervalMs = boundedInterval(options.intervalMs || process.env.EMAIL_OUTBOX_WORKER_INTERVAL_MS);
  const batchSize = boundedBatchSize(options.batchSize || process.env.EMAIL_OUTBOX_WORKER_BATCH_SIZE);
  const maxTickMs = boundedTickMs(options.maxTickMs || process.env.EMAIL_OUTBOX_WORKER_MAX_TICK_MS);
  let timer = null;
  let stopped = false;
  let activeTickPromise = null;
  let failures = 0;
  let retryAfter = 0;

  function recordFailure(code) {
    failures = Math.min(failures + 1, 5);
    retryAfter = now() + Math.min(MAX_INTERVAL_MS, intervalMs * (2 ** failures));
    onError(code);
  }

  async function executeTick() {
    if (stopped) return { processed: false, reason: 'OVERLAP_OR_STOPPED' };
    if (!enabled()) return { processed: false, reason: 'DISABLED' };
    if (now() < retryAfter) return { processed: false, reason: 'BACKOFF' };
    if (!databaseEnabled()) return { processed: false, reason: 'DATABASE_UNAVAILABLE' };

    let status;
    try {
      status = await providerStatus();
    } catch {
      recordFailure('PREFLIGHT_FAILED');
      return { processed: false, reason: 'PREFLIGHT_FAILED' };
    }
    if (!status || status.configured !== true) {
      return { processed: false, reason: 'PROVIDER_UNAVAILABLE' };
    }

    const startedAt = now();
    let processedCount = 0;
    try {
      while (!stopped && processedCount < batchSize && now() - startedAt < maxTickMs) {
        const result = await createWorker().drainOnce();
        if (!result || result.processed !== true) {
          failures = 0;
          retryAfter = 0;
          return processedCount
            ? { processed: true, batchCount: processedCount }
            : result || { processed: false, reason: 'NO_DUE_WORK' };
        }
        processedCount += 1;
      }
      failures = 0;
      retryAfter = 0;
      return processedCount
        ? { processed: true, batchCount: processedCount }
        : { processed: false, reason: stopped ? 'OVERLAP_OR_STOPPED' : 'TIME_LIMIT' };
    } catch {
      recordFailure('WORKER_ERROR');
      return { processed: false, reason: 'WORKER_ERROR' };
    }
  }

  function tick() {
    if (stopped || activeTickPromise) {
      return Promise.resolve({ processed: false, reason: 'OVERLAP_OR_STOPPED' });
    }
    const current = executeTick();
    const wrapped = current.finally(() => {
      if (activeTickPromise === wrapped) activeTickPromise = null;
    });
    activeTickPromise = wrapped;
    return wrapped;
  }

  function start() {
    if (timer || stopped || !enabled()) return stop;
    timer = setIntervalFn(() => { void tick(); }, intervalMs);
    if (timer && typeof timer.unref === 'function') timer.unref();
    void tick();
    return stop;
  }

  async function stop(options = {}) {
    stopped = true;
    if (timer) {
      clearIntervalFn(timer);
      timer = null;
    }
    const active = activeTickPromise;
    if (!active) return { settled: true, timedOut: false };
    const timeoutMs = boundedInterval(options.timeoutMs || 5000);
    let timeoutHandle;
    const timeout = new Promise((resolve) => {
      timeoutHandle = setTimeout(() => resolve(false), timeoutMs);
    });
    const settled = await Promise.race([active.then(() => true, () => true), timeout]);
    clearTimeout(timeoutHandle);
    return { settled, timedOut: !settled };
  }

  return {
    start,
    stop,
    tick,
    intervalMs,
    isRunning: () => Boolean(timer) && !stopped,
    isInFlight: () => Boolean(activeTickPromise),
  };
}

function startEmailWorkerRunner() {
  if (process.env.EMAIL_OUTBOX_AUTORUN !== 'true'
    || process.env.PHASE5_DATABASE_ENABLED !== 'true') {
    return () => {};
  }

  const existing = globalThis[SINGLETON_KEY];
  if (existing && existing.isRunning()) return existing.stop;

  // Register TS support only when explicitly opted in and persistence is enabled.
  require('tsx/cjs');
  const runner = createEmailWorkerRunner();
  globalThis[SINGLETON_KEY] = runner;
  const stop = runner.start();
  return async (options) => {
    const result = await stop(options);
    if (globalThis[SINGLETON_KEY] === runner) delete globalThis[SINGLETON_KEY];
    return result;
  };
}

module.exports = {
  boundedBatchSize,
  boundedInterval,
  boundedTickMs,
  createEmailWorkerRunner,
  startEmailWorkerRunner,
};