/* Mnemosine // Arquivo Zero — núcleo lógico (v3.0)
 * Técnicas de cifra/codificação, regras de compatibilidade, geração de caso (única para UI,
 * exemplos e pack), camada dedutiva (álibis) e dicas. Sem DOM: roda no navegador e no Node. */
(function(global){
  const D=global.MnemosineData||require('./mnemosine_data.js');
  const V=()=>global.MnemosineVisuals;
  const AZ='ABCDEFGHIJKLMNOPQRSTUVWXYZ', PB='ABCDEFGHIKLMNOPQRSTUVWXYZ', NOISE='QXZKJWV';
  const MORSE={A:'.-',B:'-...',C:'-.-.',D:'-..',E:'.',F:'..-.',G:'--.',H:'....',I:'..',J:'.---',K:'-.-',L:'.-..',M:'--',N:'-.',O:'---',P:'.--.',Q:'--.-',R:'.-.',S:'...',T:'-',U:'..-',V:'...-',W:'.--',X:'-..-',Y:'-.--',Z:'--..','0':'-----','1':'.----','2':'..---','3':'...--','4':'....-','5':'.....','6':'-....','7':'--...','8':'---..','9':'----.'};
  const normalize=s=>D.norm(s);
  const clean=s=>normalize(s).replace(/ /g,'');
  const pickNoise=r=>NOISE[Math.floor(r()*NOISE.length)];
  const group5=t=>t.replace(/ /g,'').replace(/(.{5})/g,'$1 ').trim();

  const TITLES={caesar:'MENSAGEM INTERCEPTADA',a1z26:'REGISTRO NUMÉRICO',acrostic:'RELATÓRIO MONOESPAÇADO',periodic:'PACOTE DE CARACTERES',oddEven:'FLUXO INTERCALADO',morse:'SINAL PULSADO',polybius:'PARES DE COORDENADAS',coords:'MAPA COM TRAJETÓRIA CODIFICADA',vigenere:'MENSAGEM COM CHAVE DERIVADA',binary:'BYTES BINÁRIOS / ASCII',prime:'AMOSTRA INDEXADA',time:'LINHA TEMPORAL',noise:'REGISTRO VISUAL DEGRADADO',color:'REGISTRO MULTIESPECTRAL',pigpen:'REGISTRO SIMBÓLICO',scytale:'FAIXA DE TRANSPOSIÇÃO',base64:'BLOCO CODIFICADO BASE64',hexascii:'DUMP HEXADECIMAL / ASCII',mono:'SUBSTITUIÇÃO COM ALFABETO-CHAVE',columnar:'TRANSPOSIÇÃO COLUNAR',book:'CIFRA POR REFERÊNCIA TEXTUAL',cardan:'GRADE DE CARDAN',stegimage:'IMAGEM COM DADOS OCULTOS (LSB)'};

  // ---------- técnicas ----------
  const caesarShift=seed=>2+Math.floor(D.rngFrom(seed+'|CAESAR')()*23); // 2..24, varia por caso (v3.0)
  function caesar(s,k){return normalize(s).split('').map(ch=>{const i=AZ.indexOf(ch);return i<0?ch:AZ[(i+k)%26]}).join('')}
  function a1z26(s){return normalize(s).split('').map(ch=>ch===' '?'':AZ.indexOf(ch)+1).filter(v=>v!==''&&v>0).join(' ')}
  function morse(s){return normalize(s).split('').map(ch=>ch===' '?'|':MORSE[ch]||'').join(' ')}
  function polybius(s){return normalize(s).replace(/J/g,'I').split('').filter(ch=>AZ.includes(ch)).map(ch=>{const i=PB.indexOf(ch);return `${Math.floor(i/5)+1}${i%5+1}`}).join(' ')}
  function vigenere(s,key){s=normalize(s);key=clean(key)||'ORION';let j=0,out='';for(const ch of s){const i=AZ.indexOf(ch);if(i<0){out+=ch;continue}out+=AZ[(i+AZ.indexOf(key[j++%key.length]))%26]}return out}
  function binary(s){return normalize(s).split('').map(ch=>ch===' '?'00100000':ch.charCodeAt(0).toString(2).padStart(8,'0')).join(' ')}
  const SUBJECTS=['CONTROLE DE ACESSO','ARQUIVO INTERNO','ROTINA DE INSPECAO','RELATORIO OPERACIONAL','REGISTRO DE TURNO','PROTOCOLO DE SALA','VERIFICACAO DE EQUIPAMENTO','MOVIMENTO DE PESSOAL'];
  const STATES=['SEM ALTERACAO RELEVANTE','CONFERIDO PELO SETOR','MANTIDO SOB OBSERVACAO','LIBERADO APOS REVISAO','REGISTRO SEM DIVERGENCIA','FLUXO DENTRO DO ESPERADO','ARQUIVADO SEM RESSALVAS','VALIDADO NO CONTROLE'];
  function acrostic(s,seed){
    const r=D.rngFrom(seed+'|COLUNA'),ans=clean(s),col=18+Math.floor(r()*22),width=68;
    const lines=ans.split('').map(ch=>{
      const hh=String(18+Math.floor(r()*5)).padStart(2,'0'),mi=String(Math.floor(r()*60)).padStart(2,'0'),id=100+Math.floor(r()*900);
      const base=(`${hh}:${mi} | R${id} | ${D.choose(SUBJECTS,r)} | ${D.choose(STATES,r)}`).padEnd(width,' ').slice(0,width);
      return base.slice(0,col-1)+ch+base.slice(col);
    });
    return {text:lines.join('\n'),column:col,width,lineCount:lines.length};
  }
  function periodic(s,seed){const r=D.rngFrom(seed),out=[];for(const ch of clean(s))out.push(pickNoise(r),pickNoise(r),ch);return out.join('')}
  function oddEven(s,seed){const r=D.rngFrom(seed),out=[];for(const ch of clean(s))out.push(ch,pickNoise(r));return out.join('')}
  const PRIMES=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83];
  /* v3.0: o tamanho é último_primo+1 (par, logo não primo): não sobra posição prima com ruído. */
  function prime(s,seed){const ans=clean(s),n=PRIMES[Math.min(ans.length-1,PRIMES.length-1)]+1,r=D.rngFrom(seed),arr=Array.from({length:n},()=>pickNoise(r));for(let i=0;i<ans.length&&i<PRIMES.length;i++)arr[PRIMES[i]-1]=ans[i];return arr.join('')}
  const minutes=hhmm=>{const m=/^(\d\d):(\d\d)$/.exec(hhmm);return m?+m[1]*60+ +m[2]:null};
  const fmtTime=v=>`${String(Math.floor(v/60)).padStart(2,'0')}:${String(v%60).padStart(2,'0')}`;
  function timeSeq(answer){const t=minutes(answer)??21*60,d=15;return {items:[fmtTime(t-2*d),fmtTime(t-d),'?',fmtTime(t+d)],text:[fmtTime(t-2*d),fmtTime(t-d),'?',fmtTime(t+d)].join('  →  ')}}
  const COORD_FILL=['Depósito','Hall','Arquivo','Sala 1','Pátio','Copa','Sala 3','Recepção','Oficina','Almoxarifado','Arquivo B','Sala Técnica','Anexo','Galeria','Portaria'];
  function coords(answer,seed,locals){
    const r=D.rngFrom(seed),labels=[];for(let rr=1;rr<=4;rr++)for(const c of 'ABCD')labels.push(c+rr);
    const target=Math.floor(r()*16),tr=Math.floor(target/4),tc=target%4;
    // v3.0: as outras cartas de LOCAL também aparecem como distratores — o trajeto passa a ser obrigatório.
    const others=D.shuffle(locals.filter(n=>n!==answer),r),fill=D.shuffle(COORD_FILL,r),free=D.shuffle(labels.map((_,i)=>i).filter(i=>i!==target),r),val=[];
    val[target]=answer;others.forEach((n,i)=>val[free[i]]=n);free.slice(others.length).forEach((i,j)=>val[i]=fill[j%fill.length]);
    const starts=labels.map((_,i)=>i).filter(i=>Math.abs(Math.floor(i/4)-tr)+Math.abs(i%4-tc)>=3),start=D.choose(starts,r),sr=Math.floor(start/4),sc=start%4;
    const shortest=[];for(let c=sc;c<tc;c++)shortest.push('E');for(let c=sc;c>tc;c--)shortest.push('W');for(let q=sr;q<tr;q++)shortest.push('S');for(let q=sr;q>tr;q--)shortest.push('N');
    const ordered=D.shuffle(shortest,r),moves=[],cut=1+Math.floor(r()*(ordered.length-1));
    moves.push(...ordered.slice(0,cut));
    const cr=sr+moves.filter(x=>x==='S').length-moves.filter(x=>x==='N').length,cc=sc+moves.filter(x=>x==='E').length-moves.filter(x=>x==='W').length,loops=[];
    if(cc<3)loops.push(['E','W']);if(cc>0)loops.push(['W','E']);if(cr<3)loops.push(['S','N']);if(cr>0)loops.push(['N','S']);
    if(loops.length&&r()<.85)moves.push(...D.choose(loops,r));
    moves.push(...ordered.slice(cut));
    const clock={N:'12',E:'3',S:'6',W:'9'};
    return {start:labels[start],path:moves.map(d=>clock[d]).join(' · '),moves,cells:labels.map((k,i)=>({k,value:val[i]})),target:labels[target]};
  }
  const base64Encode=s=>btoa(unescape(encodeURIComponent(normalize(s))));
  const hexAscii=s=>[...normalize(s)].map(ch=>ch.charCodeAt(0).toString(16).toUpperCase().padStart(2,'0')).join(' ');
  const deriveKey=(seed,tag)=>D.choose(D.KEYS,D.rngFrom(seed+'|'+tag));
  function keyedAlphabet(key){let seen='';for(const ch of clean(key)+AZ)if(AZ.includes(ch)&&!seen.includes(ch))seen+=ch;return seen}
  function monoEncrypt(s,key){const ka=keyedAlphabet(key);return normalize(s).split('').map(ch=>{const i=AZ.indexOf(ch);return i<0?ch:ka[i]}).join('')}
  function scytaleEncrypt(s,cols){const t=clean(s),rows=Math.ceil(t.length/cols),pad=t.padEnd(rows*cols,'X');let out='';for(let c=0;c<cols;c++)for(let r=0;r<rows;r++)out+=pad[r*cols+c];return out}
  function columnarEncrypt(s,key){const t=clean(s),k=clean(key),cols=k.length,rows=Math.ceil(t.length/cols),pad=t.padEnd(rows*cols,'X'),order=[...k].map((ch,i)=>({ch,i})).sort((a,b)=>a.ch.localeCompare(b.ch)||a.i-b.i);let out='';for(const o of order)for(let r=0;r<rows;r++)out+=pad[r*cols+o.i];return out}
  // v3.0: o preenchimento usa o MESMO vocabulário das palavras-resposta (não dá para achá-las pelo vocabulário).
  const BOOK={A:['alvo','acesso'],B:['bloco','balcão'],C:['cifra','cofre'],D:['dossiê','depósito'],E:['evidência','escada'],F:['filtro','fenda'],G:['grade','gaveta'],H:['hora','horário'],I:['índice','inspeção'],J:['janela','jornal'],K:['kilo','kit'],L:['linha','lacre'],M:['mapa','memória'],N:['número','nota'],O:['objeto','ofício'],P:['pista','porta'],Q:['quadro','quarto'],R:['rota','registro'],S:['sinal','sala'],T:['texto','turno'],U:['urna','unidade'],V:['vetor','vidro'],W:['web','walkie'],X:['xilofone','xerox'],Y:['ypsilon','yen'],Z:['zona','zelador']};
  const BOOK_ALL=Object.values(BOOK).flat();
  function bookCipher(s,seed){
    const ans=clean(s),r=D.rngFrom(seed+'|BOOK'),lines=8,per=7,total=lines*per;
    const grid=Array.from({length:total},()=>D.choose(BOOK_ALL,r)),pool=D.shuffle(Array.from({length:total},(_,i)=>i),r);
    const chosen=pool.slice(0,Math.min(ans.length,total)).sort((a,b)=>a-b),positions=[];
    chosen.forEach((p,i)=>{const ch=ans[i];grid[p]=BOOK[ch]?D.choose(BOOK[ch],r):ch;positions.push(`${Math.floor(p/per)+1}:${p%per+1}`)});
    return {coords:positions.join('  '),lines:Array.from({length:lines},(_,li)=>grid.slice(li*per,(li+1)*per).join(' '))};
  }
  function cardanCipher(s,seed){
    const ans=clean(s),r=D.rngFrom(seed+'|CARDAN'),N=6,total=N*N,pool=D.shuffle(Array.from({length:total},(_,i)=>i),r),holes=pool.slice(0,Math.min(ans.length,total)).sort((a,b)=>a-b),noise='QXZKJWVRTY';
    const grid=Array.from({length:total},()=>noise[Math.floor(r()*noise.length)]);holes.forEach((p,i)=>grid[p]=ans[i]);return {N,grid,holes};
  }

  // ---------- compatibilidade ----------
  const LETTER_ONLY=new Set(['caesar','a1z26','pigpen','polybius','mono','book']);
  const DIGIT_UNSAFE=new Set(['vigenere','scytale']); // dígitos passam intactos / texto de 4 caracteres vira 1 linha
  function compatibleTechniques(cat,selected){
    return selected.filter(t=>{
      if(t==='time')return cat==='horario';
      if(t==='coords')return cat==='local';
      if(cat==='horario')return !LETTER_ONLY.has(t)&&!DIGIT_UNSAFE.has(t);
      return true;
    });
  }

  // ---------- modelo de evidência ----------
  function evidenceModel(answer,tech,seed,ctx={}){
    const t=typeof tech==='string'?tech:tech.id,m={type:t,answer,seed,title:TITLES[t]||'REGISTRO'};
    const locals=ctx.locals||D.cards.local.map(c=>c.name);
    switch(t){
      case'caesar':m.shift=caesarShift(seed);m.text=caesar(answer,m.shift);break;
      case'a1z26':m.text=a1z26(answer);break;
      case'acrostic':Object.assign(m,acrostic(answer,seed));break;
      case'periodic':m.text=periodic(answer,seed);break;
      case'oddEven':m.text=oddEven(answer,seed);break;
      case'morse':m.text=morse(answer);break;
      case'polybius':m.text=polybius(answer);break;
      case'coords':Object.assign(m,coords(answer,seed,locals));break;
      case'vigenere':m.key=deriveKey(seed,'VIG');m.keyFragment=a1z26(m.key);m.text=vigenere(answer,m.key);break;
      case'binary':m.text=binary(answer);break;
      case'prime':m.text=prime(answer,seed);break;
      case'time':Object.assign(m,timeSeq(answer));break;
      case'noise':m.image=V()?V().visualData(answer,seed,'noise'):null;break;
      case'color':m.image=V()?V().visualData(answer,seed,'color'):null;break;
      case'pigpen':m.image=V()?V().pigpenData(answer):null;break;
      case'scytale':m.columns=3+Math.floor(D.rngFrom(seed+'|SCY')()*3);m.text=scytaleEncrypt(answer,m.columns);break;
      case'base64':m.text=base64Encode(answer);break;
      case'hexascii':m.text=hexAscii(answer);break;
      case'mono':m.key=deriveKey(seed,'MONO');m.keyFragment=a1z26(m.key);m.text=monoEncrypt(answer,m.key);break;
      case'columnar':m.key=deriveKey(seed,'COL');m.keyFragment=a1z26(m.key);m.text=columnarEncrypt(answer,m.key);break;
      case'book':{const b=bookCipher(answer,seed);m.text=b.coords;m.bookLines=b.lines;break}
      case'cardan':Object.assign(m,cardanCipher(answer,seed));break;
      case'stegimage':m.image=V()?V().stegData(answer,seed):null;m.digital=true;break;
      default:m.text=normalize(answer);
    }
    m.display=['periodic','oddEven','prime','columnar','scytale'].includes(t)&&m.text?group5(m.text):m.text;
    m.needsKey=!!m.keyFragment;
    m.hints=hintsFor(m);
    return m;
  }

  function hintsFor(m){
    const H={
      caesar:['Cifra de substituição por deslocamento.','Cifra de César: cada letra foi deslocada no alfabeto.',`O deslocamento deste caso é de ${m.shift} posições (desfaça-o).`],
      a1z26:['Código numérico.','Cada número é a posição de uma letra no alfabeto.','A=1, B=2 … Z=26. Um número por letra.'],
      acrostic:['A mensagem está na forma do texto, não nas palavras.','Procure uma coluna vertical de letras fora de lugar.',`A coluna oculta é a de número ${m.column}, contando da esquerda.`],
      periodic:['Há letras de ruído misturadas ao texto.','Leia uma letra a cada intervalo fixo.','Use a 3ª, a 6ª, a 9ª letra… (ignore os espaços de agrupamento).'],
      oddEven:['Há letras de ruído intercaladas.','Leia só um dos dois grupos de posições.','Use as posições ímpares: 1ª, 3ª, 5ª… (ignore os espaços de agrupamento).'],
      morse:['Sinal com pulsos curtos e longos.','Código Morse (ponto e traço).','Pulso curto = ponto, longo = traço; "|" separa palavras.'],
      polybius:['Pares de números.','Quadrado de Polybius 5×5 (I e J juntos).','Primeiro número = linha, segundo = coluna.'],
      coords:['Raciocínio espacial.','Siga o trajeto a partir da casa inicial.','Cada número é uma posição de relógio: 12 norte, 3 leste, 6 sul, 9 oeste. A resposta é a casa final.'],
      vigenere:['Cifra com palavra-chave.','Vigenère: a chave se repete sobre a mensagem.',`Chave: ${m.key} (a palavra vem do Fragmento K).`],
      binary:['Sequência de 0 e 1.','Bytes de 8 bits em ASCII.','Converta cada grupo de 8 bits em um caractere.'],
      prime:['Ruído com letras escondidas.','As letras estão em posições primas.','Posições 2, 3, 5, 7, 11, 13… (ignore os espaços de agrupamento).'],
      time:['Raciocínio com tempo.','Descubra o horário que falta na sequência.','Os horários avançam em passos regulares de 15 minutos.'],
      noise:['Imagem degradada por ruído.','Afaste a folha ou reduza a imagem: o texto aparece por contraste suave.','Em tela, desfoque a imagem e aumente o contraste.'],
      color:['Imagem com dois tons muito próximos.','Compare as cores com atenção; o canal vermelho separa os tons.','Em tela, isole o canal vermelho.'],
      pigpen:['Símbolos geométricos.','Cifra Pigpen (grade de “chiqueiro”).','Cada símbolo é uma letra, conforme a posição na grade e o ponto.'],
      scytale:['Transposição de letras.','Scytale: o texto foi lido em colunas de uma faixa enrolada.',`Use ${m.columns} colunas: distribua o texto em colunas e leia por linhas.`],
      base64:['Codificação digital.','Base64.','Decodifique Base64 e leia o resultado como texto.'],
      hexascii:['Valores hexadecimais.','Cada par hexadecimal é um caractere ASCII.','Exemplo: 41 = A.'],
      mono:['Substituição fixa de letras.','Alfabeto-chave construído a partir de uma palavra.',`Chave: ${m.key} (vem do Fragmento K).`],
      columnar:['Transposição de letras.','Colunar com palavra-chave.',`Chave: ${m.key} (vem do Fragmento K).`],
      book:['Referência a um texto.','Pares linha:palavra.','Leia a inicial de cada palavra indicada, na ordem.'],
      cardan:['Grade com máscara.','Grade de Cardan.','Imagine furos nas posições indicadas e leia as letras expostas na ordem.'],
      stegimage:['Dado oculto numa imagem.','Esteganografia por bit menos significativo (LSB).','Abra o PNG original no Analisador (bit 0 do canal vermelho).']
    };
    return H[m.type]||['Registro bruto.','',''];
  }

  // ---------- camada dedutiva (álibis) ----------
  function makeAlibis(sol,seed){
    const r=D.rngFrom(seed+'|ALIBI'),t=minutes(sol.horario.name)??21*60,culprit=sol.pessoa;
    const others=D.cards.pessoa.filter(p=>p.id!==culprit.id),places=D.cards.local.filter(l=>l.id!==sol.local.id),weakIdx=Math.floor(r()*others.length);
    const SRC=['Registro de acesso','Câmera interna','Testemunha','Ponto eletrônico','Registro de visitante'];
    const rows=others.map((p,i)=>{
      const weak=i===weakIdx;let start,end;
      if(weak){const before=r()<.5;start=before?t-45:t+15;end=before?t-15:t+45}
      else{start=t-15*(1+Math.floor(r()*2));end=t+15*(1+Math.floor(r()*2))}
      return {person:p,place:weak&&r()<.5?sol.local:D.choose(places,r),start,end,source:D.choose(SRC,r),excludes:!weak};
    });
    rows.push({person:culprit,place:null,start:null,end:null,source:'Sem registro verificável',excludes:false});
    return {rows:D.shuffle(rows,r),culpritId:culprit.id,decoyId:others[weakIdx].id};
  }

  // ---------- caso ----------
  function caseMeta(seed){
    const r=D.rngFrom(seed+'|META');
    return {agent:D.choose(D.AGENTS,r),date:`${String(1+Math.floor(r()*28)).padStart(2,'0')}/${String(3+Math.floor(r()*8)).padStart(2,'0')}/2026`,classification:D.choose(['RESERVADO','CONFIDENCIAL','URGENTE'],r),protocol:'P-'+(10000+Math.floor(r()*90000))};
  }
  function buildCase(seed,selected,opts={}){
    const sel=[...new Set(selected)].filter(id=>D.allTechniques.some(t=>t.id===id));
    if(sel.length<3)throw new Error('Marque ao menos três técnicas.');
    const r=D.rngFrom(seed),solution={};
    for(const c of D.categories)solution[c]=D.choose(D.cards[c],r);
    const used=[],techniques=[];
    for(const cat of D.categories){
      let pool=compatibleTechniques(cat,sel).filter(x=>!used.includes(x));
      if(!pool.length)pool=compatibleTechniques(cat,sel);
      if(!pool.length)throw new Error(`Nenhuma técnica selecionada serve para ${D.labels[cat]}. Marque, por exemplo, ${cat==='horario'?'Sequência temporal, Morse ou Binário':'mais uma técnica'}.`);
      let t=D.choose(pool,r);
      if(cat==='local'&&sel.includes('coords')&&r()<.35)t='coords';
      if(cat==='horario'&&sel.includes('time')&&r()<.55)t='time';
      used.push(t);techniques.push({category:cat,technique:t});
    }
    const withAlibis=opts.alibis!==false;
    return {schema:3,seed:String(seed),id:D.caseId(seed),solution,techniques,verification:D.verification(solution),meta:caseMeta(seed),alibis:withAlibis?makeAlibis(solution,seed):null};
  }
  const caseEvidence=c=>c.techniques.map(t=>evidenceModel(c.solution[t.category].name,t.technique,`${c.seed}|${t.category}`));

  const API={AZ,PB,MORSE,TITLES,NOISE,normalize,group5,minutes,fmtTime,caesar,caesarShift,a1z26,morse,polybius,vigenere,binary,acrostic,periodic,oddEven,prime,timeSeq,coords,base64Encode,hexAscii,deriveKey,keyedAlphabet,monoEncrypt,scytaleEncrypt,columnarEncrypt,bookCipher,cardanCipher,compatibleTechniques,evidenceModel,hintsFor,makeAlibis,caseMeta,buildCase,caseEvidence,BOOK};
  global.MnemosineCore=API;
  if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof window!=='undefined'?window:globalThis);
