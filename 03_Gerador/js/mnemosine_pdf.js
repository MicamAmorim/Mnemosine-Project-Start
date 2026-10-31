/* Mnemosine — gravador de PDF minimalista (v3.0)
 * Cada página é uma imagem JPEG. Novidades: tamanho de página arbitrário (em mm), TrimBox/BleedBox
 * para gráficas e dicionário /Info. Funciona no navegador e (com node-canvas) no Node. */
(function(global){
  const enc=new TextEncoder(), ascii=s=>enc.encode(s);
  const concat=arrays=>{const n=arrays.reduce((a,b)=>a+b.length,0),out=new Uint8Array(n);let o=0;for(const a of arrays){out.set(a,o);o+=a.length}return out};
  const PT=72/25.4;
  async function canvasToJpegBytes(canvas,quality=.92){
    if(typeof canvas.toBuffer==='function'&&typeof canvas.toBlob!=='function')return new Uint8Array(canvas.toBuffer('image/jpeg',{quality}));
    const blob=await new Promise((res,rej)=>canvas.toBlob(b=>b?res(b):rej(new Error('Falha ao rasterizar página')),'image/jpeg',quality));
    return new Uint8Array(await blob.arrayBuffer());
  }
  const obj=(id,body)=>concat([ascii(`${id} 0 obj\n`),typeof body==='string'?ascii(body):body,ascii('\nendobj\n')]);
  const streamObj=(id,dict,stream)=>concat([ascii(`${id} 0 obj\n<< ${dict} /Length ${stream.length} >>\nstream\n`),stream,ascii('\nendstream\nendobj\n')]);
  const pdfStr=s=>'('+String(s).replace(/[\\()]/g,'\\$&').replace(/[^\x20-\x7e]/g,c=>'\\'+c.charCodeAt(0).toString(8).padStart(3,'0'))+')';
  /** pages: [{bytes,width,height,wMm,hMm,bleedMm}] */
  function buildPdf(pages,meta={}){
    const n=pages.length,objects=[],kids=[];
    for(let i=0;i<n;i++)kids.push(4+i*3);
    objects[1]=obj(1,'<< /Type /Catalog /Pages 2 0 R >>');
    objects[2]=obj(2,`<< /Type /Pages /Count ${n} /Kids [${kids.map(k=>k+' 0 R').join(' ')}] >>`);
    objects[3]=obj(3,`<< /Title ${pdfStr(meta.title||'Mnemosine')} /Producer ${pdfStr('Mnemosine // Arquivo Zero v3.0')} /Creator ${pdfStr('Gerador de Casos Mnemosine')} >>`);
    pages.forEach((p,i)=>{
      const pid=4+i*3,iid=pid+1,cid=pid+2,pw=p.wMm*PT,ph=p.hMm*PT,b=(p.bleedMm||0)*PT;
      const boxes=b?` /BleedBox [0 0 ${pw.toFixed(2)} ${ph.toFixed(2)}] /TrimBox [${b.toFixed(2)} ${b.toFixed(2)} ${(pw-b).toFixed(2)} ${(ph-b).toFixed(2)}]`:'';
      objects[pid]=obj(pid,`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pw.toFixed(2)} ${ph.toFixed(2)}]${boxes} /Resources << /XObject << /Im${i+1} ${iid} 0 R >> >> /Contents ${cid} 0 R >>`);
      objects[iid]=streamObj(iid,`/Type /XObject /Subtype /Image /Width ${p.width} /Height ${p.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode`,p.bytes);
      objects[cid]=streamObj(cid,'',ascii(`q\n${pw.toFixed(2)} 0 0 ${ph.toFixed(2)} 0 0 cm\n/Im${i+1} Do\nQ`));
    });
    const maxId=3+n*3,header=ascii('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n'),chunks=[header],offsets=[];
    let pos=header.length;
    for(let id=1;id<=maxId;id++){offsets[id]=pos;chunks.push(objects[id]);pos+=objects[id].length}
    let xref=`xref\n0 ${maxId+1}\n0000000000 65535 f \n`;
    for(let id=1;id<=maxId;id++)xref+=`${String(offsets[id]).padStart(10,'0')} 00000 n \n`;
    chunks.push(ascii(`${xref}trailer\n<< /Size ${maxId+1} /Root 1 0 R /Info 3 0 R >>\nstartxref\n${pos}\n%%EOF\n`));
    return new Blob([concat(chunks)],{type:'application/pdf'});
  }
  /** items: [{canvas, orientation?, sizeMm?:[w,h], bleedMm?}] */
  async function canvasesToPdf(items,quality=.92,meta={}){
    const pages=[];
    for(const it of items){
      const canvas=it.canvas||it,land=it.orientation==='landscape',[wMm,hMm]=it.sizeMm||(land?[297,210]:[210,297]);
      pages.push({bytes:await canvasToJpegBytes(canvas,quality),width:canvas.width,height:canvas.height,wMm,hMm,bleedMm:it.bleedMm||0});
      if(it.onPage)it.onPage();
      await new Promise(r=>setTimeout(r,0));
    }
    return buildPdf(pages,meta);
  }
  global.MnemosinePDF={canvasToJpegBytes,buildPdf,canvasesToPdf};
  if(typeof module!=='undefined'&&module.exports)module.exports=global.MnemosinePDF;
})(typeof window!=='undefined'?window:globalThis);
