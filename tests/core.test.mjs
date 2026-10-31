import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const D=require('../03_Gerador/js/mnemosine_data.js');
const K=require('../03_Gerador/js/mnemosine_core.js');
const clean=s=>D.norm(s).replace(/ /g,'');
const PRIMES=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83];
const VISUAL=new Set(['noise','color','pigpen','stegimage']);

/** Decodificadores independentes: devolvem o texto que um jogador obteria. */
const DEC={
  caesar:m=>K.caesar(m.answer,0)&&m.text.split('').map(c=>{const i=K.AZ.indexOf(c);return i<0?c:K.AZ[(i-m.shift+26)%26]}).join(''),
  a1z26:m=>m.text.split(' ').map(n=>K.AZ[n-1]).join(''),
  acrostic:m=>m.text.split('\n').map(l=>l[m.column-1]).join(''),
  periodic:m=>m.text.split('').filter((_,i)=>i%3===2).join(''),
  oddEven:m=>m.text.split('').filter((_,i)=>i%2===0).join(''),
  morse:m=>{const inv=Object.fromEntries(Object.entries(K.MORSE).map(([k,v])=>[v,k]));return m.text.split(' ').map(t=>t==='|'?' ':inv[t]).join('')},
  polybius:m=>m.text.split(' ').map(p=>K.PB[(p[0]-1)*5+(p[1]-1)]).join(''),
  vigenere:m=>{const k=clean(m.key);let j=0;return m.text.split('').map(c=>{const i=K.AZ.indexOf(c);return i<0?c:K.AZ[(i-K.AZ.indexOf(k[j++%k.length])+26)%26]}).join('')},
  binary:m=>m.text.split(' ').map(b=>String.fromCharCode(parseInt(b,2))).join(''),
  prime:m=>PRIMES.filter(p=>p<=m.text.length).map(p=>m.text[p-1]).join(''),
  time:m=>{const [a,b]=m.items;return K.fmtTime(K.minutes(b)+15)},
  scytale:m=>{const rows=m.text.length/m.columns;let out='';for(let r=0;r<rows;r++)for(let c=0;c<m.columns;c++)out+=m.text[c*rows+r];return out},
  base64:m=>Buffer.from(m.text,'base64').toString('utf8'),
  hexascii:m=>m.text.split(' ').map(h=>String.fromCharCode(parseInt(h,16))).join(''),
  mono:m=>{const ka=K.keyedAlphabet(m.key);return m.text.split('').map(c=>{const i=ka.indexOf(c);return i<0?c:K.AZ[i]}).join('')},
  columnar:m=>{const k=clean(m.key),cols=k.length,rows=m.text.length/cols,order=[...k].map((ch,i)=>({ch,i})).sort((a,b)=>a.ch.localeCompare(b.ch)||a.i-b.i);const grid=Array.from({length:rows},()=>[]);let p=0;for(const o of order)for(let r=0;r<rows;r++)grid[r][o.i]=m.text[p++];return grid.map(r=>r.join('')).join('')},
  book:m=>m.text.split(/\s+/).map(pos=>{const [l,w]=pos.split(':').map(Number);return D.norm(m.bookLines[l-1].split(' ')[w-1])[0]}).join(''),
  cardan:m=>m.holes.map(h=>m.grid[h]).join(''),
  coords:m=>{const cols='ABCD';let c=cols.indexOf(m.start[0]),r=+m.start[1]-1;for(const mv of m.moves){if(mv==='N')r--;if(mv==='S')r++;if(mv==='E')c++;if(mv==='W')c--;assert.ok(c>=0&&c<4&&r>=0&&r<4,'trajeto saiu do mapa')}return m.cells[r*4+c].value}
};
const expected=(m)=>{
  const a=clean(m.answer);
  if(m.type==='a1z26'||m.type==='polybius')return a.replace(/[0-9]/g,'').replace(/J/g,m.type==='polybius'?'I':'J');
  if(m.type==='time'||m.type==='coords')return m.answer;
  return a;
};
const strip=(m,s)=>{if(m.type==='time'||m.type==='coords')return s;s=s.replace(/ /g,'');return (m.type==='scytale'||m.type==='columnar')?s.replace(/X+$/,''):s};

test('baralho: 30 cartas, fragmentos distintos por categoria e verificação injetiva',()=>{
  assert.equal(D.categories.reduce((n,c)=>n+D.cards[c].length,0),30);
  for(const c of D.categories)assert.equal(new Set(D.cards[c].map(x=>x.frag)).size,5,`fragmentos repetidos em ${c}`);
  const codes=new Set();let n=0;
  const rec=(i,sol)=>{if(i===6){codes.add(D.verification(sol));n++;return}for(const card of D.cards[D.categories[i]])rec(i+1,{...sol,[D.categories[i]]:card})};
  rec(0,{});assert.equal(n,15625);assert.equal(codes.size,15625,'códigos de verificação colidem');
});

