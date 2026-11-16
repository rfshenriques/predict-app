/* storage shim: same interface a synced DB would have */
const DB={
  get(k,d){try{const v=JSON.parse(localStorage.getItem('propline:'+k));return v==null?d:v}catch(e){return d}},
  set(k,v){try{localStorage.setItem('propline:'+k,JSON.stringify(v))}catch(e){}}
};
const STANDALONE=(()=>{try{return matchMedia('(display-mode: standalone)').matches||navigator.standalone===true}catch(e){return false}})();

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

/* BETS. Saved on the device. One record per bet, for any sport. */
let bets=DB.get('bets',[]); if(!Array.isArray(bets)) bets=[];
const saveBets=()=>{ DB.set('bets',bets); if(typeof noteBets==='function') noteBets(); };
// profit or loss of one bet: won = stake x (odds - 1), lost = -stake, open and void = 0
function betPL(b){ return b.status==='won'?b.stake*(b.odds-1):b.status==='lost'?-b.stake:0; }
function betStats(list){
  const s={pl:0,won:0,lost:0,void:0,open:0,openStake:0,staked:0};
  for(const b of list){ s.pl+=betPL(b); s[b.status]++; if(b.status==='open') s.openStake+=b.stake; else if(b.status!=='void') s.staked+=b.stake; }
  s.settled=s.won+s.lost; s.green=s.settled?s.won/s.settled*100:null; s.roi=s.staked?s.pl/s.staked*100:null;
  return s;
}
const money=n=>'€'+Math.abs(n).toFixed(2);
const signed=n=>(n>0.004?'+':n<-0.004?'−':'')+'€'+Math.abs(n).toFixed(2);
const num=v=>{ const n=parseFloat(String(v).replace(',','.')); return isFinite(n)?n:null; };
function betsFor(p){ return bets.filter(b=>b.sport===SPORT.id&&b.date===SLATE.date&&b.team===p.t&&b.player===p.name); }
function validBet(b){ return b&&typeof b.id==='string'&&typeof b.player==='string'&&typeof b.stake==='number'&&typeof b.odds==='number'&&['open','won','lost','void'].includes(b.status); }

/* SPORTS REGISTRY
   To add a sport: 1) add its data files (same shape as part-data-nba-DATE.js, one per day)  2) add one registerSport({...}) block below.
   The screens read everything from the active sport, so they need no changes. */
const SPORTS={}, SPORT_ORDER=[];
function registerSport(def){SPORTS[def.id]=def;SPORT_ORDER.push(def.id)}

registerSport({
  id:'nba', kind:'player', short:'NBA', tab2:'Players', league:'NBA', sport:'Basketball', stat:'points', unit:'pts',
  slates:NBA_SLATES.sort((a,b)=>a.date<b.date?-1:1),   // one entry per day, oldest first
  async load(){ return this.slates; },           // the API call goes here later
  // what people actually call them; everyone else is shown by last name
  nick:{"Shai Gilgeous-Alexander":"SGA","Victor Wembanyama":"Wemby","Giannis Antetokounmpo":"Giannis","Michael Porter Jr.":"MPJ","Nikola Jokic":"Jokic","DeMar DeRozan":"DeRozan","Karl-Anthony Towns":"KAT","Nickeil Alexander-Walker":"NAW","Kentavious Caldwell-Pope":"KCP","LeBron James":"LeBron","Stephen Curry":"Steph","Kevin Durant":"KD","Anthony Davis":"AD","Anthony Edwards":"Ant","Damian Lillard":"Dame","Zion Williamson":"Zion","Ja Morant":"Ja","Luka Doncic":"Luka","Kyrie Irving":"Kyrie","Trae Young":"Trae","LaMelo Ball":"LaMelo","Cade Cunningham":"Cade","Paolo Banchero":"Paolo","Scottie Barnes":"Scottie","Draymond Green":"Draymond","Klay Thompson":"Klay","Bam Adebayo":"Bam","Jrue Holiday":"Jrue","Chet Holmgren":"Chet","Tyrese Haliburton":"Hali","Donovan Mitchell":"Spida","Jaylen Brown":"JB","Franz Wagner":"Franz","Deni Avdija":"Deni","Kawhi Leonard":"Kawhi","Jimmy Butler":"Jimmy","Kristaps Porzingis":"KP","Russell Westbrook":"Russ","RJ Barrett":"RJ","OG Anunoby":"OG","CJ McCollum":"CJ","Scoot Henderson":"Scoot","Jalen Williams":"J-Dub","Jabari Smith Jr.":"Jabari","Amen Thompson":"Amen","Ausar Thompson":"Ausar","Dejounte Murray":"Dejounte","Fred VanVleet":"FVV","Bones Hyland":"Bones","Jaren Jackson Jr.":"JJJ","Herbert Jones":"Herb Jones","P.J. Washington":"PJ","Isaiah Hartenstein":"I-Hart"},
  // team colours: [primary, secondary]
  colors:{"ATL":["#E03A3E","#C1D32F"],"BOS":["#007A33","#BA9653"],"BKN":["#000000","#FFFFFF"],"CHA":["#1D1160","#00788C"],"CHI":["#CE1141","#000000"],"CLE":["#860038","#041E42"],"DAL":["#00538C","#002B5E"],"DEN":["#0E2240","#FEC524"],"DET":["#C8102E","#1D42BA"],"GSW":["#1D428A","#FFC72C"],"HOU":["#CE1141","#000000"],"IND":["#002D62","#FDBB30"],"LAC":["#C8102E","#1D428A"],"LAL":["#552583","#FDB927"],"MEM":["#5D76A9","#12173F"],"MIA":["#98002E","#F9A01B"],"MIL":["#00471B","#EEE1C6"],"MIN":["#0C2340","#236192"],"NOP":["#0C2340","#C8102E"],"NYK":["#006BB6","#F58426"],"OKC":["#007AC1","#EF3B24"],"ORL":["#0077C0","#C4CED4"],"PHI":["#006BB6","#ED174C"],"PHX":["#1D1160","#E56020"],"POR":["#E03A3E","#000000"],"SAC":["#5A2D81","#63727A"],"SAS":["#C4CED4","#000000"],"TOR":["#CE1141","#000000"],"UTA":["#002B5C","#00471B"],"WAS":["#002B5C","#E31837"]},
  // position groups: which defense columns each group uses, and how to name it
  groups:{G:{cols:[0,1],name:'guards',label:'Guards'},F:{cols:[2,3],name:'forwards',label:'Forwards'},C:{cols:[4],name:'centers',label:'Centers'}},
  steps:['Points per minute','Minutes he plays','Multiply 1 by 2','Points per game, adjusted for the defense he faces','Add 3 and 4, divide by 2','Rest: back-to-back costs 4%, two or more days off adds 1%, a tired opponent adds 2%','Learning: how his past projections compared with what he really scored'],
  // the model from the video
  project(seasonMin,seasonAvg,minutesTonight,matchup){
    const rate=seasonMin>0?seasonAvg/seasonMin:0, byMinutes=rate*minutesTonight, vsDefense=seasonAvg*matchup;
    return {rate,byMinutes,avg:seasonAvg,matchup,vsDefense,result:(byMinutes+vsDefense)/2};
  },
  // the same model, written out for one player (shown in his sheet)
  explain(p){
    const g=this.groups[p.pos]||this.groups.F;
    return [
      {t:'Points per minute',v:p.rate.toFixed(2)},
      {t:'Minutes tonight',stepper:f1(p.minutes)},
      {t:`${f1(p.minutes)} × ${p.rate.toFixed(2)}`,v:f1(p.byMinutes)},
      {t:`${f1(p.avg)} points per game × ${p.matchup.toFixed(2)}`,sub:`${p.opp} allow ${g.name} ${pct(p.matchup)}`,v:f1(p.vsDefense)},
      {t:`(${f1(p.byMinutes)} + ${f1(p.vsDefense)}) ÷ 2`,v:f1(p.base)},
      ...(p.rest.own==null?[]:[{t:`Rest × ${p.rest.f.toFixed(2)}`,sub:restTxt(p),v:f1(p.base*p.rest.f)}]),
      ...(p.learn.off?[]:[{t:`Learning × ${p.learn.f.toFixed(2)}`,sub:learnTxt(p.learn),v:f1(p.result)}])
    ];
  }
});


const daysOff=n=>n===0?'played last night':n+' day'+(n>1?'s':'')+' off';
function restTxt(p){ return `${p.t} ${daysOff(p.rest.own)}, ${p.opp} ${daysOff(p.rest.opp)}`; }
function learnTxt(l){
  const all=`all players ${l.g>=1?'+':'−'}${Math.abs(Math.round((l.g-1)*100))}%`;
  if(l.n) return `His last ${l.n>1?l.n+' games':'game'}: projected ${f1(l.p)}, scored ${l.a} · ${all}`;
  return l.N?`No past games for him yet · ${all}`:'No past games yet';
}

/* FOOTBALL: goals and corners per match and per team.
   Goals: each team's attack and the other team's defence, against the league average, home and away (a Poisson model).
   Missing players change it: lost goals and assists lower the attack, missing regular defenders and keepers weaken the defence.
   Corners: the same idea with corners won and conceded. */
