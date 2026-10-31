/* Teste de fumaça da interface: carrega o HTML real no jsdom (com node-canvas), gera um caso e exporta o PDF. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import path from 'node:path';
import fs from 'node:fs';
const require=createRequire(import.meta.url);
let JSDOM,ok=true;try{({JSDOM}=require('jsdom'));require('canvas')}catch(e){ok=false}
const ROOT=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..');
const wait=(fn,ms=90000)=>new Promise((res,rej)=>{const t0=Date.now();(function tick(){let v;try{v=fn()}catch(e){}if(v)return res(v);if(Date.now()-t0>ms)return rej(new Error('timeout aguardando condição'));setTimeout(tick,100)})()});

test('interface: preset, geração, pré-visualização e download do PDF',{skip:!ok,timeout:240000},async()=>{
  const dom=await JSDOM.fromFile(path.join(ROOT,'03_Gerador/Gerador_Casos_Mnemosine.html'),{runScripts:'dangerously',resources:'usable',pretendToBeVisual:true});
  const w=dom.window,d=w.document;
  const errors=[];w.addEventListener('error',e=>errors.push(e.message));
  await new Promise(r=>w.addEventListener('load',r));
  w.MnemosineFS.assetDataURL=async name=>{const b=fs.readFileSync(path.join(ROOT,'04_Assets',name));return `data:image/${path.extname(name).slice(1).replace('jpg','jpeg')};base64,${b.toString('base64')}`};
  const downloads=[];
  w.URL.createObjectURL=b=>{downloads.push({size:b.size,type:b.type});return 'blob:x'};w.URL.revokeObjectURL=()=>{};
  w.HTMLAnchorElement.prototype.click=function(){downloads[downloads.length-1].name=this.download};
  const $=s=>d.querySelector(s);

  // estado inicial: preset intermediário (14 essenciais)
  assert.equal(d.querySelectorAll('[data-techs] input:checked').length,14);
  assert.equal($('[data-preset=intermediario]').getAttribute('aria-pressed'),'true');
  $('[data-preset=avancado]').click();
  assert.equal(d.querySelectorAll('[data-techs] input:checked').length,23);
  $('[data-preset=iniciante]').click();
  assert.equal($('[data-preset=iniciante]').getAttribute('aria-pressed'),'true');
  assert.equal($('#btnPdf').disabled,true,'exportar deve estar desabilitado antes de gerar');

  // gera um caso Iniciante
  $('#seed').value='UI-SMOKE';$('#btnGenerate').click();
  await wait(()=>d.querySelectorAll('#pages figure').length>=10&&!$('#btnGenerate').disabled);
  assert.match($('#caseInfo').textContent,/DICC-AZ-[0-9A-F]{8}/);
  assert.equal(d.querySelectorAll('#pageNav a').length,d.querySelectorAll('#pages figure').length);
  assert.equal(d.querySelectorAll('.toast.error').length,0,'não deve haver erros na tela: '+[...d.querySelectorAll('.toast.error')].map(t=>t.textContent));
  assert.ok(d.querySelector('.badge'),'páginas do mediador devem estar marcadas');
  assert.match(w.location.hash,/seed=UI-SMOKE/);
  assert.equal($('#btnPdf').disabled,false);

  // download do PDF (300 DPI)
  $('#btnPdf').click();
  await wait(()=>downloads.some(x=>/\.pdf$/.test(x.name||'')),180000);
  const pdf=downloads.find(x=>/\.pdf$/.test(x.name));
  assert.ok(pdf.size>200000,'PDF pequeno demais: '+pdf.size);
  assert.deepEqual(errors,[]);
});
