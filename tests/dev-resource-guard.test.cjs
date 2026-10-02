const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { isTypecheckCommand, isDevServerCommand, lockIsActive, acquireTypecheckLock } = require('../server/dev-resource-guard.cjs');

test('resource guard distinguishes project checks from editor services', () => {
  assert.equal(isTypecheckCommand(['node', '/workspace/node_modules/typescript/bin/tsc', '--noEmit']), true);
  assert.equal(isTypecheckCommand(['node', '/workspace/node_modules/typescript/lib/tsc.js']), true);
  assert.equal(isTypecheckCommand(['node', '/workspace/node_modules/typescript/lib/tsserver.js']), false);
  assert.equal(isTypecheckCommand(['node', '/workspace/scripts/typecheck.cjs']), false);
  assert.equal(isDevServerCommand(['node', 'start-server.js']), true);
  assert.equal(isDevServerCommand(['node', '/workspace/node_modules/.bin/next', 'dev']), true);
  assert.equal(isDevServerCommand(['node', 'unrelated.js']), false);
});

test('resource lock detects owners, rejects overlap, and releases its own file', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'befluent-resource-test-'));
  const file = path.join(directory, 'check.lock');
  try {
    assert.equal(lockIsActive(file), false);
    const release = acquireTypecheckLock(file, []);
    assert.equal(lockIsActive(file), true);
    assert.throws(() => acquireTypecheckLock(file, []), /Another TypeScript check/);
    release();
    assert.equal(lockIsActive(file), false);
    fs.writeFileSync(file, '');
    assert.equal(lockIsActive(file), true);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('process policy refuses live previews and other project checks before locking', () => {
  assert.throws(() => acquireTypecheckLock(undefined, [['node', '--max-old-space-size=2048', 'start-server.js']]), /Pause the Be Fluent preview/);
  assert.throws(() => acquireTypecheckLock(undefined, [['node', '/workspace/node_modules/typescript/lib/tsc.js']]), /Another TypeScript check/);
});