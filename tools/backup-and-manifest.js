const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');

const ROOT = process.cwd();
const TS   = new Date().toISOString().replace(/[:.]/g, '-');
const OUT  = path.join(ROOT, 'backups', TS);
const TGZ  = path.join(OUT, 'repo.tar.gz');
const MANI = path.join(OUT, 'manifest.json');

const EXCLUDES = new Set(['node_modules', '.git', 'backups', 'archive']);

async function walk(dir, base = '') {
  const items = await fsp.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const it of items) {
    if (EXCLUDES.has(it.name)) continue;
    const rel = path.join(base, it.name);
    const abs = path.join(dir, it.name);
    if (it.isDirectory()) files.push(...await walk(abs, rel));
    else files.push({ abs, rel });
  }
  return files;
}

function sha256File(abs) {
  return new Promise((resolve, reject) => {
    const h = crypto.createHash('sha256');
    fs.createReadStream(abs).on('data', d => h.update(d))
      .on('error', reject).on('end', () => resolve(h.digest('hex')));
  });
}

async function tarGz(files) {
  const tar = require('tar-stream');
  const pack = tar.pack();
  await fsp.mkdir(OUT, { recursive: true });
  const gzip = zlib.createGzip({ level: 9 });
  const out  = fs.createWriteStream(TGZ);
  pack.pipe(gzip).pipe(out);

  for (const f of files) {
    const st = await fsp.stat(f.abs);
    await new Promise((res, rej) => {
      const entry = pack.entry({ name: f.rel, size: st.size, mode: st.mode, mtime: st.mtime }, err => err && rej(err));
      const rs = fs.createReadStream(f.abs);
      rs.on('error', rej);
      rs.on('end', () => entry.end(res));
      rs.pipe(entry);
    });
  }
  pack.finalize();
  await new Promise((res, rej) => out.on('close', res).on('error', rej));
}

(async () => {
  const files = await walk(ROOT);
  const manifest = [];
  for (const f of files) {
    const st = await fsp.stat(f.abs);
    manifest.push({ path: f.rel, bytes: st.size, sha256: await sha256File(f.abs) });
  }
  await fsp.mkdir(OUT, { recursive: true });
  await fsp.writeFile(MANI, JSON.stringify({ createdAt: TS, count: manifest.length, files: manifest }, null, 2));
  await tarGz(files);
  console.log('✅ Backup complete:', OUT);
})();
