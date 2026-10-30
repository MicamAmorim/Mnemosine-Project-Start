(function(global){
  function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
  function rngFrom(s){let a=hash(s);return function(){let t=a+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
  function norm(s){return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9 ]/g,'').replace(/\s+/g,' ').trim()}
  function maskForText(word,W,H){
    const m=document.createElement('canvas');m.width=W;m.height=H;const x=m.getContext('2d');x.fillStyle='#000';x.fillRect(0,0,W,H);
    let txt=norm(word),lines=[];if(txt.length>15 && txt.includes(' ')){let ws=txt.split(' '),a='',b='';for(const w of ws){if((a+' '+w).trim().length<=Math.ceil(txt.length/2)+2)a=(a+' '+w).trim();else b=(b+' '+w).trim()}lines=b?[a,b]:[txt]}else lines=[txt];
    x.textAlign='center';x.textBaseline='middle';x.font=`900 ${lines.length===1?96:72}px Arial Black,Arial,sans-serif`;x.fillStyle='#fff';lines.forEach((ln,i)=>x.fillText(ln,W/2,H/2+(i-(lines.length-1)/2)*82));return x.getImageData(0,0,W,H).data
  }
  function visualData(word,seed,mode='noise'){
    const W=900,H=320,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d'),r=rngFrom(seed+'|'+word+'|'+mode),md=maskForText(word,W,H),img=x.createImageData(W,H);
    if(mode==='color'){
      // Duas cores com luminância praticamente idêntica. A máscara altera apenas
      // a PROPORÇÃO entre elas: visualmente o RGB continua parecendo ruído,
      // mas o canal vermelho acumula contraste suficiente para revelar o texto.
      // A diferença é forte o bastante para sobreviver ao JPEG usado no PDF.
      const A=[170,116,135], B=[110,134,135];
      for(let i=0;i<W*H;i++){
        const inside=md[i*4]>128, pA=inside?.68:.32, base=r()<pA?A:B;
        for(let ch=0;ch<3;ch++){
          const n=(r()+r()+r()-1.5)*24;
          img.data[i*4+ch]=Math.max(0,Math.min(255,base[ch]+n));
        }
        img.data[i*4+3]=255;
      }
      x.putImageData(img,0,0);
    }else{
      for(let i=0;i<W*H;i++){const inside=md[i*4]>128;let n=(r()-.5)*122,base=151+n+(inside?7:-1);let v=Math.max(0,Math.min(255,base));img.data[i*4]=img.data[i*4+1]=img.data[i*4+2]=v;img.data[i*4+3]=255}x.putImageData(img,0,0);x.globalAlpha=.22;x.strokeStyle='#fff';for(let j=0;j<150;j++){let yy=r()*H;x.beginPath();x.moveTo(0,yy);x.lineTo(W,yy+(r()-.5)*6);x.stroke()}x.globalAlpha=1;
    }
    return c.toDataURL('image/png');
  }
  function redChannelPreview(dataUrl){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const x=c.getContext('2d');x.drawImage(im,0,0);let d=x.getImageData(0,0,c.width,c.height);for(let i=0;i<d.data.length;i+=4){let v=d.data[i];d.data[i]=d.data[i+1]=d.data[i+2]=v}x.putImageData(d,0,0);resolve(c.toDataURL('image/png'))};im.onerror=reject;im.src=dataUrl})}
  function drawPigpenGlyph(ctx,idx,x,y,s){
    ctx.save();ctx.translate(x,y);ctx.strokeStyle='#10252c';ctx.fillStyle='#10252c';ctx.lineWidth=Math.max(2,s*.08);ctx.lineCap='square';
    const dot=idx>=9&&idx<18 || idx>=22; let base=idx;
    if(idx<18){if(idx>=9)base-=9;const row=Math.floor(base/3),col=base%3;const a=s*.18,b=s*.82;
      ctx.beginPath();
      if(row===0){ctx.moveTo(a,a);ctx.lineTo(b,a)} else if(row===1){ctx.moveTo(a,a);ctx.lineTo(b,a);ctx.moveTo(a,b);ctx.lineTo(b,b)} else {ctx.moveTo(a,b);ctx.lineTo(b,b)}
      if(col===0){ctx.moveTo(a,a);ctx.lineTo(a,b)} else if(col===1){ctx.moveTo(a,a);ctx.lineTo(a,b);ctx.moveTo(b,a);ctx.lineTo(b,b)} else {ctx.moveTo(b,a);ctx.lineTo(b,b)}
      ctx.stroke(); if(dot){ctx.beginPath();ctx.arc(s/2,s/2,s*.055,0,Math.PI*2);ctx.fill()}
    }else{
      base=idx>=22?idx-22:idx-18;const cx=s/2,cy=s/2,r=s*.36;ctx.beginPath();
      if(base===0){ctx.moveTo(cx,cy);ctx.lineTo(cx-r,cy-r);ctx.moveTo(cx,cy);ctx.lineTo(cx+r,cy-r)}
      if(base===1){ctx.moveTo(cx,cy);ctx.lineTo(cx+r,cy-r);ctx.moveTo(cx,cy);ctx.lineTo(cx+r,cy+r)}
      if(base===2){ctx.moveTo(cx,cy);ctx.lineTo(cx+r,cy+r);ctx.moveTo(cx,cy);ctx.lineTo(cx-r,cy+r)}
      if(base===3){ctx.moveTo(cx,cy);ctx.lineTo(cx-r,cy+r);ctx.moveTo(cx,cy);ctx.lineTo(cx-r,cy-r)}
      ctx.stroke(); if(dot){ctx.beginPath();ctx.arc(cx,cy,s*.055,0,Math.PI*2);ctx.fill()}
    }
    ctx.restore();
  }
  function pigpenData(word){
    const txt=norm(word), W=1000,H=330,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');x.fillStyle='#e9e5da';x.fillRect(0,0,W,H);x.strokeStyle='#bcb4a5';x.strokeRect(12,12,W-24,H-24);
    const glyphs=[...txt].filter(ch=>ch===' '||/[A-Z]/.test(ch));let size=62,gap=15;const widths=glyphs.map(ch=>ch===' '?30:size+gap);let lines=[],line=[],w=0;for(const ch of glyphs){const cw=ch===' '?30:size+gap;if(w+cw>W-70&&line.length){lines.push(line);line=[];w=0}line.push(ch);w+=cw}if(line.length)lines.push(line);const totalH=lines.length*88, startY=(H-totalH)/2+5;
    lines.forEach((arr,li)=>{const lineW=arr.reduce((a,ch)=>a+(ch===' '?30:size+gap),0),startX=(W-lineW)/2;let xx=startX;for(const ch of arr){if(ch===' '){xx+=30;continue}drawPigpenGlyph(x,ch.charCodeAt(0)-65,xx,startY+li*88,size);xx+=size+gap}});return c.toDataURL('image/png')
  }
  function pigpenChartData(){
    const W=1050,H=520,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');x.fillStyle='#efeadd';x.fillRect(0,0,W,H);x.fillStyle='#233d4d';x.font='700 30px Arial';x.fillText('CHAVE PIGPEN — REFERÊNCIA',30,42);const s=55,cellW=115,cellH=75;for(let i=0;i<26;i++){const col=i%9,row=Math.floor(i/9),xx=30+col*cellW,yy=70+row*cellH;drawPigpenGlyph(x,i,xx,yy,s);x.fillStyle='#222';x.font='700 19px monospace';x.fillText(String.fromCharCode(65+i),xx+68,yy+34)}return c.toDataURL('image/png')
  }
  function stegData(word,seed){
    const W=900,H=320,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d'),r=rngFrom(seed+'|STEG|'+word),md=maskForText(word,W,H),img=x.createImageData(W,H);
    for(let i=0;i<W*H;i++){
      let base=Math.floor(80+r()*110), grain=Math.floor((r()-.5)*34);let rr=Math.max(0,Math.min(255,base+grain)),gg=Math.max(0,Math.min(255,base+Math.floor((r()-.5)*38))),bb=Math.max(0,Math.min(255,base+Math.floor((r()-.5)*38)));
      const bit=md[i*4]>128?1:0; rr=(rr&254)|bit;img.data[i*4]=rr;img.data[i*4+1]=gg;img.data[i*4+2]=bb;img.data[i*4+3]=255;
    }
    x.putImageData(img,0,0);x.globalAlpha=.13;x.strokeStyle='#ddd';for(let j=0;j<110;j++){const y=r()*H;x.beginPath();x.moveTo(0,y);x.lineTo(W,y+(r()-.5)*4);x.stroke()}x.globalAlpha=1;return c.toDataURL('image/png')
  }
  function stegReveal(dataUrl){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const x=c.getContext('2d');x.drawImage(im,0,0);const d=x.getImageData(0,0,c.width,c.height);for(let i=0;i<d.data.length;i+=4){const v=(d.data[i]&1)?20:245;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=255}x.putImageData(d,0,0);resolve(c.toDataURL('image/png'))};im.onerror=reject;im.src=dataUrl})}
  global.MnemosineVisuals={visualData,redChannelPreview,pigpenData,pigpenChartData,stegData,stegReveal};
})(window);