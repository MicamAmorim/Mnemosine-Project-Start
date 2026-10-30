(function(global){
  let rootHandle=null;
  const DB='mnemosine-project-db', STORE='handles', KEY='root';
  function idb(){return new Promise((res,rej)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore(STORE);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
  async function remember(handle){try{const db=await idb();const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put(handle,KEY);await new Promise((r,j)=>{tx.oncomplete=r;tx.onerror=()=>j(tx.error)})}catch(e){console.warn('Não foi possível persistir pasta',e)}}
  async function restore(){try{const db=await idb();const tx=db.transaction(STORE,'readonly');const req=tx.objectStore(STORE).get(KEY);const h=await new Promise((r,j)=>{req.onsuccess=()=>r(req.result);req.onerror=()=>j(req.error)}); if(h){rootHandle=h; return h}}catch(e){} return null}
  async function ensurePermission(handle){if(!handle)return false; if(await handle.queryPermission({mode:'readwrite'})==='granted')return true; return (await handle.requestPermission({mode:'readwrite'}))==='granted'}
  async function chooseRoot(){if(!window.showDirectoryPicker) throw new Error('Seu navegador não oferece a File System Access API. Use Edge/Chrome atual.'); rootHandle=await window.showDirectoryPicker({mode:'readwrite'}); if(!(await ensurePermission(rootHandle)))throw new Error('Permissão de escrita não concedida.'); await remember(rootHandle); return rootHandle}
  async function getRoot(interactive=true){ if(rootHandle){const q=await rootHandle.queryPermission({mode:'readwrite'});if(q==='granted')return rootHandle;if(interactive&&await ensurePermission(rootHandle))return rootHandle} const h=await restore(); if(h){const q=await h.queryPermission({mode:'readwrite'});if(q==='granted')return h;if(interactive&&await ensurePermission(h))return h} return interactive?chooseRoot():null }
  async function dir(path,create=true){const root=await getRoot(); let h=root; for(const part of path.split('/').filter(Booleal))h=await h.getDirectoryHandle(part,{create}); return h}
  async function write(path,data){const parts=path.split('/').filter(Boolean),name=parts.pop(),d=await dir(parts.join('/'),true),fh=await d.getFileHandle(name,{create:true}),w=await fh.createWritable(); await w.write(data); await w.close(); return path}
  async function read(path){const parts=path.split('/').filter(Boolean),name=parts.pop(),d=await dir(parts.join('/'),false),fh=await d.getFileHandle(name),f=await fh.getFile();return f}
  async function exists(path){try{await read(path);return true}catch(e){return false}}
  async function ensureStructure(){for(const p of ['01_Documentos','02_Casos','04_Assets'])await dir(p,true)}
  async function listCases(){const d=await dir('02_Casos',true),out=[]; for await(const [name,h] of d.entries()){if(h.kind==='file' && /\.pdf$/i.test(name)){const f=await h.getFile();out.push({name,size:f.size,modified:f.lastModified})}} return out.sort((a,b)=>b.modified-a.modified)}
  async function assetDataURL(name){const f=await read('04_Assets/'+name); return new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>res(fr.result);fr.onerror=()=>rej(fr.error);fr.readAsDataURL(f)})}
  function currentRoot(){return rootHandle}
  global.MnemosineFS={chooseRoot,getRoot,currentRoot,dir,write,read,exists,ensureStructure,listCases,assetDataURL};
})(window);
