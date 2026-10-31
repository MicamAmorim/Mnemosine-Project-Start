/* Mnemosine // Arquivo Zero — renderizador (v3.0), parte 3: documentos.
 * Cada função devolve uma lista de páginas {orientation,sizeMm,bleedMm,draw(P)} para Render.renderPages. */
(function(global){
  const R=global.MnemosineRender,k=R.kit,C=k.C,st=k.st,{text,fit,rect,line,circle,stamp,mm,pad2,section,kv,bullets,chrome}=k;
  const D=()=>global.MnemosineData,K=()=>global.MnemosineCore,V=()=>global.MnemosineVisuals;
  const TOP=54,BOTTOM=268;
  const over=(y,label)=>{if(y>BOTTOM)k.stats.overflow.push({label,text:'y='+y.toFixed(1)})};
  const STAMPS=['CONFIDENCIAL','EM ANÁLISE','ARQUIVO ZERO','CÓPIA ÚNICA'];
  const techName=id=>D().allTechniques.find(t=>t.id===id).name;

  // ================= CASO =================
  function casePages(c){
    const d=D(),ev=K().caseEvidence(c),items=d.categories.map((cat,i)=>({cat,n:i+1,m:ev[i],card:c.solution[cat],reg:'AZ-'+pad2(i+1),tech:c.techniques[i].technique}));
    const body=[];
    items.forEach(it=>{if(it.m.needsKey)body.push({kind:'key',it});body.push({kind:'ev',it})});
    if(c.alibis)body.push({kind:'alibi'});
    body.push({kind:'recon'});
    const index=body.map((b,i)=>({page:i+2,label:b.kind==='ev'?`${b.it.reg}  ·  ${d.labels[b.it.cat]}`:b.kind==='key'?`${b.it.reg}K  ·  FRAGMENTO K (palavra-passe)`:b.kind==='alibi'?'QUADRO DE ÁLIBIS (dedução)':'QUADRO DE RECONSTRUÇÃO'}));
    const pages=[{draw:P=>coverDraw(P,c,items,index)}];
    body.forEach(b=>{
      if(b.kind==='ev')pages.push({draw:P=>evDraw(P,c,b.it)});
      else if(b.kind==='key')pages.push({draw:P=>keyDraw(P,c,b.it)});
      else if(b.kind==='alibi')pages.push({draw:P=>alibiDraw(P,c)});
      else pages.push({orientation:'landscape',draw:P=>reconDraw(P,c)});
    });
    pages.push({draw:P=>gabaritoDraw(P,c,items)},{draw:P=>dicasDraw(P,c,items)});
    return pages;
  }
  async function coverDraw(P,c,items,index){
    const x=P.x;await chrome(P,'DOSSIÊ OPERACIONAL — CASO GERADO');
    let y=section(x,'1. DADOS DO REGISTRO',TOP);
    y=kv(x,[['AGENTE RESPONSÁVEL',c.meta.agent],['DATA DE ABERTURA',c.meta.date],['PROTOCOLO',c.meta.protocol],['CLASSIFICAÇÃO',c.meta.classification]],16,y,120,3.2,46);
    stamp(x,c.meta.classification,168,TOP+22,-7,{size:5.2});
    y=section(x,'2. MISSÃO',y+2);
    y=text(x,'Reconstrua seis elementos da ocorrência: pessoa, local, instrumento, motivo, horário e rota. Cada resposta corresponde a uma carta física. O método de resolução não acompanha a evidência; consulte o Arquivo de Referência Técnica quando necessário.',16,y,178,3.4,{lh:1.45})+3;
    if(items.some(i=>i.m.needsKey)){const h=15;rect(x,16,y,178,h,{fill:C.warn});text(x,'Se uma evidência apontar para um FRAGMENTO K, resolva primeiro a página intermediária. A palavra-passe do próximo enigma nunca é fornecida diretamente.',20,y+3.2,170,3.3,{bold:true,color:st.eco?C.ink:'#fff',lh:1.4});y+=h+4}
    y=section(x,'3. PROTOCOLO',y);
    const proto=['Resolva as páginas na ordem apresentada.','Selecione a carta correspondente a cada resposta.','Posicione as seis cartas no Quadro de Reconstrução.','Registre o código formado pelos fragmentos das cartas.'];
    if(c.alibis)proto.splice(3,0,'Use o Quadro de Álibis para conferir pessoa, local e horário.');
    y=bullets(x,proto,16,y,178,3.3,1.6)+2;
    y=section(x,'4. ÍNDICE DO DOSSIÊ',y);
    for(const r of index){text(x,`pág. ${r.page}`,18,y,22,3,{color:C.muted});text(x,r.label,42,y,150,3,{bold:true});line(x,16,y+4.6,194,y+4.6,C.line,.15,[.8,.8]);y+=5.6}
    over(y,'capa');
  }
  async function evDraw(P,c,it){
    const x=P.x,m=it.m;await chrome(P,`ANEXO ${it.reg} — ${m.title}`);
    let y=section(x,'1. IDENTIFICAÇÃO DA EVIDÊNCIA',TOP);
    kv(x,[['REGISTRO',it.reg],['CATEGORIA',D().labels[it.cat]]],16,y,86,3.1,28);
    kv(x,[['INTEGRIDADE','preservada'],['COLETA',`${c.meta.date}`]],104,y,90,3.1,28);
    y=section(x,'2. CONTEÚDO RECUPERADO',78);
    await R.drawEvidence(P,m,{X:16,Y:y,W:178,H:148});
    y=section(x,'3. CONCLUSÃO DA EQUIPE',239);
    rect(x,16,y,112,15,{stroke:C.line,lw:.35});text(x,'RESPOSTA:',19,y+2.6,40,2.8,{color:C.muted,bold:true});line(x,40,y+11,124,y+11,C.line,.3);
    const r=D().rngFrom(c.seed+'|stamp'+it.n);stamp(x,STAMPS[Math.floor(r()*STAMPS.length)],163,y+7,-6+r()*-4,{size:4.2});
  }
  async function keyDraw(P,c,it){
    const x=P.x,m=it.m;await chrome(P,`ANEXO ${it.reg}K — FRAGMENTO K (PÁGINA INTERMEDIÁRIA)`);
    let y=section(x,'1. IDENTIFICAÇÃO DA EVIDÊNCIA',TOP);
    kv(x,[['REGISTRO',it.reg+'K'],['REFERÊNCIA','chave da evidência '+it.reg]],16,y,86,3.1,28);kv(x,[['INTEGRIDADE','parcial'],['COLETA',c.meta.date]],104,y,90,3.1,28);
    y=section(x,'2. CONTEÚDO RECUPERADO',78);
    R.keyPanel(P,m,{X:16,Y:y,W:178,H:84});y+=90;
    text(x,'Converta cada número em uma letra (A=1, B=2 … Z=26). O resultado é a palavra-passe da evidência '+it.reg+'. Ela nunca aparece pronta: descubra-a aqui antes de seguir.',16,y,178,3.4,{lh:1.45});
    y=section(x,'3. CONCLUSÃO DA EQUIPE',239);
    rect(x,16,y,112,15,{stroke:C.line,lw:.35});text(x,'PALAVRA-PASSE:',19,y+2.6,60,2.8,{color:C.muted,bold:true});line(x,55,y+11,124,y+11,C.line,.3);
  }
  async function alibiDraw(P,c){
    const x=P.x,d=D(),k_=K();await chrome(P,'QUADRO DE ÁLIBIS — CAMADA DEDUTIVA');
    let y=section(x,'1. COMO USAR',TOP);
    y=text(x,'Depois de reconstruir o HORÁRIO e o LOCAL do crime, compare-os com os registros abaixo. Um álibi só EXCLUI quem estava registrado em OUTRO local durante todo o horário do crime. Quem não tem registro verificável, ou cujo período não cobre o horário, continua sob suspeita. Confirme sempre pela evidência de PESSOA.',16,y,178,3.3,{lh:1.45})+4;
    y=section(x,'2. REGISTROS COLETADOS',y);
    const cols=[['PESSOA',50],['LOCAL REGISTRADO',42],['PERÍODO',32],['FONTE',42],['EXCL.?',12]];
    let cx=16;rect(x,16,y,178,7.5,{fill:C.navy});cols.forEach(([h,w])=>{text(x,h,cx+2,y+2.3,w-3,2.5,{bold:true,color:C.navyInk});cx+=w});y+=7.5;
    for(const r of c.alibis.rows){
      cx=16;rect(x,16,y,178,15,{fill:'rgba(255,255,255,.35)',stroke:C.line,lw:.25});
      const cells=[r.person.name,r.place?r.place.name:'Sem registro',r.place?`${k_.fmtTime(r.start)} – ${k_.fmtTime(r.end)}`:'—',r.source];
      cells.forEach((t,i)=>{text(x,t,cx+2,y+4.4,cols[i][1]-3,3.1,{bold:i===0,color:i===1&&!r.place?C.muted:C.ink,lh:1.25});cx+=cols[i][1]});
      rect(x,cx+3,y+4.5,6,6,{stroke:C.ink,lw:.4});y+=15;
    }
    y=section(x,'3. DEDUÇÃO DA EQUIPE',y+6);
    text(x,'Suspeitos que restam depois de aplicar os álibis:',16,y,178,3.3,{bold:true});line(x,16,y+14,194,y+14,C.line,.3);line(x,16,y+23,194,y+23,C.line,.3);
    over(y+24,'álibis');
  }
  function reconDraw(P,c){
    const x=P.x,d=D();
    text(x,'QUADRO DE RECONSTRUÇÃO',16,4.5,130,7.2,{fam:'serif',bold:true,lh:1.1});
    text(x,'Posicione fisicamente as seis cartas nos campos abaixo.',16,15.5,140,2.9,{color:C.muted});
    text(x,'CÓDIGO DE VERIFICAÇÃO',100,9,118,2.6,{align:'right',bold:true});
    d.categories.forEach((cat,i)=>{rect(x,221+i*10,5.5,9,10,{stroke:C.ink,lw:.4,fill:'rgba(255,255,255,.4)'})});
    const sx=47,sy=24,gw=7;
    d.categories.forEach((cat,i)=>{
      const X=sx+(i%3)*(63+gw),Y=sy+Math.floor(i/3)*92;
      rect(x,X,Y,63,88,{stroke:C.line,lw:.35,dash:[2,1.2],fill:'rgba(255,255,255,.25)'});rect(x,X,Y,63,9,{fill:C.navy});
      text(x,`${i+1}. ${d.labels[cat]}`,X+3,Y+2.5,57,3.4,{bold:true,color:C.navyInk});
      text(x,'POSICIONE A CARTA AQUI',X,Y+42,63,2.8,{align:'center',color:C.muted});
    });
    text(x,'CASO MNEMOSINE — DOCUMENTO FICCIONAL PARA ATIVIDADE EDUCACIONAL.   '+P.code,16,204.5,265,2.2,{color:C.muted});
  }
  async function gabaritoDraw(P,c,items){
    const x=P.x,d=D();await chrome(P,'GABARITO DO MEDIADOR — NÃO ENTREGAR DURANTE A RESOLUÇÃO','RESTRITO AO MEDIADOR');
    let y=section(x,'1. RECONSTRUÇÃO CORRETA',TOP);
    for(const it of items){
      rect(x,16,y,178,13,{fill:it.n%2?'rgba(255,255,255,.45)':'rgba(200,190,170,.35)'});rect(x,16,y,9,13,{fill:C.navy});
      text(x,String(it.n),16,y+3.4,9,4,{bold:true,color:C.navyInk,align:'center',lh:1});
      text(x,d.labels[it.cat],28,y+4.6,34,2.8,{bold:true,color:C.muted});text(x,it.card.name,62,y+3.6,70,3.7,{bold:true,fam:'serif',lh:1.2});
      text(x,techName(it.tech),136,y+4.2,56,2.7,{color:C.muted,lh:1.2});y+=13;
    }
    y+=3;rect(x,16,y,178,15,{fill:C.navy});text(x,'CÓDIGO DE VERIFICAÇÃO',21,y+5,90,3.2,{bold:true,color:C.navyInk});text(x,c.verification,110,y+2.6,80,8,{bold:true,color:st.eco?C.ink:'#e6c27a',align:'right',fam:'serif',lh:1});y+=21;
    if(c.alibis){y=section(x,'2. CAMADA DEDUTIVA',y);const a=c.alibis,nm=id=>d.cards.pessoa.find(p=>p.id===id).name;
      y=text(x,`Excluídos pelos álibis: ${a.rows.filter(r=>r.excludes).map(r=>r.person.name).join(', ')}.\nRestam sob suspeita: ${nm(a.culpritId)} (culpado) e ${nm(a.decoyId)} (falso suspeito — período fora do horário).`,16,y,178,3.2,{lh:1.5})+4}
    y=section(x,c.alibis?'3. IDENTIFICAÇÃO DO CASO':'2. IDENTIFICAÇÃO DO CASO',y);
    kv(x,[['ID DO CASO',c.id],['SEED',c.seed],['AGENTE',c.meta.agent],['PROTOCOLO',c.meta.protocol]],16,y,178,3.1,38);
  }
  async function dicasDraw(P,c,items){
    const x=P.x,d=D();await chrome(P,'FICHA DE DICAS DO MEDIADOR','RESTRITO AO MEDIADOR');
    let y=text(x,'Sugestão: cada dica pedida soma tempo à equipe — nível 1: +2 min · nível 2: +4 min · nível 3: +6 min. Entregue uma dica por vez e só quando solicitada.',16,TOP,178,3,{color:C.muted,lh:1.4})+2;
    for(const it of items){
      rect(x,16,y,178,5.6,{fill:C.navy});text(x,`${it.reg}  ·  ${d.labels[it.cat]}  ·  ${techName(it.tech)}`,19,y+1.2,172,3,{bold:true,color:C.navyInk});y+=6.6;
      it.m.hints.forEach((h,i)=>{text(x,`Dica ${i+1}`,18,y,18,2.8,{bold:true,color:C.gold});y=Math.max(text(x,h,36,y,156,2.9,{lh:1.35}),y+4)+.8});y+=2.2;
    }
    over(y,'dicas');
  }

  /** Rótulos das páginas do PDF do caso (mesma ordem de casePages). */
  function caseLabels(c){
    const d=D(),ev=K().caseEvidence(c),out=[{label:'Dossiê',kind:'cover'}];
    d.categories.forEach((cat,i)=>{if(ev[i].needsKey)out.push({label:`AZ-${pad2(i+1)}K · Fragmento K`,kind:'key',i});out.push({label:`AZ-${pad2(i+1)} · ${d.labels[cat]}`,kind:'ev',i,type:ev[i].type})});
    if(c.alibis)out.push({label:'Álibis',kind:'alibi'});
    out.push({label:'Quadro',kind:'recon'},{label:'Gabarito',kind:'mediator'},{label:'Dicas',kind:'mediator'});
    return out;
  }

  // ================= CARTAS =================
  const CW=63,CH=88;
  async function cardFront(x,card,cat,X,Y,bleed,idx){
    const d=D();rect(x,X-bleed,Y-bleed,CW+2*bleed,CH+2*bleed,{fill:C.cream});
    rect(x,X+2.2,Y+2.2,CW-4.4,CH-4.4,{stroke:C.navy,lw:.5});rect(x,X+3,Y+3,CW-6,CH-6,{stroke:C.gold,lw:.25});
    const logo=await k.asset('dicc_logo_clean.png');if(logo){x.save();x.imageSmoothingQuality='high';x.drawImage(logo,mm(X+5.5),mm(Y+5.5),mm(8),mm(8*logo.height/logo.width));x.restore()}
    text(x,'D.I.C.C.  //  ARQUIVO ZERO',X+16,Y+6.4,42,2.5,{bold:true});text(x,`${d.labels[cat]}  ·  ${idx}/30`,X+16,Y+10.6,42,2.2,{color:C.muted});
    const art=await k.asset(card.asset);k.cover(x,art,X+5.5,Y+19,52,38,{fy:cat==='pessoa'?.2:.5});rect(x,X+5.5,Y+19,52,38,{stroke:C.navy,lw:.3});
    rect(x,X+5.5,Y+50,52,7,{fill:C.navy});text(x,d.labels[cat],X+8,Y+51.9,30,2.7,{bold:true,color:C.navyInk});text(x,card.id,X+36,Y+51.9,19,2.7,{bold:true,color:st.eco?C.ink:'#e6c27a',align:'right'});
    fit(x,card.name,X+5.5,Y+59,52,10,4.6,3,{fam:'serif',bold:true,align:'center',vcenter:true,lh:1.25,label:'carta'});
    if(card.role)text(x,card.role,X+5.5,Y+69.6,52,2.1,{align:'center',color:C.muted});
    text(x,'FRAGMENTO',X+7,Y+78.8,30,2.2,{color:C.muted,bold:true});text(x,'imprima a 100%',X+7,Y+82,30,1.9,{color:C.muted});
    rect(x,X+44.5,Y+74,13,11,{stroke:C.gold,lw:.6,fill:'rgba(255,255,255,.45)'});text(x,card.frag,X+44.5,Y+75.1,13,7.4,{fam:'serif',bold:true,align:'center',lh:1});
  }
  async function cardBack(x,X,Y,bleed){
    rect(x,X-bleed,Y-bleed,CW+2*bleed,CH+2*bleed,{fill:C.navy});
    rect(x,X+2.2,Y+2.2,CW-4.4,CH-4.4,{stroke:C.gold,lw:.5});rect(x,X+3,Y+3,CW-6,CH-6,{stroke:C.gold,lw:.25});
    const logo=await k.asset('dicc_logo_clean.png');circle(x,X+CW/2,Y+33,19,{fill:st.eco?'#fff':C.cream});
    if(logo){const w=24;x.save();x.imageSmoothingQuality='high';x.drawImage(logo,mm(X+CW/2-w/2),mm(Y+33-w*logo.height/logo.width/2),mm(w),mm(w*logo.height/logo.width));x.restore()}
    text(x,'CASO MNEMOSINE',X,Y+58,CW,5.2,{fam:'serif',bold:true,align:'center',color:C.navyInk});text(x,'ARQUIVO ZERO',X,Y+67,CW,2.8,{align:'center',color:st.eco?C.ink:'#e6c27a',bold:true});
  }
  function allCards(){const d=D();let i=0;return d.categories.flatMap(cat=>d.cards[cat].map(card=>({card,cat,idx:++i})))}
  function cardSheetPages(){
    const list=allCards(),pages=[],sheets=Math.ceil(list.length/9),X0=7.5,Y0=13.5;
    for(let s=0;s<sheets;s++){
      const chunk=list.slice(s*9,s*9+9);
      pages.push({code:`MNMS-AZ-CARTAS-F${s+1}`,draw:async P=>{
        text(P.x,`CARTAS — FRENTE  (folha ${s+1}/${sheets})  ·  imprima a 100%, sem ajustar à página  ·  corte nas linhas`,X0,5,195,2.5,{color:C.muted});
        for(let j=0;j<chunk.length;j++){const X=X0+(j%3)*66,Y=Y0+Math.floor(j/3)*91;await cardFront(P.x,chunk[j].card,chunk[j].cat,X,Y,0,chunk[j].idx);rect(P.x,X,Y,CW,CH,{stroke:C.ink,lw:.2})}}});
      pages.push({code:`MNMS-AZ-CARTAS-V${s+1}`,draw:async P=>{
        text(P.x,`CARTAS — VERSO  (folha ${s+1}/${sheets})  ·  imprima frente e verso (virar pela borda longa)`,X0,5,195,2.5,{color:C.muted});
        for(let j=0;j<chunk.length;j++){const col=2-(j%3),X=X0+col*66,Y=Y0+Math.floor(j/3)*91;await cardBack(P.x,X,Y,0);rect(P.x,X,Y,CW,CH,{stroke:C.ink,lw:.2})}}});
    }
    return pages;
  }
  function cardShopPages(){
    const b=3,pages=allCards().map(({card,cat,idx})=>({sizeMm:[CW+2*b,CH+2*b],bleedMm:b,paper:false,code:'x',draw:P=>cardFront(P.x,card,cat,b,b,b,idx)}));
    pages.push({sizeMm:[CW+2*b,CH+2*b],bleedMm:b,paper:false,code:'x',draw:P=>cardBack(P.x,b,b,b)});
    return pages;
  }

  // ================= FLUXO DE TEXTO (ambientação, referência, mediador) =================
  /** blocos: {h} {p} {ex} {list:[..]} {fn:async(x,y)=>novoY} */
  async function flow(P,blocks,y=TOP){
    const x=P.x;
    for(const b of blocks){
      if(b.h)y=section(x,b.h,y);
      else if(b.p)y=text(x,b.p,16,y,178,3.7,{lh:1.45})+4;
      else if(b.ex){const lines=b.ex.split('\n').length,h=lines*5.6+5;rect(x,16,y,178,h,{fill:'rgba(255,255,255,.45)',stroke:C.line,lw:.3});text(x,b.ex,20,y+2.6,170,3.8,{bold:true,lh:1.5});y+=h+4}
      else if(b.list)y=bullets(x,b.list,16,y,178,3.6,2.2)+2;
      else if(b.fn)y=await b.fn(x,y);
    }
    over(y,'fluxo');return y;
  }
  const doc=(label,sub,code,blocks)=>({code,draw:async P=>{await chrome(P,label,sub);await flow(P,blocks)}});

  function ambientPages(){
    const d=D(),persons=[{id:'PV',name:'Aurora Vale',asset:'Aurora_Vale.jpg',role:'Vítima / criptógrafa'},...d.cards.pessoa];
    const desc={PV:'Coordenadora do Projeto Mnemosine. Metódica, desconfiada de registros únicos e responsável por mecanismos de autenticação.',P1:'Conhecia a infraestrutura técnica e auxiliava Aurora em preservação digital.',P2:'Tinha acesso amplo a documentos administrativos e enfrentava pressões institucionais.',P3:'Circulava entre áreas administrativas e técnicas e lidava com contratos sensíveis.',P4:'Acompanhava irregularidades e reunia documentos de origem nem sempre revelada.',P5:'Conhece rotas, câmeras, horários e acessos físicos do instituto.'};
    const pages=[doc('DOSSIÊ DE AMBIENTAÇÃO — INSTITUTO ORION',null,'MNMS-AZ-AMB-001',[
      {h:'1. RESUMO DO INCIDENTE'},{p:'A professora e criptógrafa Aurora Vale, coordenadora do Projeto Mnemosine no Instituto Orion, vinha registrando inconsistências em acessos, contratos e rotas internas. Antes de uma reunião em que pretendia apresentar parte de suas descobertas, desapareceu. O arquivo físico e digital do instituto passou a apresentar lacunas, documentos duplicados, horários conflitantes e mensagens codificadas.'},
      {h:'2. O QUE JÁ É COMUM A TODOS OS CASOS'},
      {list:['Aurora antecipou a possibilidade de adulteração de evidências e distribuiu informações em mídias diferentes.','Há registros confiáveis de que mais de uma pessoa possuía motivos para esconder informações, mas isso não implica autoria de crime.','O D.I.C.C. mantém um conjunto fixo de pessoas, locais, instrumentos, motivos, horários e rotas para reconstruções operacionais.','As páginas de caso podem usar cifras, códigos e sinais visuais. Quando uma técnica exigir palavra-passe, ela deve ser descoberta em um fragmento anterior.']},
      {h:'3. PROTOCOLO MNEMOSINE'},{p:'Nenhuma informação crítica deve depender de uma única pista. A equipe deve observar o documento, identificar um padrão provável, consultar o Arquivo de Referência Técnica quando necessário e só então associar a resposta a uma carta física do Quadro de Reconstrução.'}])];
    for(let pg=0;pg<2;pg++)pages.push({code:`MNMS-AZ-AMB-00${pg+2}`,draw:async P=>{
      await chrome(P,`PESSOAS DE INTERESSE — PARTE ${pg+1}`);let y=TOP+2;
      for(const p of persons.slice(pg*3,pg*3+3)){
        rect(P.x,16,y,178,60,{fill:'rgba(246,241,230,.45)',stroke:C.line,lw:.3});
        const im=await k.asset(p.asset);k.cover(P.x,im,20,y+4,40,52,{fy:.2});rect(P.x,20,y+4,40,52,{stroke:C.navy,lw:.4});
        text(P.x,p.name,66,y+6,124,4.6,{fam:'serif',bold:true});text(P.x,p.role||'',66,y+15,124,2.9,{color:C.muted});text(P.x,desc[p.id],66,y+24,124,3.3,{lh:1.5});y+=66;
      }}});
    pages.push(doc('RECURSOS OPERACIONAIS DO ARQUIVO ZERO',null,'MNMS-AZ-AMB-004',[
      {h:'1. CONJUNTO FIXO'},{p:'O baralho físico reúne 30 cartas: 5 pessoas, 5 locais, 5 instrumentos, 5 motivos, 5 horários e 5 rotas. Casos diferentes podem chegar à mesma solução usando enigmas distintos.'},
      {h:'2. MÉTODO DE JOGO'},{p:'Resolva a evidência → identifique a resposta → encontre a carta física correspondente → posicione-a no quadro. A combinação final das seis cartas forma um código de verificação por meio dos fragmentos impressos: cada uma das 15.625 soluções possíveis gera um código único.'},
      {h:'3. QUADRO DE ÁLIBIS'},{p:'Casos com camada dedutiva trazem um quadro de álibis. Ele permite excluir suspeitos por lógica, mas inclui um falso suspeito: a evidência de PESSOA continua sendo necessária.'},
      {h:'4. ARQUIVO DE REFERÊNCIA'},{p:'Consultar o arquivo técnico é permitido e não conta como pista. O desafio inclui reconhecer qual técnica pode estar escondida na evidência. Pistas específicas do mediador podem ser penalizadas por tempo.'}]));
    return pages;
  }

  // ---------- referência técnica ----------
  const MORSE_FN=async(x,y)=>{
    const M=K().MORSE,keys=[...K().AZ,...'0123456789'],cw=29.6,rh=11;
    keys.forEach((ch,i)=>{const X=16+(i%6)*cw,Y=y+Math.floor(i/6)*rh;rect(x,X,Y,cw-1,rh-1,{fill:'rgba(255,255,255,.45)',stroke:C.line,lw:.2});text(x,ch,X+2,Y+2.6,6,4.4,{bold:true});text(x,M[ch],X+9,Y+3,cw-11,3.7,{fam:'mono'})});
    return y+Math.ceil(keys.length/6)*rh+4;
  };
  const POLY_FN=async(x,y)=>{const g=K().PB;for(let c=0;c<5;c++)text(x,String(c+1),24+c*10,y,10,4,{bold:true,color:C.muted,align:'center'});for(let r=0;r<5;r++){text(x,String(r+1),16,y+6+r*7,6,4,{bold:true,color:C.muted});for(let c=0;c<5;c++){const X=26+c*10;rect(x,X-2,y+5+r*7,10,7,{stroke:C.line,lw:.25,fill:'rgba(255,255,255,.45)'});text(x,r===1&&c===3?'I/J':g[r*5+c],X-2,y+6.4+r*7,10,3.9,{bold:true,align:'center'})}}return y+42};
  const imgFn=(make,h)=>async(x,y)=>{const src=make();if(src){const im=await k.loadImg(src);k.contain(x,im,16,y,178,h,{smooth:false});}return y+h+4};
  const CARDAN_FN=async(x,y)=>{const ex=K().cardanCipher('LUA','REF-CARDAN'),N=6,cs=7;
    for(let i=0;i<N*N;i++){const cx=i%N,cy=Math.floor(i/N),hole=ex.holes.includes(i);
      rect(x,20+cx*cs,y+cy*cs,cs,cs,{stroke:C.ink,lw:.3,fill:'#fbf8ee'});text(x,ex.grid[i],20+cx*cs,y+cy*cs+1.4,cs,3.6,{bold:true,align:'center',lh:1});
      const mx=80+cx*cs;rect(x,mx,y+cy*cs,cs,cs,{stroke:C.ink,lw:.3,fill:hole?'#fff':C.navy,dash:hole?[1,.7]:null})}
    text(x,'GRADE',20,y+N*cs+2,N*cs,3,{bold:true,align:'center'});text(x,'MÁSCARA',80,y+N*cs+2,N*cs,3,{bold:true,align:'center'});text(x,'Letras expostas: L U A',130,y+14,64,3.4,{bold:true});return y+N*cs+10};
  function referencePages(){
    const vis=()=>V();
    const P=(t,blocks)=>doc(t,null,null,blocks);
    return [
      P('MANUAL DE CONSULTA — USO EM CAMPO',[{p:'Este arquivo ensina métodos gerais usados nos casos. Ele não informa qual método corresponde a cada evidência. O desafio inclui reconhecer o padrão antes de aplicar uma técnica.'},{h:'ROTINA DE DIAGNÓSTICO'},{list:['Observe o formato: letras, números, pares, pontos/traços, imagem ou grade.','Procure repetição, intervalos, orientação e referências a outra página.','Teste uma hipótese em pequena escala.','Só então decodifique todo o material.','Se houver FRAGMENTO K, resolva-o antes: ele fornece a palavra-passe.']},{p:'No gerador há três níveis: Iniciante (cifras simples), Intermediário (padrão) e Avançado (todas as técnicas, incluindo Pigpen, Scytale, Base64, hexadecimal, substituição monoalfabética, transposição colunar, Book cipher, Cardan e LSB).'}]),
      P('CIFRA DE CÉSAR E A1Z26',[{h:'CIFRA DE CÉSAR'},{p:'Como reconhecer: texto alfabético que parece quase pronunciável ou mantém padrões de repetição, com espaços entre palavras. Como resolver: desloque todas as letras a mesma quantidade no sentido inverso. O alfabeto é circular. O deslocamento muda de caso para caso: teste de 1 a 25 até surgir uma frase legível.'},{ex:'CASA  +3  →  FDVD\nFDVD  -3  →  CASA'},{h:'A1Z26'},{p:'Como reconhecer: números entre 1 e 26 separados em grupos. Como resolver: A=1, B=2, … Z=26.'},{ex:'12   21   16   1    →    L U P A'}]),
      P('ESTRUTURA OCULTA E FILTROS TEXTUAIS',[{h:'LEITURA POR COLUNA OCULTA'},{p:'Em relatórios de linhas regulares, uma coluna vertical contém letras que quebram palavras (erros de digitação alinhados). Leia essa coluna, de cima para baixo.'},{ex:'ARQUIVO INTERNO  |  CONFERIDO\nROTINA DE INSPECAO  |  MANTIDO\nRELATORIO DE TURNO  |  VALIDADO'},{h:'AMOSTRAGEM PERIÓDICA'},{p:'Numere as posições começando em 1. Teste cada 2ª, 3ª, 4ª… posição quando houver ruído regular. Os blocos de 5 letras são só para leitura: ignore os espaços ao contar.'},{ex:'X M A Q P Z A R   →   lendo 3 e 6:  A  Z'},{h:'ÍMPARES / PARES'},{p:'Separe as posições 1, 3, 5, 7… das posições 2, 4, 6, 8…. Em M x A y P z A, as posições ímpares formam MAPA.'},{h:'POSIÇÕES PRIMAS'},{p:'Leia as letras nas posições 2, 3, 5, 7, 11, 13… O número 1 não é primo. O restante é ruído.'}]),
      P('MORSE — PONTOS, TRAÇOS E PULSOS',[{p:'Pontos/traços ou pulsos curtos/longos. Cada grupo é uma letra; intervalos maiores separam letras e palavras. No site, o mesmo padrão pode ser ouvido.'},{fn:MORSE_FN},{ex:'.-..  ..-  .-   →   L U A'}]),
      P('POLYBIUS E MAPA POR TRAJETÓRIA',[{h:'QUADRADO DE POLYBIUS 5×5'},{fn:POLY_FN},{p:'O primeiro dígito indica a linha e o segundo a coluna. I/J compartilham a mesma célula. Exemplo: 24 → I/J.'},{h:'MAPA COM TRAJETÓRIA CODIFICADA'},{p:'Parta da casa de INÍCIO e siga cada número como um ponteiro de relógio: 12 = norte (para cima), 3 = leste (direita), 6 = sul (baixo), 9 = oeste (esquerda). Cada número é uma casa. A resposta é o nome da casa onde o trajeto termina. A planta mostra vários locais possíveis: só o trajeto indica qual é o correto.'},{ex:'INÍCIO: B2   TRAJETO: 3 · 6 · 6\nB2 → C2 → C3 → C4'}]),
      P('VIGENÈRE E BINÁRIO / ASCII',[{h:'VIGENÈRE COM CHAVE DERIVADA'},{p:'Reconheça uma cifra polialfabética quando o deslocamento não é fixo e houver referência a uma chave. No Mnemosine a palavra-passe nunca aparece diretamente: resolva o Fragmento K. Use A=0…Z=25 e, para decifrar, subtraia a chave repetida módulo 26.'},{ex:'CIFRADO    X  U  P  L\nCHAVE      L  U  A  L\nVALORES   23 20 15 11\nSUBTRAIR  11 20  0 11\nRESULTADO  M  A  P  A'},{h:'BINÁRIO / ASCII'},{p:'Blocos de 8 bits podem representar caracteres ASCII. Exemplo: 01000001 = 65 decimal = A. Espaço = 00100000. Agrupe em bytes de 8 bits antes de converter.'},{ex:'01001100  01010101  01000001  →  LUA'}]),
      P('SEQUÊNCIAS TEMPORAIS',[{p:'Compare a diferença entre termos consecutivos. Em horários, converta mentalmente em minutos e procure um intervalo constante.'},{ex:'08:10  →  08:25  →  ?  →  08:55\n          +15 min     +15 min\n          resposta: 08:40'},{p:'Nem toda série usa diferença constante. Se as diferenças variam, teste alternância, multiplicação ou outro padrão somente quando a evidência sugerir isso.'}]),
      P('PERCEPÇÃO VISUAL — RUÍDO E CANAIS',[{h:'RUÍDO DE ALTA FREQUÊNCIA'},{p:'A informação pode estar na média visual, não nos pixels individuais. Afaste a folha, reduza a imagem ou semicerre os olhos. Não tente ler cada ponto.'},{fn:imgFn(()=>vis()&&vis().visualData('SINAL','REF-NOISE','noise'),46)},{h:'CANAIS DE COR'},{p:'Duas distribuições cromáticas podem ter luminância semelhante. No original a palavra deve parecer quase invisível. Isole o canal vermelho (editor de imagem, câmera ou um filtro vermelho/celofane sobre a folha impressa em cor) para aumentar o contraste.'},{fn:imgFn(()=>vis()&&vis().visualData('SINAL','REF-COLOR','color'),46)}]),
      P('PIGPEN',[{p:'Símbolos formados por cantos, caixas e formas em X, algumas com ponto. Cada símbolo corresponde a uma letra em uma chave fixa.'},{fn:imgFn(()=>vis()&&vis().pigpenChartData(),70)},{p:'Compare cada glifo com a chave acima e transcreva letra por letra. Espaços maiores separam palavras.'}]),
      P('SCYTALE, BASE64 E HEX / ASCII',[{h:'SCYTALE'},{p:'Transposição: as letras não são substituídas, apenas mudam de posição. O caso informa o parâmetro físico em número de colunas. Reescreva a sequência em uma grade com esse número de colunas e teste a leitura perpendicular.'},{h:'BASE64'},{p:'Reconheça letras maiúsculas/minúsculas, números e às vezes = no final. É codificação, não cifra. Decodifique Base64 para recuperar o texto ASCII/UTF-8.'},{h:'HEXADECIMAL / ASCII'},{p:'Pares 00–FF representam bytes. Converta cada par hexadecimal para decimal e depois para o caractere ASCII. O número à esquerda de cada linha é só um deslocamento: ignore-o.'},{ex:'4C 55 41   →   L U A'}]),
      P('MONOALFABÉTICA E TRANSPOSIÇÃO COLUNAR',[{h:'SUBSTITUIÇÃO MONOALFABÉTICA'},{p:'O Fragmento K fornece uma palavra-chave. Remova letras repetidas da chave e acrescente as letras restantes do alfabeto: isso forma o alfabeto cifrado. Cada letra é substituída sempre pela mesma letra. Para decifrar, faça o mapeamento inverso.'},{ex:'Exemplo com chave LIMA:\nALFABETO: ABCDEFGHIJKLMNOPQRSTUVWXYZ\nCIFRADO:  LIMABCDEFGHJKNOPQRSTUVWXYZ'},{h:'TRANSPOSIÇÃO COLUNAR'},{p:'O Fragmento K fornece a chave. Escreva o texto em linhas sob as letras da chave. Ordene as colunas alfabeticamente pela chave e leia as colunas nessa ordem. Para decifrar, reconstrua o comprimento de cada coluna e devolva a ordem original. Letras X no final são enchimento.'}]),
      P('BOOK CIPHER E GRADE DE CARDAN',[{h:'BOOK CIPHER'},{p:'A própria evidência fornece um texto de referência e índices no formato linha:palavra. Vá à linha indicada, conte as palavras e registre a inicial da palavra encontrada. As iniciais, em sequência, formam a resposta. Um índice que aponta para um número indica o próprio número.'},{ex:'2:4  1:2  3:1   →   procure cada palavra no texto.'},{h:'GRADE DE CARDAN'},{p:'Você recebe uma grade de letras e uma máscara com furos. Sobreponha a máscara à grade e leia somente as células visíveis pelos furos, em ordem de leitura (esquerda → direita, cima → baixo).'},{fn:CARDAN_FN}]),
      P('ESTEGANOGRAFIA EM IMAGEM (LSB)',[{p:'No método LSB, o bit menos significativo de um canal de cor é alterado. A diferença visual é praticamente imperceptível, mas os bits podem reconstruir uma máscara. Esta técnica é digital: use o PNG original, não uma fotografia, impressão ou JPEG recomprimido.'},{fn:imgFn(()=>vis()&&vis().stegData('SINAL','REF-STEG'),50)},{p:'No site, abra o Analisador de Esteganografia e carregue o PNG. O analisador extrai a paridade do canal vermelho (R & 1) e mostra a máscara escondida. Ao salvar um caso com LSB, o PNG correspondente acompanha o PDF.'}]),
      P('DEDUÇÃO — QUADRO DE ÁLIBIS',[{p:'Alguns casos trazem um quadro de álibis. É uma segunda via de raciocínio: em vez de decifrar, você deduz.'},{h:'REGRAS'},{list:['Um álibi exclui uma pessoa quando o período registrado COBRE o horário do crime e o local registrado é DIFERENTE do local do crime.','Quem não tem registro, ou cujo período termina antes (ou começa depois) do horário, continua suspeito.','Há sempre um falso suspeito: alguém cujo álibi parece forte, mas não cobre o horário.','Use a evidência de PESSOA para decidir entre os suspeitos que restam.']},{ex:'Crime às 21:00 na Biblioteca\nA: Arquivo, 20:45–21:30  → excluída\nB: Biblioteca, 20:15–20:45 → continua suspeito\nC: sem registro           → continua suspeito'}])
    ].map((pg,i,arr)=>Object.assign(pg,{code:`MNMS-AZ-REF-${pad2(i+1)}`}));
  }

  // ---------- manual do mediador ----------
  function mediatorPages(){
    const M=(t,b)=>doc(t,'RESTRITO AO MEDIADOR',null,b);
    return [
      M('VISÃO GERAL E PREPARAÇÃO',[{p:'O Arquivo Zero usa um baralho fixo de 30 cartas e casos variáveis. Antes da aula, imprima as cartas (03_Cartas_PnP.pdf), o Quadro de Reconstrução do caso e disponibilize o Arquivo de Referência Técnica.'},{h:'DURAÇÃO SUGERIDA'},{p:'Iniciante: 40–60 min. Intermediário: 60–90 min. Avançado: 90–120 min, ou em duas sessões. Equipes de 3 a 5 pessoas funcionam melhor.'},{h:'PREPARAÇÃO RÁPIDA'},{list:['Gere o caso, anote a SEED e baixe o PDF.','Imprima o dossiê SEM as duas últimas páginas (gabarito e dicas): elas são suas.','Imprima as cartas e recorte; embaralhe e espalhe sobre a mesa.','Para enigmas coloridos (canais), imprima em cor; para o modo econômico, marque "Modo econômico (P&B)".']}]),
      M('GERADOR v3.0 — SEEDS, DOWNLOADS E PACK',[{p:'O gerador é estático e funciona em qualquer navegador moderno. Em Chrome/Edge no computador há também a gravação direta em pastas.'},{h:'DOWNLOADS'},{list:['"Baixar PDF do caso" gera o PDF em 300 DPI.','"Baixar kit completo (ZIP)" inclui o PDF, o JSON do caso e os PNGs de esteganografia.','"Gerar PACK (ZIP)" cria os PDFs-base, inclusive o arquivo de cartas para gráfica (sangria de 3 mm e TrimBox).','Em Chrome/Edge, "Gravar na pasta do projeto" salva direto em 01_Documentos e 02_Casos.']},{h:'SEEDS E LINKS'},{p:'A mesma seed e as mesmas técnicas geram sempre o mesmo caso. Use "Copiar link do caso" para compartilhar a configuração exata. Guarde a seed para reproduzir exatamente um caso.'}]),
      M('REGRA DE PALAVRA-PASSE',[{p:'Vigenère, substituição monoalfabética e transposição colunar recebem a chave por FRAGMENTO K intermediário. A palavra-passe nunca é impressa diretamente na evidência principal: a equipe converte números em letras (A=1…Z=26).'},{p:'As chaves vêm de um banco de 40 palavras e mudam por caso. A ficha de dicas indica a chave de cada evidência, caso a equipe trave.'}]),
      M('ENIGMAS VISUAIS E DIGITAIS',[{p:'Ruído visual e canais de cor são impressos como imagens. O ruído aparece ao afastar a folha ou reduzir a imagem. Os canais de cor ficam quase invisíveis a olho nu: um filtro vermelho (celofane) ou um editor de imagem resolve. Esteganografia LSB exige o PNG original e deve ser analisada no Analisador do site; recompressão JPEG ou impressão destroem a informação.'},{p:'Se não puder imprimir em cor, desmarque "Ocultação por canais de cor" ou ofereça o PNG digitalmente.'}]),
      M('CAMADA DEDUTIVA E CÓDIGO DE VERIFICAÇÃO',[{h:'QUADRO DE ÁLIBIS'},{p:'Com a opção ativa, o dossiê inclui um quadro de álibis. Três suspeitos são excluídos logicamente; restam o culpado e um falso suspeito. A equipe ainda precisa da evidência de PESSOA para decidir. O gabarito indica quem é o falso suspeito.'},{h:'CÓDIGO DE VERIFICAÇÃO'},{p:'Cada carta traz um fragmento (letra). Os seis fragmentos formam um código de verificação. Desde a v3.0, os 5 fragmentos de cada categoria são distintos: um código errado sempre indica ao menos uma carta errada. O código NÃO é uma palavra do dicionário.'},{p:'Atenção: as cartas da v3.0 têm fragmentos diferentes em 5 cartas (P5, I3, M5, R4, R5). Reimprima o baralho se você usava a versão anterior.'}]),
      M('DICAS, TEMPO E PONTUAÇÃO',[{h:'SISTEMA DE DICAS'},{p:'Cada evidência tem 3 níveis de dica na última página do PDF: (1) a família do enigma; (2) o nome da técnica; (3) o parâmetro específico (deslocamento, chave, coluna…). Entregue um nível por vez.'},{h:'PENALIDADES E PONTUAÇÃO (SUGESTÃO)'},{ex:'Dica 1: +2 min   Dica 2: +4 min   Dica 3: +6 min\nPontos = 1000 − tempo em minutos × 5 − dicas × 20\nCarta errada no quadro: −50 pontos cada'},{p:'Adapte livremente. O objetivo é manter o desafio justo e permitir que equipes de níveis diferentes avancem.'}])
    ].map((pg,i)=>Object.assign(pg,{code:`MNMS-AZ-MED-${pad2(i+1)}`}));
  }

  // ---------- modelo em branco e casos de exemplo ----------
  function blankPages(){
    return [{code:'MNMS-AZ-MODELO-01',draw:async P=>{await chrome(P,'MODELO EM BRANCO — PÁGINA DE EVIDÊNCIA');let y=section(P.x,'1. IDENTIFICAÇÃO DA EVIDÊNCIA',TOP);rect(P.x,16,y,178,22,{stroke:C.line,lw:.35});y=section(P.x,'2. CONTEÚDO RECUPERADO',y+27);rect(P.x,16,y,178,110,{stroke:C.line,lw:.35});y=section(P.x,'3. CONCLUSÃO DA EQUIPE',y+116);rect(P.x,16,y,178,15,{stroke:C.line,lw:.35})}},
            {orientation:'landscape',code:'MNMS-AZ-MODELO-02',draw:P=>reconDraw(P,{})}];
  }
  function examplePages(){
    const d=D(),k_=K();
    return ['A-ARQUIVO','B-BIBLIOTECA','C-LABORATORIO','D-SERVIDORES'].map((seed,i)=>{
      const c=k_.buildCase(seed,d.presets.intermediario),ev=k_.caseEvidence(c);
      return {code:`MNMS-AZ-EX-${pad2(i+1)}`,draw:async P=>{
        await chrome(P,`CASO DE EXEMPLO ${i+1} — SEED ${seed}`,'RESTRITO AO MEDIADOR');let y=section(P.x,'SOLUÇÃO E TÉCNICAS',TOP);
        d.categories.forEach((cat,j)=>{rect(P.x,16,y,178,15,{fill:j%2?'rgba(255,255,255,.45)':'rgba(200,190,170,.35)'});text(P.x,d.labels[cat],19,y+4.5,32,2.9,{bold:true,color:C.muted});text(P.x,c.solution[cat].name,52,y+3.5,66,3.6,{bold:true,fam:'serif',lh:1.2});text(P.x,techName(c.techniques[j].technique),120,y+4.2,72,2.9,{lh:1.2});y+=15});
        y+=4;rect(P.x,16,y,178,14,{fill:C.navy});text(P.x,'CÓDIGO DE VERIFICAÇÃO',21,y+4.6,90,3.1,{bold:true,color:C.navyInk});text(P.x,c.verification,110,y+2.6,80,7.5,{bold:true,color:st.eco?C.ink:'#e6c27a',align:'right',fam:'serif',lh:1});y+=20;
        y=section(P.x,'COMO REPRODUZIR',y);text(P.x,`Digite a seed "${seed}" no gerador, escolha o preset Intermediário e mantenha a camada dedutiva ativada. O caso será idêntico a este.`,16,y,178,3.3,{lh:1.45});
      }};
    });
  }

  const pageSets={case:casePages,cards:cardSheetPages,cardsShop:cardShopPages,ambient:ambientPages,reference:referencePages,mediator:mediatorPages,blank:blankPages,examples:examplePages};
  /** Renderiza um documento: Render.make('case',caseData,{dpi,eco,onProgress}) → itens de página. */
  async function make(name,arg,o={}){const pages=pageSets[name](arg);return R.renderPages(pages,Object.assign({id:name==='case'?arg.id:'DICC-MNMS-AZ-BASE'},o))}
  /** Gera o PDF de um documento (300 DPI por padrão): Render.makePdf('case',caso,{eco,onProgress}) → Blob. */
  async function makePdf(name,arg,o={}){return R.pagesToPdf(pageSets[name](arg),Object.assign({id:name==='case'?arg.id:'DICC-MNMS-AZ-BASE',dpi:300},o))}
  const PACK=[['01_Dossie_de_Ambientacao_Arquivo_Zero.pdf','ambient'],['02_Casos_de_Exemplo.pdf','examples'],['03_Cartas_PnP.pdf','cards'],['04_Arquivo_de_Referencia_Tecnica.pdf','reference'],['05_Manual_do_Mediador.pdf','mediator'],['06_Modelo_de_Caso_em_Branco.pdf','blank'],['07_Cartas_Para_Grafica_Sangria_3mm.pdf','cardsShop']];
  Object.assign(R,{make,makePdf,pageSets,caseLabels,PACK,TOP,BOTTOM});
})(typeof window!=='undefined'?window:globalThis);