registerSport({
  id:'epl', kind:'match', league:'Premier League', short:'Premier League', sport:'Football', stat:'goals', unit:'goals', tab2:'Teams',
  slates:(window.EPL_SLATES||[]).sort((a,b)=>a.date<b.date?-1:1),
  async load(){ return this.slates; },
  colors:{ARS:["#EF0107","#063672"],AVL:["#670E36","#95BFE5"],BOU:["#DA291C","#111111"],BRE:["#E30613","#1A1A1A"],BRI:["#0057B8","#FFCD00"],
    CFC:["#034694","#DBA111"],COV:["#3A9BD0","#0B2343"],CRY:["#1B458F","#C4122E"],EVE:["#003399","#00184A"],FUL:["#111111","#CC0000"],
    HUL:["#F5A12D","#111111"],IPS:["#0044A9","#DE2C37"],LEE:["#1D428A","#FFCD00"],LFC:["#C8102E","#00B2A9"],MCI:["#6CABDD","#1C2C5B"],
    MUN:["#DA291C","#1A1A1A"],NEW:["#241F20","#41B6E6"],NFO:["#E53233","#1A1A1A"],SUN:["#EB172B","#A68A0D"],TOT:["#132257","#4B5A8A"]},
  steps:['League average for home or away teams','Attack: how much this team scores compared with that average','Defence: how much the other team lets in','Missing players on both sides','Multiply them all: expected goals']
});
/* Nations League: same model, teams rated within their group. The table is built from the results. */
function unlPrep(s){
  const T={}, G={}; const row=t=>T[t]||(T[t]={h:[0,0,0],a:[0,0,0]});
  // one blowout (7-0) says less than it seems, so goals in a match count up to 4 when rating teams
  (s.results||[]).forEach(([g,h,a,hg,ag])=>{ G[h]=G[a]=g; hg=Math.min(hg,4); ag=Math.min(ag,4); const H=row(h),A=row(a); H.h[0]++;H.h[1]+=hg;H.h[2]+=ag; A.a[0]++;A.a[1]+=ag;A.a[2]+=hg; });
  s.table=T; s.groupOf=G; Object.values(s.teams).forEach(x=>{ if(!x.out) x.out=[]; }); return s;
}
registerSport({
  id:'unl', kind:'match', league:'Nations League', short:'Nations League', sport:'Football', stat:'goals', unit:'goals', tab2:'Teams',
  slates:(window.UNL_SLATES||[]).map(unlPrep).sort((a,b)=>a.date<b.date?-1:1),
  async load(){ return this.slates; },
  colors:{BEL:["#E30613","#111111"],ITA:["#0066B3","#00205B"],FRA:["#002395","#ED2939"],TUR:["#E30A17","#8B0000"],CRO:["#D52B1E","#171796"],CZE:["#D7141A","#11457E"],
    ESP:["#C60B1E","#FFC400"],ENG:["#1A2B5F","#CE1124"],GER:["#111111","#DD0000"],NED:["#F36C21","#21468B"],GRE:["#0D5EAF","#0A3D7A"],SRB:["#C6363C","#0C4076"],
    DEN:["#C8102E","#8B0A1F"],NOR:["#BA0C2F","#00205B"],WAL:["#C8102E","#00B140"],POR:["#006600","#C8102E"],SCO:["#0065BD","#002855"],SVN:["#005DA4","#ED1C24"],
    SUI:["#D52B1E","#8B0000"],MKD:["#D20000","#FFE600"],GEO:["#DA291C","#7A0E12"],HUN:["#CE2939","#477050"],NIR:["#00A651","#00592A"],UKR:["#0057B7","#FFD700"],
    AUT:["#ED2939","#7A0E12"],ISR:["#0038B8","#002277"],KOS:["#244AA5","#D0A650"],IRL:["#169B62","#FF883E"],ROU:["#FCD116","#002B7F"],POL:["#DC143C","#8B0A1F"],
    SWE:["#006AA7","#FECC00"],BIH:["#002395","#FECB00"],ALB:["#E41E20","#111111"],FIN:["#002F6C","#0A1F44"],BLR:["#C8313E","#4AA657"],SMR:["#5EB6E4","#2A6E9B"],
    ARM:["#D90012","#F2A800"],CYP:["#0047AB","#D57800"],LVA:["#9E3039","#5C1A20"],MNE:["#C40308","#D4AF37"],KAZ:["#00AFCA","#FEC50C"],MDA:["#0046AE","#FFD200"],
    SVK:["#0B4EA2","#EE1C25"],FRO:["#005EB8","#EF3340"],EST:["#0072CE","#111111"],ISL:["#02529C","#DC1E35"],LUX:["#ED2939","#00A1DE"],BUL:["#00966E","#D62612"],
    AND:["#10069F","#D50032"],GIB:["#DA000C","#8B0000"],MLT:["#CF142B","#7A0C19"],LTU:["#FDB913","#006A44"],AZE:["#0092BC","#E4002B"],LIE:["#002B7F","#CE1126"]},
  steps:['Average goals for home or away teams in this group (half group, half whole competition)','Attack: how much this team scores compared with that average (goals in one match count up to 4)','Defence: how much the other team lets in','Missing players on both sides','Multiply them all: expected goals']
});
Object.entries(SPORTS).forEach(([id,sp])=>sp.slates.forEach(s=>s.sid=id));
const FB={SHRINK:5, LOST:0.6, CORNER_R:20};
const fbTeamName=(s,t)=>(s.teams[t]||{name:t}).name;
const matchTitle=g=>g.home&&SPORT.kind==='match'?`${g.home} v ${g.away}`:`${g.away} at ${g.home}`;
/* availability of a missing player: 1 plays, 0 out, in between = how likely */
function fbStatus(s,g,t,r){
  const [name,pos,m,goals,ast,type,info,ret]=r, id=(s.sid||'epl')+':'+s.date+':'+t+':'+name, day=g.utc.slice(0,10);
  let a,label,cls;
  if(ret==='x'){a=0;label='Out';cls='o'}
  else if(type==='S'){ if(!ret||ret>=day){a=0;label='Suspended';cls='o'} else {a=1;label='Ban served';cls='v'} }
  else if(!ret){a=.5;label='Doubtful';cls='q'}
  else if(ret>day){a=0;label=ret>new Date(Date.parse(day)+21*864e5).toISOString().slice(0,10)?'Out long term':'Out';cls='o'}
  else {a=.8;label='Expected back';cls='v'}
  const ed=id in edits.play; if(ed) a=edits.play[id]?1:0;
  return {id,name,pos,m,goals,ast,type,info,ret,a,label,cls,edited:ed};
}
function fbAbsent(s,g,t){ return (s.teams[t].out||[]).map(r=>fbStatus(s,g,t,r)); }
const DEF_W={G:[.10,.04],D:[.05,.02],M:[.02,0],F:[0,0]};
function fbInjury(s,g,t){
  const tb=s.table[t], gf=tb.h[1]+tb.a[1], list=fbAbsent(s,g,t);
  let lost=0,def=0; const who=[];
  list.forEach(p=>{ const miss=1-p.a; if(miss<=0) return;
    const c=p.goals+.5*p.ast; if(c>0){ lost+=miss*c; who.push(p.name.split(' ').slice(-1)[0]); }
    const w=DEF_W[p.pos]||[0,0], d=p.m>=6?w[0]:p.m>=3?w[1]:0; def+=miss*d; });
  const share=gf?lost/gf:0;
  return {att:Math.max(.7,1-FB.LOST*share),def:Math.min(1.25,1+def),share,lost,who,list};
}
function fbLeague(s,grp){
  const avg=list=>{ let hp=0,hg=0,ap=0,ag=0; list.forEach(x=>{hp+=x.h[0];hg+=x.h[1];ap+=x.a[0];ag+=x.a[1];}); return {home:hg/hp,away:ag/ap,team:(hg+ag)/(hp+ap)}; };
  const all=avg(Object.values(s.table)); if(!grp) return all;
  const g=avg(Object.entries(s.table).filter(([t])=>s.groupOf[t]===grp).map(([,x])=>x));
  return {home:(g.home+all.home)/2,away:(g.away+all.away)/2,team:(g.team+all.team)/2,group:grp};
}
const shrink=(raw,n)=>(n*raw+FB.SHRINK)/(n+FB.SHRINK);
function fbStrength(s,t,venue,L){
  const x=s.table[t], n=x.h[0]+x.a[0], v=x[venue][0]?x[venue]:[n,x.h[1]+x.a[1],x.h[2]+x.a[2]], vAvg=venue==='h'?L.home:L.away, oAvg=venue==='h'?L.away:L.home;
  const att=shrink(((v[1]/v[0])/vAvg+((x.h[1]+x.a[1])/n)/L.team)/2,n);
  const def=shrink(((v[2]/v[0])/oAvg+((x.h[2]+x.a[2])/n)/L.team)/2,n);
  return {att,def,gfv:v[1]/v[0],gav:v[2]/v[0]};
}
function fbCorners(s,g){
  const C=s.corners||{}, A=s.cornersAvg||{home:5,away:4.5}, all=(A.home+A.away)/2, n=s.cornersN||10;
  const one=(t,o,venue)=>{ const c=C[t]||{h:A.home,a:A.away,f:all,ag:all}, oc=C[o]||{ag:all}, vAvg=venue==='h'?A.home:A.away;
    const forS=shrink(((venue==='h'?c.h:c.a)/vAvg+c.f/all)/2,n), agS=oc.ag!=null?shrink(oc.ag/all,n):1;
    return {lam:vAvg*forS*agS,forS,agS,base:vAvg,won:venue==='h'?c.h:c.a,conc:oc.ag}; };
  if(!C[g.home]&&!C[g.away]) return null;
  return {home:one(g.home,g.away,'h'),away:one(g.away,g.home,'a')};
}
const _fbc={};
function fbModel(s,g){
  const L=fbLeague(s,g.group), H=fbStrength(s,g.home,'h',L), A=fbStrength(s,g.away,'a',L), iH=fbInjury(s,g,g.home), iA=fbInjury(s,g,g.away);
  const lh=L.home*H.att*A.def*iH.att*iA.def, la=L.away*A.att*H.def*iA.att*iH.def;
  const ph=pois(lh,10), pa=pois(la,10), grid=ph.map(x=>pa.map(y=>x*y));
  let hw=0,dr=0,aw=0,btts=0; grid.forEach((r,i)=>r.forEach((v,j)=>{ if(i>j)hw+=v; else if(i===j)dr+=v; else aw+=v; if(i>0&&j>0)btts+=v; }));
  const scores=[]; grid.forEach((r,i)=>r.forEach((v,j)=>scores.push({h:i,a:j,p:v}))); scores.sort((a,b)=>b.p-a.p);
  // projected goals per team: the most goals the team is more likely than not to reach (median); the score must agree with BTTS
  const med=pmf=>{ let c=0; for(let k=0;k<pmf.length;k++){ c+=pmf[k]; if(c>=.5) return k; } return 0; };
  const ps={h:med(ph),a:med(pa)}, bttsYes=btts>=.5;
  if(!bttsYes&&ps.h>0&&ps.a>0){ if(lh<la) ps.h=0; else ps.a=0; }
  if(bttsYes){ ps.h=Math.max(1,ps.h); ps.a=Math.max(1,ps.a); }
  ps.p=grid[ps.h]&&grid[ps.h][ps.a]||0;
  const near=[]; for(let i=Math.max(0,ps.h-1);i<=ps.h+1;i++) for(let j=Math.max(0,ps.a-1);j<=ps.a+1;j++) if(grid[i]) near.push({h:i,a:j,p:grid[i][j]});
  return {L,H,A,iH,iA,lh,la,ph,pa,grid,hw,dr,aw,btts,scores,corners:fbCorners(s,g),ps,near,bttsPick:bttsYes};
}
/* probability helpers */
function pois(l,max){ const r=[]; let p=Math.exp(-l); for(let k=0;k<=max;k++){ r.push(p); p*=l/(k+1); } return r; }
function negbin(mu,r,max){ const q=r/(r+mu), out=[]; let p=Math.pow(q,r); for(let k=0;k<=max;k++){ out.push(p); p*=(k+r)/(k+1)*(1-q); } return out; }
function overUnder(pmf,L){ let over=0,under=0,push=0; pmf.forEach((v,k)=>{ if(k>L)over+=v; else if(k<L)under+=v; else push+=v; }); const t=over+under+push||1; return {over:over/t,under:under/t,push:push/t}; }
/* one market as a distribution: goals or corners, the match or one team */
function fbDist(m,stat,market,side){
  if(stat==='corners'){ const c=m.corners, mu=market==='total'?c.home.lam+c.away.lam:c[side].lam; return {mu,pmf:negbin(mu,FB.CORNER_R,40)}; }
  const mu=market==='total'?m.lh+m.la:(side==='home'?m.lh:m.la); return {mu,pmf:pois(mu,15)};
}
const P0=v=>Math.round(v*100)+'%';
/* ---- screens ---- */
function fbSlateName(s){ return s.label||day(s.games[0].utc); }
function fbCard(g){
  const m=fbModel(SLATE,g), f=g.final, C=m.corners;
  const side=(t,lam,k)=>`<div class="side">${tile(t)}<span class="nm">${fbTeamName(SLATE,t)}<span class="topp">${k==='home'?'Home':'Away'} · ${lam.toFixed(2)} goals</span></span>
    ${f?`<b class="xg real num" aria-label="Final">${f[k]}</b>`:`<span class="xg proj num" aria-label="Projected goals">${m.ps[k==='home'?'h':'a']}</span>`}</div>`;
  return `<button class="card game fbg" data-sport="${SPORT.id}" data-day="${DAY}" data-do="open" data-id="${g.id}" aria-label="${matchTitle(g)}, projected ${m.ps.h} ${m.ps.a}, open match">
    <div class="ghead"><span>${f?'Final':day(g.utc)+' · '+clock(g.utc)}</span><span class="gh-r">${f?`<span class="projt">Projected ${m.ps.h}–${m.ps.a}</span>`:'<span class="projt">Projected score</span>'}<i class="chev"></i></span></div>${side(g.home,m.lh,'home')}${side(g.away,m.la,'away')}
    <div class="gfoot"><span>Goals · <b class="num">${(m.lh+m.la).toFixed(1)}</b></span>${C?`<span>Corners · <b class="num">${(C.home.lam+C.away.lam).toFixed(1)}</b></span>`:''}<span>Both score · <b>${m.bttsPick?'Yes':'No'}</b></span></div></button>`;
}
function fbHome(){
  const top=fbTopCards(6,false).sort(byTime).map(i=>i.html).join('');
  return head(`${SPORT.league} · ${SLATE.games.length} matches`,slateName(SLATE),isLatest()?'Latest round · times in your time zone':'Past round')+(onHome()?homeChips():'')+dayPicker()+
  (onHome()?`<div class="sec">My bets</div>`+sumHTML(true):'')+
  (top?`<div class="sec row-sec"><span>Top projections</span><button class="link" data-do="list">All teams</button></div><div class="hs">${top}</div>`:'')+`
  <div class="sec">Matches</div>`+SLATE.games.map(fbCard).join('')+
  `<p class="note">The big number is each team's projected goals. Tap a match for its summary, then goals, corners, the score grid and team news.</p>`;
}
let fbStat='goals';
function fbTeams(){
  const rows=SLATE.games.flatMap(g=>{ const m=fbModel(SLATE,g); return [{t:g.home,o:g.away,k:'home',g,m},{t:g.away,o:g.home,k:'away',g,m}]; })
    .map(r=>({...r,v:fbStat==='goals'?(r.k==='home'?r.m.lh:r.m.la):r.m.corners[r.k].lam})).sort((a,b)=>b.v-a.v);
  const line=fbStat==='goals'?1.5:4.5;
  return head(`${SPORT.league} · ${slateName(SLATE)}`,'Teams','Ranked by expected '+fbStat)+dayPicker()+
  `<div class="seg" role="group" aria-label="Stat">${[['goals','Goals'],['corners','Corners']].map(([k,l])=>`<button data-do="fbstat" data-v="${k}" aria-pressed="${k===fbStat}">${l}</button>`).join('')}</div>
  <div class="card">${rows.map((r,k)=>{ const d=fbDist(r.m,fbStat,'team',r.k), ou=overUnder(d.pmf,line), miss=(r.k==='home'?r.m.iH:r.m.iA);
    return `<div class="row prow"><button class="rmain" data-do="open" data-id="${r.g.id}">${tile(r.t,'sm')}<span class="who"><b>${fbTeamName(SLATE,r.t)}</b><span class="num">${r.k==='home'?'vs':'at'} ${r.o} · over ${line} ${P0(ou.over)}</span></span>
      <span class="proj num">${r.v.toFixed(fbStat==='goals'?2:1)}</span></button><button class="rbet" data-do="fbbet" data-g="${r.g.id}" data-stat="${fbStat}" data-mk="team" data-k="${r.k}" data-l="${line}" data-side="over" aria-label="Add a bet on ${fbTeamName(SLATE,r.t)} ${fbStat}">${ICON.addbet}</button></div>`; }).join('')}</div>
  <p class="note">Tap a team for the full match. The plus adds a bet on that team's ${fbStat}, over ${line}.</p>`;
}
function lineRow(g,m,stat,mk,k,L){
  const d=fbDist(m,stat,mk,k), ou=overUnder(d.pmf,L);
  const B=(side,p)=>`<button class="lb" data-do="fbbet" data-g="${g.id}" data-stat="${stat}" data-mk="${mk}" data-k="${k||''}" data-l="${L}" data-side="${side}" aria-label="Add a bet: ${side} ${L}, ${P0(p)} chance"><span>${side==='over'?'Over':'Under'}</span><b class="num">${P0(p)}</b></button>`;
  return `<div class="lrow"><span class="ll num">${L}</span>${B('over',ou.over)}${B('under',ou.under)}</div>`;
}
function stepRows(rows){ return rows.map((r,k)=>`<div class="step"><span class="n">${k+1}</span><span class="t">${r.t}${r.sub?`<small>${r.sub}</small>`:''}</span>${r.v!=null?`<span class="v num">${r.v}</span>`:''}</div>`).join(''); }
function fbSteps(g,m,k){
  const t=k==='home'?g.home:g.away, o=k==='home'?g.away:g.home, S=k==='home'?m.H:m.A, Os=k==='home'?m.A:m.H, I=k==='home'?m.iH:m.iA, Io=k==='home'?m.iA:m.iH;
  const base=k==='home'?m.L.home:m.L.away, lam=k==='home'?m.lh:m.la, x=v=>'×'+v.toFixed(2);
  return stepRows([
    {t:`${k==='home'?'Home':'Away'} teams score on average`,sub:m.L.group?`Group ${m.L.group}, blended with the whole competition`:'',v:base.toFixed(2)},
    {t:`${t} attack`,sub:`${S.gfv.toFixed(1)} goals a game ${k==='home'?'at home':'away'}, blended with the whole season`,v:x(S.att)},
    {t:`${o} defence`,sub:`${Os.gav.toFixed(1)} let in a game ${k==='home'?'away':'at home'}, blended with the whole season`,v:x(Os.def)},
    {t:'Missing players',sub:'Injuries and bans on both teams',v:x(I.att*Io.def)},
    {t:'Expected goals',v:lam.toFixed(2)}]);
}
function fbCornerSteps(g,m,k){
  const t=k==='home'?g.home:g.away, o=k==='home'?g.away:g.home, c=m.corners[k];
  return stepRows([{t:`${k==='home'?'Home':'Away'} teams win on average`,v:c.base.toFixed(1)},{t:`${t} win`,sub:`${c.won.toFixed(1)} a game ${k==='home'?'at home':'away'}, blended with the whole season`,v:'×'+c.forS.toFixed(2)},
    {t:`${o} concede`,sub:c.conc!=null?`${c.conc.toFixed(1)} a game`:'Not published for this competition, so counted as average',v:'×'+c.agS.toFixed(2)},{t:'Expected corners',v:c.lam.toFixed(1)}]);
}
function fbGrid(g,m){
  const N=6, max=m.scores[0].p, P=m.ps;
  let h=`<div class="sgrid" aria-label="Correct score chances"><span class="sg-c sg-h" role="columnheader"></span>${[...Array(N).keys()].map(j=>`<span class="sg-c sg-h" role="columnheader">${j}</span>`).join('')}`;
  for(let i=0;i<N;i++){ h+=`<span class="sg-c sg-h" role="rowheader">${i}</span>`;
    for(let j=0;j<N;j++){ const p=m.grid[i][j], a=Math.min(1,p/max); h+=`<button class="sg-c num${i===P.h&&j===P.a?' top':''}${a>.55?' hi':''}" style="--a:${(a*.85).toFixed(2)}" data-do="fbscore" data-g="${g.id}" data-h="${i}" data-a="${j}" aria-label="Add a bet on ${g.home} ${i}, ${g.away} ${j}: ${(p*100).toFixed(1)}% chance">${(p*100).toFixed(p>=.1?0:1)}</button>`; } }
  return h+'</div>';
}
function fbNews(g,t){
  const list=fbAbsent(SLATE,g,t);
  if(!list.length) return `<div class="row plain"><span class="k">No confirmed absences</span></div>`;
  return list.map(p=>`<div class="fld nws"><span class="who"><b>${esc(p.name)} <span class="pill ${p.cls}">${p.label}${p.a>0&&p.a<1?' · '+P0(p.a):''}</span>${p.edited?'<span class="pill e">Edited</span>':''}</b>
    <span class="num">${{G:'Goalkeeper',D:'Defender',M:'Midfielder',F:'Forward'}[p.pos]||''} · ${p.m?p.m+' games · ':''}${esc(p.info)}</span></span>
    <button class="sw" role="switch" aria-checked="${p.a>=.5}" aria-label="${esc(p.name)} plays" data-do="fbplay" data-id="${esc(p.id)}" data-a="${p.a}"></button></div>`).join('');
}
function fbGame(c){
  const g=SLATE.games.find(x=>x.id===c.id), m=fbModel(SLATE,g), f=g.final, tab=c.fb||'sum';
  const tm=(t,k)=>`<span class="tm">${tile(t,'lg')}<b>${fbTeamName(SLATE,t)}</b><span class="sc num ${f?'real':'proj'}">${f?f[k]:m.ps[k==='home'?'h':'a']}</span><small class="xgs num">${f?`<span class="projt">Projected ${m.ps[k==='home'?'h':'a']}</span>`:(k==='home'?m.lh:m.la).toFixed(2)+' goals'}</small></span>`;
  const pr=g.prob, W=(k,l,v,src)=>`<span class="wp"><span class="tk">${l}</span><b class="num">${P0(v)}</b>${src!=null?`<small class="num">Sportradar ${src.toFixed(0)}%</small>`:''}</span>`;
  let body='';
  if(tab==='sum'){ const C=m.corners, PRO=has('pro'), lk='<span class="pill e">Pro</span>', hn=fbTeamName(SLATE,g.home), an=fbTeamName(SLATE,g.away);
    const win=m.ps.h>m.ps.a?hn+' win':m.ps.h<m.ps.a?an+' win':'Draw';
    const S=(tabk,k,sub,v,lock)=>`<button class="row" data-do="fbtab" data-v="${tabk}"><span class="who"><b>${k}</b>${sub?`<span>${sub}</span>`:''}</span><span class="v num sumv">${lock?lk:v}</span><i class="chev"></i></button>`;
    body=`${f?`<div class="sec">Result</div><div class="card"><div class="row"><span class="who"><b>Final score</b><span>Projected <span class="projt">${m.ps.h} – ${m.ps.a}</span>${f.home===m.ps.h&&f.away===m.ps.a?' · exact':''}</span></span><span class="v num sumv real">${f.home} – ${f.away}</span></div></div>`:''}<div class="sec">Projection</div><div class="card">
      ${S('goals','Goals',`${hn} ${m.lh.toFixed(1)} · ${an} ${m.la.toFixed(1)}`,(m.lh+m.la).toFixed(1))}
      ${C?S('corners','Corners',`${hn} ${C.home.lam.toFixed(1)} · ${an} ${C.away.lam.toFixed(1)}`,(C.home.lam+C.away.lam).toFixed(1),!PRO):''}
      ${S('goals','Both teams score',(m.bttsPick?'Both teams projected to score':(m.ps.h===0?hn:an)+' projected not to score')+' · '+P0(m.bttsPick?m.btts:1-m.btts)+' chance',m.bttsPick?'Yes':'No')}
      ${S('score','Correct score',win,`${m.ps.h} – ${m.ps.a}`,!PRO)}
    </div>
    <p class="note">Each team's score is the goals it's more likely than not to reach, kept in line with both teams to score. Tap a line for the chances behind it.</p>`; }
  if(tab==='goals') body=`<div class="sec">Who wins</div><div class="card wps">${W('home',fbTeamName(SLATE,g.home),m.hw,pr&&pr.home)}${W('draw','Draw',m.dr,pr&&pr.draw)}${W('away',fbTeamName(SLATE,g.away),m.aw,pr&&pr.away)}</div>
    <div class="sec">Match goals · ${(m.lh+m.la).toFixed(2)} expected</div><div class="card">${[1.5,2.5,3.5,4.5].map(L=>lineRow(g,m,'goals','total','',L)).join('')}<div class="row plain"><span class="k">Both teams score</span><span class="v num">${P0(m.btts)} yes · ${P0(1-m.btts)} no</span></div></div>
    <div class="sec">${dot(g.home)}${fbTeamName(SLATE,g.home)} goals · ${m.lh.toFixed(2)}</div><div class="card">${[0.5,1.5,2.5].map(L=>lineRow(g,m,'goals','team','home',L)).join('')}</div>
    <div class="sec">${dot(g.away)}${fbTeamName(SLATE,g.away)} goals · ${m.la.toFixed(2)}</div><div class="card">${[0.5,1.5,2.5].map(L=>lineRow(g,m,'goals','team','away',L)).join('')}</div>
    <div class="sec">How ${g.home} get ${m.lh.toFixed(2)}</div><div class="card steps">${fbSteps(g,m,'home')}</div>
    <div class="sec">How ${g.away} get ${m.la.toFixed(2)}</div><div class="card steps">${fbSteps(g,m,'away')}</div>`;
  if(tab==='corners'){ const C=m.corners, tot=C.home.lam+C.away.lam;
    body=`<div class="sec">Match corners · ${tot.toFixed(1)} expected</div><div class="card">${[8.5,9.5,10.5,11.5].map(L=>lineRow(g,m,'corners','total','',L)).join('')}</div>
    <div class="sec">${dot(g.home)}${fbTeamName(SLATE,g.home)} corners · ${C.home.lam.toFixed(1)}</div><div class="card">${[3.5,4.5,5.5,6.5].map(L=>lineRow(g,m,'corners','team','home',L)).join('')}</div>
    <div class="sec">${dot(g.away)}${fbTeamName(SLATE,g.away)} corners · ${C.away.lam.toFixed(1)}</div><div class="card">${[2.5,3.5,4.5,5.5].map(L=>lineRow(g,m,'corners','team','away',L)).join('')}</div>
    <div class="sec">How ${g.home} get ${C.home.lam.toFixed(1)}</div><div class="card steps">${fbCornerSteps(g,m,'home')}</div>
    <div class="sec">How ${g.away} get ${C.away.lam.toFixed(1)}</div><div class="card steps">${fbCornerSteps(g,m,'away')}</div>
    <p class="note">Corners vary more than goals, so the chances allow for that. Missing players are not used for corners.</p>`; }
  if(tab==='score') body=`<div class="sec">Correct score, % chance</div><div class="card sgw"><div class="sg-ax"><span>${dot(g.home)}${g.home} down</span><span>${dot(g.away)}${g.away} across</span></div>${fbGrid(g,m)}</div>
    <div class="sec">Projected score</div><div class="card"><button class="row" data-do="fbscore" data-g="${g.id}" data-h="${m.ps.h}" data-a="${m.ps.a}"><span class="k"><b>${g.home} ${m.ps.h} – ${m.ps.a} ${g.away}</b></span><span class="v num">${(m.ps.p*100).toFixed(1)}%</span><span class="lplus" aria-hidden="true">${ICON.addbet}</span></button></div>
    <div class="sec">Within one goal of it · ${P0(m.near.reduce((t,x)=>t+x.p,0))} together</div><div class="card">${m.near.filter(x=>!(x.h===m.ps.h&&x.a===m.ps.a)).sort((a,b)=>b.p-a.p).map(s=>`<button class="row" data-do="fbscore" data-g="${g.id}" data-h="${s.h}" data-a="${s.a}"><span class="k">${g.home} ${s.h} – ${s.a} ${g.away}</span><span class="v num">${(s.p*100).toFixed(1)}%</span><span class="lplus" aria-hidden="true">${ICON.addbet}</span></button>`).join('')}</div>
    <p class="note">The highlighted square is the projected score. Any one exact score is unlikely, so the squares around it matter too. Tap a square to add a bet on it.</p>`;
  if(tab==='news') body=`<div class="sec">${dot(g.home)}${fbTeamName(SLATE,g.home)} missing</div><div class="card">${fbNews(g,g.home)}</div>
    <div class="sec">${dot(g.away)}${fbTeamName(SLATE,g.away)} missing</div><div class="card">${fbNews(g,g.away)}</div>
    <p class="note">Switch a player on if you know he plays, or off if he doesn't. Doubtful players count as half (shown on), players expected back count as 80%.</p>`;
  return head(`${SPORT.league} · ${g.group?g.group+' · ':''}${day(g.utc)} · ${f?'Final':clock(g.utc)}`,`${fbTeamName(SLATE,g.home)} v ${fbTeamName(SLATE,g.away)}`,'')+
  `<div class="card mu fbmu">${tm(g.home,'home')}<span class="at">${f?'final':'projected'}</span>${tm(g.away,'away')}</div>
  <div class="seg" role="group" aria-label="Section">${[['sum','Summary'],['goals','Goals'],['corners','Corners'],['score','Score'],['news','News']].map(([k,l])=>`<button data-do="fbtab" data-v="${k}" aria-pressed="${k===tab}">${l}</button>`).join('')}</div>`+body;
}
function fbResults(){
  const done=SLATE.games.filter(g=>g.final);
  return head(`${SPORT.league} · ${slateName(SLATE)}`,'Results','Expected goals against the real score')+dayPicker()+
  (done.length?`<div class="card">${done.map(g=>{ const m=fbModel(SLATE,g), gap=(g.final.home+g.final.away)-(m.lh+m.la);
    return `<button class="row" data-do="open" data-id="${g.id}"><span class="gp-t">${tile(g.home,'sm')}<b class="num">${g.final.home} – ${g.final.away}</b>${tile(g.away,'sm')}</span><span class="v num">xG ${m.lh.toFixed(1)} – ${m.la.toFixed(1)} <span class="pill ${verdict(gap)}">${sgn(gap)}</span></span></button>`; }).join('')}</div>`
  :`<div class="empty">${billy('chew','Billy the goat')}<b>No results yet</b><span>${slateName(SLATE)} starts ${day(SLATE.games[0].utc)}. Scores show here after the matches.</span></div>`);
}
function fbInfo(){
  const R=(k,v)=>`<div class="row plain"><span class="k">${k}</span><span class="v">${v}</span></div>`, src=SLATE.sources||{};
  return `<div class="sec">Expected goals, ${SPORT.steps.length} steps</div><div class="card steps">${stepRows(SPORT.steps.map(t=>({t})))}</div>
  <p class="note">The chances for each line, the winner and the correct score come from those expected goals (a Poisson model). Corners use the same steps with corners won and conceded.</p>
  <div class="sec">Where the numbers come from</div>
  <div class="card">${Object.entries(src).map(([k,v])=>R({table:'League table',results:'Results',injuries:'Injuries and bans',corners:'Corners',fixtures:'Fixtures'}[k]||k,v)).join('')}${R('Checked',SLATE.checked)}</div>`;
}
/* a bet draft on an exact final score */
function fbScoreDraft(gid,h,a){
  const g=SLATE.games.find(x=>x.id===gid), m=fbModel(SLATE,g);
  return {sport:SPORT.id,date:SLATE.date,when:g.utc,gid,market:'score',team:g.home,opp:g.away,player:`${g.home} v ${g.away}`,stat:'score',sh:h,sa:a,proj:+(m.grid[h][a]).toFixed(4),side:'exact',line:'',stake:'',odds:'',status:'open'};
}
const isScore=b=>b&&b.market==='score';
function scoreFinal(b){ const s=(SPORTS[b.sport]||SPORT).slates.find(x=>x.date===b.date), g=s&&s.games.find(x=>x.id===b.gid); return g&&g.final?g.final:null; }
/* a bet draft on a football line */
function fbDraft(gid,stat,mk,k,L,side){
  const g=SLATE.games.find(x=>x.id===gid), m=fbModel(SLATE,g), d=fbDist(m,stat,mk,k);
  const t=mk==='total'?g.home:(k==='home'?g.home:g.away), o=mk==='total'?g.away:(k==='home'?g.away:g.home);
  return {sport:SPORT.id,date:SLATE.date,when:g.utc,gid,market:mk,team:t,opp:o,player:mk==='total'?`${g.home} v ${g.away}`:fbTeamName(SLATE,t),stat,proj:+d.mu.toFixed(2),side,line:String(L),stake:'',odds:'',status:'open'};
}

