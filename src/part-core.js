/* Shared helpers. Everything sport-specific lives in part-sports.js */
function gameOf(t){return SLATE.games.find(x=>x.away===t||x.home===t)}
function opponent(t){const g=gameOf(t);return g.away===t?g.home:g.away}
function matchupFor(t,pos){
  const idx=(SPORT.groups[pos]||Object.values(SPORT.groups)[0]).cols, d=SLATE.defense&&SLATE.defense[opponent(t)], avg=a=>idx.reduce((s,k)=>s+a[k],0)/idx.length;
  return d?avg(d)/avg(SLATE.leagueDefense):1;
}
let edits=DB.get('edits',{min:{},play:{}}); if(!edits.min||!edits.play) edits={min:{},play:{}};
const pid=(t,i)=>SPORT.id+':'+SLATE.date+':'+t+':'+SLATE.teams[t].players[i][0];
/* rest: days off before this game (0 = second night of a back-to-back) */
const restOf=t=>SLATE.rest&&t in SLATE.rest?SLATE.rest[t]:null;
function restFactor(t){ const own=restOf(t), opp=restOf(opponent(t)); let f=1;
  if(own===0) f*=.96; else if(own!=null&&own>=2) f*=1.01;
  if(opp===0) f*=1.02; return {f,own,opp}; }
/* learning: compare past projections with what players really scored, and nudge the next ones.
   Only games before this slate count; applied from 15 Nov 2026, when it was added, so older projections stay as they were. */
