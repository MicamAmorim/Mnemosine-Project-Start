import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { join } from 'node:path';

const root = process.cwd();
const dist = join(root, 'dist');
const generatorDir = join(root, '03_Gerador');
const bundleDir = join(generatorDir, 'generator_bundle');

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

cpSync(join(root, 'index.html'), join(dist, 'index.html'));
cpSync(generatorDir, join(dist, '03_Gerador'), { recursive: true });
cpSync(join(root, '04_Assets'), join(dist, '04_Assets'), { recursive: true });

let payload = '';
for (let i = 1; i <= 7; i++) {
  const name = `v23_${String(i).padStart(2, '0')}.js`;
  const src = readFileSync(join(bundleDir, name), 'utf8');
  const match = src.match(/\+'([^']+)'\s*;?\s*$/s);
  if (!match) throw new Error(`Não foi possível extrair o payload de ${name}`);
  payload += match[1];
}

payload = payload.replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/');
while (payload.length % 4) payload += '=';

const compressed = Buffer.from(payload, 'base64');
if (compressed.length < 2 || compressed[0] !== 0x1f || compressed[1] !== 0x8b) {
  throw new Error(`Bundle inválido: assinatura gzip ausente (${compressed.length} bytes)`);
}

const html = gunzipSync(compressed).toString('utf8');
if (!/^<!doctype html>/i.test(html.trim())) {
  throw new Error('Bundle descompactado, mas o HTML não foi reconhecido');
}

writeFileSync(join(dist, '03_Gerador', 'Gerador_Casos_Mnemosine.html'), html, 'utf8');
rmSync(join(dist, '03_Gerador', 'generator_bundle'), { recursive: true, force: true });

console.log(`MNEMOSINE: gerador estático criado (${Buffer.byteLength(html)} bytes).`);