/* active sport and day. Loaded after every sport has registered. */
let SPORT=SPORTS[DB.get('sport','nba')]||SPORTS.nba, DAY=SPORT.slates.length-1, SLATE=SPORT.slates[DAY];
function setDay(i){ if(!SPORT.slates[i]) return; DAY=i; SLATE=SPORT.slates[i]; }
function setSport(id){ if(!SPORTS[id]) return; SPORT=SPORTS[id]; setDay(SPORT.slates.length-1); DB.set('sport',id); }
function slateName(s){ return s.label||day(s.games[0].utc); }
/* run fn with another sport (latest slate) active, then put everything back */
function withSport(id,fn){ const S=SPORT,D=DAY,L=SLATE; SPORT=SPORTS[id]; DAY=SPORT.slates.length-1; SLATE=SPORT.slates[DAY];
  try{ return fn(); } finally { SPORT=S; DAY=D; SLATE=L; } }

/* BET CALCULATOR: the chance a bet wins (from the projection), compared with the odds, and how much of your bank to stake.
   The stake uses the Kelly rule, scaled down (a quarter or half) and capped, because projections are never exact. */
let acct=DB.get('acct',{}); if(!acct||typeof acct!=='object') acct={};
acct={bank:null,frac:.25,cap:.05,...acct};
const saveAcct=()=>DB.set('acct',acct);
/* NBA: how far real points land from the projection, measured on past days with results */
let _nbaC=null;
function nbaSpread(){
  if(_nbaC) return _nbaC; const sp=SPORTS.nba; let sum=0,n=0;
  (sp?sp.slates:[]).forEach(s=>{ if(!s.actual) return;
    const opp=t=>{const g=s.games.find(x=>x.away===t||x.home===t); return g?(g.away===t?g.home:g.away):null};
    Object.entries(s.teams).forEach(([t,tm])=>{ const o=opp(t), d=o&&s.defense&&s.defense[o];
      tm.players.forEach(([name,pos,min,pts,st])=>{ if(st==='O'||st==='D') return; const a=s.actual[t]&&s.actual[t][name]; if(a==null) return;
        const idx=(sp.groups[pos]||sp.groups.F).cols, avg=x=>idx.reduce((q,k)=>q+x[k],0)/idx.length, mu=d?avg(d)/avg(s.leagueDefense):1;
        const p=sp.project(min,pts,min,mu).result; if(p<3) return; sum+=(a-p)*(a-p)/p; n++; }); }); });
  _nbaC={c:n>20?Math.sqrt(sum/n):1.6,n}; return _nbaC;
}
function normCdf(x){ const t=1/(1+.2316419*Math.abs(x)), d=.3989423*Math.exp(-x*x/2), p=d*t*(.3193815+t*(-.3565638+t*(1.781478+t*(-1.821256+t*1.330274)))); return x>0?1-p:p; }
/* chance the bet wins, loses or is a push (line hit exactly) */
function winChance(d){
  if(isScore(d)){ const s=SPORTS[d.sport].slates.find(x=>x.date===d.date), g=s&&s.games.find(x=>x.id===d.gid); if(!g) return null;
    const p=fbModel(s,g).grid[d.sh][d.sa]; return {p,push:0,q:1-p,how:'goal model, chance of this exact score'}; }
  const L=num(d.line); if(L==null) return null;
  if((SPORTS[d.sport]||{}).kind==='match'){
    const s=SPORTS[d.sport].slates.find(x=>x.date===d.date), g=s&&s.games.find(x=>x.id===d.gid); if(!g) return null;
    const m=fbModel(s,g), k=d.market==='total'?'':(d.team===g.home?'home':'away'), dist=fbDist(m,d.stat,d.market,k), ou=overUnder(dist.pmf,L);
    const w=d.side==='under'?ou.under:ou.over; return {p:w,push:ou.push,q:1-w-ou.push,mu:dist.mu,how:d.stat==='corners'?'corner model':'goal model'};
  }
  const mu=num(d.proj); if(mu==null||mu<=0) return null;
  const S=nbaSpread(), sd=Math.max(2.5,S.c*Math.sqrt(mu)), over=1-normCdf((L-mu)/sd), p=Math.min(.95,Math.max(.05,d.side==='under'?1-over:over));
  return {p,push:0,q:1-p,mu,sd,how:S.n?`spread from ${S.n} past results`:'typical spread'};
}
function kelly(w,odds){ const b=odds-1; return b>0?(w.p*b-w.q)/b:-1; }
function suggest(d){
  const w=winChance(d), o=num(d.odds); if(!w) return null;
  const r={...w,fair:1/Math.max(.001,w.p/(1-w.push||1))};
  if(!(o>1)) return r;
  r.edge=w.p*o+w.push-1; r.k=kelly(w,o);
  if(acct.bank>0&&r.k>0){ const f=Math.min(acct.cap,r.k*acct.frac); r.frac=f; r.stake=Math.max(.5,Math.floor(acct.bank*f*2)/2); }
  return r;
}
function calcHTML(d){
  const r=suggest(d); if(!r) return isScore(d)?'':'<p class="note">Set a line to see the chance this bet wins.</p>';
  const o=num(d.odds), P=v=>Math.round(v*100)+'%';
  const T=(k,v,c)=>`<span><span class="tk">${k}</span><b class="num ${c||''}">${v}</b></span>`;
  let tail='';
  if(!(o>1)) tail='<p class="cnote">Add the odds to see if it is worth it.</p>';
  else if(r.k<=0) tail=`<p class="cnote neg"><b>No bet.</b> Odds of ${o.toFixed(2)} pay less than a ${P(r.p)} chance is worth. You would want ${r.fair.toFixed(2)} or more.</p>`;
  else if(!(acct.bank>0)) tail=`<p class="cnote">Worth it at these odds. <button class="link" data-do="gotab" data-tab="account">Set your bank</button> to get a stake.</p>`;
  else tail=`<div class="cuse"><span>Stake <b class="num">${money(r.stake)}</b><small>${(r.frac*100).toFixed(1)}% of your ${money(acct.bank)} bank</small></span><button class="btn2 sm" data-do="usestake" data-v="${r.stake}">Use</button></div>`;
  return `<div class="card calc2"><div class="tot">${T('Win chance',P(r.p))}${T('Fair odds',r.fair.toFixed(2))}${T('Edge',o>1?(r.edge>=0?'+':'−')+Math.abs(r.edge*100).toFixed(0)+'%':'–',o>1?(r.edge>0?'pos':'neg'):'')}</div>${tail}</div>
  <p class="note">From the ${r.how}${r.push>0.001?`; ${P(r.push)} chance the line lands exactly (stake back)`:''}. A guide, not a promise.</p>`;
}
/* ACCOUNT */
function viewAccount(){
  const S=(k,opts,val)=>`<div class="seg" role="group">${opts.map(([v,l])=>`<button data-do="${k}" data-v="${v}" aria-pressed="${v==val}">${l}</button>`).join('')}</div>`;
  const R=(doo,label,sub)=>`<button class="row" data-do="${doo}"><span class="who"><b>${label}</b>${sub?`<span>${sub}</span>`:''}</span><i class="chev"></i></button>`;
  return head('Propline','Account',ME.email?'Signed in':'Settings')+
  accountTop()+`
  <div class="sec">More</div><div class="card">${R('info','How the projections work','Every sport')}${R('backup','Back up or restore bets',bets.length+' bets')}</div>
  ${STANDALONE?'':'<p class="note">To install: in Safari, tap Share, then Add to Home Screen.</p>'}`;
}
function sportsBody(){
  return `<div class="card">${SPORT_ORDER.map(id=>{const s=SPORTS[id]; return `<button class="row" data-do="sport" data-s="${id}" aria-pressed="${id===SPORT.id}"><span class="sp-ic" aria-hidden="true">${s.kind==='match'?ICON.ball:ICON.hoop}</span><span class="who"><b>${s.league}</b><span>${s.sport} · ${s.slates.length} ${s.kind==='match'?'rounds':'days'} saved</span></span>${id===SPORT.id?'<span class="gp-ck" aria-hidden="true"></span>':''}</button>`}).join('')}</div>
  <p class="note">More leagues can be added later.</p>`;
}

