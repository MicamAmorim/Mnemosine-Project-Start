/* Testes de renderização (exigem node-canvas): nenhum layout estoura; PDFs válidos; arquivo de gráfica com TrimBox. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
let env=null;try{env=require('./helpers/env.cjs')}catch(e){}
const skip=!env;
const BOX={X:16,Y:87,W:178,H:148};

test('todas as técnicas × todas as respostas cabem na área de evidência',{skip,timeout:300000},async()=>{
  const R=env.setup(),D=MnemosineData,K=MnemosineCore;let n=0;
  for(const tech of D.allTechniques.map(t=>t.id)){
    for(const cat of D.categories){
      if(!K.compatibleTechniques(cat,[tech]).length)continue;
      for(const card of D.cards[cat]){
        const m=K.evidenceModel(card.name,tech,`lay|${tech}|${card.id}`);
        await R.renderPages([{draw:async P=>{await R.drawEvidence(P,m,BOX)}}],{dpi:40});
        assert.deepEqual(R.stats.overflow,[],`${tech} / ${card.name}: ${JSON.stringify(R.stats.overflow)}`);n++;
      }
    }
  }
  assert.ok(n>400,'cobertura baixa: '+n);
});

test('casos completos (todas as técnicas) renderizam sem estouro e geram PDF válido',{skip,timeout:300000},async()=>{
  const R=env.setup(),D=MnemosineData,K=MnemosineCore;
  for(const seed of ['rt-1','rt-2','rt-3','rt-4','rt-5','rt-6']){
    const c=K.buildCase(seed,D.presets.avancado,{alibis:seed!=='rt-6'});
    const blob=await R.makePdf('case',c,{dpi:60});
    const buf=Buffer.from(await blob.arrayBuffer());
    assert.equal(buf.slice(0,5).toString(),'%PDF-');assert.match(buf.slice(-12).toString(),/%%EOF/);
    assert.deepEqual(R.stats.overflow,[],seed+' '+JSON.stringify(R.stats.overflow));
    const pages=(buf.toString('latin1').match(/\/Type \/Page /g)||[]).length;
    assert.equal(pages,R.caseLabels(c).length,'rótulos e páginas divergem');
  }
});

test('documentos do pack: sem estouro; arquivo de gráfica com 31 páginas e TrimBox de 3 mm',{skip,timeout:300000},async()=>{
  const R=env.setup();
  for(const [file,key] of R.PACK){
    const blob=await R.makePdf(key,null,{dpi:50}),s=Buffer.from(await blob.arrayBuffer()).toString('latin1');
    assert.deepEqual(R.stats.overflow,[],file+' '+JSON.stringify(R.stats.overflow));
    if(key==='cardsShop'){
      assert.equal((s.match(/\/Type \/Page /g)||[]).length,31);
      const trim=/\/TrimBox \[([\d. ]+)\]/.exec(s);assert.ok(trim,'sem TrimBox');
      const [a,b,c,d]=trim[1].split(' ').map(Number);assert.ok(Math.abs(a-8.5)<.1&&Math.abs(b-8.5)<.1,'sangria deve ser 3 mm (8,5 pt)');
      assert.ok(Math.abs((c-a)-63*72/25.4)<.2&&Math.abs((d-b)-88*72/25.4)<.2,'corte deve ser 63×88 mm');
    }
  }
});

test('ZIP: estrutura válida e CRC conferem',{skip,timeout:60000},async()=>{
  env.setup();const Z=MnemosineZip,blob=await Z.create([{name:'01_Documentos/a.txt',data:'olá'},{name:'02_Casos/b.bin',data:new Uint8Array([1,2,3,250])}]);
  const b=Buffer.from(await blob.arrayBuffer());assert.equal(b.readUInt32LE(0),0x04034b50);
  assert.equal(b.readUInt32LE(b.length-22),0x06054b50);assert.equal(b.readUInt16LE(b.length-22+10),2);
  assert.equal(Z.crc32(new TextEncoder().encode('123456789')),0xCBF43926);
});
