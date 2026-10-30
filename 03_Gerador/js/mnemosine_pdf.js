(function(global){
  const enc = new TextEncoder();
  const ascii = s => enc.encode(s);
  const concat = arrays => {
    const n = arrays.reduce((a,b)=>a+b.length,0), out = new Uint8Array(n);
    let o=0; for(const a of arrays){ out.set(a,o); o+=a.length; } return out;
  };
  async function canvasToJpegBytes(canvas, quality=0.9){
    const blob = await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Falha ao rasterizar página')),'image/jpeg',quality));
    return new Uint8Array(await blob.arrayBuffer());
  }
  function objectBytes(id, body){
    return concat([ascii(`${id} 0 obj\n`), typeof body==='string'?ascii(body):body, ascii(`\nendobj\n`)]);
  }
  function streamObjectBytes(id, dict, stream){
    return concat([ascii(`${id} 0 obj\n<< ${dict} /Length ${stream.length} >>\nstream\n`), stream, ascii(`\nendstream\nendobj\n`)]);
  }
  function buildPdf(pageImages){
    const objects=[];
    const pageRefs=[];
    const count=pageImages.length;
    const pagesId=2;
    for(let i=0;i<count;i++) pageRefs.push(3+i*3);
    objects[1]=objectBytes(1,`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);
    objects[2]=objectBytes(2,`<< /Type /Pages /Count ${count} /Kids [${pageRefs.map(x=>`${x} 0 R`).join(' ')}] >>`);
    for(let i=0;i<count;i++){
      const page=pageImages[i], pageId=3+i*3, imgId=pageId+1, contentId=pageId+2;
      const landscape=page.orientation==='landscape';
      const pw=landscape?841.89:595.28, ph=landscape?595.28:841.89;
      const imName=`Im${i+1}`;
      objects[pageId]=objectBytes(pageId,`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${pw.toFixed(2)} ${ph.toFixed(2)}] /Resources << /XObject << /${imName} ${imgId} 0 R >> >> /Contents ${contentId} 0 R >>`);
      objects[imgId]=streamObjectBytes(imgId,`/Type /XObject /Subtype /Image /Width ${page.width} /Height ${page.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode`,page.bytes);
      const content=ascii(`q\n${pw.toFixed(2)} 0 0 ${ph.toFixed(2)} 0 0 cm\n/${imName} Do\nQ`);
      objects[contentId]=streamObjectBytes(contentId,'',content);
    }
    const maxId=2+count*3;
    const header=ascii('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
    const chunks=[header], offsets=new Array(maxId+1).fill(0);
    let pos=header.length;
    for(let id=1;id<=maxId;id++){
      offsets[id]=pos; chunks.push(objects[id]); pos+=objects[id].length;
    }
    const xrefPos=pos;
    let xref=`xref\n0 ${maxId+1}\n0000000000 65535 f \n`;
    for(let id=1;id<=maxId;id++) xref+=`${String(offsets[id]).padStart(10,'0')} 00000 n \n`;
    const trailer=`trailer\n<< /Size ${maxId+1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`;
    chunks.push(ascii(xref+trailer));
    return new Blob([concat(chunks)],{type:'application/pdf'});
  }
  async function canvasesToPdf(canvases, quality=0.9){
    const pages=[];
    for(const item of canvases){
      const canvas=item.canvas||item;
      pages.push({bytes:await canvasToJpegBytes(canvas,quality),width:canvas.width,height:canvas.height,orientation:item.orientation||'portrait'});
      await new Promise(r=>setTimeout(r,0));
    }
    return buildPdf(pages);
  }
  async function pdfFromDrawers(drawers, quality=0.9){
    const DPI=144, S=DPI/25.4;
    const sizes={portrait:[Math.round(210*S),Math.round(297*S)],landscape:[Math.round(297*S),Math.round(210*S)]};
    const pages=[];
    for(const d of drawers){
      const orientation=d.orientation||'portrait';
      const [w,h]=sizes[orientation];
      const canvas=document.createElement('canvas');
      canvas.width=w; canvas.height=h;
      const ctx=canvas.getContext('2d');
      ctx.fillStyle='#eee9dc';
      ctx.fillRect(0,0,w,h);
      await d.draw(ctx);
      pages.push({canvas,orientation});
      await new Promise(r=>setTimeout(r,0));
    }
    return canvasesToPdf(pages,quality);
  }
  global.MnemosinePDF={canvasToJpegBytes,buildPdf,canvasesToPdf};
  global.pdfFromDrawers=pdfFromDrawers;
})(window);
