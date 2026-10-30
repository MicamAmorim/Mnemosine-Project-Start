import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { join } from 'node:path';

const root = process.cwd();
const generatorDir = join(root, '03_Gerador');
const bundleDir = join(generatorDir, 'generator_bundle');
const publicDir = join(root, 'public');

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

rmSync(publicDir, { recursive: true, force: true });
mkdirSync(publicDir, { recursive: true });
cpSync(join(root, 'index.html'), join(publicDir, 'index.html'));
cpSync(generatorDir, join(publicDir, '03_Gerador'), { recursive: true });
cpSync(join(root, '04_Assets'), join(publicDir, '04_Assets'), { recursive: true });
if (existsSync(join(root, '01_Documentos'))) {
  cpSync(join(root, '01_Documentos'), join(publicDir, '01_Documentos'), { recursive: true });
}

writeFileSync(join(publicDir, '03_Gerador', 'Gerador_Casos_Mnemosine.html'), html, 'utf8');
rmSync(join(publicDir, '03_Gerador', 'generator_bundle'), { recursive: true, force: true });

console.log(`MNEMOSINE: site estático criado em public/ (${Buffer.byteLength(html)} bytes de HTML).`);