/* BILLY, the GOAT. One drawing, many moods: the classes on the wrapper decide which eyes and mouth show. */
const BILLY_DEFS='<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>'+
 '<linearGradient id="bhorn" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFDC5C"/><stop offset=".55" stop-color="#FEC40B"/><stop offset="1" stop-color="#D99500"/></linearGradient>'+
 '<linearGradient id="bface" x1=".2" y1="0" x2=".8" y2="1"><stop offset="0" stop-color="#FFF8EA"/><stop offset=".5" stop-color="#FDEFD6"/><stop offset="1" stop-color="#EFD3A4"/></linearGradient>'+
 '<linearGradient id="bmuz" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F5DDB5"/><stop offset="1" stop-color="#E3BF89"/></linearGradient>'+
 '<linearGradient id="bbeard" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF6E6"/><stop offset="1" stop-color="#E6C796"/></linearGradient>'+
 '<clipPath id="bhead"><path d="M128 76C162 76 176 100 172 130C168 162 152 200 128 208C104 200 88 162 84 130C80 100 94 76 128 76Z"/></clipPath>'+
 '</defs></svg>';
function billy(cls,label){
  return `<span class="billy ${cls||''}" ${label?`role="img" aria-label="${label}"`:'aria-hidden="true"'}><svg viewBox="40 26 176 216">
  <g class="b-horns"><path d="M108 86C98 50 74 36 56 50C48 57 50 68 58 70M148 86C158 50 182 36 200 50C208 57 206 68 198 70" fill="none" stroke="#B47A00" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>
   <path d="M106 84C96 50 74 38 57 50C50 56 51 65 57 67M150 84C160 50 182 38 199 50C206 56 205 65 199 67" fill="none" stroke="url(#bhorn)" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
   <path d="M94 62l9-4M84 50l6-7M70 44l1-8M168 58l-9-4M174 48l-6-7M188 44l-1-8" stroke="#C88A00" stroke-width="3.5" stroke-linecap="round"/></g>
  <g class="b-earL"><ellipse cx="72" cy="128" rx="31" ry="13" transform="rotate(24 72 128)" fill="#E6C694"/><ellipse cx="72" cy="125" rx="30" ry="12" transform="rotate(24 72 125)" fill="#FDEFD6"/><ellipse cx="76" cy="127" rx="19" ry="5.5" transform="rotate(24 76 127)" fill="#E2B386"/></g>
  <g class="b-earR"><ellipse cx="184" cy="128" rx="31" ry="13" transform="rotate(-24 184 128)" fill="#E0BD88"/><ellipse cx="184" cy="125" rx="30" ry="12" transform="rotate(-24 184 125)" fill="#F4E0BD"/><ellipse cx="180" cy="127" rx="19" ry="5.5" transform="rotate(-24 180 127)" fill="#D9A777"/></g>
  <g class="b-jaw"><path d="M106 192Q112 226 128 240Q144 226 150 192Z" fill="url(#bbeard)"/><path d="M128 206Q130 222 128 232M118 204Q120 218 124 228M138 204Q137 218 133 228" fill="none" stroke="#D9B47E" stroke-width="2.5" stroke-linecap="round"/></g>
  <path d="M128 76C162 76 176 100 172 130C168 162 152 200 128 208C104 200 88 162 84 130C80 100 94 76 128 76Z" fill="url(#bface)"/>
  <g clip-path="url(#bhead)"><path d="M150 70C186 96 182 170 128 214L200 214L200 70Z" fill="#E7C796" opacity=".55"/><ellipse cx="110" cy="96" rx="22" ry="12" transform="rotate(-18 110 96)" fill="#FFFBF3" opacity=".9"/></g>
  <path d="M112 84Q118 66 128 76Q134 62 144 82Q134 78 128 86Q120 78 112 84Z" fill="#FFF6E4"/>
  <g class="b-brows"><path d="M92 116L118 122M164 115L139 122" stroke="#5C0D1F" stroke-width="6.5" stroke-linecap="round"/></g>
  <g class="b-sadbrows"><path d="M94 124L118 116M162 124L138 116" stroke="#5C0D1F" stroke-width="6.5" stroke-linecap="round"/></g>
  <g class="b-eyeL"><ellipse cx="106" cy="139" rx="14" ry="14" fill="#EBCF9F"/><circle cx="106" cy="138" r="11.5" fill="#3A0A14"/><circle cx="106" cy="141" r="6" fill="#5C0D1F"/><circle cx="110" cy="133.5" r="4" fill="#FFFBF3"/></g>
  <g class="b-eyeR"><ellipse cx="151" cy="139" rx="14" ry="14" fill="#E3C391"/><circle cx="151" cy="138" r="11.5" fill="#3A0A14"/><circle cx="151" cy="141" r="6" fill="#5C0D1F"/><circle cx="155" cy="133.5" r="4" fill="#FFFBF3"/></g>
  <g class="b-wink"><path d="M139 140Q151 129 163 140" fill="none" stroke="#3A0A14" stroke-width="7" stroke-linecap="round"/><path d="M163 140l5 3" stroke="#3A0A14" stroke-width="4" stroke-linecap="round"/></g>
  <g class="b-sadeyes"><path d="M96 142Q106 136 116 142M141 142Q151 136 161 142" fill="none" stroke="#3A0A14" stroke-width="6" stroke-linecap="round"/></g>
  <ellipse cx="98" cy="164" rx="10" ry="6" fill="#D4566F" opacity=".22"/><ellipse cx="158" cy="164" rx="10" ry="6" fill="#D4566F" opacity=".22"/>
  <g class="b-muz"><ellipse cx="128" cy="187" rx="25" ry="19" fill="url(#bmuz)"/><ellipse cx="122" cy="179" rx="10" ry="5" fill="#FBEBCF" opacity=".9"/>
   <path d="M119 180Q128 187 137 180" fill="none" stroke="#3A0A14" stroke-width="6" stroke-linecap="round"/>
   <path class="b-smile" d="M117 195Q128 202 141 192" fill="none" stroke="#731328" stroke-width="4.5" stroke-linecap="round"/>
   <path class="b-frown" d="M117 199Q128 191 139 199" fill="none" stroke="#731328" stroke-width="4.5" stroke-linecap="round"/></g>
  </svg></span>`;
}
document.body.insertAdjacentHTML('afterbegin',BILLY_DEFS);
const calm=()=>{try{return matchMedia('(prefers-reduced-motion:reduce)').matches}catch(e){return false}};
/* launch: pops in, winks, then gets out of the way. Once per app session. */
function billyHello(){
  let seen=false; try{ seen=sessionStorage.getItem('billy-hi')==='1'; sessionStorage.setItem('billy-hi','1'); }catch(e){}
  if(seen) return;
  const el=document.createElement('div'); el.id='billy-hi'; el.setAttribute('aria-hidden','true');
  el.innerHTML=billy('hello')+'<b>Billy\'s picks</b>';
  document.body.appendChild(el);
  setTimeout(()=>el.classList.add('out'),calm()?700:1500);
  setTimeout(()=>el.remove(),calm()?900:1900);
  el.addEventListener('click',()=>el.remove());
}
/* a bet just settled: Billy jumps for a win, droops for a loss */
function billyReact(status,pl){
  if(status!=='won'&&status!=='lost') return;
  const old=document.getElementById('billy-react'); if(old) old.remove();
  const el=document.createElement('div'); el.id='billy-react'; el.className=status; el.setAttribute('role','status');
  const conf=status==='won'&&!calm()?Array.from({length:18},(_,i)=>`<i style="--x:${(i*37%100)}%;--d:${(i%6)*.07}s;--r:${(i*53)%360}deg;--c:${['#FEC40B','#731328','#FDEFD6'][i%3]}"></i>`).join(''):'';
  el.innerHTML=`<div class="conf">${conf}</div><div class="br-card">${billy(status==='won'?'jump':'sad')}<span><b>${status==='won'?'Green!':'Red one.'}</b>${status==='won'?signed(pl)+' in the bag':'Billy\'s on the next pick'}</span></div>`;
  document.body.appendChild(el);
  const go=()=>{ el.classList.add('out'); setTimeout(()=>el.remove(),300); };
  el.addEventListener('click',go); setTimeout(go,2400);
}

