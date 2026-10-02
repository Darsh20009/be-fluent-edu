const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const lockPath = path.join(os.tmpdir(), 'befluent-typecheck.lock');

function isTypecheckCommand(args) {
  return args.slice(1).some((arg) => ['tsc', 'tsc.js'].includes(path.basename(arg)));
}

function isDevServerCommand(args) {
  return args.slice(1).some((arg) => path.basename(arg) === 'start-server.js')
    || args.some((arg, index) => path.basename(arg) === 'next' && args[index + 1] === 'dev');
}

function nodeCommands() {
  const commands = [];
  for (const pid of fs.readdirSync('/proc').filter((name) => /^\d+$/.test(name))) {
    if (Number(pid) === process.pid) continue;
    try {
      const name = fs.readFileSync(`/proc/${pid}/comm`, 'utf8').trim();
      if (!['node', 'MainThread'].includes(name)) continue;
      commands.push(fs.readFileSync(`/proc/${pid}/cmdline`, 'utf8').split('\0').filter(Boolean));
    } catch {
      // Processes can exit between enumeration and inspection.
    }
  }
  return commands;
}

function lockIsActive(file = lockPath) {
  try {
    const pid = Number(fs.readFileSync(file, 'utf8').trim());
    if (!Number.isInteger(pid) || pid <= 0) return true; // Another owner may still be writing.
    try {
      process.kill(pid, 0);
      return true;
    } catch (error) {
      return error.code !== 'ESRCH';
    }
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
}

function assertStaticChecksIdle() {
  if (lockIsActive() || nodeCommands().some(isTypecheckCommand)) {
    throw new Error('Finish the running TypeScript check before starting the development preview.');
  }
}

function acquireTypecheckLock(file = lockPath, commands = nodeCommands()) {
  if (commands.some(isDevServerCommand)) {
    throw new Error('Pause the Be Fluent preview before running npm run typecheck; restart it after the check.');
  }
  if (lockIsActive(file) || commands.some(isTypecheckCommand)) {
    throw new Error('Another TypeScript check is running. Run only one project check at a time.');
  }
  let fd;
  try {
    // Exclusive creation is the atomic gate. Never unlink before acquiring:
    // another checker could have created its live lock since inspection.
    fd = fs.openSync(file, 'wx', 0o600);
  } catch (error) {
    if (error.code === 'EEXIST') {
      throw new Error(`TypeScript lock already exists at ${file}. If its owner exited abnormally, confirm no check is running before removing the stale lock.`);
    }
    throw error;
  }
  fs.writeFileSync(fd, String(process.pid));
  fs.closeSync(fd);
  return () => {
    try {
      if (fs.readFileSync(file, 'utf8').trim() === String(process.pid)) fs.unlinkSync(file);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  };
}

module.exports = { assertStaticChecksIdle, acquireTypecheckLock, isTypecheckCommand, isDevServerCommand, lockIsActive };