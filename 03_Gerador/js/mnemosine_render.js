/* Mnemosine // Arquivo Zero — renderizador (v3.0), parte 1: kit de desenho.
 * Tudo é desenhado em MILÍMETROS e rasterizado em 300 DPI (pré-visualização usa DPI menor com
 * o MESMO layout: as quebras de linha são medidas numa escala fixa, independente do DPI). */
(function(global){
  const D=()=>global.MnemosineData,K=()=>global.MnemosineCore;
  const SRC=(typeof document!=='undefined'&&document.currentScript&&document.currentScript.src)||null;
  const FAM={
    mono:'"Courier Prime","Courier New",Courier,monospace',
    serif:'"Libre Baskerville",Georgia,"Times New Roman",serif',
    stamp:'"Special Elite","Courier Prime","Courier New",monospace'
  };
  const PAL={
    color:{paper:'#eee9dc',ink:'#222',navy:'#233d4d',navyInk:'#fff',muted:'#6a665e',line:'#817b70',gold:'#b78b35',red:'#a73732',blue:'#c9d5dc',cream:'#f7f2e6',dark:'#0d181d',term:'#86e7ae',scope:'#7fd8e8',green:'#3b7865',warn:'#7a5a20'},
    eco:{paper:'#ffffff',ink:'#111',navy:'#e4e4e4',navyInk:'#111',muted:'#555',line:'#777',gold:'#444',red:'#222',blue:'#eee',cream:'#fff',dark:'#f3f3f3',term:'#111',scope:'#111',green:'#333',warn:'#ddd'}
  };
  const C=Object.assign({},PAL.color),st={dpi:300,S:300/25.4,eco:false},stats={overflow:[]};
  const mm=n=>n*st.S, pad2=n=>String(n).padStart(2,'0');
  function configure(o={}){if(o.dpi){st.dpi=o.dpi;st.S=o.dpi/25.4}if('eco' in o){st.eco=!!o.eco;Object.assign(C,st.eco?PAL.eco:PAL.color)}}

  // ---------- fontes ----------
  let fontsReady=null;
  function loadFonts(){
    if(fontsReady)return fontsReady;
    if(typeof FontFace==='undefined'||!SRC)return (fontsReady=Promise.resolve(false));
    const b=new URL('../fonts/',SRC).href;
    const defs=[['Courier Prime','CourierPrime-Regular.ttf','400'],['Courier Prime','CourierPrime-Bold.ttf','700'],['Libre Baskerville','LibreBaskerville-Variable.ttf','400 700'],['Special Elite','SpecialElite-Regular.ttf','400']];
    fontsReady=Promise.all(defs.map(async([fam,file,w])=>{try{const f=new FontFace(fam,`url(${b+file})`,{weight:w});await f.load();document.fonts.add(f);return true}catch(e){console.warn('Fonte indisponível',file,e);return false}})).then(r=>r.every(Boolean));
    return fontsReady;
  }

  // ---------- medição / texto ----------
  let M=null;const meas=()=>M||(M=document.createElement('canvas').getContext('2d'));
  const tw=(t,size,bold,fam)=>{const m=meas();m.font=`${bold?700:400} ${size*20}px ${FAM[fam||'mono']}`;return m.measureText(t).width/20};
  function wrap(t,W,size,bold,fam){
    const out=[];
    for(const para of String(t).split('\n')){
      let line='';
      for(let w of para.split(/ +/)){
        while(tw(w,size,bold,fam)>W&&w.length>1){let k=w.length;while(k>1&&tw(w.slice(0,k),size,bold,fam)>W)k--;if(line){out.push(line);line=''}out.push(w.slice(0,k));w=w.slice(k)}
        const z=line?line+' '+w:w;
        if(line&&tw(z,size,bold,fam)>W){out.push(line);line=w}else line=z;
      }
      out.push(line);
    }
    return out;
  }
  const setFont=(x,size,o)=>{x.font=`${o.bold?700:400} ${size*st.S}px ${FAM[o.fam||'mono']}`};
  /** Desenha texto com quebra automática. Retorna o Y (mm) logo abaixo da última linha. */
  function text(x,t,X,Y,W,size,o={}){
    o=Object.assign({lh:1.4,color:C.ink,align:'left',fam:'mono'},o);
    setFont(x,size,o);x.fillStyle=o.color;x.textBaseline='top';x.textAlign=o.align;
    const ax=o.align==='center'?X+W/2:o.align==='right'?X+W:X;let y=Y;
    if(o.alpha!=null){x.save();x.globalAlpha=o.alpha}
    for(const l of wrap(t,W,size,o.bold,o.fam)){x.fillText(l,mm(ax),mm(y));y+=size*o.lh}
    if(o.alpha!=null)x.restore();
    x.textAlign='left';
    return y;
  }
  /** Maior tamanho (≤max, ≥min) que cabe em W×H. Registra estouro em stats.overflow. */
  function fit(x,t,X,Y,W,H,max,min,o={}){
    const lh=o.lh||1.4;let s=max;
    for(;s>=min-1e-6;s-=.2){if(wrap(t,W,s,o.bold,o.fam).length*s*lh<=H)break}
    if(s<min-1e-6){s=min;stats.overflow.push({label:o.label||'fit',text:String(t).slice(0,30)})}
    const n=wrap(t,W,s,o.bold,o.fam).length,y0=o.vcenter?Y+Math.max(0,(H-n*s*lh)/2):Y;
    return {size:s,bottom:text(x,t,X,y0,W,s,o),lines:n};
  }
  const lineHeight=(size,lh=1.4)=>size*lh;

  // ---------- primitivas ----------
  function rect(x,X,Y,W,H,o={}){if(o.fill){x.fillStyle=o.fill;x.fillRect(mm(X),mm(Y),mm(W),mm(H))}if(o.stroke){x.strokeStyle=o.stroke;x.lineWidth=mm(o.lw||.25);if(o.dash)x.setLineDash(o.dash.map(mm));x.strokeRect(mm(X),mm(Y),mm(W),mm(H));x.setLineDash([])}}
  function rrect(x,X,Y,W,H,r,o={}){x.beginPath();x.moveTo(mm(X+r),mm(Y));x.arcTo(mm(X+W),mm(Y),mm(X+W),mm(Y+H),mm(r));x.arcTo(mm(X+W),mm(Y+H),mm(X),mm(Y+H),mm(r));x.arcTo(mm(X),mm(Y+H),mm(X),mm(Y),mm(r));x.arcTo(mm(X),mm(Y),mm(X+W),mm(Y),mm(r));x.closePath();if(o.fill){x.fillStyle=o.fill;x.fill()}if(o.stroke){x.strokeStyle=o.stroke;x.lineWidth=mm(o.lw||.25);x.stroke()}}
  function line(x,x1,y1,x2,y2,color,lw=.25,dash){x.save();x.strokeStyle=color||C.line;x.lineWidth=mm(lw);if(dash)x.setLineDash(dash.map(mm));x.beginPath();x.moveTo(mm(x1),mm(y1));x.lineTo(mm(x2),mm(y2));x.stroke();x.restore()}
  function circle(x,cx,cy,r,o={}){x.beginPath();x.arc(mm(cx),mm(cy),mm(r),0,Math.PI*2);if(o.fill){x.fillStyle=o.fill;x.fill()}if(o.stroke){x.strokeStyle=o.stroke;x.lineWidth=mm(o.lw||.25);if(o.dash)x.setLineDash(o.dash.map(mm));x.stroke();x.setLineDash([])}}
  function stamp(x,label,cx,cy,deg,o={}){
    const size=o.size||5,w=tw(label,size,false,'stamp')+7,h=size*1.9,col=o.color||C.red;
    x.save();x.translate(mm(cx),mm(cy));x.rotate(deg*Math.PI/180);x.globalAlpha=o.alpha??(st.eco?.9:.6);x.strokeStyle=col;x.fillStyle=col;
    x.lineWidth=mm(.8);x.strokeRect(mm(-w/2),mm(-h/2),mm(w),mm(h));x.lineWidth=mm(.3);x.strokeRect(mm(-w/2+1),mm(-h/2+1),mm(w-2),mm(h-2));
    setFont(x,size,{fam:'stamp'});x.textAlign='center';x.textBaseline='middle';x.fillText(label,0,mm(.15));x.restore();
  }
  function tape(x,cx,cy,deg,w=22,h=6.5){if(st.eco)return;x.save();x.translate(mm(cx),mm(cy));x.rotate(deg*Math.PI/180);x.fillStyle='rgba(224,208,150,.72)';x.fillRect(mm(-w/2),mm(-h/2),mm(w),mm(h));x.strokeStyle='rgba(150,130,70,.35)';x.lineWidth=mm(.2);x.strokeRect(mm(-w/2),mm(-h/2),mm(w),mm(h));x.restore()}

  // ---------- imagens ----------
  const cache=new Map();
  const loadImg=src=>new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=src});
  async function asset(name){
    if(cache.has(name))return cache.get(name);
    try{const im=await loadImg(await global.MnemosineFS.assetDataURL(name));cache.set(name,im);return im}
    catch(e){console.warn('Asset indisponível',name,e&&e.message);cache.set(name,null);return null}
  }
  /** Preenche W×H recortando (sem deformar). fy: foco vertical (0=topo). */
  function cover(x,im,X,Y,W,H,o={}){
    if(!im)return;const dr=W/H,sr=im.width/im.height;let sw=im.width,sh=im.height,sx=0,sy=0;
    if(sr>dr){sw=im.height*dr;sx=(im.width-sw)*(o.fx??.5)}else{sh=im.width/dr;sy=(im.height-sh)*(o.fy??.5)}
    x.save();x.imageSmoothingEnabled=o.smooth!==false;x.imageSmoothingQuality='high';x.drawImage(im,sx,sy,sw,sh,mm(X),mm(Y),mm(W),mm(H));x.restore();
  }
  function contain(x,im,X,Y,W,H,o={}){
    if(!im)return null;const s=Math.min(W/im.width,H/im.height),w=im.width*s,h=im.height*s,dx=X+(W-w)/2,dy=Y+(H-h)/2;
    x.save();x.imageSmoothingEnabled=o.smooth!==false;x.imageSmoothingQuality='high';x.drawImage(im,mm(dx),mm(dy),mm(w),mm(h));x.restore();return {X:dx,Y:dy,W:w,H:h};
  }

  // ---------- papel ----------
  async function paper(x,w,h,key){
    x.fillStyle=C.paper;x.fillRect(0,0,mm(w),mm(h));
    if(st.eco)return;
    const tex=await asset('aged_paper.png');
    if(tex){x.save();x.globalCompositeOperation='multiply';x.globalAlpha=.3;if(w>h){x.translate(mm(w)/2,mm(h)/2);x.rotate(Math.PI/2);x.drawImage(tex,-mm(h)/2,-mm(w)/2,mm(h),mm(w))}else x.drawImage(tex,0,0,mm(w),mm(h));x.restore()}
    const g=x.createRadialGradient(mm(w/2),mm(h/2),mm(Math.min(w,h)*.42),mm(w/2),mm(h/2),mm(Math.max(w,h)*.72));g.addColorStop(0,'rgba(120,95,50,0)');g.addColorStop(1,'rgba(120,95,50,.17)');x.fillStyle=g;x.fillRect(0,0,mm(w),mm(h));
    const r=D().rngFrom('stain|'+key);                       // 1 mancha de café por página, determinística
    const sx=25+r()*(w-50),sy=h*.55+r()*h*.3,sr=8+r()*5;x.save();x.strokeStyle='rgba(112,72,28,.10)';x.lineWidth=mm(.9);x.beginPath();x.arc(mm(sx),mm(sy),mm(sr),0,Math.PI*1.7);x.stroke();x.lineWidth=mm(.3);x.beginPath();x.arc(mm(sx),mm(sy),mm(sr-1.2),.3,Math.PI*1.4);x.stroke();x.restore();
    line(x,0,h/3,w,h/3,'rgba(90,75,50,.10)',.35);line(x,0,h/3+.5,w,h/3+.5,'rgba(255,255,255,.35)',.3); // dobra
    if(h>w)for(const hy of [h*.2,h*.5,h*.8]){circle(x,7,hy,2.6,{fill:'rgba(70,60,45,.22)'});circle(x,7,hy,2.6,{stroke:'rgba(255,255,255,.4)',lw:.3})}
  }

  // ---------- estrutura de página ----------
  async function header(P,sub){
    sub=sub||'ARQUIVO ZERO';const x=P.x,logo=await asset('dicc_logo_clean.png');
    if(logo){x.save();x.imageSmoothingQuality='high';x.drawImage(logo,mm(16),mm(9),mm(15),mm(15*logo.height/logo.width));x.restore()}
    text(x,'ESTADO DA REPÚBLICA FEDERATIVA DO BRASIL\nSECRETARIA DE SEGURANÇA PÚBLICA',35,9,102,2.3,{color:C.muted,lh:1.5});
    text(x,'DEPARTAMENTO DE INVESTIGAÇÕES CRIMINAIS E COMBATE AO CRIME ORGANIZADO',35,17.5,102,2.9,{bold:true,lh:1.35});
    text(x,'D.I.C.C. — UNIDADE DE ANÁLISE DE CASOS ESPECIAIS',35,27,102,2.2,{color:C.muted});
    rect(x,142,9,52,22,{stroke:C.line,lw:.3});
    text(x,'NÚMERO DO CASO',144.5,11,47,2.1,{color:C.muted});
    text(x,P.id,144.5,14.8,47,3,{bold:true});
    text(x,sub,144.5,20.2,47,2.1,{color:C.muted});
    text(x,`PÁG. ${P.i+1}/${P.n}`,144.5,25.6,47,2.7,{bold:true});
    line(x,16,35,194,35,C.ink,.4);
  }
  function strip(x,label,y=39){rect(x,16,y,178,9,{fill:C.navy});rect(x,16,y,2.2,9,{fill:C.gold});text(x,label,21,y+2.7,170,3.4,{bold:true,color:C.navyInk,fam:'mono'})}
  function section(x,title,y,X=16,W=178){text(x,title,X,y,W,3.2,{bold:true});line(x,X,y+5.4,X+W,y+5.4,C.line,.3);return y+8.5}
  function footer(P){
    const x=P.x,h=P.h;line(x,16,h-24,194,h-24,C.line,.3);
    rect(x,16,h-21,50,13,{fill:C.blue});text(x,'CÓDIGO DO ARQUIVO',18,h-19.6,46,2,{color:C.muted});text(x,P.code,18,h-14.6,46,2.8,{bold:true});
    text(x,'CASO MNEMOSINE — DOCUMENTO FICCIONAL PARA ATIVIDADE EDUCACIONAL.\nNÃO REPRESENTA ÓRGÃO, SERVIDOR OU DOCUMENTO OFICIAL.',70,h-19.5,124,2.3,{color:C.muted,align:'right',lh:1.5});
  }
  async function chrome(P,label,sub){await header(P,sub);if(label)strip(P.x,label);footer(P)}
  /** Tabela chave/valor em duas colunas. */
  function kv(x,rows,X,Y,W,size=3.1,keyW=38){let y=Y;for(const [k,v] of rows){text(x,k,X,y,keyW,size-.3,{color:C.muted});const b=text(x,v,X+keyW,y,W-keyW,size,{bold:true});y=Math.max(b,y+size*1.4)+1.2}return y}
  function bullets(x,items,X,Y,W,size=3.2,gap=1.8){let y=Y;items.forEach((t,i)=>{circle(x,X+2.4,y+size*.62,2.4,{fill:C.navy});text(x,String(i+1),X,y+size*.14,4.8,size*.78,{bold:true,color:C.navyInk,align:'center'});y=text(x,t,X+7,y,W-7,size)+gap});return y}

  // ---------- motor de renderização ----------
  const A4={portrait:[210,297],landscape:[297,210]};
  /** pages: [{orientation?,sizeMm?,bleedMm?,paper?:false,code?,draw:async(P)=>void}] */
  async function renderPages(pages,o={}){
    configure(o);stats.overflow.length=0;await loadFonts();
    const out=[],n=pages.length;
    for(let i=0;i<n;i++){
      const pg=pages[i],[w,h]=pg.sizeMm||A4[pg.orientation||'portrait'],c=document.createElement('canvas');
      c.width=Math.round(w*st.S);c.height=Math.round(h*st.S);
      const x=c.getContext('2d'),P={x,w,h,i,n,id:o.id||'DICC-MNMS-AZ-BASE',code:pg.code||`${o.id||'DICC-MNMS-AZ-BASE'}-${pad2(i+1)}`};
      if(pg.paper!==false)await paper(x,w,h,(o.id||'')+i);
      await pg.draw(P);
      const meta={orientation:pg.orientation||'portrait',sizeMm:[w,h],bleedMm:pg.bleedMm||0};
      if(o.encode){ // codifica já em JPEG e libera o canvas (a 300 DPI cada página usa ~35 MB)
        const bytes=await global.MnemosinePDF.canvasToJpegBytes(c,o.quality??.92);out.push(Object.assign({bytes,width:c.width,height:c.height},meta));c.width=c.height=0;
      }else out.push(Object.assign({canvas:c},meta));
      if(o.onProgress)o.onProgress(i+1,n);
      await new Promise(r=>setTimeout(r,0));
    }
    return out;
  }
  async function toPdf(items,o={}){return global.MnemosinePDF.canvasesToPdf(items,o.quality??.92,{title:o.title||'Mnemosine'})}
  /** Renderiza páginas já codificadas e monta o PDF (uso de memória constante). */
  async function pagesToPdf(pages,o={}){
    const items=await renderPages(pages,Object.assign({},o,{encode:true}));
    return global.MnemosinePDF.buildPdf(items.map(i=>({bytes:i.bytes,width:i.width,height:i.height,wMm:i.sizeMm[0],hMm:i.sizeMm[1],bleedMm:i.bleedMm})),{title:o.title||'Mnemosine'});
  }

  const kit={st,C,FAM,PAL,stats,mm,pad2,tw,wrap,text,fit,rect,rrect,line,circle,stamp,tape,asset,loadImg,cover,contain,paper,header,strip,section,footer,chrome,kv,bullets,configure,loadFonts};
  global.MnemosineRender=Object.assign(global.MnemosineRender||{},{kit,renderPages,toPdf,pagesToPdf,configure,loadFonts,stats,A4});
  if(typeof module!=='undefined'&&module.exports)module.exports=global.MnemosineRender;
})(typeof window!=='undefined'?window:globalThis);
