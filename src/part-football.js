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
    ${f?`<b class="fin num">${f[k]}</b>`:''}<span class="xg num" aria-label="${f?'Projected':'Projected goals'}">${m.ps[k==='home'?'h':'a']}</span></div>`;
  return `<button class="card game" data-sport="${SPORT.id}" data-day="${DAY}" data-do="open" data-id="${g.id}" aria-label="${matchTitle(g)}, projected ${m.ps.h} ${m.ps.a}, open match">
    <div class="ghead"><span>${f?'Final':day(g.utc)+' · '+clock(g.utc)}</span><span class="gh-r">Projected score<i class="chev"></i></span></div>${side(g.home,m.lh,'home')}${side(g.away,m.la,'away')}
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
  const tm=(t,k)=>`<span class="tm">${tile(t,'lg')}<b>${fbTeamName(SLATE,t)}</b><span class="sc num">${f?f[k]:m.ps[k==='home'?'h':'a']}</span><small class="xgs num">${(k==='home'?m.lh:m.la).toFixed(2)} goals</small></span>`;
  const pr=g.prob, W=(k,l,v,src)=>`<span class="wp"><span class="tk">${l}</span><b class="num">${P0(v)}</b>${src!=null?`<small class="num">Sportradar ${src.toFixed(0)}%</small>`:''}</span>`;
  let body='';
  if(tab==='sum'){ const C=m.corners, PRO=has('pro'), lk='<span class="pill e">Pro</span>', hn=fbTeamName(SLATE,g.home), an=fbTeamName(SLATE,g.away);
    const win=m.ps.h>m.ps.a?hn+' win':m.ps.h<m.ps.a?an+' win':'Draw';
    const S=(tabk,k,sub,v,lock)=>`<button class="row" data-do="fbtab" data-v="${tabk}"><span class="who"><b>${k}</b>${sub?`<span>${sub}</span>`:''}</span><span class="v num sumv">${lock?lk:v}</span><i class="chev"></i></button>`;
    body=`<div class="sec">Projection</div><div class="card">
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
