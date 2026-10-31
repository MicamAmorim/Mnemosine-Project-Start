/* Mnemosine // Arquivo Zero — aplicação (v3.0): UI, estado, exportações e fallback de download. */
(function(){
  'use strict';
  const D=MnemosineData,K=MnemosineCore,R=MnemosineRender,FS=MnemosineFS,Z=MnemosineZip,M=MnemosineMorse;
  const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
  const PREVIEW_DPI=110,PRESET_NOTE={iniciante:'Cifras simples: César, A1Z26, Morse, Polybius, mapa, sequência, periódica e ímpares/pares.',intermediario:'As 14 técnicas essenciais (padrão).',avancado:'Todas as 23 técnicas, incluindo Pigpen, Scytale, Base64, hex, chaves, Book, Cardan e LSB.'};
  const store={get(k,d){try{const v=localStorage.getItem('mnemo.'+k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem('mnemo.'+k,JSON.stringify(v))}catch(e){}}};
  let current=null,busy=false,models=[];

  // ---------- utilidades de interface ----------
  function toast(msg,kind='info',ms=5000){const t=document.createElement('div');t.className='toast '+kind;t.textContent=msg;$('#toasts').append(t);setTimeout(()=>t.remove(),ms)}
  const setStatus=m=>{$('#status').textContent=m||''};
  function setProgress(i,n){const p=$('#progress');if(!n){p.hidden=true;return}p.hidden=false;p.max=n;p.value=i}
  function setBusy(b){busy=b;document.body.setAttribute('aria-busy',String(b));$('#btnGenerate').disabled=b;$('#btnNewSeed').disabled=b;$('#btnPack').disabled=b;$('#btnFsPack').disabled=b;$$('[data-needs-case]').forEach(x=>x.disabled=b||!current);if(!b)setProgress(0,0)}
  function download(blob,name){const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),4000)}
  const safe=s=>String(s).replace(/[^A-Za-z0-9_-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,40)||'caso';
  const randomSeed=()=>String(Date.now()).slice(-10)+String(Math.floor(Math.random()*999)).padStart(3,'0');
  const dataUrlBlob=u=>fetch(u).then(r=>r.blob());
  const fileBase=()=>`${current.id}_${safe(current.seed)}`;
  const opts=()=>({eco:$('#optEco').checked,alibis:$('#optAlibis').checked});
  async function guard(fn){if(busy)return;setBusy(true);try{await fn()}catch(e){console.error(e);toast('Erro: '+(e&&e.message||e),'error',8000);setStatus('')}finally{setBusy(false)}}

  // ---------- técnicas e presets ----------
  function buildTechs(){
    const mk=(list,box)=>list.forEach(t=>{const l=document.createElement('label');l.className='chk';
      const i=document.createElement('input');i.type='checkbox';i.value=t.id;
      const sp=document.createElement('span');sp.textContent=t.name;
      const sm=document.createElement('small');sm.textContent=t.digital?'digital':t.family;
      const a=document.createElement('a');a.className='help';a.href='Metodos_Mnemosine.html#'+t.id;a.target='_blank';a.rel='noopener';a.textContent='?';a.setAttribute('aria-label','Ver método: '+t.name);
      l.append(i,sp,sm,a);box.append(l)});
    mk(D.implemented,$('#techsEssential'));mk(D.advanced,$('#techsAdvanced'));
  }
  const selected=()=>$$('[data-techs] input:checked').map(i=>i.value);
  function setSelected(ids){const s=new Set(ids);$$('[data-techs] input').forEach(i=>i.checked=s.has(i.value));markPreset()}
  function currentPreset(){const sel=selected().sort().join(',');for(const [k,v] of Object.entries(D.presets))if([...v].sort().join(',')===sel)return k;return 'custom'}
  function markPreset(){const p=currentPreset();$$('.preset').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.preset===p)));$('#presetNote').textContent=p==='custom'?'Seleção personalizada.':PRESET_NOTE[p];$('#techCount').textContent=selected().length+' marcadas';persist()}
  function persist(){store.set('techs',selected());store.set('opts',opts())}

  // ---------- link compartilhável ----------
  function writeHash(){const p=new URLSearchParams();p.set('seed',current?current.seed:$('#seed').value);p.set('t',selected().join(','));p.set('a',opts().alibis?1:0);p.set('e',opts().eco?1:0);try{history.replaceState(null,'','#'+p)}catch(e){try{location.hash=p.toString()}catch(e2){}}}
  function readHash(){const p=new URLSearchParams(location.hash.slice(1));if(!p.has('seed'))return false;$('#seed').value=p.get('seed');if(p.get('t'))setSelected(p.get('t').split(',').filter(Boolean));if(p.has('a'))$('#optAlibis').checked=p.get('a')==='1';if(p.has('e'))$('#optEco').checked=p.get('e')==='1';return true}

  // ---------- pré-visualização ----------
  async function showPreview(c){
    setStatus('Desenhando páginas…');
    models=K.caseEvidence(c);const labels=R.caseLabels(c);
    const items=await R.make('case',c,{dpi:PREVIEW_DPI,eco:opts().eco,onProgress:setProgress});
    const host=$('#pages'),nav=$('#pageNav');host.replaceChildren();nav.replaceChildren();$('#empty').classList.add('hidden');
    items.forEach((it,i)=>{
      const L=labels[i]||{label:'Página '+(i+1),kind:'x'},fig=document.createElement('figure');fig.id='p'+(i+1);
      it.canvas.setAttribute('role','img');it.canvas.setAttribute('aria-label',`Página ${i+1}: ${L.label}`);
      const cap=document.createElement('figcaption');cap.append(`Pág. ${i+1} — ${L.label}`);
      if(L.kind==='mediator'){const b=document.createElement('span');b.className='badge';b.textContent='restrito ao mediador';cap.append(b)}
      const m=L.kind==='ev'?models[L.i]:null;
      if(m&&m.type==='morse'){cap.append(btn('Ouvir Morse',()=>M.playMorse(m.text)),btn('Baixar WAV',()=>download(M.wavBlob(m.text),'morse.wav')))}
      if(m&&m.type==='stegimage'&&m.image)cap.append(btn('Baixar PNG original (LSB)',async()=>download(await dataUrlBlob(m.image),`${current.id}_${m.answer?safe(m.answer):'lsb'}_LSB.png`)));
      fig.append(it.canvas,cap);host.append(fig);
      const a=document.createElement('a');a.href='#p'+(i+1);a.textContent=`${i+1}. ${L.label}`;if(L.kind==='mediator')a.className='med';nav.append(a);
    });
    const info=$('#caseInfo');info.hidden=false;info.replaceChildren();
    for(const [k,v] of [['ID',c.id],['Seed',c.seed],['Páginas',items.length],['Técnicas',c.techniques.length]]){const s=document.createElement('span');s.append(k+': ');const b=document.createElement('b');b.textContent=v;s.append(b);info.append(s)}
    if(await R.kit.asset('dicc_logo_clean.png')===null)toast('Imagens do projeto não encontradas: as cartas e o logo ficarão em branco. Veja o aviso no topo da página.','error',9000);
    setStatus(`Caso ${c.id} pronto — ${items.length} páginas.`);
  }
  function btn(label,fn){const b=document.createElement('button');b.type='button';b.className='btn';b.textContent=label;b.addEventListener('click',()=>{try{fn()}catch(e){toast('Erro: '+e.message,'error')}});return b}

  async function generate(newSeed){
    if(busy)return;
    if(newSeed||!$('#seed').value.trim())$('#seed').value=randomSeed();
    const seed=$('#seed').value.trim();let c;
    try{c=K.buildCase(seed,selected(),{alibis:opts().alibis})}catch(e){toast(e.message,'error',7000);return}
    await guard(async()=>{current=c;await showPreview(c);writeHash();persist()});
  }

  // ---------- exportações ----------
  async function caseFiles(onProgress){
    const files=[],base=fileBase();
    files.push({name:`${base}.pdf`,data:await R.makePdf('case',current,{eco:opts().eco,title:current.id,onProgress})});
    files.push({name:`${base}.json`,data:new Blob([JSON.stringify(current,null,2)],{type:'application/json'})});
    for(const m of models){if(m.type==='stegimage'&&m.image)files.push({name:`${base}_${safe(m.answer)}_LSB.png`,data:await dataUrlBlob(m.image)});if(m.type==='morse')files.push({name:`${base}_morse.wav`,data:M.wavBlob(m.text)})}
    return files;
  }
  const progressLabel=l=>(i,n)=>{setProgress(i,n);setStatus(`${l} — página ${i}/${n}`)};
  const exportPdf=()=>guard(async()=>{const b=await R.makePdf('case',current,{eco:opts().eco,title:current.id,onProgress:progressLabel('Gerando PDF 300 DPI')});download(b,fileBase()+'.pdf');setStatus('PDF gerado.');toast('PDF baixado. Imprima a 100% (sem “ajustar à página”).','ok')});
  const exportZip=()=>guard(async()=>{const f=await caseFiles(progressLabel('Gerando kit'));download(await Z.create(f),fileBase()+'_kit.zip');setStatus('Kit gerado.');toast('Kit completo baixado (PDF, JSON e anexos digitais).','ok')});
  async function packFiles(label){
    const out=[];let k=0;
    for(const [file,key] of R.PACK){k++;const b=await R.makePdf(key,null,{eco:false,title:file.replace(/\.pdf$/,''),onProgress:(i,n)=>{setProgress(i,n);setStatus(`${label} ${k}/${R.PACK.length}: ${file} — ${i}/${n}`)}});out.push({name:file,data:b})}
    return out;
  }
  const exportPack=()=>guard(async()=>{const f=await packFiles('PACK');download(await Z.create(f.map(x=>({name:'01_Documentos/'+x.name,data:x.data}))),'Mnemosine_PACK_v3.zip');setStatus('PACK gerado.');toast('PACK baixado (7 PDFs).','ok')});
  const exportHtml=()=>guard(async()=>{
    const pages=$$('#pages canvas').map(c=>c.toDataURL('image/jpeg',.85)),labels=R.caseLabels(current);
    const mor=models.map((m,i)=>m.type==='morse'?{i,text:m.text}:null).filter(Boolean);
    const figs=pages.map((src,i)=>{const L=labels[i];const mo=mor.find(m=>L&&L.kind==='ev'&&m.i===L.i);return `<figure><img src="${src}" alt="Página ${i+1}: ${L?L.label:''}">${mo?`<p><button onclick='playMorse(${JSON.stringify(mo.text)})'>Ouvir Morse</button> <button onclick='dl(${JSON.stringify(mo.text)})'>Baixar WAV</button></p>`:''}</figure>`}).join('\n');
    const html=`<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${current.id}</title><style>body{margin:0;background:#12171a;color:#edf2f4;font:15px system-ui;padding:16px}figure{max-width:860px;margin:0 auto 24px}img{width:100%;height:auto;display:block;background:#eee9dc;box-shadow:0 8px 24px #0008}button{padding:8px 12px;margin-right:6px}</style><h1 style="max-width:860px;margin:0 auto 16px;font:700 18px Georgia">${current.id} — seed ${current.seed.replace(/</g,'&lt;')}</h1>${figs}<script>${M.toneEvents}\n${M.playMorse}\n${M.wavBlob}\nfunction dl(c){const u=URL.createObjectURL(wavBlob(c)),a=document.createElement('a');a.href=u;a.download='morse.wav';a.click()}<\/script></html>`;
    download(new Blob([html],{type:'text/html'}),fileBase()+'.html');toast('HTML interativo baixado (versão de pré-visualização; o PDF é a versão para imprimir).','ok');
  });
  async function copyLink(){writeHash();try{await navigator.clipboard.writeText(location.href);toast('Link do caso copiado.','ok')}catch(e){window.prompt('Copie o link:',location.href)}}

  // ---------- pasta do projeto (File System Access API; opcional) ----------
  async function refreshCases(){const ul=$('#casesList');ul.replaceChildren();try{for(const c of (await FS.listCases()).slice(0,30)){const li=document.createElement('li');li.textContent=`${c.name} · ${(c.size/1e6).toFixed(1)} MB`;ul.append(li)}}catch(e){}}
  const fsChoose=()=>guard(async()=>{await FS.chooseRoot();await FS.ensureStructure();toast('Pasta do projeto selecionada.','ok');$('#notice').hidden=true;await refreshCases()});
  const fsSaveCase=()=>guard(async()=>{await FS.ensureStructure();const f=await caseFiles(progressLabel('Gerando'));for(const x of f)await FS.write('02_Casos/'+x.name,x.data);await refreshCases();toast(`${f.length} arquivo(s) gravados em 02_Casos.`,'ok');setStatus('Gravado.')});
  const fsSavePack=()=>guard(async()=>{await FS.ensureStructure();const f=await packFiles('PACK');for(const x of f)await FS.write('01_Documentos/'+x.name,x.data);toast('PACK gravado em 01_Documentos.','ok');setStatus('Gravado.')});

  // ---------- inicialização ----------
  function init(){
    buildTechs();
    const saved=store.get('techs',null);setSelected(saved&&saved.length?saved:D.presets.intermediario);
    const o=store.get('opts',null);if(o){$('#optAlibis').checked=o.alibis!==false;$('#optEco').checked=!!o.eco}
    const fromHash=readHash();
    $$('.preset').forEach(b=>b.addEventListener('click',()=>setSelected(D.presets[b.dataset.preset])));
    $$('[data-techs]').forEach(x=>x.addEventListener('change',markPreset));
    $('#optAlibis').addEventListener('change',persist);$('#optEco').addEventListener('change',persist);
    $('#btnGenerate').addEventListener('click',()=>generate(false));$('#btnNewSeed').addEventListener('click',()=>generate(true));
    $('#seed').addEventListener('keydown',e=>{if(e.key==='Enter')generate(false)});
    $('#btnPdf').addEventListener('click',exportPdf);$('#btnZip').addEventListener('click',exportZip);$('#btnHtml').addEventListener('click',exportHtml);$('#btnLink').addEventListener('click',copyLink);$('#btnPack').addEventListener('click',exportPack);
    if(FS.canWriteProject()){$('#fsGroup').hidden=false;$('#btnRoot').addEventListener('click',fsChoose);$('#btnFsCase').addEventListener('click',fsSaveCase);$('#btnFsPack').addEventListener('click',fsSavePack);FS.getRoot(false).then(r=>{if(r)refreshCases()}).catch(()=>{})}
    const btnNoticeRoot=$('#btnNoticeRoot');
    if(btnNoticeRoot){
      btnNoticeRoot.addEventListener('click',()=>FS.canWriteProject()?fsChoose():toast('A seleção de pastas requer Chrome/Edge em localhost ou HTTPS.','error',8000));
    }
    if(location.protocol==='file:'){
      FS.getRoot(false).then(r=>{if(!r){$('#notice').hidden=false}}).catch(()=>{$('#notice').hidden=false});
    }
    markPreset();R.loadFonts();
    if(fromHash)generate(false);
  }
  document.addEventListener('DOMContentLoaded',init);
})();
