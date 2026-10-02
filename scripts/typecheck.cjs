const { spawn } = require('node:child_process');
const { acquireTypecheckLock } = require('../server/dev-resource-guard.cjs');

let release;
try {
  release = acquireTypecheckLock();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
process.once('exit', release);
let child;
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => child?.kill(signal));
}

function run(entry, args, onSuccess) {
  child = spawn(process.execPath, ['--max-old-space-size=2048', entry, ...args], { stdio: 'inherit' });
  child.once('error', () => {
    console.error('Could not start the static verification step.');
    process.exit(1);
  });
  child.once('exit', (code, signal) => {
    if (code !== 0) process.exit(code ?? (signal === 'SIGINT' ? 130 : 143));
    if (onSuccess) onSuccess();
    else process.exit(0);
  });
}

// Next's live .next/dev declarations can be partially rewritten during HMR.
// Generate a stable route snapshot and check it separately from that live tree.
run(require.resolve('next/dist/bin/next'), ['typegen'], () => {
  run(require.resolve('typescript/lib/tsc.js'), [
    '--noEmit', '--project', 'tsconfig.check.json', ...process.argv.slice(2),
  ]);
});