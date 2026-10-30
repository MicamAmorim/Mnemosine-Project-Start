(async function(){try{
  let s=String(window.__MNEMO_V23_GZ||'').replace(/\s+/g,'');
  // Chromium mobile is stricter than some desktop browsers when Base64 padding is omitted.
  // Normalize the final concatenated payload before calling atob().
  s=s.replace(/-/g,'+').replace(/_/g,'/');
  while(s.length%4)s+='=';
  const b=atob(s),u=new Uint8Array(b.length);
  for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);
  if(typeof DecompressionStream!=='function')throw new Error('Este navegador não oferece DecompressionStream. Atualize o Chrome/Edge ou use a versão desktop.');
  const ds=new DecompressionStream('gzip'),ab=await new Response(new Blob([u]).stream().pipeThrough(ds)).arrayBuffer(),html=new TextDecoder('utf-8').decode(ab);
  delete window.__MNEMO_V23_GZ;
  document.open();document.write(html);document.close();
}catch(e){
  document.body.innerHTML='<pre style="white-space:pre-wrap;padding:24px;color:#ffb4b4">Falha ao carregar o gerador: '+String(e)+'\n\nRecarregue a página após a atualização do deploy.</pre>';
  console.error(e)
}})();