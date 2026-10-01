/* eslint-disable @typescript-eslint/no-require-imports */

const MIN_INTERVAL_MS = 3000;
const MAX_INTERVAL_MS = 60000;

function boundedInterval(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 10000;
  return Math.max(MIN_INTERVAL_MS, Math.min(MAX_INTERVAL_MS, Math.floor(parsed)));
}

function loadProviderModule() {
  // Provider/persistence are loaded without importing the worker or Prisma.
  return require('../lib/whatsapp/provider.ts');
}

function loadWorkerModule() {
  return require('../lib/whatsapp/worker.ts');
}

function createWhatsAppWorkerRunner(options = {}) {
  const providerStatus = options.providerStatus || (() => loadProviderModule().whatsappProviderStatus());
  const createProvider = options.createProvider || ((accountId) => loadProviderModule().createWhatsAppProvider(accountId));
  const createWorker = options.createWorker || ((providerFactory) => {
    const { WhatsAppOutboxWorker } = loadWorkerModule();
    return new WhatsAppOutboxWorker(undefined, providerFactory);
  });
  const setIntervalFn = options.setIntervalFn || setInterval;
  const clearIntervalFn = options.clearIntervalFn || clearInterval;
  const onError = options.onError || ((error) => console.error('⚠️ WhatsApp worker error:', error));
  const intervalMs = boundedInterval(options.intervalMs || process.env.PHASE8_WHATSAPP_WORKER_INTERVAL_MS);
  let timer = null;
  let inFlight = false;
  let stopped = false;
  let activeTickPromise = null;

  async function executeTick() {
    if (stopped || inFlight) return { processed: false, reason: 'OVERLAP_OR_STOPPED' };

    // This preflight must remain before createWorker: importing the worker
    // imports Prisma. Unavailable deployments therefore perform no DB work.
    let state;
    try {
      state = await providerStatus();
    } catch (error) {
      onError(error);
      return { processed: false, reason: 'PREFLIGHT_FAILED' };
    }
    if (!state || state.status === 'PROVIDER_UNAVAILABLE' || state.persistence !== 'PERSISTENCE_CONFIGURED') {
      return { processed: false, reason: 'PROVIDER_UNAVAILABLE' };
    }

    inFlight = true;
    try {
      const worker = createWorker(createProvider);
      return await worker.drainOnce();
    } catch (error) {
      onError(error);
      return { processed: false, reason: 'WORKER_ERROR' };
    } finally {
      inFlight = false;
    }
  }

  function tick() {
    if (stopped) return Promise.resolve({ processed: false, reason: 'OVERLAP_OR_STOPPED' });
    if (activeTickPromise) return Promise.resolve({ processed: false, reason: 'OVERLAP_OR_STOPPED' });
    const current = executeTick();
    activeTickPromise = current.finally(() => {
      if (activeTickPromise === settled) activeTickPromise = null;
    });
    const settled = activeTickPromise;
    return current;
  }

  function start() {
    if (timer || stopped) return stop;
    stopped = false;
    void tick();
    timer = setIntervalFn(() => { void tick(); }, intervalMs);
    if (timer && typeof timer.unref === 'function') timer.unref();
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
    isInFlight: () => inFlight,
  };
}

function startWhatsAppWorkerRunner() {
  if (process.env.PHASE8_WHATSAPP_WORKER_ENABLED === 'false') {
    return () => {};
  }
  // tsx is a production dependency in this application. Registering it here
  // keeps the canonical CommonJS server able to load the TS service boundary.
  require('tsx/cjs');
  return createWhatsAppWorkerRunner().start();
}

module.exports = {
  boundedInterval,
  createWhatsAppWorkerRunner,
  startWhatsAppWorkerRunner,
};