const ICON={lock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V7.5a4 4 0 0 1 8 0V11"/></svg>',
  home:'<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11l8-7 8 7"/><path d="M6 10v9h12v-9"/></svg>',
  players:'<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.8-3.6 3.5-5.5 7-5.5s6.200 1.900 7 5.500"/></svg>',
  bets:'<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z"/><path d="M14.5 9.500v5"/></svg>',
  results:'<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8 12.500l2.800 2.800L16 9.500"/></svg>',
  back:'<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
  addbet:'<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></svg>',
  cal:'<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',
  down:'<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10l5 5 5-5"/></svg>',
  share:'<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5v11M8 7.2l4-3.7 4 3.7"/><path d="M8.5 10.5H7a2 2 0 0 0-2 2V19a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6.5a2 2 0 0 0-2-2h-1.5"/></svg>',
  account:'<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="10" r="3.2"/><path d="M6.400 18.400c1.300-2.200 3.300-3.300 5.600-3.300s4.300 1.100 5.600 3.300"/></svg>',
  sports:'<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7.500l4 2.900-1.500 4.700h-5L8 10.400z"/><path d="M12 7.500V3.200M16 10.400l4.100-1.300M14.500 15.100l2.600 3.600M9.500 15.100l-2.600 3.600M8 10.400 3.900 9.100"/></svg>',
  ball:'<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7.500l4 2.900-1.500 4.700h-5L8 10.400z"/><path d="M12 7.500V3.200M16 10.400l4.100-1.300M14.500 15.100l2.600 3.600M9.500 15.100l-2.600 3.600M8 10.400 3.900 9.100"/></svg>',
  hoop:'<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3v18M5.600 5.600c2.400 2 2.400 10.800 0 12.800M18.400 5.600c-2.400 2-2.400 10.800 0 12.800"/></svg>',
  info:'<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5.500M12 7.600v.1"/></svg>'
};
/* filled versions, shown on the selected tab */
const ICONF={
  home:'<svg class="ic f" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2 3.3 10.8a1 1 0 0 0 .7 1.7H5V19a1.5 1.5 0 0 0 1.5 1.5h3.5v-5h4v5h3.5A1.5 1.5 0 0 0 19 19v-6.5h1a1 1 0 0 0 .7-1.7z"/></svg>',
  players:'<svg class="ic f" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="7.8" r="4.2"/><path d="M3.8 20.2c.6-4.400 3.900-6.900 8.200-6.900s7.600 2.500 8.200 6.900a.9.9 0 0 1-.9 1H4.700a.9.9 0 0 1-.9-1z"/></svg>',
  bets:'<svg class="ic f" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M6 5h12a3 3 0 0 1 3 3v2.200a.8.8 0 0 1-.6.8 1.900 1.900 0 0 0 0 2 .8.8 0 0 1 .6.8V16a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-2.200a.8.8 0 0 1 .6-.8 1.900 1.900 0 0 0 0-2 .8.8 0 0 1-.6-.8V8a3 3 0 0 1 3-3zm7.700 4.200v5.600h1.600V9.200z"/></svg>',
  sports:'<svg class="ic f" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M12 2.500a9.500 9.500 0 1 1 0 19 9.500 9.500 0 0 1 0-19zm0 5.200-3.600 2.600 1.400 4.300h4.400l1.400-4.300z"/></svg>',
  account:'<svg class="ic f" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M12 2.500a9.500 9.500 0 1 1 0 19 9.500 9.500 0 0 1 0-19zm0 4.200a3.300 3.300 0 1 0 0 6.600 3.300 3.300 0 0 0 0-6.600zm0 8.100c-2.500 0-4.600 1.100-5.900 3.100a7.900 7.900 0 0 0 11.800 0c-1.300-2-3.400-3.100-5.900-3.100z"/></svg>',
  results:'<svg class="ic f" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M12 2.500a9.500 9.500 0 1 1 0 19 9.500 9.500 0 0 1 0-19zm4.600 6.300a1 1 0 0 0-1.400.1l-4.300 5-2.100-2.100a1 1 0 0 0-1.400 1.400l2.900 2.900a1 1 0 0 0 1.500-.1l5-5.800a1 1 0 0 0-.2-1.400z"/></svg>'
};
const TABS=[['home','Home'],['sports','Sports'],['bets','Bets'],['results','Results'],['account','Account']];
let nav=DB.get('nav',null);
if(!nav||!TABS.some(t=>t[0]===nav.tab)) nav={tab:'home',stack:[]}; nav.stack=[];
let topPos='', pq='', resGame=null, sheet=null;
const cur=()=>nav.stack[nav.stack.length-1]||null;
const onHome=()=>nav.tab==='home'&&!cur();
const isLatest=()=>DAY===SPORT.slates.length-1;
const slateDay=()=>slateName(SLATE);
function pageTitle(){
  const c=cur(); if(c){ if(c.v==='game'){const g=SLATE.games.find(x=>x.id===c.id);return matchTitle(g)} return c.v==='list'?SPORT.tab2:c.v==='res'?SPORT.league+' results':SPORT.league; }
  return {home:hf==='all'?'Predictions':SPORT.league,sports:'Sports',bets:'Bets',results:'Results',account:'Account'}[nav.tab];
}
function head(eyebrow,title,sub){
  return `<header class="lt-wrap"><span class="eyebrow">${eyebrow}</span><h1 class="lt" id="lt">${esc(title)}</h1>${sub?`<span class="sub">${sub}</span>`:''}</header>`;
}
const tile=(t,size)=>`<span class="abbr ${size||''}" style="${tstyle(t)}">${t}</span>`;
const dot=t=>`<i class="dot" style="${tstyle(t)}"></i>`;
function sportPicker(){
  if(SPORT_ORDER.length<2) return '';
  return `<div class="seg" role="group" aria-label="Sport">${SPORT_ORDER.map(id=>`<button data-do="sport" data-s="${id}" aria-pressed="${id===SPORT.id}">${SPORTS[id].league}</button>`).join('')}</div>`;
}
function dayPicker(){
  const n=SPORT.slates.length; if(n<2) return '';
  const first=Math.max(0,n-3), older=DAY<first;
  const chips=SPORT.slates.map((s,i)=>[s,i]).slice(first).reverse().map(([s,i])=>
    `<button class="chip" data-do="day" data-i="${i}" aria-pressed="${i===DAY}">${i===n-1?'Latest · ':''}${slateName(s)}</button>`).join('');
  return `<div class="chips" role="group" aria-label="Day"><button class="chip cal" data-do="cal" aria-label="${older?'Day: '+slateDay()+'. Pick another day':'Pick a day from the calendar'}" aria-pressed="${older}">${ICON.cal}${older?`<span>${slateDay()}</span>`:''}</button>${chips}</div>`;
}
/* local yyyy-mm-dd of a slate, the same day its label shows */
const localKey=utc=>{const d=new Date(utc);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
function calBody(){
  const map={}; SPORT.slates.forEach((s,i)=>map[localKey(s.games[0].utc)]=i);
  const keys=Object.keys(map).sort(), y=sheet.y, m=sheet.m;
  const first=new Date(y,m,1), lead=(first.getDay()+6)%7, days=new Date(y,m+1,0).getDate();
  const minM=keys[0].slice(0,7), maxM=keys[keys.length-1].slice(0,7), ym=y+'-'+String(m+1).padStart(2,'0');
  const today=localKey(Date.now());
  let cells=''; for(let k=0;k<lead;k++) cells+='<span></span>';
  for(let d=1;d<=days;d++){
    const key=ym+'-'+String(d).padStart(2,'0'), i=map[key];
    if(i==null) cells+=`<span class="cd off${key===today?' today':''}">${d}</span>`;
    else { const g=SPORT.slates[i].games.length;
      cells+=`<button class="cd${i===DAY?' on':''}${key===today?' today':''}" data-do="calday" data-i="${i}" aria-pressed="${i===DAY}" aria-label="${day(SPORT.slates[i].games[0].utc)}, ${g} games"><span>${d}</span><i></i></button>`; }
  }
  const mName=first.toLocaleDateString('en-GB',{month:'long',year:'numeric'});
  return `<div class="card calc"><div class="cal-h"><button class="glassbtn sm" data-do="calm" data-d="-1" aria-label="Previous month" ${ym<=minM?'disabled':''}>${ICON.back}</button><b>${mName}</b><button class="glassbtn sm fwd" data-do="calm" data-d="1" aria-label="Next month" ${ym>=maxM?'disabled':''}>${ICON.back}</button></div>
  <div class="cal-w" aria-hidden="true">${['M','T','W','T','F','S','S'].map(x=>`<span>${x}</span>`).join('')}</div><div class="cal-g">${cells}</div></div>
  <p class="note">Days with a dot have games saved. ${SPORT.slates.length} days so far.</p>`;
}
function gamesBody(){
  const c=cur();
  return SPORT.slates.map((s,i)=>[s,i]).reverse().map(([s,i])=>
    `<div class="sec">${i===SPORT.slates.length-1?'Latest · ':''}${slateName(s)}</div><div class="card">${s.games.map(g=>{
      const on=i===DAY&&c&&c.id===g.id;
      return `<button class="row gp${on?' on':''}" data-do="gogame" data-i="${i}" data-id="${g.id}" ${on?'aria-current="true"':''}>
        <span class="gp-t">${SPORT.kind==='match'?`${tile(g.home,'sm')}<span class="at">v</span>${tile(g.away,'sm')}`:`${tile(g.away,'sm')}<span class="at">at</span>${tile(g.home,'sm')}`}</span>
        <span class="gp-r num">${g.final?(SPORT.kind==='match'?`${g.final.home}–${g.final.away}`:`${g.final.away}–${g.final.home}`):(SPORT.kind==='match'?day(g.utc).split(' ')[0]+' ':'')+clock(g.utc)}</span>${on?'<span class="gp-ck" aria-hidden="true"></span>':''}</button>`}).join('')}</div>`).join('');
}
/* bets summary: P/L, won vs lost, open bets and stakes, % of greens */
function sumHTML(asButton){
  const s=betStats(bets), c=s.pl>0.004?'pos':s.pl<-0.004?'neg':'';
  const T=(k,v,sub,cls)=>`<span class="tile"><span class="tk">${k}</span><b class="tv num ${cls||''}">${v}</b><span class="ts num">${sub}</span></span>`;
  const inner=T('Profit / loss',signed(s.pl),s.roi==null?'No settled bets yet':`ROI ${s.roi>0?'+':s.roi<0?'−':''}${Math.abs(s.roi).toFixed(0)}%`,c)+
    T('Won – lost',`${s.won} – ${s.lost}`,s.void?`${s.void} void`:'Settled bets')+
    T('Open bets',s.open,`${money(s.openStake)} at stake`)+
    T('Greens',s.green==null?'–':s.green.toFixed(0)+'%','Won out of settled');
  return asButton?`<button class="card sum" data-do="gotab" data-tab="bets" aria-label="My bets summary, open bets">${inner}</button>`:`<div class="card sum">${inner}</div>`;
}
/* home */
function gameCard(g){
  const o=gameOdds(g), f=g.final;
  const side=(t,k)=>{ const top=roster(t).on[0], lost=f&&f[k]<f[k==='away'?'home':'away'];
    return `<div class="side">${tile(t)}<span class="nm">${SLATE.teams[t].name}<span class="topp">${top?esc(sn(top.name))+' · '+f1(top.result):'No players'}</span></span>
      ${f?`<b class="fin num ${lost?'dim':''}">${f[k]}</b>`:''}<span class="odd num" aria-label="Moneyline">${oddTxt(o,k)}</span></div>`; };
  return `<button class="card game" data-sport="${SPORT.id}" data-day="${DAY}" data-do="open" data-id="${g.id}" aria-label="${g.away} at ${g.home}, open game">
    <div class="ghead"><span>${f?'Final':clock(g.utc)}</span><span class="gh-r">Moneyline<i class="chev"></i></span></div>${side(g.away,'away')}${side(g.home,'home')}</button>`;
}
function viewHome(){
  const top=leaders().slice(0,6);
  return head(`${SPORT.league} · ${SLATE.games.length} games`,slateDay(),isLatest()?'Latest slate · times in your time zone':'Past slate')+(onHome()?homeChips():'')+dayPicker()+
  (onHome()?`<div class="sec">My bets</div>`+sumHTML(true):'')+
  `<div class="sec row-sec"><span>Top projections</span><button class="link" data-do="list">All players</button></div>
  <div class="hs">${top.map(p=>`<button class="pc" style="${tstyle(p.t)}" data-sport="${SPORT.id}" data-day="${DAY}" data-do="player" data-t="${p.t}" data-i="${p.i}" aria-label="${esc(p.name)}, ${f1(p.result)} ${SPORT.stat}">${p===top[0]?billy('peek'):''}${tile(p.t,'sm')}<b>${esc(sn(p.name))}</b><span class="pcv num">${f1(p.result)}</span><span class="pcs">vs ${p.opp}</span></button>`).join('')}</div>
  <div class="sec">Games</div>`+SLATE.games.map(gameCard).join('')+
  `<p class="note">Each team shows its top projected scorer. Tap a game for every player and to set the odds.</p>`;
}
/* players */
function gapPill(p){ const a=actualOf(p); if(a==null||!p.playing) return ''; const g=a-p.result; return `<span class="pill ${verdict(g)}" title="Scored ${a}, projected ${f1(p.result)}">${sgn(g)}</span>`; }
function rowHTML(p,rank,withTeam){
  const pill=!p.playing?`<span class="pill o">${p.status==='D'?'Doubtful':'Out'}</span>`:p.status==='Q'?'<span class="pill q">Questionable</span>':'';
  const ed=p.id in edits.min?'<span class="pill e">Edited</span>':'', bt=betsFor(p).length?'<span class="pill e">Bet</span>':'', a=actualOf(p);
  const sub=withTeam?`vs ${p.opp} · ${p.pos}${p.starter?' · Starter':''}`:`${p.pos} · ${f1(p.minutes)} min${p.starter?' · Starter':''}`;
  return `<div class="row prow ${p.playing?'':'off'}"><button class="rmain" data-do="player" data-t="${p.t}" data-i="${p.i}">
    ${withTeam?tile(p.t,'sm'):`<span class="rk num">${rank||''}</span>`}<span class="who"><b>${esc(sn(p.name))}${pill}${ed}${bt}${gapPill(p)}</b><span class="num">${sub}</span></span>
    <span class="proj num">${p.playing?f1(p.result):'–'}${a!=null?`<small>scored ${a}</small>`:''}</span></button>${
    p.playing?`<button class="rbet" data-do="quickbet" data-t="${p.t}" data-i="${p.i}" aria-label="Add a bet on ${esc(p.name)}">${ICON.addbet}</button>`:'<span class="rbet"></span>'}</div>`;
}
function playerList(){
  const q=pq.trim().toLowerCase(), all=leaders(topPos).filter(p=>!q||p.name.toLowerCase().includes(q)||sn(p.name).toLowerCase().includes(q)||p.t.toLowerCase().includes(q)), list=q?all:all.slice(0,40);
  return list.map((p,k)=>rowHTML(p,k+1,true)).join('')||'<div class="row plain"><span class="k">No player matches.</span></div>';
}
function viewPlayers(){
  return head(`${SPORT.league} · ${slateDay()}`,'Players','Ranked by projected '+SPORT.stat)+dayPicker()+
  `<input class="search" id="psearch" type="search" inputmode="search" autocomplete="off" placeholder="Search a player or team" aria-label="Search a player or team" value="${esc(pq)}">
  <div class="seg" role="group" aria-label="Position">${[['','All'],...Object.entries(SPORT.groups).map(([k,g])=>[k,g.label])].map(([k,l])=>`<button data-do="pos" data-p="${k}" aria-pressed="${k===topPos}">${l}</button>`).join('')}</div>
  <div class="card" id="plist">${playerList()}</div>
  <p class="note">Shows the top 40. Search to find anyone else.</p>`;
}
/* game */
function impliedText(g){
  const o=gameOdds(g), im=implied(o), a=SLATE.teams[g.away].name, h=SLATE.teams[g.home].name;
  const part=(n,v)=>v==null?'':`${n} ${v.toFixed(0)}%`, t=[part(a,im.away),part(h,im.home)].filter(Boolean).join(' · ');
  return (t?`Implied chance: ${t}. `:'No odds yet. ')+(o.src?`Loaded from ${o.src}. `:'')+(o.est.away||o.est.home?'The grey price is an estimate from the other team\'s odds. ':'')+'Type your own decimal odds to change them.';
}
function viewGame(c){
  const g=SLATE.games.find(x=>x.id===c.id), r=roster(c.team), o=gameOdds(g), f=g.final;
  const tm=(t,k)=>`<span class="tm">${tile(t,'lg')}<b>${SLATE.teams[t].name}</b>${f?`<span class="sc num">${f[k]}</span>`:''}</span>`;
  const F=(t,k)=>`<label class="fld" for="od-${k}"><span>${dot(t)}${SLATE.teams[t].name}</span><input id="od-${k}" data-in="odds" data-g="${g.id}" data-side="${k}" inputmode="decimal" autocomplete="off" placeholder="${o.est[k]?'~'+o[k].toFixed(2):'–'}" value="${o[k]&&!o.est[k]?o[k].toFixed(2):''}"></label>`;
  return head(`${SPORT.league} · ${day(g.utc)} · ${f?'Final':clock(g.utc)}`,g.away+' at '+g.home,'')+
  `<div class="card mu">${tm(g.away,'away')}<span class="at">at</span>${tm(g.home,'home')}</div>
  <div class="sec">Moneyline (decimal)</div><div class="card">${F(g.away,'away')}${F(g.home,'home')}</div><p class="note" id="imp">${impliedText(g)}</p>
  <div class="seg" role="group" aria-label="Team">${[g.away,g.home].map(x=>`<button data-do="team" data-t="${x}" aria-pressed="${x===c.team}">${dot(x)}${SLATE.teams[x].name}</button>`).join('')}</div>
  <div class="sec">${dot(c.team)}Projected ${SPORT.stat}</div>
  <div class="card">${r.on.map((p,k)=>rowHTML(p,k+1)).join('')||'<div class="row plain">No players</div>'}</div>
  ${r.off.length?`<div class="sec">Not playing</div><div class="card">${r.off.map(p=>rowHTML(p)).join('')}</div>`:''}
  <p class="note">Tap a player for the steps, his real score, or to add a bet.</p>`;
}
/* bets */
const BSTAT={open:['op','Open'],won:['w','Won'],lost:['l','Lost'],void:['v','Void']};
function betLine(b){ return `${b.side==='under'?'Under':'Over'}${b.line!=null?' '+b.line:''} ${b.stat}`; }
/* what the player really scored in the game this bet is on: typed in Results, or loaded from the box score */
function betActual(b){
  const s=(SPORTS[b.sport]||SPORT).slates.find(x=>x.date===b.date); if(!s) return null;
  if(isScore(b)) return null;
  if((SPORTS[b.sport]||{}).kind==='match'){ const g=s.games.find(x=>x.id===b.gid), src=g&&(b.stat==='corners'?g.corners:g.final); if(!src) return null;
    return b.market==='total'?src.home+src.away:src[b.team===g.home?'home':'away']; }
  const id=b.sport+':'+b.date+':'+b.team+':'+b.player;
  if(id in acts) return acts[id];
  return s.actual&&s.actual[b.team]&&b.player in s.actual[b.team]?s.actual[b.team][b.player]:null;
}
function betViz(b,a){
  if(isScore(b)){ const f=scoreFinal(b), win=f?(f.home===b.sh&&f.away===b.sa):null, cls=win==null?'':win?'pos':'neg', K=(k,v,c)=>`<span class="bk ${c||''}">${k}<b class="num">${v}</b></span>`;
    return `<span class="bviz"><span class="bv-keys">${K('Pick',b.sh+'–'+b.sa)}${b.proj!=null?K('Chance',Math.round(b.proj*1000)/10+'%','kp'):''}${K('Final',f?f.home+'–'+f.away:'–','ks '+cls)}</span></span>`; }
  const L=b.line, P=b.proj, vals=[L,P,a].filter(v=>v!=null);
  if(L==null) return '';
  const lo=Math.max(0,Math.floor(Math.min(...vals)-4)), hi=Math.ceil(Math.max(...vals)+4), x=v=>((v-lo)/(hi-lo)*100).toFixed(1)+'%';
  const win=a==null?null:a===L?null:(a>L)===(b.side!=='under');
  const cls=win==null?'':win?'pos':'neg';
  const seg=a==null?'':`<span class="bv-seg ${cls}" style="left:${x(Math.min(a,L))};width:calc(${x(Math.max(a,L))} - ${x(Math.min(a,L))})"></span>`;
  const K=(k,v,c)=>`<span class="bk ${c||''}"><i></i>${k}<b class="num">${v}</b></span>`;
  return `<span class="bviz">
    <span class="bv-keys">${K('Line',L,'kl')}${P!=null?K('Proj',f1(P),'kp'):''}${K(b.stat==='corners'?'Count':'Scored',a!=null?a:'–','ks '+cls)}</span>
    <span class="bv-track" aria-hidden="true">${seg}<span class="bv-line" style="left:${x(L)}"></span>${P!=null?`<span class="bv-proj" style="left:${x(P)}"></span>`:''}${a!=null?`<span class="bv-act ${cls}" style="left:${x(a)}"></span>`:''}</span>
    ${a!=null?`<span class="bv-cap ${cls}">${a===L?'Exactly on the line':(Math.abs(a-L)%1?Math.abs(a-L).toFixed(1):Math.abs(a-L))+(a>L?' over':' under')+' the line'}</span>`:''}
  </span>`;
}
function betRow(b){
  const pl=betPL(b), st=BSTAT[b.status], ret=b.stake*b.odds, a=betActual(b);
  return `<div class="betw"><button class="bet" data-do="bet" data-id="${b.id}">
    <span class="bt-top"><b>${esc(sn(b.player))}</b><span class="pill ${st[0]}">${st[1]}</span></span>
    <span class="bt-mid">${tile(b.team,'sm',b.sport)}<span>${isScore(b)?`Correct score ${b.sh}–${b.sa}`:`${b.market==='total'?'Match':'vs '+b.opp} · ${b.side==='under'?'Under':'Over'} ${b.line!=null?b.line+' ':''}${b.stat}`}</span></span>
    ${betViz(b,a)}
    <span class="bt-row num"><span>${money(b.stake)} at ${b.odds.toFixed(2)}</span>
      <span class="${b.status==='open'?'':pl>0?'pos':pl<0?'neg':''}">${b.status==='open'?'Returns '+money(ret):signed(pl)}</span></span></button><button class="bshare" data-do="sharebet" data-id="${b.id}" aria-label="Share ${esc(b.player)} bet">${ICON.share}</button></div>`;
}
/* totals for a group of bets: stake, what it pays back if every bet wins, and the profit in that case */
function totalsHTML(list,showPL){
  const st=list.reduce((s,b)=>s+b.stake,0), ret=list.reduce((s,b)=>s+b.stake*b.odds,0), s=betStats(list);
  const C=(k,v,cls)=>`<span><span class="tk">${k}</span><b class="num ${cls||''}">${v}</b></span>`;
  // all settled: just stake and P/L; anything still open: stake, return and profit if every open bet wins
  return s.open===0&&showPL?`<div class="tot">${C('Staked',money(st))}${C('P/L',signed(s.pl),s.pl>0.004?'pos':s.pl<-0.004?'neg':'')}</div>`
    :`<div class="tot">${C('Staked',money(st))}${C('Return',money(ret))}${C('Profit',money(ret-st))}</div>`;
}
const secShare=(l,k)=>`<button class="secbtn" data-do="shareday" data-k="${k}" data-ids="${l.map(b=>b.id).join(',')}" aria-label="Share these ${l.length} bets">${ICON.share}<span>Share</span></button>`;
function viewBets(){
  const open=bets.filter(b=>b.status==='open').sort((a,b)=>b.ts-a.ts), done=bets.filter(b=>b.status!=='open');
  const days=[...new Set(done.map(b=>b.date))].sort().reverse();
  return head('All sports','Bets',bets.length?`${bets.length} bet${bets.length===1?'':'s'} tracked`:'Nothing tracked yet')+sumHTML(false)+
  (bets.length?'':`<div class="empty">${billy('chew','Billy the goat')}<b>No bets yet</b><span>Tap the plus next to any player to track a bet. Billy keeps the score.</span></div>`)+
  [...new Set(open.map(b=>b.date))].sort().reverse().map(d=>{const l=open.filter(b=>b.date===d).sort((a,b)=>(a.when||'').localeCompare(b.when||''));
    return `<div class="sec">${secShare(l,'open')}Open · ${day(l[0].when)} · ${l.length}</div><div class="card glist">${totalsHTML(l,false)}${l.map(betRow).join('')}</div>`}).join('')+
  days.map(d=>{const l=done.filter(b=>b.date===d);
    return `<div class="sec">${secShare(l,'done')}${day(l[0].when)} · ${l.length} settled</div><div class="card glist">${totalsHTML(l,true)}${l.sort((a,b)=>b.ts-a.ts).map(betRow).join('')}</div>`}).join('')+
  `<p class="note">Bets are saved on this iPhone only. Amounts are in euros and odds are decimal. For open bets, Return is stake × odds if they win and Profit is that minus the stake.</p>`;
}
/* results: projection vs what he scored */
function accHTML(){
  const a=accuracy(slateTeams().flatMap(t=>roster(t).on));
  const T=(k,v,sub)=>`<span class="tile"><span class="tk">${k}</span><b class="tv num">${v}</b><span class="ts num">${sub}</span></span>`;
  return T('Players checked',a.n,a.n?'With a real score':'None entered yet')+T('Average gap',a.n?a.avg.toFixed(1):'–',SPORT.stat+' off, on average')+
    T('Beat projection',a.n?a.beat.toFixed(0)+'%':'–','Scored the same or more')+T('Biggest miss',a.n?sgn(a.worst.gap):'–',a.n?esc(sn(a.worst.p.name)):'–');
}
let resOpen={};
function resRow(p){
  const a=actualOf(p), dnp=!p.playing;
  return `<div class="rrow ${dnp?'off':''}"><span class="who"><b>${esc(sn(p.name))}</b><span class="num">Projected ${dnp?'–':f1(p.result)} <span class="gapc" data-gap="${p.t}-${p.i}">${dnp?'<span class="pill v">Did not play</span>':a==null?'<span class="pill v">No points yet</span>':gapPill(p)}</span></span></span>
    ${dnp?'':`<input data-in="act" data-t="${p.t}" data-i="${p.i}" inputmode="numeric" autocomplete="off" placeholder="–" aria-label="${esc(p.name)} real ${SPORT.stat}" value="${a==null?'':a}">`}</div>`;
}
function resTeam(g,t,k){
  const all=SLATE.teams[t].players.map((_,i)=>player(t,i)), sc=all.filter(p=>p.playing&&actualOf(p)!=null).sort((x,y)=>actualOf(y)-actualOf(x));
  const none=all.filter(p=>p.playing&&actualOf(p)==null).sort((x,y)=>y.result-x.result), dnp=all.filter(p=>!p.playing);
  const key=g.id+':'+t, open=key in resOpen?resOpen[key]:k===0, f=g.final;
  return `<details class="card tblock" data-key="${key}" ${open?'open':''}><summary>${tile(t)}<span class="nm">${SLATE.teams[t].name}<span class="topp">${sc.length} of ${sc.length+none.length} with points</span></span>${f?`<b class="fin num">${f[k?'home':'away']}</b>`:''}<i class="chev"></i></summary>
    ${[...sc,...none,...dnp].map(resRow).join('')}</details>`;
}
function viewResults(){
  if(!resGame||!SLATE.games.some(g=>g.id===resGame)) resGame=SLATE.games[0].id;
  const g=SLATE.games.find(x=>x.id===resGame);
  return head(`${SPORT.league} · ${slateDay()}`,'Results','Projection against what he really scored')+dayPicker()+
  `<div class="card sum" id="acc">${accHTML()}</div>
  <div class="sec">Real ${SPORT.stat} by game</div>
  <div class="chips" role="group" aria-label="Game">${SLATE.games.map(x=>`<button class="chip alt" data-do="resgame" data-id="${x.id}" aria-pressed="${x.id===resGame}">${x.away} at ${x.home}</button>`).join('')}</div>
  ${resTeam(g,g.away,0)}${resTeam(g,g.home,1)}
  <p class="note legend"><span class="pill w">+</span> scored the projection or more <span class="pill y">−3</span> up to ${CLOSE} under <span class="pill or">−6</span> up to ${NEAR} under <span class="pill l">−7</span> more than ${NEAR} under. Players are sorted by points scored.</p>`;
}
/* sheets */
function stepsHTML(p){
  const rows=p?SPORT.explain(p):SPORT.steps.map(t=>({t}));
  return rows.map((r,k)=>`<div class="step"><span class="n">${k+1}</span><span class="t">${r.t}${r.sub?`<small>${r.sub}</small>`:''}</span>${
    r.stepper!=null?`<span class="stepper"><button data-do="min" data-d="-1" aria-label="One minute less">−</button><b class="num">${r.stepper}</b><button data-do="min" data-d="1" aria-label="One minute more">+</button></span>`
    :r.v!=null?`<span class="v num">${r.v}</span>`:''}</div>`).join('');
}
function playerBody(p){
  const mine=betsFor(p), a=actualOf(p);
  return `<div class="card result"><span>${tile(p.t,'sm')} vs ${p.opp}<br>Projected ${SPORT.stat}</span><b class="num">${p.playing?f1(p.result):'–'}</b></div>
  ${has('pro')?`<div class="card steps">${stepsHTML(p)}</div>`:lockCard('pro','How this is worked out')}
  <div class="card"><div class="fld"><span>Playing tonight</span><button class="sw" role="switch" aria-checked="${p.playing}" aria-label="Playing tonight" data-do="play"></button></div>
    <label class="fld" for="sh-act"><span>Real ${SPORT.stat} scored <span class="gapc" data-gap="${p.t}-${p.i}">${gapPill(p)}</span></span><input id="sh-act" data-in="act" data-t="${p.t}" data-i="${p.i}" inputmode="numeric" autocomplete="off" placeholder="After the game" value="${a==null?'':a}"></label></div>
  <div class="card glist">${mine.map(betRow).join('')}<button class="row nork plain" data-do="addbet"><span class="k tintc">Add a bet</span></button></div>
  ${p.edited?'<button class="btn2" data-do="reset">Reset his minutes and status</button>':''}`;
}
function betHint(d){
  if(isScore(d)){ const f=scoreFinal(d); return (f?`<p class="note">Final score ${f.home}–${f.away}, so this bet ${f.home===d.sh&&f.away===d.sa?'won':'lost'}.</p>`:''); }
  const a=d.line!==''&&num(d.line)!=null?betActual({...d,line:num(d.line)}):null; let res='';
  if(a!=null){ const L=num(d.line), over=d.side!=='under', what=d.stat==='points'?'He scored':'Final count:';
    res=`<p class="note">${what} ${a}, ${a===L?'the same as the line, which is usually void':((a>L)===over?'so this bet won':'so this bet lost')}.</p>`; }
  return res;
}
function betBody(){
  const d=sheet.draft, S=(k,opts,val)=>`<div class="seg" role="group">${opts.map(([v,l])=>`<button data-do="${k}" data-v="${v}" aria-pressed="${v===val}">${l}</button>`).join('')}</div>`;
  const F=(id,label,ph)=>`<label class="fld" for="bf-${id}"><span>${label}</span><input id="bf-${id}" inputmode="decimal" autocomplete="off" placeholder="${ph}" value="${esc(d[id])}"></label>`;
  const FS=(id,label,ph,what)=>`<div class="fld"><label for="bf-${id}">${label}</label><span class="stepper"><button data-do="bstep" data-f="${id}" data-d="-1" aria-label="Lower the ${what}">−</button><input id="bf-${id}" class="stin" inputmode="decimal" autocomplete="off" placeholder="${ph}" value="${esc(d[id])}"><button data-do="bstep" data-f="${id}" data-d="1" aria-label="Raise the ${what}">+</button></span></div>`;
  if(isScore(d)) return `<div class="card result small"><span>${esc(d.player)}<br>Correct score ${d.sh}–${d.sa} · chance</span><b class="num">${Math.round(d.proj*1000)/10}%</b></div>
  <div class="card"><div class="fld"><span>Your pick</span><b class="num">${d.team} ${d.sh} – ${d.sa} ${d.opp}</b></div>${FS('odds','Odds','–','odds')}${F('stake','Stake (€)','10')}</div>
  <div id="bhint">${betHint(d)}</div>
  <div class="sec">Result</div>
  ${S('bstatus',[['open','Open'],['won','Won'],['lost','Lost'],['void','Void']],d.status)}
  ${sheet.id?'<button class="btn2 danger" data-do="betdel">Delete bet</button>':''}`;
  const sub=d.market?`${d.market==='total'?'Match':d.team+' vs '+d.opp} · expected ${d.stat}`:`${d.team} vs ${d.opp} · projected`;
  return `<div class="card result small"><span>${esc(d.player)}<br>${sub}</span><b class="num">${d.market?(+d.proj).toFixed(2):f1(d.proj)}</b></div>
  ${S('bside',[['over','Over'],['under','Under']],d.side)}
  <div class="card">${FS('line','Line ('+d.stat+')','–','line')}${FS('odds','Odds','–','odds')}${F('stake','Stake (€)','10')}</div>
  <div id="bhint">${betHint(d)}</div>
  <div class="sec">Result</div>
  ${S('bstatus',[['open','Open'],['won','Won'],['lost','Lost'],['void','Void']],d.status)}
  ${sheet.id?'<button class="btn2 danger" data-do="betdel">Delete bet</button>':''}`;
}
function backupBody(){
  return `<p class="note">Copy this text and keep it somewhere safe, like Notes. To restore, paste a saved copy here and tap Restore.</p>
  <textarea id="bk" class="ta" spellcheck="false" autocomplete="off" aria-label="Bets backup text">${esc(JSON.stringify(bets))}</textarea>
  <button class="btn2" data-do="bkcopy">Copy</button><button class="btn2" data-do="bkrestore">Restore from this text</button>`;
}
function infoBody(one){
  if(!one) return allInfo();
  if(SPORT.kind==='match') return fbInfo();
  const R=(k,v)=>`<div class="row plain"><span class="k">${k}</span><span class="v">${v}</span></div>`, src=SLATE.sources||{}, ml=(SLATE.games.find(g=>g.ml&&g.ml.src)||{ml:{}}).ml.src;
  return `<div class="sec">The projection, ${SPORT.steps.length} steps</div><div class="card steps">${stepsHTML()}</div>
  <div class="sec">Where the numbers come from</div>
  <div class="card">${R('Sport',SPORT.sport+' · '+SPORT.league)}${R('Player stats',src.stats||'–')}${R('Lineups and injuries',src.injuries||'–')}${R('Defense by position',src.defense||'–')}${R('Moneyline',ml||'Typed by you')}${R('Checked',SLATE.checked)}</div>
  <p class="note">Questionable players may not play. This is a simple estimate, not a guarantee.</p>
  ${hasEdits()?'<button class="btn2" data-do="resetall">Reset my minute changes</button>':''}
  ${STANDALONE?'':'<p class="note">To install: in Safari, tap Share, then Add to Home Screen.</p>'}`;
}
function sheetParts(){
  if(sheet.kind==='player'){ const p=player(sheet.t,sheet.i); return {title:p.name,left:null,right:['Done','close'],body:playerBody(p)}; }
  if(sheet.kind==='bet') return {title:sheet.id?'Edit bet':'New bet',left:['Cancel','betcancel'],right:['Save','betsave'],body:betBody()};
  if(sheet.kind==='share') return {title:sheet.title,left:null,right:['Done','close'],body:shareBody()};
  if(sheet.kind==='cal') return {title:'Pick a day',left:null,right:['Done','close'],body:calBody()};
  if(sheet.kind==='games') return {title:'Games',left:null,right:['Done','close'],body:gamesBody()};
  if(sheet.kind==='sports') return {title:'Sport',left:null,right:['Done','close'],body:sportsBody()};
  if(sheet.kind==='pw') return {title:'Password',left:['Cancel','close'],right:['Save','pwsave'],body:pwBody()};
  if(sheet.kind==='info') return {title:'How it works',left:null,right:['Done','close'],body:infoBody()};
  return {title:'Back up bets',left:null,right:['Done','close'],body:backupBody()};
}

/* HUB SCREENS: Home (all sports, or one), Sports (every league with its top projections), Results (by sport and league). */
let hf=DB.get('hf','all'); if(hf!=='all'&&!SPORTS[hf]) hf='all';
const SPORT_GROUPS=()=>{ const g={}; SPORT_ORDER.forEach(id=>{ const s=SPORTS[id].sport; (g[s]=g[s]||[]).push(id); }); return g; };
function homeChips(){
  return `<div class="chips" role="group" aria-label="Show sport">${[['all','All'],...SPORT_ORDER.map(id=>[id,SPORTS[id].league])].map(([k,l])=>`<button class="chip" data-do="hf" data-v="${k}" aria-pressed="${k===hf}">${l}</button>`).join('')}</div>`;
}
/* top projection cards, as buttons that carry their sport and day. Each item: {html, utc, score}. */
function nbaTopCards(n,label){
  return leaders().slice(0,n).map(p=>({utc:gameOf(p.t).utc,html:`<button class="pc" style="${tstyle(p.t)}" data-sport="${SPORT.id}" data-day="${DAY}" data-do="player" data-t="${p.t}" data-i="${p.i}" aria-label="${esc(p.name)}, ${f1(p.result)} ${SPORT.stat}">${label?`<span class="pcl">${SPORT.league}</span>`:''}${tile(p.t,'sm')}<b>${esc(sn(p.name))}</b><span class="pcv num">${f1(p.result)}</span><span class="pcs">points · vs ${p.opp} · ${day(gameOf(p.t).utc).split(" ")[0]} ${clock(gameOf(p.t).utc)}</span></button>`}));
}
/* football: the biggest goal and corner projections, ranked against the competition's usual numbers */
function fbTopCards(n,label){
  const gs=SLATE.games.filter(g=>!g.final), ms=gs.map(g=>({g,m:fbModel(SLATE,g)}));
  if(!ms.length) return [];
  const avg=f=>ms.reduce((q,x)=>q+f(x),0)/ms.length, G=x=>x.m.lh+x.m.la, C=x=>x.m.corners?x.m.corners.home.lam+x.m.corners.away.lam:0, ag=avg(G), ac=avg(C);
  // one card per match, ranked by how far its goals or corners stand above the round's average
  return ms.map(x=>({x,score:Math.max(G(x)/ag,C(x)?C(x)/ac:0)})).sort((a,b)=>b.score-a.score).slice(0,n).map(({x,score})=>{ const g=x.g, m=x.m;
    return {utc:g.utc,score,html:`<button class="pc fbpc" style="${tstyle(g.home)}" data-sport="${SPORT.id}" data-day="${DAY}" data-do="open" data-id="${g.id}" aria-label="${matchTitle(g)}, projected ${m.ps.h} ${m.ps.a}">${label?`<span class="pcl">${SPORT.league}</span>`:''}<span class="pct">${tile(g.home,'sm')}${tile(g.away,'sm')}</span><b>${g.home} v ${g.away}</b><span class="pcv num">${m.ps.h}–${m.ps.a}</span><span class="pcs">${G(x).toFixed(1)} goals${C(x)?'<br>'+C(x).toFixed(1)+' corners':''}<br>BTTS ${m.bttsPick?'yes':'no'} · ${clock(g.utc)}</span></button>`}; });
}
const byTime=(a,b)=>a.utc<b.utc?-1:a.utc>b.utc?1:0;
const topList=(id,n,label)=>withSport(id,()=>SPORT.kind==='match'?fbTopCards(n,label):nbaTopCards(n,label));
const topCards=(id,n,label)=>topList(id,n,label).sort(byTime).map(i=>i.html).join('');
function homeAll(){
  const today=new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'});
  const mixed=SPORT_ORDER.flatMap(id=>topList(id,3,true)).sort(byTime).map(i=>i.html).join('');
  return head('All sports · '+today,'Predictions','Latest from every league')+homeChips()+
  `<div class="sec">My bets</div>`+sumHTML(true)+
  `<div class="sec">Top predictions</div><div class="hs">${mixed}</div>`+
  SPORT_ORDER.map(id=>({id,t:withSport(id,()=>{ const g=SLATE.games.find(x=>!x.final)||SLATE.games[0]; return g.utc; })})).sort((a,b)=>a.t<b.t?-1:1).map(({id})=>withSport(id,()=>{ const up=SLATE.games.filter(g=>!g.final).slice(0,3), list=up.length?up:SLATE.games.slice(0,3);
    return `<div class="sec row-sec"><span>${SPORT.league} · ${slateName(SLATE)}</span><button class="link" data-do="league" data-s="${id}">All ${SPORT.kind==='match'?'matches':'games'}</button></div>`+
      list.map(g=>SPORT.kind==='match'?fbCard(g):gameCard(g)).join(''); })).join('')+
  `<p class="note">Pick a sport above to see only that sport, or open Sports for every league.</p>`;
}
function viewSports(){
  const G=SPORT_GROUPS();
  return head('Propline','Sports','Every league, with its top projections')+
  Object.entries(G).map(([sp,ids])=>`<div class="sec">${sp}</div><div class="card">${ids.map(id=>{ const S=SPORTS[id], s=S.slates[S.slates.length-1];
      return `<button class="row" data-do="league" data-s="${id}"><span class="sp-ic" aria-hidden="true">${S.kind==='match'?ICON.ball:ICON.hoop}</span><span class="who"><b>${S.league}</b><span>${slateName(s)} · ${s.games.length} ${S.kind==='match'?'matches':'games'}</span></span><i class="chev"></i></button>`; }).join('')}</div>`+
    ids.map(id=>`<div class="sec row-sec"><span>Top in ${SPORTS[id].league}</span><button class="link" data-do="league" data-s="${id}">Open</button></div><div class="hs">${topCards(id,6,false)}</div>`).join('')).join('');
}
function leagueSummary(id){
  return withSport(id,()=>{
    if(SPORT.kind==='match'){ const n=SPORT.slates.reduce((q,s)=>q+s.games.filter(g=>g.final).length,0);
      return n?`${n} match${n>1?'es':''} with results`:`No results yet · ${slateName(SLATE)} starts ${day(SLATE.games[0].utc)}`; }
    for(let i=SPORT.slates.length-1;i>=0;i--){ if(!SPORT.slates[i].actual) continue; setDay(i);
      const a=accuracy(slateTeams().flatMap(t=>roster(t).on)); if(a.n) return `${slateName(SLATE)} · ${a.n} players · average miss ${a.avg.toFixed(1)} points`; }
    return 'No results yet';
  });
}
function resultsHub(){
  const G=SPORT_GROUPS();
  return head('Propline','Results','Projections against what really happened')+
  Object.entries(G).map(([sp,ids])=>`<div class="sec">${sp}</div><div class="card">${ids.map(id=>`<button class="row" data-do="resleague" data-s="${id}"><span class="sp-ic" aria-hidden="true">${SPORTS[id].kind==='match'?ICON.ball:ICON.hoop}</span><span class="who"><b>${SPORTS[id].league}</b><span>${leagueSummary(id)}</span></span><i class="chev"></i></button>`).join('')}</div>`).join('')+
  `<p class="note">Tap a league for the game-by-game results.</p>`;
}
function allInfo(){
  return SPORT_ORDER.map(id=>withSport(id,()=>`<div class="sec">${SPORT.league}</div>`+(SPORT.kind==='match'?fbInfo():infoBody(true)))).join('');
}

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

/* ACCOUNT & PLANS. ME comes from the gate (server). Plans: starter < plus < pro. */
const ME=window.ME||{email:null,tier:'pro',plans:{}};
const RANK={starter:1,plus:2,pro:3}, PLAN_NAME={starter:'Starter',plus:'Plus',pro:'Pro'};
const has=t=>(RANK[ME.tier]||0)>=RANK[t];
// what each screen needs
function needFor(c){ if(c) return 'plus'; return nav.tab==='sports'||nav.tab==='results'?'plus':'starter'; }
const LOCK_TXT={plus:'Every player, every game and full results are in Plus.',pro:'Corners, the correct-score grid, the steps behind each projection and share pictures are in Pro.'};
function lockCard(t,what){
  return `<div class="card lockc"><span class="lk-ic" aria-hidden="true">${ICON.lock}</span><b>${what||'This is in '+PLAN_NAME[t]}</b><span>${LOCK_TXT[t]}</span>
  <button class="btn" data-do="upgrade">See ${PLAN_NAME[t]}</button></div>`;
}
function lockView(t){ return head('Propline',PLAN_NAME[t],'Part of the '+PLAN_NAME[t]+' plan')+lockCard(t,'Unlock with '+PLAN_NAME[t]); }
// actions that need Pro
function proAction(d){ return ['sharebet','shareday','sharego','fbscore'].includes(d.do)||(d.do==='fbtab'&&(d.v==='corners'||d.v==='score')); }

/* BET SYNC: server keeps {bets, del, at}. Local changes win until they reach the server. */
let syncT=null, lastIds=new Set(bets.map(b=>b.id)), delIds=DB.get('betsDel',[]); if(!Array.isArray(delIds)) delIds=[];
let dirty=!!DB.get('betsDirty',false);
function noteBets(){
  const ids=new Set(bets.map(b=>b.id)); lastIds.forEach(id=>{ if(!ids.has(id)&&!delIds.includes(id)) delIds.push(id); }); lastIds=ids;
  DB.set('betsDel',delIds); dirty=true; DB.set('betsDirty',true); clearTimeout(syncT); syncT=setTimeout(pushBets,700);
}
async function pushBets(){
  if(!ME.email||!window.PLAPI) return;
  try{ const r=await fetch('/api/bets',{method:'PUT',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify({bets,del:delIds})});
    if(r.ok){ dirty=false; DB.set('betsDirty',false); } }catch(e){}
}
async function pullBets(){
  if(!ME.email||!window.PLAPI) return;
  let srv; try{ srv=await PLAPI('bets'); }catch(e){ return; }
  const del=new Set([...(srv.del||[]),...delIds]), mine=new Map(bets.map(b=>[b.id,b])), out=new Map();
  (srv.bets||[]).filter(validBet).forEach(b=>out.set(b.id,dirty&&mine.has(b.id)?mine.get(b.id):b));
  bets.forEach(b=>{ if(!out.has(b.id)&&(dirty||!srv.at)) out.set(b.id,b); });
  const merged=[...out.values()].filter(b=>!del.has(b.id));
  const changed=JSON.stringify(merged)!==JSON.stringify(bets);
  bets=merged; DB.set('bets',bets); lastIds=new Set(bets.map(b=>b.id)); delIds=[...del]; DB.set('betsDel',delIds);
  if(dirty||changed||!srv.at) await pushBets();
  if(changed){ refresh(); }
}
/* account screen */
function accountTop(){
  if(!ME.email) return `<div class="card prof">${billy('','Billy the goat')}<span class="who"><b>Guest</b><span>Not signed in</span></span></div>`;
  return `<div class="card prof">${billy('','Billy the goat')}<span class="who"><b>${esc(ME.email)}</b><span>${ME.tier?PLAN_NAME[ME.tier]+' plan':'No plan'}${ME.owner?' · Owner':''}</span></span></div>
  <div class="sec">Plan</div><div class="card">
    <button class="row" data-do="upgrade"><span class="who"><b>${ME.tier?'Change plan':'Choose a plan'}</b><span>${ME.tier?PLAN_NAME[ME.tier]+', €'+((ME.plans[ME.tier]||{}).price/100||0).toFixed(2)+' a month':''}</span></span><i class="chev"></i></button>
    ${ME.simulated?`<button class="row" data-do="simcancel"><span class="who"><b style="color:var(--red)">Cancel plan</b><span>Simulated plan, nothing was charged</span></span></button>`:''}
    ${ME.billing?`<button class="row" data-do="billing"><span class="who"><b>Billing and cancel</b><span>Card, invoices, cancel</span></span><i class="chev"></i></button>`:''}
  </div>
  <div class="sec">Sign in</div><div class="card">
    <button class="row" data-do="pwsheet"><span class="who"><b>Change password</b></span><i class="chev"></i></button>
    <button class="row" data-do="signout"><span class="who"><b style="color:var(--red)">Sign out</b></span></button>
  </div>`;
}
function pwBody(){
  return `<div class="card"><label class="fld"><span>Current</span><input id="pw-old" type="password" autocomplete="current-password" style="width:11rem"></label>
  <label class="fld"><span>New</span><input id="pw-new" type="password" autocomplete="new-password" placeholder="8+ characters" style="width:11rem"></label></div>
  <p class="note">You stay signed in on this device.</p>
  <div class="sec">Delete account</div><div class="card"><label class="fld"><span>Password</span><input id="pw-del" type="password" autocomplete="current-password" style="width:11rem"></label></div>
  <button class="btn2 danger" data-do="delacct">Delete my account and bets</button><p class="note">This also cancels your plan. It can't be undone.</p>`;
}
async function authAction(d){
  if(d.do==='upgrade'){ closeSheet&&sheet&&closeSheet(); window.showPlans&&showPlans(ME); return true; }
  if(d.do==='signout'){ try{ await PLAPI('logout',{}); }catch(e){} try{localStorage.removeItem('propline:me')}catch(e){} location.replace('/'); return true; }
  if(d.do==='billing'){ try{ const r=await PLAPI('portal',{}); location.href=r.url; }catch(e){ toast(e.message); } return true; }
  if(d.do==='simcancel'){ if(!confirmDel){ confirmDel=true; toast('Tap again to cancel your plan'); setTimeout(()=>confirmDel=false,4000); return true; }
    try{ await PLAPI('cancel',{}); location.replace('/'); }catch(e){ toast(e.message); } return true; }
  if(d.do==='pwsheet'){ openSheet({kind:'pw'}); return true; }
  if(d.do==='pwsave'){ const o=$('#pw-old').value, n=$('#pw-new').value; try{ await PLAPI('password',{old:o,password:n}); closeSheet(); toast('Password changed'); }catch(e){ toast(e.message); } return true; }
  if(d.do==='delacct'){ const p=$('#pw-del').value; if(!p) { toast('Type your password to delete'); return true; }
    if(!confirmDel){ confirmDel=true; toast('Tap again to delete for good'); setTimeout(()=>confirmDel=false,4000); return true; }
    try{ await PLAPI('delete',{password:p}); localStorage.clear(); location.replace('/'); }catch(e){ toast(e.message); } return true; }
  return false;
}
let confirmDel=false;
setTimeout(pullBets,300);
document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='visible') pullBets(); });

