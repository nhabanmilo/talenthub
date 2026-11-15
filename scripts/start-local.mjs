import { existsSync, readFileSync, unlinkSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(root);
const require = createRequire(import.meta.url);
const missing = [];
for (const name of ['@cspotcode/source-map-support', 'miniflare', 'typescript']) {
  try { require.resolve(name); } catch { missing.push(name); }
}
const cli = resolve(root, 'node_modules/vinext/dist/cli.js');
if (!existsSync(cli)) missing.push('vinext');
if (missing.length) {
  console.error('Thieu thu vien: ' + missing.join(', '));
  console.error('Dong cua so may chu cu, chay npm install trong thu muc talenthub, roi mo lai.');
  process.exit(1);
}
if (process.argv.includes('--check-only')) {
  console.log('OK: cac thu vien khoi dong da day du.');
  process.exit(0);
}
const url = 'http://localhost:3001';
async function ready() {
  try {
    const response = await fetch(url + '/api/data', { signal: AbortSignal.timeout(2000) });
    if (!response.ok) return false;
    const data = await response.json();
    return Array.isArray(data.jobs) && Object.hasOwn(data, 'user');
  } catch { return false; }
}
function open() {
  console.log('TalentHub da san sang: ' + url);
  if (process.platform === 'win32') {
    const browser = spawn('cmd.exe', ['/d', '/c', 'start', '', url], { windowsHide:true, stdio:'ignore' });
    browser.on('error', () => console.log('Mo trinh duyet tai ' + url));
  }
}
if (await ready()) { open(); process.exitCode = 0; }
else {
  const lockPath = resolve(root, '.vinext/dev/lock.json');
  try {
    const lock = JSON.parse(readFileSync(lockPath, 'utf8'));
    if (resolve(lock.cwd).toLowerCase() === root.toLowerCase() && Number.isInteger(lock.pid) && lock.pid > 0) {
      try { process.kill(lock.pid, 0); }
      catch (error) { if (error.code === 'ESRCH') unlinkSync(lockPath); }
    }
  } catch { /* The CLI handles absent or unreadable locks. */ }
  console.log('Dang khoi dong TalentHub. Giu cua so nay mo khi su dung web.');
  const server = spawn(process.execPath, [cli, 'dev', '--port', '3001'], {
    cwd:root, stdio:'inherit', windowsHide:true,
    env:{...process.env, WRANGLER_LOG_PATH:resolve(root,'.wrangler/logs'), WRANGLER_SEND_METRICS:'false'},
  });
  let stopped = false;
  server.on('error', error => { stopped = true; console.error(error.message); process.exitCode = 1; });
  server.on('exit', code => { stopped = true; process.exitCode = code || 0; });
  for (let i = 0; i < 60 && !stopped; i++) {
    if (await ready()) { open(); break; }
    if (i === 59) console.error('May chu chua san sang. Xem thong bao loi trong cua so nay.');
    else await new Promise(r => setTimeout(r, 1500));
  }
}
