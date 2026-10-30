(async function(){try{
  let s=String(window.__MNEMO_V23_GZ||'').replace(/\s+/g,'').replace(/-/g,'+').replace(/_/g,'/');
  // Decoder Base64 próprio: evita diferenças de tolerância do atob() entre
  // Chrome desktop, Chrome Android e Samsung Internet. Padding '=' é opcional.
  const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const clean=s.replace(/[^A-Za-z0-9+/]/g,'');
  if(!clean.length) throw new Error('Bundle vazio ou não carregado.');
  let out=[],acc=0,bits=0;
  for(let i=0;i<clean.length;i++){
    const v=alphabet.indexOf(clean[i]);
    if(v<0) continue;
    acc=(acc<<6)|v; bits+=6;
    if(bits>=8){bits-=8;out.push((acc>>bits)&255);}
  }
  const u=new Uint8Array(out);
  if(u.length<2 || u[0]!==0x1f || u[1]!==0x8b)
    throw new Error('Bundle inválido: assinatura gzip não encontrada (base64='+clean.length+' chars, bytes='+u.length+').');
  if(typeof DecompressionStream!=='function')
    throw new Error('Este navegador não oferece DecompressionStream. Atualize o Chrome/Edge ou use a versão desktop.');
  const ds=new DecompressionStream('gzip');
  const ab=await new Response(new Blob([u]).stream().pipeThrough(ds)).arrayBuffer();
  const html=new TextDecoder('utf-8').decode(ab);
  if(!/^<!doctype html>/i.test(html.trim()))
    throw new Error('Bundle descompactado, porém o conteúdo HTML não foi reconhecido.');
  delete window.__MNEMO_V23_GZ;
  document.open();document.write(html);document.close();
}catch(e){
  document.body.innerHTML='<pre style="white-space:pre-wrap;padding:24px;color:#ffb4b4">Falha ao carregar o gerador: '+String(e)+'\n\nAtualize a página após o novo deploy. Se persistir, envie esta mensagem completa.</pre>';
  console.error(e)
}})();