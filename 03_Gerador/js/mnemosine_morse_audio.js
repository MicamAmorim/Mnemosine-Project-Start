/* Mnemosine — áudio Morse (v3.0). Funções puras e independentes: também são embutidas (via toString)
 * no HTML interativo exportado. */
(function(global){
  function toneEvents(code){let t=0,out=[];for(const tok of code.split(/\s+/)){if(tok==='|'){t+=.55;continue}for(const ch of tok){const d=ch==='.'?.09:.27;out.push([t,d]);t+=d+.09}t+=.18}return [out,t+.15]}
  function playMorse(code){const A=new (window.AudioContext||window.webkitAudioContext)(),[ev,total]=toneEvents(code);for(const [t,d] of ev){const o=A.createOscillator(),g=A.createGain();o.frequency.value=650;g.gain.value=.16;o.connect(g).connect(A.destination);o.start(A.currentTime+t);o.stop(A.currentTime+t+d)}setTimeout(()=>A.close(),(total+1)*1000)}
  function wavBlob(code){const sr=44100,[ev,total]=toneEvents(code),n=Math.ceil(total*sr),data=new Int16Array(n);for(const [t,d] of ev){for(let i=Math.floor(t*sr);i<Math.min(n,Math.floor((t+d)*sr));i++)data[i]=Math.sin(2*Math.PI*650*i/sr)*8000}const b=new ArrayBuffer(44+n*2),v=new DataView(b);const s=(o,z)=>[...z].forEach((c,i)=>v.setUint8(o+i,c.charCodeAt(0)));s(0,'RIFF');v.setUint32(4,36+n*2,true);s(8,'WAVEfmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,sr,true);v.setUint32(28,sr*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);s(36,'data');v.setUint32(40,n*2,true);for(let i=0;i<n;i++)v.setInt16(44+i*2,data[i],true);return new Blob([b],{type:'audio/wav'})}
  global.MnemosineMorse={toneEvents,playMorse,wavBlob};
  if(typeof module!=='undefined'&&module.exports)module.exports=global.MnemosineMorse;
})(typeof window!=='undefined'?window:globalThis);
