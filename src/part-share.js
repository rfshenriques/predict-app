/* SHARE: draws bets as a PNG card for friends (no stakes, no money: just the picks). */
let shareImg=null; // {url,file,title}
const SH={W:390,PAD:16};
function shGame(b){
  const sp=SPORTS[b.sport]||SPORT, s=sp.slates.find(x=>x.date===b.date);
  const g=s&&s.games.find(x=>x.away===b.team||x.home===b.team);
  const F=(SPORTS[b.sport]||{}).kind==='match';
  return g?{away:g.away,home:g.home,utc:g.utc,final:g.final,label:F?`${g.home} v ${g.away}`:`${g.away} at ${g.home}`,fin:g.final?(F?`${g.final.home}–${g.final.away}`:`${g.final.away}–${g.final.home}`):''}:{away:b.team,home:b.opp,utc:b.when,label:`${b.team} v ${b.opp}`};
}
function shColors(sport,t){ const c=((SPORTS[sport]||SPORT).colors||{})[t]||['#8E8E93','#8E8E93']; return [c[0],c[1]||c[0]]; }
function rr(x,c,y,w,h,r){ c.beginPath(); c.roundRect?c.roundRect(x,y,w,h,r):c.rect(x,y,w,h); }
function shTile(c,sport,t,x,y,w,h){
  const [p,s]=shColors(sport,t), g=c.createLinearGradient(x,y,x+w,y+h);
  g.addColorStop(.3,p); g.addColorStop(1,s); c.fillStyle=g; rr(x,c,y,w,h,h*.3); c.fill();
  const light=Math.min(lum(p),lum(s))>.45;
  c.fillStyle=light?'#000':'#fff'; c.font=`700 ${h*.42}px -apple-system,system-ui,sans-serif`; c.textAlign='center'; c.textBaseline='middle';
  c.fillText(t,x+w/2,y+h/2+.5); c.textAlign='left'; c.textBaseline='alphabetic';
}
function shFit(c,txt,max){ if(c.measureText(txt).width<=max) return txt; while(txt.length>1&&c.measureText(txt+'…').width>max) txt=txt.slice(0,-1); return txt+'…'; }
const SH_ST={open:['Open','#7A5A00','#FEF0B8'],won:['Won','#1A7F37','#D6F3DD'],lost:['Lost','#C5221F','#FBDAD8'],void:['Void','#636366','#E5E5EA']};
function shCardH(b){ return betActual(b)!=null?150:132; }
async function makeShareImage(list,title,sub){
  const S=3, W=SH.W, P=SH.PAD, headH=104, foot=46;
  const H=headH+list.reduce((h,b)=>h+shCardH(b)+12,0)+foot;
  const cv=document.createElement('canvas'); cv.width=W*S; cv.height=H*S; const c=cv.getContext('2d'); c.scale(S,S);
  const F=(w,s)=>`${w} ${s}px -apple-system,BlinkMacSystemFont,"SF Pro Text",system-ui,sans-serif`;
  // page
  let bg=c.createLinearGradient(0,0,0,H); bg.addColorStop(0,'#FDEFD6'); bg.addColorStop(.35,'#F6F1EC'); bg.addColorStop(1,'#F2F2F7');
  c.fillStyle=bg; c.fillRect(0,0,W,H);
  // header band
  const hb=c.createLinearGradient(0,0,W,headH); hb.addColorStop(0,'#731328'); hb.addColorStop(1,'#4A0C1A');
  c.fillStyle=hb; c.fillRect(0,0,W,headH-14);
  c.fillStyle='#FEC40B'; c.fillRect(0,headH-14,W,3);
  try{ const im=new Image(); im.src='icon-192.png'; await im.decode(); c.save(); rr(P,c,18,52,52,13); c.clip(); c.drawImage(im,P,18,52,52); c.restore(); }catch(e){}
  c.fillStyle='#fff'; c.font=F(800,22); c.fillText('Propline',P+64,42);
  c.fillStyle='#FDEFD6'; c.font=F(600,13); c.fillText(shFit(c,title,W-P*2-64),P+64,62);
  c.fillStyle='rgba(253,239,214,.7)'; c.font=F(500,11); c.fillText(sub,P+64,79);
  // cards
  let y=headH+4;
  list.forEach(b=>{
    const h=shCardH(b), x=P, w=W-P*2, a=betActual(b), g=shGame(b), st=SH_ST[b.status]||SH_ST.open;
    c.save(); c.shadowColor='rgba(60,20,30,.12)'; c.shadowBlur=14; c.shadowOffsetY=4; c.fillStyle='#fff'; rr(x,c,y,w,h,18); c.fill(); c.restore();
    shTile(c,b.sport,b.team,x+14,y+14,46,32);
    // status pill
    c.font=F(700,12); const pw=c.measureText(st[0]).width+18;
    c.fillStyle=st[2]; rr(x+w-14-pw,c,y+16,pw,22,11); c.fill(); c.fillStyle=st[1]; c.fillText(st[0],x+w-14-pw+9,y+31);
    c.fillStyle='#1C1C1E'; c.font=F(700,17); c.fillText(shFit(c,b.player,w-74-pw-24),x+70,y+30);
    const when=g.final?`Final ${g.fin}`:`${day(g.utc)} · ${clock(g.utc)}`;
    c.fillStyle='#6C6C70'; c.font=F(500,12.5); c.fillText(shFit(c,`${g.label} · ${when}`,w-74-pw-24),x+70,y+47);
    // three boxes: pick, odds, projection
    const bx=isScore(b)?[['Score',`${b.sh}–${b.sa}`,'#731328'],['Odds',b.odds.toFixed(2),'#1C1C1E'],['Chance',Math.round(b.proj*100)+'%','#1C1C1E']]:[[`${b.side==='under'?'Under':'Over'} ${b.stat}`,b.line!=null?String(b.line):'–','#731328'],['Odds',b.odds.toFixed(2),'#1C1C1E'],['Projected',b.proj!=null?f1(b.proj):'–','#1C1C1E']];
    const gap=8, bw=(w-28-gap*2)/3;
    bx.forEach(([k,v,col],i)=>{ const X=x+14+i*(bw+gap), Y=y+62;
      c.fillStyle=i===0?'#F9EDEF':'#F2F2F7'; rr(X,c,Y,bw,54,12); c.fill();
      c.fillStyle='#6C6C70'; c.font=F(600,10.5); c.fillText(shFit(c,k.toUpperCase(),bw-20),X+10,Y+19);
      c.fillStyle=col; c.font=F(800,21); c.fillText(v,X+10,Y+44); });
    if(a!=null){ const win=b.line==null||a===b.line?null:(a>b.line)===(b.side!=='under');
      c.fillStyle=win==null?'#6C6C70':win?'#1A7F37':'#C5221F'; c.font=F(700,12.5);
      const d=b.line==null?'':` · ${Math.abs(a-b.line)%1?Math.abs(a-b.line).toFixed(1):Math.abs(a-b.line)} ${a>=b.line?'over':'under'} the line`;
      c.fillText(`${b.stat==='corners'?'Corners':'Scored'} ${a}${d}`,x+14,y+136); }
    y+=h+12;
  });
  c.fillStyle='#8E8E93'; c.font=F(500,10.5); c.textAlign='center';
  c.fillText('Projections by Propline · for fun, not betting advice',W/2,H-20); c.textAlign='left';
  const blob=await new Promise(r=>cv.toBlob(r,'image/png'));
  return blob;
}
async function openShare(list,title,sub,name){
  if(!list.length) return;
  if(shareImg) URL.revokeObjectURL(shareImg.url);
  shareImg=null; openSheet({kind:'share',title:list.length===1?'Share bet':'Share bets'});
  try{
    const blob=await makeShareImage(list,title,sub);
    shareImg={url:URL.createObjectURL(blob),file:new File([blob],name,{type:'image/png'}),title};
  }catch(e){ shareImg={err:true}; }
  if(sheet&&sheet.kind==='share') renderSheet();
}
function shareBody(){
  if(!shareImg) return '<p class="note" style="text-align:center;padding:2rem 0">Making the picture…</p>';
  if(shareImg.err) return '<p class="note">Could not make the picture on this device.</p>';
  return `<img class="shimg" src="${shareImg.url}" alt="Picture of the bets to share">
  <button class="btn" data-do="sharego">${ICON.share}Share picture</button>
  <p class="note">No stakes or money are shown, only the picks. You can also touch and hold the picture to save it.</p>`;
}
async function shareGo(){
  if(!shareImg||!shareImg.file) return;
  const data={files:[shareImg.file],title:'Propline bets'};
  try{
    if(navigator.canShare&&navigator.canShare(data)){ await navigator.share(data); return; }
  }catch(e){ if(e&&e.name==='AbortError') return; }
  const a=document.createElement('a'); a.href=shareImg.url; a.download=shareImg.file.name; document.body.appendChild(a); a.click(); a.remove();
  toast('Picture saved');
}
function shareBets(ids,kind){
  const list=ids.map(id=>bets.find(b=>b.id===id)).filter(Boolean); if(!list.length) return;
  list.sort((a,b)=>(a.when||'').localeCompare(b.when||''));
  const d=day(list[0].when), n=list.length;
  const title=n===1?(isScore(list[0])?`Correct score ${list[0].sh}–${list[0].sa} in ${list[0].player}`:`${list[0].side==='under'?'Under':'Over'} ${list[0].line} on ${list[0].player}`):`My ${kind==='open'?'picks':'bets'} · ${d}`;
  const sub=n===1?`${(SPORTS[list[0].sport]||SPORT).league} · ${d}`:`${(SPORTS[list[0].sport]||SPORT).league} · ${n} bets`;
  openShare(list,title,sub,`propline-${list[0].date}${n===1?'-'+list[0].player.toLowerCase().replace(/[^a-z]+/g,'-'):''}.png`);
}