const LEARN_FROM='2026-11-15'; let LEARN={};
function learnTable(){
  const key=SPORT.id+':'+SLATE.date; if(LEARN.key===key) return LEARN;
  const per={}; let A=0,P=0,N=0;
  (SPORT.slates||[]).filter(s=>s.date<SLATE.date&&s.actual).forEach(s=>Object.entries(s.teams).forEach(([t,tm])=>{
    const g=s.games.find(x=>x.away===t||x.home===t); if(!g) return; const opp=g.away===t?g.home:g.away, dnp=(s.dnp&&s.dnp[t])||[];
    tm.players.forEach(([name,pos,min,pts])=>{
      const a=s.actual[t]&&s.actual[t][name]; if(a==null||dnp.includes(name)||min<10) return;
      const idx=(SPORT.groups[pos]||SPORT.groups.F).cols, d=s.defense&&s.defense[opp], av=x=>idx.reduce((q,k)=>q+x[k],0)/idx.length;
      const pr=SPORT.project(min,pts,min,d?av(d)/av(s.leagueDefense):1).result; if(!(pr>0)) return;
      A+=a; P+=pr; N++; const e=per[name]||(per[name]={n:0,a:0,p:0}); e.n++; e.a+=a; e.p+=pr; });
  }));
  const g=N?Math.min(1.1,Math.max(.9,1+(A/P-1)*N/(N+100))):1;
  return LEARN={key,g,per,N,A,P};
}
function learnFor(name){
  if(SLATE.date<LEARN_FROM) return {f:1,n:0,off:true};
  const L=learnTable(), e=L.per[name]; if(!e) return {f:L.g,n:0,g:L.g,N:L.N};
  return {f:Math.min(1.2,Math.max(.8,(e.n*(e.a/e.p)+4*L.g)/(e.n+4))),n:e.n,a:e.a,p:e.p,g:L.g,N:L.N};
}
function player(t,i){
  const [name,pos,min,pts,status,st]=SLATE.teams[t].players[i], id=pid(t,i);
  const sat=SLATE.dnp&&SLATE.dnp[t]&&SLATE.dnp[t].includes(name);
  const playing=id in edits.play?edits.play[id]:(status!=='O'&&status!=='D'&&!sat);
  const minutes=id in edits.min?edits.min[id]:min;
  const m=SPORT.project(min,pts,minutes,matchupFor(t,pos)), rest=restFactor(t), learn=learnFor(name);
  return {t,i,id,name,pos,min,pts,status,starter:!!st,playing,minutes,edited:(id in edits.min)||(id in edits.play),opp:opponent(t),...m,base:m.result,rest,learn,result:m.result*rest.f*learn.f};
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
// at or above the projection: green; up to 3 under: yellow; up to 6 under: orange; more than 6 under: red
function verdict(gap){ return gap>=-0.05?'w':gap>=-CLOSE?'y':gap>=-NEAR?'or':'l'; }
const sgn=n=>(n>0.04?'+':n<-0.04?'−':'')+Math.abs(n).toFixed(1);
function accuracy(list){
  const r=list.map(p=>({p,a:actualOf(p)})).filter(x=>x.a!=null).map(x=>({p:x.p,gap:x.a-x.p.result})).filter(x=>isFinite(x.gap));
  if(!r.length) return {n:0};
  const abs=r.map(x=>Math.abs(x.gap)), worst=r.reduce((m,x)=>x.gap<m.gap?x:m);
  return {n:r.length,avg:abs.reduce((s,x)=>s+x,0)/r.length,beat:r.filter(x=>x.gap>=-0.05).length/r.length*100,worst};
}
/* moneyline odds (decimal): data from the slate, or what you typed */
let oddsEd=DB.get('odds',{}); if(!oddsEd||typeof oddsEd!=='object') oddsEd={};
const oddsKey=g=>SPORT.id+':'+SLATE.date+':'+g.id;
// if only one team has a price, the other is estimated from it (typical bookmaker margin of 4.5%) and flagged in est
function gameOdds(g){
  const e=oddsEd[oddsKey(g)]||{}, m=g.ml||{}, o={away:'away' in e?e.away:(m.away||null),home:'home' in e?e.home:(m.home||null),src:m.src||null,est:{}};
  for(const [x,y] of [['away','home'],['home','away']]) if(!o[x]&&o[y]&&!(x in e)){ const p=1.045-1/o[y]; if(p>.01){ o[x]=Math.round(100/p)/100; o.est[x]=true; } }
  return o;
}
const oddTxt=(o,k)=>o[k]?(o.est[k]?'~':'')+o[k].toFixed(2):'–';
function implied(o){ if(o.away&&o.home){ const a=1/o.away,h=1/o.home; return {away:a/(a+h)*100,home:h/(a+h)*100}; } return {away:o.away?100/o.away:null,home:o.home?100/o.home:null}; }
/* team colours */
function lum(hex){ const c=[1,3,5].map(i=>parseInt(hex.substr(i,2),16)/255).map(v=>v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)); return .2126*c[0]+.7152*c[1]+.0722*c[2]; }
function tstyle(t,sp){ const S=SPORTS[sp]||SPORT, c=(S.colors&&S.colors[t])||Object.values(SPORTS).map(x=>x.colors&&x.colors[t]).find(Boolean)||['#8E8E93','#8E8E93'], p=c[0], s=c[1]||p, lp=lum(p), ls=lum(s);
  return `--tc:${p};--tc2:${s};--tf:${Math.min(lp,ls)>.45?'#000':'#fff'};--tsh:${Math.min(lp,ls)>.45?'none':'0 1px 2px rgba(0,0,0,.45)'};--tcd:${lp>=.05?p:ls>=.05?s:'#8E8E93'}`; }
/* short names: a known nickname, else the last name; first initial or full name only when two players would clash */
const SUFFIX=/\s+(Jr\.?|Sr\.?|II|III|IV)$/;
let _sn={};
function shortNames(){
  const key=SPORT.id+SLATE.date; if(_sn.key===key) return _sn.map;
  if(SPORT.kind==='match'){ _sn={key,map:{}}; return _sn.map; }
  const names=slateTeams().flatMap(t=>SLATE.teams[t].players.map(r=>r[0])), nick=SPORT.nick||{}, last=n=>n.replace(SUFFIX,'').split(' ').slice(1).join(' ')||n, cnt={}, map={}, c2={};
  names.forEach(n=>{ if(!nick[n]){ const l=last(n); cnt[l]=(cnt[l]||0)+1; } });
  names.forEach(n=>{ map[n]=nick[n]||(cnt[last(n)]>1?n[0]+'. '+last(n):last(n)); });
  Object.values(map).forEach(v=>c2[v]=(c2[v]||0)+1);
  names.forEach(n=>{ if(c2[map[n]]>1&&!nick[n]) map[n]=n.replace(SUFFIX,''); });
  _sn={key,map}; return map;
}
const sn=name=>shortNames()[name]||Object.values(SPORTS).map(x=>x.nick&&x.nick[name]).find(Boolean)||name;