/* WEATHER-STYLE BLOCKS
   A section title and the cards after it become one block. While you scroll, the title stays pinned under the
   top bar, the block's content slides up underneath it and is cut off there, and when the block runs out the
   title rides up with it and the block fades. Team blocks in Results (details) work the same way. */
function blockify(root){
  [...root.children].forEach(el=>{
    if(!el.classList||!el.classList.contains('sec')||!el.parentNode) return;
    const parts=[]; let n=el.nextElementSibling;
    while(n&&n.matches('.card,.hs')){ parts.push(n); n=n.nextElementSibling; }
    if(!parts.length) return;
    const s=document.createElement('section'); s.className='sblock';
    el.parentNode.insertBefore(s,el); el.classList.add('sb-h'); s.appendChild(el); parts.forEach(p=>s.appendChild(p));
  });
  root.querySelectorAll('details.tblock').forEach(d=>{ d.classList.add('sblock'); const sm=d.querySelector('summary'); if(sm) sm.classList.add('sb-h'); });
}
let blkRaf=0;
function paintBlocks(){
  blkRaf=0;
  const row=navEl.querySelector('.nav-row'); if(!row) return;
  const line=row.getBoundingClientRect().bottom+4;
  view.querySelectorAll('.sblock').forEach(b=>{
    const h=b.querySelector(':scope > .sb-h'); if(!h) return;
    const r=b.getBoundingClientRect(), hh=h.offsetHeight, d=line-r.top;
    if(d<=0||r.bottom<0){ if(b.dataset.on){ b.style.clipPath=''; b.style.opacity=''; h.style.transform=''; delete b.dataset.on; } return; }
    const shift=Math.max(0,Math.min(d,r.height-hh)), left=r.bottom-line, fadeZone=hh*1.6;
    b.dataset.on='1';
    h.style.transform=`translateY(${shift}px)`;
    b.style.clipPath=`inset(${Math.max(0,d)}px 0 0 0 round 1.375rem)`;
    b.style.opacity=left<fadeZone?Math.max(0,left/fadeZone).toFixed(3):'';
  });
}
const queueBlocks=()=>{ if(!blkRaf) blkRaf=requestAnimationFrame(paintBlocks); };
addEventListener('scroll',queueBlocks,{passive:true});
addEventListener('resize',queueBlocks);
document.addEventListener('toggle',queueBlocks,true);

