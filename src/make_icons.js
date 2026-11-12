const sharp=require('sharp'),fs=require('fs'),path=require('path');
const [src,out]=[process.argv[2],process.argv[3]||'icons'];
const LIGHT=process.argv[4]||'#F2F2F7',DARK=process.argv[5]||'#000000';
const D=[[440,956,3],[420,912,3],[402,874,3],[430,932,3],[393,852,3],[390,844,3],[428,926,3],[414,896,3],[414,896,2],[375,812,3],[375,667,2],[414,736,3]];
(async()=>{
 fs.mkdirSync(path.join(out,'splash'),{recursive:true});
 const flat=async n=>sharp(src,{density:384}).resize(n,n).flatten({background:'#ffffff'}).removeAlpha().png().toBuffer();
 for(const [n,f] of [[180,'apple-touch-icon.png'],[192,'icon-192.png'],[512,'icon-512.png'],[1024,'icon-1024.png'],[32,'favicon-32.png']])
   fs.writeFileSync(path.join(out,f),await flat(n));
 const list=[];
 for(const [w,h,r] of D)for(const mode of ['light','dark']){
  const W=w*r,H=h*r,s=Math.round(W*.24),rad=Math.round(s*.2237);
  const mask=Buffer.from(`<svg width="${s}" height="${s}"><rect width="${s}" height="${s}" rx="${rad}"/></svg>`);
  const icon=await sharp(await flat(512)).resize(s,s).composite([{input:mask,blend:'dest-in'}]).png().toBuffer();
  const f=`splash/${w}x${h}@${r}-${mode}.png`;
  await sharp({create:{width:W,height:H,channels:3,background:mode==='dark'?DARK:LIGHT}}).composite([{input:icon,left:Math.round((W-s)/2),top:Math.round((H-s)/2)}]).png({compressionLevel:9,palette:true}).toFile(path.join(out,f));
  list.push({w,h,r,mode,f});
 }
 fs.writeFileSync(path.join(out,'splash/index.json'),JSON.stringify(list));
 console.log('ok',list.length+5,'files');
})();
