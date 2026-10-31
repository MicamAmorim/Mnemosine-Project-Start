/* Ambiente de teste: carrega os módulos do navegador no Node usando node-canvas. */
const fs=require('fs'),path=require('path'),vm=require('vm');
const {createCanvas,Image,registerFont}=require('canvas');
const ROOT=path.resolve(__dirname,'../..'),GEN=path.join(ROOT,'03_Gerador');
let loaded=false;
function setup(){
  if(loaded)return globalThis.MnemosineRender;loaded=true;
  const F=n=>path.join(GEN,'fonts',n);
  registerFont(F('CourierPrime-Regular.ttf'),{family:'Courier Prime',weight:'normal'});
  registerFont(F('CourierPrime-Bold.ttf'),{family:'Courier Prime',weight:'bold'});
  registerFont(F('LibreBaskerville-Variable.ttf'),{family:'Libre Baskerville',weight:'normal'});
  registerFont(F('LibreBaskerville-Variable.ttf'),{family:'Libre Baskerville',weight:'bold'});
  registerFont(F('SpecialElite-Regular.ttf'),{family:'Special Elite'});
  global.window=globalThis;
  global.document={createElement:t=>{if(t!=='canvas')throw new Error('elemento '+t);return createCanvas(300,150)}};
  global.Image=Image;
  global.MnemosineFS={assetDataURL:async name=>{const b=fs.readFileSync(path.join(ROOT,'04_Assets',name));const ext=path.extname(name).slice(1).replace('jpg','jpeg');return `data:image/${ext};base64,${b.toString('base64')}`}};
  for(const f of ['mnemosine_data','mnemosine_core','mnemosine_visuals','mnemosine_pdf','mnemosine_zip','mnemosine_render','mnemosine_evidence','mnemosine_docs'])
    vm.runInThisContext(fs.readFileSync(path.join(GEN,'js',f+'.js'),'utf8'),{filename:f+'.js'});
  return globalThis.MnemosineRender;
}
module.exports={setup,ROOT,GEN};