test('ID do caso é estável, sem hífen duplo e sem colisão em 5.000 seeds',()=>{
  const ids=new Set();for(let i=0;i<5000;i++)ids.add(D.caseId('seed'+i));
  assert.equal(ids.size,5000);assert.match(D.caseId('-ARQUIVO'),/^DICC-AZ-[0-9A-F]{8}$/);
});

test('ida e volta de cada técnica textual, para todas as 30 respostas compatíveis',()=>{
  let checked=0;
  for(const tech of D.allTechniques.map(t=>t.id).filter(t=>!VISUAL.has(t))){
    for(const cat of D.categories){
      if(K.compatibleTechniques(cat,[tech]).length===0)continue;
      for(const card of D.cards[cat]){
        const m=K.evidenceModel(card.name,tech,`rt|${tech}|${card.id}`);
        const got=strip(m,DEC[tech](m)),exp=strip(m,expected(m));
        assert.equal(got,exp,`${tech} falhou para ${card.name}`);checked++;
      }
    }
  }
  assert.ok(checked>300);
});

test('mapa por trajetória: só uma célula é a resposta e há outras cartas de local como distratores',()=>{
  const names=D.cards.local.map(c=>c.name);
  for(let i=0;i<500;i++)for(const ans of names){
    const m=K.evidenceModel(ans,'coords','map'+i+ans);
    assert.equal(m.cells.filter(c=>c.value===ans).length,1);
    assert.equal(m.cells.filter(c=>names.includes(c.value)).length,5,'devem aparecer as 5 cartas de local');
    assert.equal(DEC.coords(m),ans);
    assert.ok(m.moves.length>=3,'trajeto curto demais');
  }
});

test('fuzz de 2.000 seeds: determinismo, compatibilidade, sem vazamento e ida e volta',()=>{
  const all=D.presets.avancado;
  for(let i=0;i<2000;i++){
    const seed='fz'+i*7919,c=K.buildCase(seed,all),c2=K.buildCase(seed,all);
    assert.deepEqual(c,c2,'caso não é determinístico');
    const hor=c.techniques.find(t=>t.category==='horario').technique;
    assert.ok(!['vigenere','scytale','caesar','a1z26','polybius','mono','book','pigpen'].includes(hor),`horário recebeu ${hor}`);
    const ev=K.caseEvidence(c);
    ev.forEach((m,idx)=>{
      const cat=D.categories[idx];
      assert.equal(c.techniques[idx].technique,m.type);
      if(VISUAL.has(m.type))return;
      assert.equal(strip(m,DEC[m.type](m)),strip(m,expected(m)),`${m.type}/${cat} seed ${seed}`);
      if(m.text&&!['time','book','cardan','coords','acrostic'].includes(m.type)){
        const a=clean(m.answer);
        assert.ok(!clean(m.text).includes(a.replace(/[0-9]/g,'')||a)||a.length<3,`vazamento em claro: ${m.type} ${m.answer}`);
        if(cat==='horario')assert.ok(!m.text.includes(a),`horário em claro: ${m.type}`);
      }
    });
  }
});

test('acróstico cabe no layout (máx. 24 linhas) para todas as respostas',()=>{
  for(const cat of D.categories)for(const card of D.cards[cat]){
    const n=clean(card.name).length;assert.ok(n<=24,`${card.name}: ${n}`);
    if(cat!=='horario'||true){const m=K.evidenceModel(card.name,'acrostic','ac'+card.id);assert.equal(m.lineCount,n)}
  }
});

test('álibis: exatamente 3 excluídos; sobram culpado + 1 falso suspeito',()=>{
  for(let i=0;i<2000;i++){
    const c=K.buildCase('al'+i,D.presets.intermediario),t=K.minutes(c.solution.horario.name);
    const excl=c.alibis.rows.filter(r=>r.place&&r.start<=t&&t<=r.end&&r.place.id!==c.solution.local.id).map(r=>r.person.id);
    assert.equal(excl.length,3);assert.ok(!excl.includes(c.solution.pessoa.id));
    const left=c.alibis.rows.map(r=>r.person.id).filter(id=>!excl.includes(id)).sort();
    assert.deepEqual(left,[c.solution.pessoa.id,c.alibis.decoyId].sort());
    assert.equal(c.alibis.rows.length,5);
  }
  assert.equal(K.buildCase('x',D.presets.intermediario,{alibis:false}).alibis,null);
});

test('presets cobrem todas as categorias e buildCase valida entradas',()=>{
  for(const [name,list] of Object.entries(D.presets))for(const cat of D.categories)assert.ok(K.compatibleTechniques(cat,list).length>0,`${name} sem técnica para ${cat}`);
  assert.throws(()=>K.buildCase('x',['caesar','a1z26']),/três técnicas/);
  assert.throws(()=>K.buildCase('x',['caesar','a1z26','polybius']),/HORÁRIO/);
});
