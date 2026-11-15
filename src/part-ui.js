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
