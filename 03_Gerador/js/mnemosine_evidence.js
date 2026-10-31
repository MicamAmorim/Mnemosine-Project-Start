/* Mnemosine // Arquivo Zero — renderizador (v3.0), parte 2: "skins" das evidências.
 * Cada família de técnica ganha um visual próprio: telegrama, terminal, osciloscópio, polaroide,
 * planta baixa, relatório contínuo, linha do tempo, livro e grade de Cardan. */
(function(global){
  const R=global.MnemosineRender,k=R.kit,C=k.C,st=k.st,{text,fit,rect,rrect,line,circle,stamp,tape,mm}=k;
  const V=()=>global.MnemosineVisuals;

  function telegram(P,m,b,o={}){
    const x=P.x;rect(x,b.X,b.Y,b.W,b.H,{fill:C.cream,stroke:C.line,lw:.35});
    for(let px=b.X+4;px<b.X+b.W-2;px+=4.5)circle(x,px,b.Y+3.2,.9,{fill:C.paper});
    text(x,o.title||'TELEGRAMA  //  MENSAGEM INTERCEPTADA',b.X,b.Y+8,b.W,3.6,{fam:'stamp',align:'center',color:C.muted});
    line(x,b.X+10,b.Y+15,b.X+b.W-10,b.Y+15,C.line,.3,[1.5,1]);
    let top=b.Y+20;
    if(m.type==='scytale'){text(x,`FAIXA FÍSICA: ${m.columns} COLUNAS`,b.X,top,b.W,3.6,{bold:true,align:'center',color:C.red});top+=9}
    if(m.needsKey&&!o.noKeyNote){text(x,'REQUER PALAVRA-PASSE — VER FRAGMENTO K',b.X,top,b.W,3.2,{bold:true,align:'center',color:C.red});top+=8}
    fit(x,o.body||m.display||m.text,b.X+10,top,b.W-20,b.Y+b.H-top-18,o.max||9,3.4,{bold:true,align:'center',vcenter:true,label:m.type,lh:1.5});
    text(x,'CANAL ALFA  •  TRANSMISSÃO CIFRADA  •  PRIORIDADE ALTA',b.X,b.Y+b.H-9,b.W,2.4,{align:'center',color:C.muted,fam:'stamp'});
  }

  function terminal(P,m,b){
    const x=P.x;rrect(x,b.X,b.Y,b.W,b.H,3,{fill:C.dark,stroke:C.line,lw:.35});
    if(!st.eco){circle(x,b.X+7,b.Y+6,1.3,{fill:'#d65a4e'});circle(x,b.X+11.5,b.Y+6,1.3,{fill:'#e0b04c'});circle(x,b.X+16,b.Y+6,1.3,{fill:'#6dbf6a'})}
    const name={binary:'bytes.bin',hexascii:'dump.hex',base64:'bloco.b64'}[m.type];
    text(x,`$ cat ${name}`,b.X+(st.eco?7:22),b.Y+4.4,b.W-30,3,{color:C.term,alpha:.85});line(x,b.X+4,b.Y+11,b.X+b.W-4,b.Y+11,C.term,.2);
    const g=(a,n)=>a.reduce((r,v,i)=>(i%n?r[r.length-1].push(v):r.push([v]),r),[]);
    let rows;
    if(m.type==='binary')rows=g(m.text.split(' '),5).map(r=>r.join(' '));
    else if(m.type==='hexascii')rows=g(m.text.split(' '),8).map((r,i)=>`${(i*8).toString(16).padStart(4,'0')}  ${r.join(' ')}`);
    else rows=m.text.match(/.{1,28}/g);
    fit(x,rows.join('\n'),b.X+7,b.Y+16,b.W-14,b.H-28,{binary:6.2,hexascii:8,base64:8.4}[m.type],2.8,{color:C.term,lh:1.6,label:m.type});
    text(x,'$ _',b.X+7,b.Y+b.H-9,30,3.2,{color:C.term,alpha:.85});
  }

  function scope(P,m,b){
    const x=P.x;rrect(x,b.X,b.Y,b.W,b.H,3,{fill:C.dark,stroke:C.line,lw:.35});
    if(!st.eco)for(let gx=b.X+10;gx<b.X+b.W;gx+=10)line(x,gx,b.Y+4,gx,b.Y+b.H-4,'rgba(127,216,232,.12)',.15);
    text(x,'OSCILOSCÓPIO  //  CANAL 1',b.X+6,b.Y+4,80,2.8,{color:C.scope,alpha:.8});
    const toks=m.text.split(' '),rowW=b.W-16,rowH=14,maxRows=Math.floor((b.H*.58)/rowH);
    const lay=u=>{const segs=[];let cx=0,row=0;const adv=n=>{cx+=n*u;if(cx>rowW){row++;cx=n*u>rowW?0:n*u}};
      toks.forEach((t,ti)=>{if(t==='|'){cx+=4*u;return}
        for(let i=0;i<t.length;i++){const len=t[i]==='-'?3:1;if(cx+len*u>rowW){row++;cx=0}segs.push({row,x:cx,w:len*u});cx+=len*u+u}
        cx+=2*u});return {segs,rows:row+1}};
    let u=2.4,L=lay(u);while(L.rows>maxRows&&u>.7){u-=.1;L=lay(u)}
    const y0=b.Y+12;
    for(let r=0;r<L.rows;r++)line(x,b.X+8,y0+r*rowH+10,b.X+8+rowW,y0+r*rowH+10,C.scope,.15,[1,1.5]);
    L.segs.forEach(s=>rect(x,b.X+8+s.x,y0+s.row*rowH+2,s.w,8,{fill:C.scope}));
    const ty=y0+L.rows*rowH+4;
    fit(x,m.text.replace(/\|/g,' / '),b.X+8,ty,rowW,b.Y+b.H-ty-8,5.6,3,{color:C.scope,lh:1.5,label:'morse'});
  }

  const CAPTION={noise:'Registro degradado por ruído de alta frequência.',color:'Registro multiespectral: os tons quase não se separam.',stegimage:'Imagem digital. A versão impressa não preserva os dados ocultos: use o PNG original.'};
  async function photo(P,m,b){
    const x=P.x,im=m.image?await k.loadImg(m.image):null,pw=b.W-30,ph=b.H-10,px=b.X+15,py=b.Y+5;
    if(!st.eco)rect(x,px+1.4,py+1.6,pw,ph,{fill:'rgba(40,30,15,.20)'});
    rect(x,px,py,pw,ph,{fill:'#fbfaf6',stroke:C.line,lw:.3});
    const crisp=m.type!=='pigpen';
    if(im)k.contain(x,im,px+7,py+7,pw-14,ph-7-26,{smooth:!crisp});
    else text(x,'[imagem indisponível]',px+7,py+ph/2,pw-14,3.4,{align:'center',color:C.muted});
    text(x,CAPTION[m.type]||'',px+7,py+ph-18,pw-14,3.6,{fam:'stamp',color:C.ink,align:'center',lh:1.45});
    tape(x,px+9,py+.5,-9);tape(x,px+pw-9,py+.5,7);
  }
  async function pigpen(P,m,b){
    const x=P.x,im=m.image?await k.loadImg(m.image):null;rect(x,b.X,b.Y,b.W,b.H,{fill:C.cream,stroke:C.line,lw:.35});
    for(let yy=b.Y+12;yy<b.Y+b.H-4;yy+=7)line(x,b.X+4,yy,b.X+b.W-4,yy,'rgba(70,110,160,.25)',.2);
    line(x,b.X+14,b.Y+3,b.X+14,b.Y+b.H-3,'rgba(190,70,70,.45)',.3);
    if(im)k.contain(x,im,b.X+18,b.Y+8,b.W-30,b.H-30);
    text(x,'Símbolos copiados do caderno.',b.X+18,b.Y+b.H-10,b.W-30,3.4,{fam:'stamp',color:C.muted});
  }

  function plan(P,m,b){
    const x=P.x,cw=36,ch=24,gx=b.X+(b.W-4*cw)/2+3,gy=b.Y+22;
    rect(x,b.X,b.Y,b.W,b.H,{fill:C.cream,stroke:C.line,lw:.35});
    text(x,'PLANTA DO PAVIMENTO  —  PROTOCOLO DE ACESSO',b.X,b.Y+6,b.W,3.6,{fam:'stamp',align:'center',color:C.muted});
    'ABCD'.split('').forEach((c,i)=>text(x,c,gx+i*cw,gy-6.5,cw,3.6,{bold:true,align:'center',color:C.muted}));
    [1,2,3,4].forEach((r,i)=>text(x,String(r),gx-7,gy+i*ch+ch/2-2,5,3.6,{bold:true,align:'center',color:C.muted}));
    m.cells.forEach((c,i)=>{
      const X=gx+(i%4)*cw,Y=gy+Math.floor(i/4)*ch,isStart=c.k===m.start;
      rect(x,X,Y,cw,ch,{fill:isStart?(st.eco?'#ddd':'#efdcae'):'#fbf8ee',stroke:C.ink,lw:.5});
      text(x,c.k,X+1.6,Y+1.4,10,2.4,{color:C.muted});
      fit(x,c.value,X+2,Y+7,cw-4,ch-9,3.7,2.5,{bold:true,align:'center',vcenter:true,lh:1.25,label:'célula'});
      if(isStart){circle(x,X+cw-4.5,Y+4.5,2,{fill:C.red});text(x,'INÍCIO',X+cw-17,Y+ch-4.6,16,2.3,{bold:true,color:C.red,align:'right'})}
    });
    const y2=gy+4*ch+7;rect(x,b.X+8,y2,b.W-16,12,{fill:C.navy});
    text(x,`INÍCIO: ${m.start}     TRAJETO (RELÓGIO): ${m.path}`,b.X+8,y2+3.4,b.W-16,4.4,{bold:true,color:C.navyInk,align:'center',lh:1.2});
  }

  function log(P,m,b){
    const x=P.x,lines=m.text.split('\n'),n=lines.length,pitch=Math.min(6,(b.H-26)/n),s=Math.min(3.9,(b.W-16)/(m.width*.6));
    rect(x,b.X,b.Y,b.W,b.H,{fill:C.cream,stroke:C.line,lw:.35});
    text(x,'RELATÓRIO DE OCORRÊNCIAS  —  IMPRESSÃO CONTÍNUA',b.X,b.Y+4,b.W,3.4,{fam:'stamp',align:'center',color:C.muted});
    const cwid=s*.6,x0=b.X+8,y0=b.Y+19;
    for(let c=10;c<=m.width;c+=10)text(x,String(c),x0+(c-1)*cwid-1,y0-6,6,1.9,{color:C.muted});
    x.font=`400 ${s*st.S}px ${k.FAM.mono}`;x.textBaseline='top';x.textAlign='left';
    lines.forEach((l,i)=>{const y=y0+i*pitch;if(i%2===0&&!st.eco)rect(x,b.X+4,y-.6,b.W-8,pitch,{fill:'rgba(120,170,120,.15)'});x.fillStyle=C.ink;x.fillText(l,mm(x0),mm(y))});
  }

  function timeline(P,m,b){
    const x=P.x,step=(b.W-50)/3,cy=b.Y+b.H/2,x0=b.X+25;
    rect(x,b.X,b.Y,b.W,b.H,{fill:C.cream,stroke:C.line,lw:.35});
    text(x,'LINHA TEMPORAL RECONSTRUÍDA  —  UM REGISTRO SE PERDEU',b.X,b.Y+8,b.W,3.6,{fam:'stamp',align:'center',color:C.muted});
    line(x,x0,cy,x0+3*step,cy,C.ink,.6);
    m.items.forEach((t,i)=>{
      const cx=x0+i*step,q=t==='?';
      circle(x,cx,cy,15,{fill:q?'#fff6d6':C.navy,stroke:q?C.red:C.navy,lw:.7,dash:q?[2,1.5]:null});
      text(x,t,cx-15,cy-(q?6:3.2),30,q?12:6,{bold:true,align:'center',color:q?C.red:C.navyInk,fam:q?'serif':'mono',lh:1});
      if(i<3){const ax=cx+step/2+4;x.fillStyle=C.ink;x.beginPath();x.moveTo(mm(ax),mm(cy-2.4));x.lineTo(mm(ax+4.5),mm(cy));x.lineTo(mm(ax),mm(cy+2.4));x.fill()}
    });
  }

  function book(P,m,b){
    const x=P.x;rect(x,b.X,b.Y,b.W,b.H,{fill:C.cream,stroke:C.line,lw:.35});
    text(x,'EXCERTO DE REFERÊNCIA  (linha : palavra)',b.X,b.Y+6,b.W,3.6,{fam:'stamp',align:'center',color:C.muted});
    line(x,b.X+10,b.Y+13,b.X+b.W-10,b.Y+13,C.line,.3,[1.5,1]);
    fit(x,m.bookLines.map((l,i)=>`${i+1}  ${l}`).join('\n'),b.X+9,b.Y+17,b.W-18,b.H*.55,4.2,2.8,{lh:1.75,label:'book'});
    const yy=b.Y+b.H*.55+24;text(x,'ÍNDICES',b.X,yy,b.W,3.4,{bold:true,align:'center',color:C.red});
    fit(x,m.text,b.X+10,yy+6,b.W-20,b.Y+b.H-yy-12,5,3,{bold:true,align:'center',lh:1.5,label:'book-idx'});
  }

  function cardan(P,m,b){
    const x=P.x,cs=11,N=m.N,gw=cs*N,gx=b.X+(b.W-2*gw-14)/2,gy=b.Y+22;
    rect(x,b.X,b.Y,b.W,b.H,{fill:C.cream,stroke:C.line,lw:.35});
    text(x,'GRADE  +  MÁSCARA PERFURADA',b.X,b.Y+6,b.W,3.6,{fam:'stamp',align:'center',color:C.muted});
    text(x,'GRADE',gx,gy-7,gw,3.4,{bold:true,align:'center'});text(x,'MÁSCARA',gx+gw+14,gy-7,gw,3.4,{bold:true,align:'center'});
    for(let i=0;i<N*N;i++){
      const cx=i%N,cy=Math.floor(i/N),hole=m.holes.includes(i);
      rect(x,gx+cx*cs,gy+cy*cs,cs,cs,{fill:'#fbf8ee',stroke:C.ink,lw:.35});text(x,m.grid[i],gx+cx*cs,gy+cy*cs+2.2,cs,5.6,{bold:true,align:'center',lh:1});
      const mx=gx+gw+14+cx*cs;
      if(hole)rect(x,mx,gy+cy*cs,cs,cs,{fill:'#fff',stroke:C.ink,lw:.5,dash:[1,.8]});else rect(x,mx,gy+cy*cs,cs,cs,{fill:C.navy,stroke:C.ink,lw:.3});
    }
    text(x,'Recorte os furos brancos da máscara (ou copie-os numa transparência), sobreponha à grade e leia as letras expostas, de cima para baixo e da esquerda para a direita.',b.X+12,gy+gw+8,b.W-24,3.3,{align:'center',color:C.muted});
  }

  /** Desenha a evidência em b={X,Y,W,H} (mm). */
  async function drawEvidence(P,m,b){
    switch(m.type){
      case'morse':return scope(P,m,b);
      case'binary':case'hexascii':case'base64':return terminal(P,m,b);
      case'noise':case'color':case'stegimage':return photo(P,m,b);
      case'pigpen':return pigpen(P,m,b);
      case'coords':return plan(P,m,b);
      case'acrostic':return log(P,m,b);
      case'time':return timeline(P,m,b);
      case'book':return book(P,m,b);
      case'cardan':return cardan(P,m,b);
      default:return telegram(P,m,b);
    }
  }
  function keyPanel(P,m,b){telegram(P,m,b,{title:'FRAGMENTO K  //  CHAVE PARCIAL',body:m.keyFragment,max:11,noKeyNote:true})}

  Object.assign(R,{drawEvidence,keyPanel});
})(typeof window!=='undefined'?window:globalThis);
