const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');

function nowTs() {
  return new Date().toISOString().replace(/[:]/g, '-').replace(/\..+/, 'Z');
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function write(p, data) {
  ensureDir(path.dirname(p));
  fs.writeFileSync(p, data);
}

function readEnvFileIfExists(filePath, env) {
  if (fs.existsSync(filePath)) {
    const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
    for (const line of lines) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      const k = m[1];
      let v = m[2];
      // Strip surrounding quotes if present
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      env[k] = v;
    }
  }
}

function curl(url, timeoutMs = 8000) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () =>
        resolve({ ok: true, status: res.statusCode, headers: res.headers, body })
      );
    });
    req.on('error', (err) => resolve({ ok: false, error: err.message }));
    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error('timeout'));
    });
  });
}

async function waitForPort(host, port, attempts = 30, pauseMs = 2000) {
  for (let i = 0; i < attempts; i++) {
    const res = await curl(`http://${host}:${port}/health`);
    if (res.ok && typeof res.status === 'number') return true;
    await new Promise((r) => setTimeout(r, pauseMs));
  }
  return false;
}

(async () => {
  const projectRoot = path.resolve(__dirname, '..'); // tools/.. = root
  process.chdir(projectRoot);

  const ts = nowTs();
  const runDir = path.join(projectRoot, 'audit', 'runs', ts);
  ensureDir(runDir);

  // Base env (file-driven to avoid shell)
  const env = { ...process.env };
  env.NODE_ENV = 'staging';
  env.PORT = env.PORT || '3000';
  // Feature flags (defaults)
  env.USE_OPTIMIZED_ENTRY = env.USE_OPTIMIZED_ENTRY ?? 'false';
  env.USE_OPTIMIZED_FEATURES = env.USE_OPTIMIZED_FEATURES ?? 'false';
  env.ENABLE_COMPRESSION = env.ENABLE_COMPRESSION ?? 'true';
  env.ENABLE_METRICS = env.ENABLE_METRICS ?? 'true';
  env.ENABLE_REQUEST_LOGGING = env.ENABLE_REQUEST_LOGGING ?? 'true';

  // Load file-based env if present (root-level .env.staging)
  readEnvFileIfExists(path.join(projectRoot, '.env.staging'), env);

  // Snapshot env (non-secret)
  write(
    path.join(runDir, 'env-staging-snapshot.txt'),
    `ENV SNAPSHOT (non-secret):
NODE_ENV=${env.NODE_ENV}
PORT=${env.PORT}
USE_OPTIMIZED_ENTRY=${env.USE_OPTIMIZED_ENTRY}
USE_OPTIMIZED_FEATURES=${env.USE_OPTIMIZED_FEATURES}
ENABLE_COMPRESSION=${env.ENABLE_COMPRESSION}
ENABLE_METRICS=${env.ENABLE_METRICS}
ENABLE_REQUEST_LOGGING=${env.ENABLE_REQUEST_LOGGING}
`
  );

  const stdoutPath = path.join(runDir, 'staging-stdout.log');
  const stderrPath = path.join(runDir, 'staging-stderr.log');

  // Prefer canonical entry (no shell)
  const candidates = [
    ['node', [path.join(projectRoot, 'src', 'index.canonical.js')]],
    ['node', [path.join(projectRoot, 'src', 'index.js')]],
  ];

  let child = null;
  let started = false;

  for (const [cmd, args] of candidates) {
    write(path.join(runDir, 'bringup-attempts.txt'), `TRY: ${cmd} ${args.join(' ')}\n`);

    child = spawn(cmd, args, { env, cwd: projectRoot });

    const outStream = fs.createWriteStream(stdoutPath, { flags: 'a' });
    const errStream = fs.createWriteStream(stderrPath, { flags: 'a' });
    child.stdout.pipe(outStream);
    child.stderr.pipe(errStream);

    // Wait for port to respond
    started = await waitForPort('127.0.0.1', Number(env.PORT));
    if (started) break;

    // Stop this attempt and try next
    try { child.kill(); } catch {}
    fs.appendFileSync(path.join(runDir, 'bringup-attempts.txt'), `PORT NOT LISTENING after ${cmd}\n`);
  }

  if (!started) {
    fs.appendFileSync(path.join(runDir, 'bringup-fail.txt'), 'FAILED: server never reached /health.\n');
    console.log(`FAILED: server never reached /health. See ${runDir}`);
    process.exit(2);
  }

  // Health probes (with fallbacks)
  const smokePath = path.join(runDir, 'smoke-unit3.txt');
  const probes = [
    `/health`,
    `/healthz`,
    `/`,
  ];
  fs.writeFileSync(smokePath, '===== HEALTH PROBES =====\n');
  let ok200 = false;
  for (const p of probes) {
    fs.appendFileSync(smokePath, `\n== http://127.0.0.1:${env.PORT}${p} ==\n`);
    const res = await curl(`http://127.0.0.1:${env.PORT}${p}`);
    if (res.ok) {
      fs.appendFileSync(smokePath, `Status: ${res.status}\nHeaders: ${JSON.stringify(res.headers)}\nBody:\n${(res.body || '').slice(0, 2000)}\n`);
      if (res.status === 200) ok200 = true;
    } else {
      fs.appendFileSync(smokePath, `ERROR: ${res.error}\n`);
    }
  }

  // /metrics
  fs.appendFileSync(smokePath, `\n===== /metrics =====\n`);
  const mRes = await curl(`http://127.0.0.1:${env.PORT}/metrics`);
  if (mRes.ok) {
    fs.appendFileSync(smokePath, `Status: ${mRes.status}\n`);
  } else {
    fs.appendFileSync(smokePath, `ERROR /metrics: ${mRes.error}\n`);
  }

  // Optional: run test-smoke-unit3.js if present
  const testPath = path.join(projectRoot, 'test-smoke-unit3.js');
  if (fs.existsSync(testPath)) {
    fs.appendFileSync(smokePath, `\n===== node test-smoke-unit3.js =====\n`);
    await new Promise((resolve) => {
      const t = spawn(process.execPath, [testPath], { env, cwd: projectRoot });
      t.stdout.on('data', (d) => fs.appendFileSync(smokePath, d.toString()));
      t.stderr.on('data', (d) => fs.appendFileSync(smokePath, d.toString()));
      t.on('close', () => resolve());
    });
  }

  // Verification markdown
  const md = `# Staging Verification — ${ts}

- Port: ${env.PORT}
- Health: ${ok200 ? 'OK (>=1 probe returned 200)' : 'NOT OK'}

## stdout (tail)
\`\`\`
${fs.existsSync(stdoutPath) ? fs.readFileSync(stdoutPath, 'utf8').split(/\r?\n/).slice(-80).join('\n') : '<no stdout>'}
\`\`\`

## stderr (tail)
\`\`\`
${fs.existsSync(stderrPath) ? fs.readFileSync(stderrPath, 'utf8').split(/\r?\n/).slice(-80).join('\n') : '<no stderr>'}
\`\`\`
`;
  write(path.join(runDir, 'staging-verification.md'), md);

  if (!ok200) {
    console.log(`FAILED: Health not 200. Artifacts in ${runDir}`);
    try { child.kill(); } catch {}
    process.exit(3);
  }

  console.log(`SUCCESS: Staging server healthy. Artifacts in ${runDir}`);
  // leave server running so the reviewer can poke at it
})();


