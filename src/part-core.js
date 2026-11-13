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
