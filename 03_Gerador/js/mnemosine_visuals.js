(function(global){
  function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
  function rngFrom(s){let a=hash(s);return function(){let t=a+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
  function norm(s){return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9 ]/g,'').replace(/\s+/g,' ').trim()}
  function maskForText(word,W,H){const m=document.createElement('canvas');m.width=W;m.height=H;const x=m.getContext('2d');x.fillStyle='#000';x.fillRect(0,0,W,H);let txt=norm(word),lines=[];if(txt.length>15 && txt.includes(' ')){let ws=txt.split(' '),a='',b='';for(const w of ws){if((a+' '+w).trim().length<=Math.ceil(txt.length/2)+2)a=(a+' '+w).trim();else b=(b+' '+w).trim()}lines=b?[a,b]:[txt]}else lines=[txt];x.textAlign='center';x.textBaseline='middle';x.font=`900 ${lines.length===1?96:72}px Arial Black,Arial,sans-serif`;x.fillStyle='#fff';lines.forEach((ln,i)=>x.fillText(ln,W/2,H/2+(i-(lines.length-1)/2)*82));return x.getImageData(0,0,W,H).data}
  function visualData(word,seed,mode='noise'){
    const W=900,H=320,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d'),r=rngFrom(seed+'|'+word+'|'+mode),md=maskForText(word,W,H),img=x.createImageData(W,H);
    if(mode==='color'){
      // Statistical red/cyan dithering. Raw image has near-equal average luminance; red-channel filtering reveals the mask.
      const A=[160,116,123], B=[105,141,148];
      for(let i=0;i<W*H;i++){
        const inside=md[i*4]>128, pA=inside?0.43:0.57, base=r()<pA?A:B;
        for(let ch=0;ch<3;ch++){let n=(r()+r()+r()-1.5)*18;img.data[i*4+ch]=Math.max(0,Math.min(255,base[ch]+n))}img.data[i*4+3]=255;
      }
      x.putImageData(img,0,0);
      // fine neutral grain to make direct reading even harder without destroying channel information
      x.globalAlpha=.13;x.fillStyle='#eee';for(let j=0;j<3500;j++)x.fillRect(r()*W,r()*H,1+r()*2,1+r()*2);x.globalAlpha=1;
    }else{
      for(let i=0;i<W*H;i++){const inside=md[i*4]>128;let n=(r()-.5)*112,base=151+n+(inside?9:-2);let v=Math.max(0,Math.min(255,base));img.data[i*4]=img.data[i*4+1]=img.data[i*4+2]=v;img.data[i*4+3]=255}x.putImageData(img,0,0);x.globalAlpha=.20;x.strokeStyle='#fff';for(let j=0;j<120;j++){let yy=r()*H;x.beginPath();x.moveTo(0,yy);x.lineTo(W,yy+(r()-.5)*5);x.stroke()}x.globalAlpha=1;
    }
    return c.toDataURL('image/png');
  }
  function redChannelPreview(dataUrl){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const x=c.getContext('2d');x.drawImage(im,0,0);let d=x.getImageData(0,0,c.width,c.height);for(let i=0;i<d.data.length;i+=4){let v=d.data[i];d.data[i]=d.data[i+1]=d.data[i+2]=v}x.putImageData(d,0,0);resolve(c.toDataURL('image/png'))};im.onerror=reject;im.src=dataUrl})}
  global.MnemosineVisuals={visualData,redChannelPreview};
})(window);