const view=$('#view'), navEl=$('#nav'), bar=$('#tabbar'), root=$('#sheet-root'), toastEl=$('#toast');
const REDUCE=()=>{try{return matchMedia('(prefers-reduced-motion:reduce)').matches}catch(e){return false}};
let ltObs=null, pgUntil=0;
function renderAll(){
  const c=cur();
  if(c&&c.s){ if(SPORT.id!==c.s) setSport(c.s); if(c.d!=null&&c.d!==DAY) setDay(c.d); }
  else if(!c&&nav.tab==='home'&&hf!=='all'&&SPORT.id!==hf) setSport(hf);
  const F=SPORT.kind==='match';
  const need=needFor(c);
  view.innerHTML=!has(need)?lockView(need):c?(c.v==='game'?(F?fbGame(c):viewGame(c)):c.v==='list'?(F?fbTeams():viewPlayers()):c.v==='res'?(F?fbResults():viewResults()):(F?fbHome():viewHome()))
    :nav.tab==='home'?(hf==='all'?homeAll():F?fbHome():viewHome()):nav.tab==='sports'?viewSports():nav.tab==='bets'?viewBets():nav.tab==='account'?viewAccount():resultsHub();
  blockify(view); queueBlocks();
  navEl.innerHTML=`<div class="nav-bg"></div><div class="nav-row">${c?`<button class="glassbtn" data-do="back" aria-label="Back">${ICON.back}</button>`:'<span class="nb-sp"></span>'}${c&&c.v==='game'?`<button class="gpick" data-do="gamepick" aria-label="${esc(pageTitle())}. Switch game">${(g=>F?`${dot(g.home)}<span>${g.home} <i>v</i> ${g.away}</span>${dot(g.away)}`:`${dot(g.away)}<span>${g.away} <i>at</i> ${g.home}</span>${dot(g.home)}`)(SLATE.games.find(x=>x.id===c.id))}${ICON.down}</button>`:`<span class="nav-title" aria-hidden="true">${esc(pageTitle())}</span>`}<span class="nb-sp"></span></div>`;
  navEl.classList.remove('show-title');
  bar.style.setProperty('--i',TABS.findIndex(t=>t[0]===nav.tab));
  bar.querySelectorAll('button').forEach(b=>b.dataset.tab===nav.tab?b.setAttribute('aria-current','page'):b.removeAttribute('aria-current'));
  if(ltObs) ltObs.disconnect();
  const lt=$('#lt');
  if(lt&&'IntersectionObserver' in window){
    ltObs=new IntersectionObserver(e=>navEl.classList.toggle('show-title',!e[0].isIntersecting),{rootMargin:'-56px 0px 0px 0px'});
    ltObs.observe(lt);
  }
  DB.set('nav',nav);
}
/* page slide */
function pgSnap(){
  const c=view.cloneNode(true); c.removeAttribute('id'); c.querySelectorAll('[id]').forEach(e=>e.removeAttribute('id'));
  c.className='view pg'; c.setAttribute('aria-hidden','true'); c.inert=true; c.style.top=(-scrollY)+'px';
  document.body.appendChild(c); document.documentElement.classList.add('pg-run'); return c;
}
function pgRun(dir,snap){
  const a=dir==='fwd'?'pg-in':'pg-back-in'; view.classList.add(a); snap.classList.add(dir==='fwd'?'pg-under':'pg-out');
  pgUntil=Date.now()+480;
  setTimeout(()=>{snap.remove();view.classList.remove(a);document.documentElement.classList.remove('pg-run')},REDUCE()?160:480);
}
function push(entry){ if(Date.now()<pgUntil) return; const s=pgSnap(); (cur()||nav).y=scrollY; nav.stack.push(entry); renderAll(); scrollTo(0,0); pgRun('fwd',s); }
function pop(){ if(Date.now()<pgUntil||!cur()) return; const s=pgSnap(); nav.stack.pop(); renderAll(); scrollTo(0,(cur()||nav).y||0); pgRun('back',s); }
function goTab(tab){ nav.tab=tab; nav.stack=[]; nav.y=0; renderAll(); scrollTo(0,0); }
/* tab bar */
bar.style.setProperty('--n',TABS.length);
bar.innerHTML='<span class="tb-ind"></span>'+TABS.map(([k,l])=>`<button data-do="tab" data-tab="${k}">${ICON[k].replace('class="ic"','class="ic o"')}${ICONF[k]}<span>${l}</span></button>`).join('');
let lastY=0;
addEventListener('scroll',()=>{
  const y=scrollY;
  if(y<=8) bar.classList.remove('min'); else if(y>lastY+4&&y>12) bar.classList.add('min'); else if(y<lastY-4) bar.classList.remove('min');
  lastY=y;
},{passive:true});
function tapBar(){bar.classList.remove('tap');void bar.offsetWidth;bar.classList.add('tap');setTimeout(()=>bar.classList.remove('tap'),650)}
/* sheet */
let opener=null;
function renderSheet(){
  const el=root.querySelector('.sheet'); if(!el||!sheet) return; const p=sheetParts();
  el.setAttribute('aria-label',p.title);
  el.querySelector('.sh-head').innerHTML=`${p.left?`<button class="lead" data-do="${p.left[1]}">${p.left[0]}</button>`:'<span class="sp"></span>'}<h2>${esc(p.title)}</h2><button data-do="${p.right[1]}" id="sh-done">${p.right[0]}</button>`;
  $('#sh-body').innerHTML=p.body;
}
function openSheet(s){
  if(sheet) return; sheet=s; opener=s.kind==='player'?{t:s.t,i:s.i}:null;
  root.classList.remove('closing');
  root.innerHTML='<div class="scrim" data-do="close"></div><div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div><div class="sh-head"></div><div class="sh-body" id="sh-body"></div></div>';
  renderSheet();
  document.documentElement.style.setProperty('--sy',(scrollY-view.offsetTop+innerHeight*.3)+'px');
  document.body.classList.add('sheet-open'); view.inert=true; bar.inert=true; navEl.inert=true;
  const d=$('#sh-done'); if(d) d.focus({preventScroll:true});
  bindDrag(root.querySelector('.sheet'));
}
function releasePage(){
  document.body.classList.remove('sheet-open'); document.documentElement.style.removeProperty('--pscale');
  view.inert=false; bar.inert=false; navEl.inert=false;
}
function closeSheet(){
  if(!sheet) return; sheet=null; root.classList.add('closing'); releasePage();
  if(document.activeElement&&root.contains(document.activeElement)) document.activeElement.blur();
  const sc=root.querySelector('.scrim'); if(sc) sc.style.opacity='';
  setTimeout(()=>{ if(!sheet){root.innerHTML='';root.classList.remove('closing')} },REDUCE()?20:300);
  if(opener){const b=view.querySelector(`[data-do="player"][data-t="${opener.t}"][data-i="${opener.i}"]`); if(b) b.focus({preventScroll:true});}
}
function bindDrag(el){
  let y0=null,dy=0,t0=0,h=0; const body=el.querySelector('.sh-body'), sc=root.querySelector('.scrim');
  el.addEventListener('touchstart',e=>{
    if(e.target.closest('input,textarea')||(e.target.closest('button')&&!e.target.closest('.sh-head'))){y0=null;return}
    if(body.contains(e.target)&&body.scrollTop>0){y0=null;return}
    y0=e.touches[0].clientY;dy=0;t0=Date.now();h=el.offsetHeight;el.style.animation='none';el.style.transition='none';
  },{passive:true});
  el.addEventListener('touchmove',e=>{
    if(y0==null) return; dy=e.touches[0].clientY-y0;
    el.style.transform=`translateY(${dy>0?dy:dy/6}px)`;
    const pr=Math.max(0,Math.min(1,dy/h));
    document.documentElement.style.setProperty('--pscale',.95+.05*pr); if(sc) sc.style.opacity=1-pr;
    if(dy>0&&e.cancelable) e.preventDefault();
  },{passive:false});
  el.addEventListener('touchend',()=>{
    if(y0==null) return; const v=dy/Math.max(1,Date.now()-t0); y0=null;
    if(dy>h*.28||(v>.5&&dy>24)){
      el.style.transition='transform .3s cubic-bezier(.32,.72,0,1)'; el.style.transform=`translateY(${h+32}px)`;
      sheet=null; releasePage(); if(sc){sc.style.transition='opacity .3s';sc.style.opacity=0}
      setTimeout(()=>{ if(!sheet) root.innerHTML='' },300);
    }else{
      el.style.transition='transform .42s cubic-bezier(.2,.9,.3,1)'; el.style.transform='';
      document.documentElement.style.removeProperty('--pscale'); if(sc) sc.style.opacity='';
    }
  });
}
/* keep the sheet above the keyboard */
if(window.visualViewport){
  const kb=()=>document.documentElement.style.setProperty('--kb',Math.max(0,innerHeight-visualViewport.height-visualViewport.offsetTop)+'px');
  visualViewport.addEventListener('resize',kb); visualViewport.addEventListener('scroll',kb);
}
/* toast */
let toastT=0, undo=null;
function toast(msg,undoFn){
  undo=undoFn||null; toastEl.innerHTML=`<span>${esc(msg)}</span>${undo?'<button data-do="undo">Undo</button>':''}`;
  toastEl.classList.add('on'); clearTimeout(toastT); toastT=setTimeout(()=>toastEl.classList.remove('on'),4000);
}
function syncDraft(){ if(sheet&&sheet.kind==='bet') ['line','stake','odds'].forEach(k=>{const e=$('#bf-'+k); if(e) sheet.draft[k]=e.value}); }
function refresh(){ const y=scrollY; syncDraft(); renderAll(); scrollTo(0,y); if(sheet) renderSheet(); }
function backFromBet(){ if(sheet.from){ sheet={kind:'player',t:sheet.from.t,i:sheet.from.i}; refresh(); } else { closeSheet(); refresh(); } }
function editBet(b,from){
  const s={kind:'bet',id:b.id,from,draft:{...b,line:b.line==null?'':String(b.line),stake:String(b.stake),odds:String(b.odds)}};
  if(sheet){ sheet=s; renderSheet(); } else openSheet(s);
}
function newDraft(p){ return {sport:SPORT.id,date:SLATE.date,when:gameOf(p.t).utc,team:p.t,opp:p.opp,player:p.name,stat:SPORT.stat,proj:+p.result.toFixed(1),side:'over',line:'',stake:'',odds:'',status:'open'}; }
/* + and - on the bet form: the line moves by 0.5, the odds by 0.01. Hold to keep going. */
function betStep(f,dir){
  const e=$('#bf-'+f); if(!e||!sheet||sheet.kind!=='bet') return; let v=num(e.value);
  if(f==='line'){ v=v==null?Math.round(sheet.draft.proj*2)/2:Math.max(0,Math.round((v+dir*.5)*2)/2); e.value=String(v); }
  else { v=v==null?1.90:Math.max(1.01,Math.round((v+dir*.01)*100)/100); e.value=v.toFixed(2); }
  sheet.draft[f]=e.value; const h=$('#bhint'); if(h) h.innerHTML=betHint(sheet.draft);
}
let holdT=0, holdI=0; const stopHold=()=>{ clearTimeout(holdT); clearInterval(holdI); };
document.addEventListener('pointerdown',e=>{
  const b=e.target.closest('[data-do="bstep"]'); if(!b) return;
  stopHold(); betStep(b.dataset.f,+b.dataset.d);
  holdT=setTimeout(()=>{ holdI=setInterval(()=>betStep(b.dataset.f,+b.dataset.d),70); },450);
});
['pointerup','pointercancel','contextmenu'].forEach(t=>document.addEventListener(t,stopHold));
addEventListener('blur',stopHold);
/* events */
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-do]'); if(!b) return; const d=b.dataset;
  if(proAction(d)&&!has('pro')){ ME.email?showPlans(ME):toast('Part of Pro'); return; }
  if(['upgrade','signout','billing','simcancel','pwsheet','pwsave','delacct'].includes(d.do)){ authAction(d); return; }
  const ctx=b.closest('[data-sport]'); if(ctx&&!root.contains(ctx)){ if(SPORT.id!==ctx.dataset.sport) setSport(ctx.dataset.sport); if(ctx.dataset.day!=null) setDay(+ctx.dataset.day); }
  switch(d.do){
    case 'tab':
      tapBar();
      if(d.tab===nav.tab&&!cur()){ scrollTo({top:0,behavior:REDUCE()?'auto':'smooth'}); break; }
      goTab(d.tab); break;
    case 'gotab': goTab(d.tab); break;
    case 'open': push({v:'game',s:SPORT.id,d:DAY,id:d.id,team:SLATE.games.find(g=>g.id===d.id).away,fb:d.fb==='corners'?'corners':undefined}); break;
    case 'league': setSport(d.s); push({v:'league',s:d.s,d:DAY}); break;
    case 'resleague': setSport(d.s); push({v:'res',s:d.s,d:DAY}); break;
    case 'list': push({v:'list',s:SPORT.id,d:DAY}); break;
    case 'hf': hf=d.v; DB.set('hf',hf); if(hf!=='all') setSport(hf); refresh(); break;
    case 'back': pop(); break;
    case 'team': cur().team=d.t; refresh(); break;
    case 'pos': topPos=d.p; refresh(); break;
    case 'day': setDay(+d.i); if(cur()) cur().d=DAY; resGame=null; refresh(); break;
    case 'cal': { const t=new Date(SLATE.games[0].utc); openSheet({kind:'cal',y:t.getFullYear(),m:t.getMonth()}); break; }
    case 'calm': { const t=new Date(sheet.y,sheet.m+(+d.d),1); sheet.y=t.getFullYear(); sheet.m=t.getMonth(); renderSheet(); break; }
    case 'calday': setDay(+d.i); if(cur()) cur().d=DAY; resGame=null; closeSheet(); refresh(); break;
    case 'sharebet': shareBets([d.id],'one'); break;
    case 'shareday': shareBets(d.ids.split(','),d.k); break;
    case 'sharego': shareGo(); break;
    case 'gamepick': openSheet({kind:'games'}); break;
    case 'gogame': { setDay(+d.i); const g=SLATE.games.find(x=>x.id===d.id); resGame=null; closeSheet();
      if(cur()) nav.stack[nav.stack.length-1]={v:'game',s:SPORT.id,d:DAY,id:g.id,team:g.away}; renderAll(); scrollTo(0,0); break; }
    case 'sport': setSport(d.s); topPos=''; pq=''; resGame=null; nav.stack=[]; if(sheet) closeSheet(); refresh(); break;
    case 'sportpick': openSheet({kind:'sports'}); break;
    case 'fbstat': fbStat=d.v; refresh(); break;
    case 'fbtab': cur().fb=d.v; refresh(); break;
    case 'fbscore': openSheet({kind:'bet',id:null,from:null,draft:fbScoreDraft(d.g,+d.h,+d.a)}); break;
    case 'fbbet': openSheet({kind:'bet',id:null,from:null,draft:fbDraft(d.g,d.stat,d.mk,d.k,+d.l,d.side)}); break;
    case 'fbplay': edits.play[d.id]=!(+d.a>=.5); DB.set('edits',edits); refresh(); break;
    case 'usestake': { const e=$('#bf-stake'); if(e){ e.value=d.v; sheet.draft.stake=d.v; } toast('Stake set to '+money(+d.v)); break; }
    case 'acfrac': acct.frac=+d.v; saveAcct(); refresh(); break;
    case 'accap': acct.cap=+d.v; saveAcct(); refresh(); break;
    case 'resgame': resGame=d.id; refresh(); break;
    case 'info': openSheet({kind:'info'}); break;
    case 'player': openSheet({kind:'player',t:d.t,i:+d.i}); break;
    case 'close': closeSheet(); break;
    case 'undo': if(undo){undo();undo=null;toastEl.classList.remove('on')} break;
    case 'resetall': { const old=JSON.parse(JSON.stringify(edits)); edits={min:{},play:{}}; DB.set('edits',edits); refresh();
      toast('Changes reset',()=>{edits=old;DB.set('edits',edits);refresh()}); break; }
    /* bets */
    case 'addbet': { if(!sheet||sheet.kind!=='player') break;
      sheet={kind:'bet',id:null,from:{t:sheet.t,i:sheet.i},draft:newDraft(player(sheet.t,sheet.i))}; renderSheet(); break; }
    case 'quickbet': openSheet({kind:'bet',id:null,from:null,draft:newDraft(player(d.t,+d.i))}); break;
    case 'bstep': if(e.detail===0) betStep(d.f,+d.d); break;   // keyboard only: touch and mouse are handled on press, below
    case 'bet': { const x=bets.find(q=>q.id===d.id); if(x) editBet(x,sheet&&sheet.kind==='player'?{t:sheet.t,i:sheet.i}:null); break; }
    case 'bside': syncDraft(); sheet.draft.side=d.v; renderSheet(); break;
    case 'bstatus': syncDraft(); sheet.draft.status=d.v; renderSheet(); break;
    case 'betcancel': backFromBet(); break;
    case 'betsave': { syncDraft(); const q=sheet.draft, stake=num(q.stake), odds=num(q.odds), hasLine=String(q.line).trim()!=='', line=hasLine?num(q.line):null;
      if(!(stake>0)||!(odds>1)){ toast('Enter a stake, and odds above 1.00'); break; }
      if(hasLine&&line==null){ toast('The line must be a number'); break; }
      const rec={id:sheet.id||('b'+Date.now().toString(36)+Math.random().toString(36).slice(2,6)),sport:q.sport,date:q.date,when:q.when,team:q.team,opp:q.opp,player:q.player,stat:q.stat,proj:q.proj,gid:q.gid,market:q.market,sh:q.sh,sa:q.sa,side:q.side,line,stake,odds,status:q.status,ts:q.ts||Date.now()};
      const ix=bets.findIndex(x=>x.id===rec.id), was=ix>=0?bets[ix].status:null; if(ix>=0) bets[ix]=rec; else bets.push(rec); saveBets();
      backFromBet(); if(rec.status!==was&&(rec.status==='won'||rec.status==='lost')) billyReact(rec.status,betPL(rec)); else toast(ix>=0?'Bet updated':'Bet saved'); break; }
    case 'betdel': { const old=bets.slice(); bets=bets.filter(x=>x.id!==sheet.id); saveBets(); backFromBet();
      toast('Bet deleted',()=>{bets=old;saveBets();refresh()}); break; }
    case 'backup': openSheet({kind:'backup'}); break;
    case 'bkcopy': { const t=$('#bk').value; const ok=()=>toast('Copied'), no=()=>{ $('#bk').select(); toast('Select all the text and copy it'); };
      try{ navigator.clipboard.writeText(t).then(ok,no); }catch(err){ no(); } break; }
    case 'bkrestore': { let arr=null; try{ arr=JSON.parse($('#bk').value); }catch(err){}
      if(!Array.isArray(arr)||!arr.every(validBet)){ toast('That text is not a bets backup'); break; }
      const old=bets.slice(); bets=arr; saveBets(); closeSheet(); refresh();
      toast(`Restored ${arr.length} bet${arr.length===1?'':'s'}`,()=>{bets=old;saveBets();refresh()}); break; }
    default: if(sheet&&sheet.kind==='player'){
      const p=player(sheet.t,sheet.i);
      if(d.do==='min') edits.min[p.id]=Math.max(0,Math.min(48,Math.round(p.minutes+(+d.d))));
      if(d.do==='play') edits.play[p.id]=!p.playing;
      if(d.do==='reset'){delete edits.min[p.id];delete edits.play[p.id]}
      DB.set('edits',edits); refresh();
    }
  }
});
/* typed values: real points, moneyline odds, player search. Only the affected bits are redrawn so the keyboard stays up. */
document.addEventListener('toggle',e=>{ const d=e.target; if(d.classList&&d.classList.contains('tblock')) resOpen[d.dataset.key]=d.open; },true);
function paintGap(p){ document.querySelectorAll(`[data-gap="${p.t}-${p.i}"]`).forEach(e=>e.innerHTML=gapPill(p)||(e.closest('.rrow')?'<span class="pill v">No points yet</span>':'')); const a=$('#acc'); if(a) a.innerHTML=accHTML(); }
document.addEventListener('change',e=>{
  const el=e.target, d=el.dataset; if(!d||!d.in) return;
  if(d.in==='act'){
    const p=player(d.t,+d.i), v=el.value.trim();
    if(v==='') acts[p.id]=null; else { const x=num(v); if(x==null||x<0||x>200){ toast('Type the points as a number'); el.value=''; return; } acts[p.id]=x; }
    DB.set('acts',acts);
    if(sheet&&sheet.kind==='player'){ const y=scrollY; renderAll(); scrollTo(0,y); }
    paintGap(player(d.t,+d.i));
  }
  if(d.in==='bank'){ const v=el.value.trim(), x=num(v); if(v===''){acct.bank=null} else if(x==null||x<=0){ toast('Type the bank as a number'); el.value=''; return; } else { acct.bank=Math.round(x*100)/100; el.value=String(acct.bank); } saveAcct(); toast(acct.bank?'Bank set to '+money(acct.bank):'Bank cleared'); }
  if(d.in==='odds'){
    const g=SLATE.games.find(x=>x.id===d.g), k=oddsKey(g), v=el.value.trim(), cur=oddsEd[k]||{};
    if(v==='') cur[d.side]=null; else { const x=num(v); if(x==null||x<=1){ toast('Decimal odds must be above 1.00'); el.value=''; return; } cur[d.side]=x; el.value=x.toFixed(2); }
    oddsEd[k]=cur; DB.set('odds',oddsEd); const im=$('#imp'); if(im) im.textContent=impliedText(g);
  }
});
document.addEventListener('input',e=>{ const id=e.target.id||'';
  if(sheet&&sheet.kind==='bet'&&(id==='bf-line'||id==='bf-odds')){ sheet.draft[id.slice(3)]=e.target.value; const h=$('#bhint'); if(h) h.innerHTML=betHint(sheet.draft); }
  if(id==='psearch'){ pq=e.target.value; const l=$('#plist'); if(l) l.innerHTML=playerList(); } });
document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&sheet) closeSheet(); if(e.key==='Enter'&&e.target.matches&&e.target.matches('input')) e.target.blur(); });
SPORT.load().then(()=>{ renderAll(); scrollTo(0,0); billyHello(); });
if('serviceWorker' in navigator && location.protocol==='https:'){ try{navigator.serviceWorker.register('sw.js').catch(()=>{})}catch(e){} }
