const ICON={
  home:'<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11l8-7 8 7"/><path d="M6 10v9h12v-9"/></svg>',
  players:'<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.8-3.6 3.5-5.5 7-5.5s6.200 1.900 7 5.500"/></svg>',
  bets:'<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z"/><path d="M14.5 9.500v5"/></svg>',
  results:'<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8 12.500l2.800 2.800L16 9.500"/></svg>',
  back:'<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
  addbet:'<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></svg>',
  info:'<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5.500M12 7.600v.1"/></svg>'
};
/* filled versions, shown on the selected tab */
const ICONF={
  home:'<svg class="ic f" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2 3.3 10.8a1 1 0 0 0 .7 1.7H5V19a1.5 1.5 0 0 0 1.5 1.5h3.5v-5h4v5h3.5A1.5 1.5 0 0 0 19 19v-6.5h1a1 1 0 0 0 .7-1.7z"/></svg>',
  players:'<svg class="ic f" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="7.8" r="4.2"/><path d="M3.8 20.2c.6-4.400 3.900-6.900 8.200-6.900s7.600 2.500 8.200 6.900a.9.9 0 0 1-.9 1H4.700a.9.9 0 0 1-.9-1z"/></svg>',
  bets:'<svg class="ic f" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M6 5h12a3 3 0 0 1 3 3v2.200a.8.8 0 0 1-.6.8 1.900 1.900 0 0 0 0 2 .8.8 0 0 1 .6.8V16a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-2.200a.8.8 0 0 1 .6-.8 1.900 1.900 0 0 0 0-2 .8.8 0 0 1-.6-.8V8a3 3 0 0 1 3-3zm7.700 4.200v5.600h1.600V9.200z"/></svg>',
  results:'<svg class="ic f" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M12 2.500a9.500 9.500 0 1 1 0 19 9.500 9.500 0 0 1 0-19zm4.600 6.300a1 1 0 0 0-1.400.1l-4.300 5-2.100-2.100a1 1 0 0 0-1.400 1.400l2.900 2.900a1 1 0 0 0 1.500-.1l5-5.800a1 1 0 0 0-.2-1.400z"/></svg>'
};
const TABS=[['home','Home'],['players','Players'],['bets','Bets'],['results','Results']];
let nav=DB.get('nav',null);
if(!nav||!TABS.some(t=>t[0]===nav.tab)||!Array.isArray(nav.stack)||nav.stack.some(s=>!SLATE.games.some(g=>g.id===s.id))) nav={tab:'home',stack:[]};
let topPos='', pq='', resGame=null, sheet=null;
const cur=()=>nav.stack[nav.stack.length-1]||null;
const isLatest=()=>DAY===SPORT.slates.length-1;
const slateDay=()=>day(SLATE.games[0].utc);
function pageTitle(){
  const c=cur(); if(c){const g=SLATE.games.find(x=>x.id===c.id);return g.away+' at '+g.home}
  return {home:slateDay(),players:'Players',bets:'Bets',results:'Results'}[nav.tab];
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
  return `<div class="chips" role="group" aria-label="Day">${SPORT.slates.map((s,i)=>[s,i]).reverse().map(([s,i])=>
    `<button class="chip" data-do="day" data-i="${i}" aria-pressed="${i===DAY}">${day(s.games[0].utc)}</button>`).join('')}</div>`;
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
  return `<button class="card game" data-do="open" data-id="${g.id}" aria-label="${g.away} at ${g.home}, open game">
    <div class="ghead"><span>${f?'Final':clock(g.utc)}</span><span class="gh-r">Moneyline<i class="chev"></i></span></div>${side(g.away,'away')}${side(g.home,'home')}</button>`;
}
function viewHome(){
  const top=leaders().slice(0,6);
  return sportPicker()+head(`${SPORT.league} · ${SLATE.games.length} games`,slateDay(),isLatest()?'Latest slate · times in your time zone':'Past slate')+dayPicker()+
  `<div class="sec">My bets</div>`+sumHTML(true)+
  `<div class="sec row-sec"><span>Top projections</span><button class="link" data-do="gotab" data-tab="players">All players</button></div>
  <div class="hs">${top.map(p=>`<button class="pc" style="${tstyle(p.t)}" data-do="player" data-t="${p.t}" data-i="${p.i}" aria-label="${esc(p.name)}, ${f1(p.result)} ${SPORT.stat}">${p===top[0]?billy('peek'):''}${tile(p.t,'sm')}<b>${esc(sn(p.name))}</b><span class="pcv num">${f1(p.result)}</span><span class="pcs">vs ${p.opp}</span></button>`).join('')}</div>
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
  const id=b.sport+':'+b.date+':'+b.team+':'+b.player;
  if(id in acts) return acts[id];
  return s.actual&&s.actual[b.team]&&b.player in s.actual[b.team]?s.actual[b.team][b.player]:null;
}
function betRow(b){
  const pl=betPL(b), st=BSTAT[b.status], ret=b.stake*b.odds, a=betActual(b);
  const hit=a==null||b.line==null?'':(a===b.line?'':((a>b.line)===(b.side!=='under')?'pos':'neg'));
  const C=(k,v,cls)=>`<span class="bs"><span class="tk">${k}</span><b class="num ${cls||''}">${v}</b></span>`;
  return `<button class="bet" data-do="bet" data-id="${b.id}">
    <span class="bt-top"><b>${esc(sn(b.player))}</b><span class="pill ${st[0]}">${st[1]}</span></span>
    <span class="bt-mid">${tile(b.team,'sm')}<span>vs ${b.opp} · ${b.side==='under'?'Under':'Over'} ${b.stat}</span></span>
    <span class="bt-stats">${C('Line',b.line!=null?b.line:'–')}${C('Projected',b.proj!=null?f1(b.proj):'–','tintc')}${C('Scored',a!=null?a:'–',hit)}</span>
    <span class="bt-row num"><span>${money(b.stake)} at ${b.odds.toFixed(2)}</span>
      <span class="${b.status==='open'?'':pl>0?'pos':pl<0?'neg':''}">${b.status==='open'?'Returns '+money(ret):signed(pl)}</span></span></button>`;
}
/* totals for a group of bets: stake, what it pays back if every bet wins, and the profit in that case */
function totalsHTML(list,showPL){
  const st=list.reduce((s,b)=>s+b.stake,0), ret=list.reduce((s,b)=>s+b.stake*b.odds,0), s=betStats(list);
  const C=(k,v,cls)=>`<span><span class="tk">${k}</span><b class="num ${cls||''}">${v}</b></span>`;
  // all settled: just stake and P/L; anything still open: stake, return and profit if every open bet wins
  return s.open===0&&showPL?`<div class="tot">${C('Staked',money(st))}${C('P/L',signed(s.pl),s.pl>0.004?'pos':s.pl<-0.004?'neg':'')}</div>`
    :`<div class="tot">${C('Staked',money(st))}${C('Return',money(ret))}${C('Profit',money(ret-st))}</div>`;
}
function viewBets(){
  const open=bets.filter(b=>b.status==='open').sort((a,b)=>b.ts-a.ts), done=bets.filter(b=>b.status!=='open');
  const days=[...new Set(done.map(b=>b.date))].sort().reverse();
  return head('All sports','Bets',bets.length?`${bets.length} bet${bets.length===1?'':'s'} tracked`:'Nothing tracked yet')+sumHTML(false)+
  (bets.length?'':`<div class="empty">${billy('chew','Billy the goat')}<b>No bets yet</b><span>Tap the plus next to any player to track a bet. Billy keeps the score.</span></div>`)+
  (open.length?`<div class="sec">Open · ${open.length}</div><div class="card glist">${totalsHTML(open,false)}${open.map(betRow).join('')}</div>`:'')+
  days.map(d=>{const l=done.filter(b=>b.date===d);
    return `<div class="sec">${day(l[0].when)} · ${l.length} settled</div><div class="card glist">${totalsHTML(l,true)}${l.sort((a,b)=>b.ts-a.ts).map(betRow).join('')}</div>`}).join('')+
  `<button class="btn2" data-do="backup">Back up or restore bets</button>
  <p class="note">Bets are saved on this iPhone only. Amounts are in euros and odds are decimal. For open bets, Return is stake × odds if they win and Profit is that minus the stake.</p>`;
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
  <div class="card steps">${stepsHTML(p)}</div>
  <div class="card"><div class="fld"><span>Playing tonight</span><button class="sw" role="switch" aria-checked="${p.playing}" aria-label="Playing tonight" data-do="play"></button></div>
    <label class="fld" for="sh-act"><span>Real ${SPORT.stat} scored <span class="gapc" data-gap="${p.t}-${p.i}">${gapPill(p)}</span></span><input id="sh-act" data-in="act" data-t="${p.t}" data-i="${p.i}" inputmode="numeric" autocomplete="off" placeholder="After the game" value="${a==null?'':a}"></label></div>
  <div class="card glist">${mine.map(betRow).join('')}<button class="row nork plain" data-do="addbet"><span class="k tintc">Add a bet</span></button></div>
  ${p.edited?'<button class="btn2" data-do="reset">Reset his minutes and status</button>':''}`;
}
function betHint(d){
  if(d.line===''||num(d.line)==null) return '';
  const sl=SPORT.slates.find(s=>s.date===d.date); if(!sl||d.sport!==SPORT.id) return '';
  const idx=(sl.teams[d.team]||{players:[]}).players.findIndex(r=>r[0]===d.player); if(idx<0) return '';
  const id=SPORT.id+':'+d.date+':'+d.team+':'+d.player, a=id in acts?acts[id]:(sl.actual&&sl.actual[d.team]&&d.player in sl.actual[d.team]?sl.actual[d.team][d.player]:null);
  if(a==null) return ''; const L=num(d.line), over=d.side!=='under';
  const res=a===L?'the same as the line, which is usually void':((a>L)===over?'so this bet won':'so this bet lost');
  return `<p class="note">He scored ${a}, ${res}.</p>`;
}
function betBody(){
  const d=sheet.draft, S=(k,opts,val)=>`<div class="seg" role="group">${opts.map(([v,l])=>`<button data-do="${k}" data-v="${v}" aria-pressed="${v===val}">${l}</button>`).join('')}</div>`;
  const F=(id,label,ph)=>`<label class="fld" for="bf-${id}"><span>${label}</span><input id="bf-${id}" inputmode="decimal" autocomplete="off" placeholder="${ph}" value="${esc(d[id])}"></label>`;
  const FS=(id,label,ph,what)=>`<div class="fld"><label for="bf-${id}">${label}</label><span class="stepper"><button data-do="bstep" data-f="${id}" data-d="-1" aria-label="Lower the ${what}">−</button><input id="bf-${id}" class="stin" inputmode="decimal" autocomplete="off" placeholder="${ph}" value="${esc(d[id])}"><button data-do="bstep" data-f="${id}" data-d="1" aria-label="Raise the ${what}">+</button></span></div>`;
  return `<div class="card result small"><span>${esc(d.player)}<br>${d.team} vs ${d.opp} · projected</span><b class="num">${f1(d.proj)}</b></div>
  ${S('bside',[['over','Over'],['under','Under']],d.side)}
  <div class="card">${FS('line','Line ('+d.stat+')','–','line')}${FS('odds','Odds','–','odds')}${F('stake','Stake (€)','10')}</div>
  <div class="sec">Result</div>
  ${S('bstatus',[['open','Open'],['won','Won'],['lost','Lost'],['void','Void']],d.status)}<div id="bhint">${betHint(d)}</div>
  ${sheet.id?'<button class="btn2 danger" data-do="betdel">Delete bet</button>':''}`;
}
function backupBody(){
  return `<p class="note">Copy this text and keep it somewhere safe, like Notes. To restore, paste a saved copy here and tap Restore.</p>
  <textarea id="bk" class="ta" spellcheck="false" autocomplete="off" aria-label="Bets backup text">${esc(JSON.stringify(bets))}</textarea>
  <button class="btn2" data-do="bkcopy">Copy</button><button class="btn2" data-do="bkrestore">Restore from this text</button>`;
}
function infoBody(){
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
  if(sheet.kind==='info') return {title:'How it works',left:null,right:['Done','close'],body:infoBody()};
  return {title:'Back up bets',left:null,right:['Done','close'],body:backupBody()};
}
