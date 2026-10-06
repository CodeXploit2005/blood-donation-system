// Start the client only after the API is ready, so Vite can proxy immediately.
const { spawn } = require('node:child_process');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const env = { ...process.env };
if (process.argv.includes('--local')) env.LOCAL_DB = 'true';
require('../server/node_modules/dotenv').config({ path: path.join(root, 'server/.env'), processEnv: env });
const target = `http://127.0.0.1:${env.PORT || 5000}`;
env.API_PROXY_TARGET = target;
const children = [];
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (process.platform === 'win32' && child.pid) {
      spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true });
    } else child.kill();
  }
  process.exitCode = code;
}
function start(script, args, cwd) {
  const child = spawn(process.execPath, [path.join(root, script), ...args], { cwd: path.join(root, cwd), env, stdio: 'inherit' });
  children.push(child);
  child.on('error', error => { console.error(error.message); stop(1); });
  child.on('exit', code => { if (!stopping) stop(code || 0); });
  return child;
}
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
async function main() {
  try {
    await fetch(`${target}/api/health`, { signal: AbortSignal.timeout(1000) });
    throw new Error(`Cổng backend đã được sử dụng: ${target}. Dừng phiên cũ trước khi chạy.`);
  } catch (error) {
    if (error.message.startsWith('Cổng backend')) throw error;
  }
  start('server/node_modules/tsx/dist/cli.mjs', ['watch', 'src/server.ts'], 'server');
  const deadline = Date.now() + 90000;
  while (!stopping && Date.now() < deadline) {
    try {
      const response = await fetch(`${target}/api/health`, { signal: AbortSignal.timeout(1000) });
      if (response.ok) {
        start('client/node_modules/vite/bin/vite.js', [], 'client');
        return;
      }
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  if (!stopping) { console.error('Backend chưa sẵn sàng sau 90 giây. Kiểm tra MongoDB hoặc chạy npm run dev:local.'); stop(1); }
}
main().catch(error => { console.error(error.message); stop(1); });
