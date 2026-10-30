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

let html = gunzipSync(compressed).toString('utf8');
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

function mustReplace(source, oldText, newText, label) {
  if (!source.includes(oldText)) throw new Error(`Patch não encontrado: ${label}`);
  return source.replace(oldText, newText);
}

// v2.4 puzzle hardening: keep technique IDs stable, but make the evidence itself less obvious.
const renderPath = join(publicDir, '03_Gerador', 'js', 'mnemosine_render.js');
let render = readFileSync(renderPath, 'utf8');

const oldAcrostic = `  function acrostic(s){const words=['Não descarte esta linha.','Observe com calma.','Registre a posição.','Tente outra leitura.','Evite pressupostos.','Leia apenas o necessário.','Anote o resultado.','Mantenha a ordem.','Ignore o ruído.','Siga o padrão.'];return normalize(s).replace(/ /g,'').split('').map((ch,i)=>ch+' — '+words[i%words.length]).join('\\n')}`;
const newAcrostic = `  function acrostic(s,seed){const r=D().rngFrom(seed+'|coluna'),ans=normalize(s).replace(/ /g,''),col=22+Math.floor(r()*15),width=62,notes=['MOVIMENTO REGULAR SEM ALTERACAO APARENTE','ACESSO VALIDADO PELO CONTROLE INTERNO','REGISTRO CONFERIDO SEM DIVERGENCIA VISIVEL','ROTINA MANTIDA NO INTERVALO OBSERVADO','DOCUMENTO REVISADO E DEVOLVIDO AO ARQUIVO','EVENTO CLASSIFICADO COMO OPERACAO ORDINARIA','VERIFICACAO MANUAL SEM ANOMALIA RELEVANTE','FLUXO INTERNO PRESERVADO DURANTE O TURNO'];const lines=ans.split('').map((ch,i)=>{const hh=String(18+Math.floor(r()*5)).padStart(2,'0'),mi=String(Math.floor(r()*60)).padStart(2,'0'),id=String(10+Math.floor(r()*90)),note=notes[Math.floor(r()*notes.length)];let base=(hh+':'+mi+' | R'+id+' | '+note+' | OK').padEnd(width,' ').slice(0,width);return base.slice(0,col-1)+ch+base.slice(col)});return {text:lines.join('\\n'),column:col,width}}`;
render = mustReplace(render, oldAcrostic, newAcrostic, 'gerador de coluna oculta');

const oldCoords = `  function coords(answer,seed){const r=D().rngFrom(seed),labels=['A1','B1','C1','A2','B2','C2','A3','B3','C3'],pick=labels[Math.floor(r()*labels.length)];return {code:pick,cells:labels.map((k,i)=>({k,value:k===pick?answer:['Depósito','Hall','Arquivo','Sala 1','Pátio','Copa','Sala 3','Recepção'][i%8]}))}}`;
const newCoords = `  function coords(answer,seed){const r=D().rngFrom(seed),cols=['A','B','C','D'],rows=[1,2,3,4],labels=[];for(const n of rows)for(const c of cols)labels.push(c+n);const target=Math.floor(r()*labels.length),tr=Math.floor(target/4),tc=target%4,pool=['Depósito','Hall','Arquivo','Sala 1','Pátio','Copa','Sala 3','Recepção','Oficina','Almoxarifado','Arquivo B','Sala Técnica','Anexo','Galeria','Portaria'];let dec=0;const cells=labels.map((k,i)=>({k,value:i===target?answer:pool[(dec++)%pool.length]}));let starts=labels.map((_,i)=>i).filter(i=>i!==target&&Math.abs(Math.floor(i/4)-tr)+Math.abs(i%4-tc)>=2),start=starts[Math.floor(r()*starts.length)],sr=Math.floor(start/4),sc=start%4,moves=[];const loops=[];if(sc<3)loops.push(['E','W']);if(sc>0)loops.push(['W','E']);if(sr<3)loops.push(['S','N']);if(sr>0)loops.push(['N','S']);if(loops.length){const q=loops[Math.floor(r()*loops.length)];moves.push(...q)}const shortest=[];for(let c=sc;c<tc;c++)shortest.push('E');for(let c=sc;c>tc;c--)shortest.push('W');for(let rr=sr;rr<tr;rr++)shortest.push('S');for(let rr=sr;rr>tr;rr--)shortest.push('N');moves.push(...D().shuffle(shortest,r));const clock={N:'12',E:'3',S:'6',W:'9'},path=moves.map(d=>clock[d]).join(' · '),startCode=labels[start];return {code:'INÍCIO '+startCode+' | '+path,start:startCode,path,cells}}`;
render = mustReplace(render, oldCoords, newCoords, 'mapa por trajetória');

