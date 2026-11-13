/* Shared helpers. Everything sport-specific lives in part-sports.js */
function gameOf(t){return SLATE.games.find(x=>x.away===t||x.home===t)}
function opponent(t){const g=gameOf(t);return g.away===t?g.home:g.away}
function matchupFor(t,pos){
  const idx=(SPORT.groups[pos]||Object.values(SPORT.groups)[0]).cols, d=SLATE.defense&&SLATE.defense[opponent(t)], avg=a=>idx.reduce((s,k)=>s+a[k],0)/idx.length;
  return d?avg(d)/avg(SLATE.leagueDefense):1;
}
let edits=DB.get('edits',{min:{},play:{}}); if(!edits.min||!edits.play) edits={min:{},play:{}};
const pid=(t,i)=>SPORT.id+':'+SLATE.date+':'+t+':'+SLATE.teams[t].players[i][0];
function player(t,i){
  const [name,pos,min,pts,status,st]=SLATE.teams[t].players[i], id=pid(t,i);
  const playing=id in edits.play?edits.play[id]:(status!=='O'&&status!=='D');
  const minutes=id in edits.min?edits.min[id]:min;
  return {t,i,id,name,pos,min,pts,status,starter:!!st,playing,minutes,edited:(id in edits.min)||(id in edits.play),opp:opponent(t),...SPORT.project(min,pts,minutes,matchupFor(t,pos))};
}
function roster(t){
  const all=SLATE.teams[t].players.map((_,i)=>player(t,i));
  return {on:all.filter(p=>p.playing).sort((a,b)=>b.result-a.result),off:all.filter(p=>!p.playing)};
}
function slateTeams(){return SLATE.games.flatMap(g=>[g.away,g.home])}
function leaders(pos){
  return slateTeams().flatMap(t=>roster(t).on).filter(p=>!pos||p.pos===pos).sort((a,b)=>b.result-a.result);
}
const hasEdits=()=>Object.keys(edits.min).length+Object.keys(edits.play).length>0;
const $=s=>document.querySelector(s);
const f1=n=>n.toFixed(1);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const pct=m=>{const d=Math.round((m-1)*100);return d===0?'an average amount':Math.abs(d)+'% '+(d>0?'more':'less')+' than average'};
function day(utc){return new Date(utc).toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'})}
function clock(utc){return new Date(utc).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}

/* results: what a player actually scored vs the projection */
let acts=DB.get('acts',{}); if(!acts||typeof acts!=='object') acts={};
function actualOf(p){ if(p.id in acts) return acts[p.id]; const a=SLATE.actual&&SLATE.actual[p.t]; return a&&(p.name in a)?a[p.name]:null; }
const CLOSE=3, NEAR=6;
function verdict(gap){ const a=Math.abs(gap); return a<=CLOSE?['w','Close']:a<=NEAR?['q','Near']:['l','Off']; }
const sgn=n=>(n>0.04?'+':n<-0.04?'−':'')+Math.abs(n).toFixed(1);
function accuracy(list){
  const r=list.map(p=>({p,a:actualOf(p)})).filter(x=>x.a!=null).map(x=>({p:x.p,gap:x.a-x.p.result}));
  if(!r.length) return {n:0};
  const abs=r.map(x=>Math.abs(x.gap)), worst=r.reduce((m,x)=>Math.abs(x.gap)>Math.abs(m.gap)?x:m);
  return {n:r.length,avg:abs.reduce((s,x)=>s+x,0)/r.length,close:abs.filter(x=>x<=CLOSE).length/r.length*100,worst};
}
/* moneyline odds (decimal): data from the slate, or what you typed */
let oddsEd=DB.get('odds',{}); if(!oddsEd||typeof oddsEd!=='object') oddsEd={};
const oddsKey=g=>SPORT.id+':'+SLATE.date+':'+g.id;
function gameOdds(g){ const e=oddsEd[oddsKey(g)]||{}, m=g.ml||{}; return {away:'away' in e?e.away:(m.away||null),home:'home' in e?e.home:(m.home||null),src:m.src||null}; }
function implied(o){ if(o.away&&o.home){ const a=1/o.away,h=1/o.home; return {away:a/(a+h)*100,home:h/(a+h)*100}; } return {away:o.away?100/o.away:null,home:o.home?100/o.home:null}; }
/* team colours */
function lum(hex){ const c=[1,3,5].map(i=>parseInt(hex.substr(i,2),16)/255).map(v=>v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)); return .2126*c[0]+.7152*c[1]+.0722*c[2]; }
function tstyle(t){ const c=(SPORT.colors&&SPORT.colors[t])||['#8E8E93','#8E8E93'], p=c[0], s=c[1]||p;
  return `--tc:${p};--tf:${lum(p)>.4?'#000':'#fff'};--tcd:${lum(p)>=.05?p:lum(s)>=.05?s:'#8E8E93'}`; }
