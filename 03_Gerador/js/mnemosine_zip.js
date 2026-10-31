/* Mnemosine — criador de ZIP (sem compressão, "stored") para o fallback de download (v3.0).
 * Permite baixar o PACK/kit em navegadores sem File System Access API (Firefox, Safari, mobile). */
(function(global){
  const enc=new TextEncoder();
  const TABLE=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
  function crc32(u8){let c=0xFFFFFFFF;for(let i=0;i<u8.length;i++)c=TABLE[(c^u8[i])&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0}
  async function toU8(d){if(d instanceof Uint8Array)return d;if(typeof d==='string')return enc.encode(d);if(d&&typeof d.arrayBuffer==='function')return new Uint8Array(await d.arrayBuffer());throw new Error('Tipo de dado não suportado no ZIP')}
  /** files: [{name:'pasta/arquivo.ext', data:Blob|Uint8Array|string}] → Blob application/zip */
  async function create(files){
    const now=new Date(),time=(now.getHours()<<11)|(now.getMinutes()<<5)|(now.getSeconds()>>1),date=((now.getFullYear()-1980)<<9)|((now.getMonth()+1)<<5)|now.getDate();
    const parts=[],central=[];let offset=0;
    for(const f of files){
      const name=enc.encode(f.name.replace(/^\/+/,'')),data=await toU8(f.data),crc=crc32(data);
      const lh=new DataView(new ArrayBuffer(30));
      lh.setUint32(0,0x04034b50,true);lh.setUint16(4,20,true);lh.setUint16(6,0x0800,true);lh.setUint16(8,0,true);lh.setUint16(10,time,true);lh.setUint16(12,date,true);lh.setUint32(14,crc,true);lh.setUint32(18,data.length,true);lh.setUint32(22,data.length,true);lh.setUint16(26,name.length,true);lh.setUint16(28,0,true);
      parts.push(new Uint8Array(lh.buffer),name,data);
      const ch=new DataView(new ArrayBuffer(46));
      ch.setUint32(0,0x02014b50,true);ch.setUint16(4,20,true);ch.setUint16(6,20,true);ch.setUint16(8,0x0800,true);ch.setUint16(10,0,true);ch.setUint16(12,time,true);ch.setUint16(14,date,true);ch.setUint32(16,crc,true);ch.setUint32(20,data.length,true);ch.setUint32(24,data.length,true);ch.setUint16(28,name.length,true);ch.setUint32(42,offset,true);
      central.push(new Uint8Array(ch.buffer),name);
      offset+=30+name.length+data.length;
    }
    const csize=central.reduce((a,b)=>a+b.length,0),end=new DataView(new ArrayBuffer(22));
    end.setUint32(0,0x06054b50,true);end.setUint16(8,files.length,true);end.setUint16(10,files.length,true);end.setUint32(12,csize,true);end.setUint32(16,offset,true);
    return new Blob([...parts,...central,new Uint8Array(end.buffer)],{type:'application/zip'});
  }
  global.MnemosineZip={create,crc32};
  if(typeof module!=='undefined'&&module.exports)module.exports=global.MnemosineZip;
})(typeof window!=='undefined'?window:globalThis);