render = mustReplace(render,
  `case'acrostic':m.text=acrostic(answer);m.meta='Relatório transcrito';break;`,
  `case'acrostic':Object.assign(m,acrostic(answer,seed));m.meta='Relatório monoespaçado';break;`,
  'modelo da coluna oculta');
render = mustReplace(render,
  `case'coords':Object.assign(m,coords(answer,seed));m.meta='Mapa indexado';break;`,
  `case'coords':Object.assign(m,coords(answer,seed));m.meta='Mapa com trajetória codificada';break;`,
  'modelo de trajetória');

const oldDraw = `else if(m.type==='coords'){box(x,45,191,120,52);const cs=m.cells;for(let i=0;i<9;i++){const r=Math.floor(i/3),c=i%3;box(x,52+c*35,196+r*14,32,12);text(x,cs[i].k,mm(54+c*35),mm(198+r*14),mm(8),1.8,true,C.gold);text(x,cs[i].value,mm(62+c*35),mm(198+r*14),mm(20),1.8)}text(x,'COORDENADA RECUPERADA: '+m.code,mm(52),mm(240),mm(110),2.5,true)}else{text(x,m.text,mm(30),mm(195),mm(145),m.text.length>90?2.6:m.text.length>45?3.3:5.2,true,C.ink,m.text.includes('\\n')?1.45:1.35)}`;
const newDraw = `else if(m.type==='acrostic'){box(x,27,191,150,53);text(x,m.text,mm(31),mm(194),mm(142),2,false,C.ink,1.12)}else if(m.type==='coords'){box(x,42,191,126,53);const cs=m.cells,cw=28,ch=9.3;for(let i=0;i<16;i++){const rr=Math.floor(i/4),cc=i%4,xx=47+cc*cw,yy=194+rr*ch;box(x,xx,yy,cw-1,ch-0.7,m.cells[i].k===m.start?'#d8d0bd':null);text(x,cs[i].k,mm(xx+1.3),mm(yy+1.2),mm(7),1.55,true,C.gold);text(x,cs[i].value,mm(xx+8),mm(yy+1.1),mm(18),1.35,false,C.ink,1.15)}text(x,'INÍCIO: '+m.start+'   TRAJETO (POSIÇÕES DE RELÓGIO): '+m.path,mm(47),mm(233),mm(116),1.9,true)}else{text(x,m.text,mm(30),mm(195),mm(145),m.text.length>90?2.6:m.text.length>45?3.3:5.2,true,C.ink,m.text.includes('\\n')?1.45:1.35)}`;
render = mustReplace(render, oldDraw, newDraw, 'desenho das evidências reforçadas');
writeFileSync(renderPath, render, 'utf8');

const dataPath = join(publicDir, '03_Gerador', 'js', 'mnemosine_data.js');
let data = readFileSync(dataPath, 'utf8');
data = data.replace(`{id:'acrostic',name:'Acróstico',family:'Estrutura textual'}`, `{id:'acrostic',name:'Leitura por coluna oculta',family:'Estrutura textual'}`);
data = data.replace(`{id:'coords',name:'Coordenadas em mapa',family:'Raciocínio espacial'}`, `{id:'coords',name:'Mapa por trajetória codificada',family:'Raciocínio espacial'}`);
writeFileSync(dataPath, data, 'utf8');

// The HTML preview historically printed the coordinate label. It now describes a path, never the target cell.
html = html.replaceAll('COORDENADA:', 'TRAJETO CODIFICADO:');
writeFileSync(join(publicDir, '03_Gerador', 'Gerador_Casos_Mnemosine.html'), html, 'utf8');
rmSync(join(publicDir, '03_Gerador', 'generator_bundle'), { recursive: true, force: true });

console.log(`MNEMOSINE: site estático criado em public/ (${Buffer.byteLength(html)} bytes de HTML). Puzzles de coluna e trajetória reforçados.`);