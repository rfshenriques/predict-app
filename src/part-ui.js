const ICON={
  games:'<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3.5"/><path d="M12 5v14M7.5 10.5v3M16.5 10.5v3"/></svg>',
  top:'<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 20v-6M12 20V4M19 20v-10"/></svg>',
  bets:'<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z"/><path d="M14.5 9.5v5"/></svg>',
  formula:'<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M17 5H7l6 7-6 7h10"/></svg>',
  back:'<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>'
};
const TABS=[['games','Games'],['top','Top'],['bets','Bets'],['formula','Formula']];
let nav=DB.get('nav',null);
if(!nav||!TABS.some(t=>t[0]===nav.tab)||!Array.isArray(nav.stack)||nav.stack.some(s=>!SLATE.games.some(g=>g.id===s.id))) nav={tab:'games',stack:[]};
let topPos='', sheet=null;
const cur=()=>nav.stack[nav.stack.length-1]||null;
const isLatest=()=>DAY===SPORT.slates.length-1;
const slateTag=()=>SPORT.league+(isLatest()?' · latest slate':' · past slate');
function pageTitle(){
  const c=cur(); if(c){const g=SLATE.games.find(x=>x.id===c.id);return g.away+' at '+g.home}
  return {games:'Games',top:'Top picks',bets:'Bets',formula:'Formula'}[nav.tab];
}
function head(eyebrow,title,sub){
  return `<header class="lt-wrap"><span class="eyebrow">${eyebrow}</span><h1 class="lt" id="lt">${esc(title)}</h1>${sub?`<span class="sub">${sub}</span>`:''}</header>`;
}
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
function sideHTML(t){
  const top=roster(t).on[0];
  return `<div class="side"><span class="abbr">${t}</span><span class="nm">${SLATE.teams[t].name}<span class="topp">${top?esc(top.name):'No players'}</span></span><span class="big num">${top?f1(top.result):''}</span></div>`;
}
function viewGames(){
  const best=leaders()[0], d0=day(SLATE.games[0].utc);
  return sportPicker()+head(slateTag(),'Games',`${SLATE.games.length} games · ${d0}, your time`)+
  `<div class="sec">My bets</div>`+sumHTML(true)+dayPicker()+
  (best?`<button class="hero" data-do="player" data-t="${best.t}" data-i="${best.i}" aria-label="Top projection: ${esc(best.name)}, ${f1(best.result)} ${SPORT.stat}">
    <span class="hero-k">Top projection</span><span class="hero-n">${esc(best.name)}</span>
    <span class="hero-s">${SLATE.teams[best.t].name} vs ${SLATE.teams[best.opp].name}</span>
    <span class="hero-v num">${f1(best.result)}<small>${SPORT.unit}</small></span></button>`:'')+
  `<div class="sec">Tip-offs</div>`+
  SLATE.games.map(g=>`<button class="card game" data-do="open" data-id="${g.id}" aria-label="${g.away} at ${g.home}, open players">
    <div class="ghead"><span>${day(g.utc)} · ${clock(g.utc)}</span><i class="chev"></i></div>${sideHTML(g.away)}${sideHTML(g.home)}</button>`).join('')+
  `<p class="note">Each game shows its top projected scorer. Tap a game for every player.</p>`;
}
function rowHTML(p,rank,withTeam){
  const pill=!p.playing?`<span class="pill o">${p.status==='D'?'Doubtful':'Out'}</span>`:p.status==='Q'?'<span class="pill q">Questionable</span>':p.status==='D'?'<span class="pill q">Doubtful</span>':'';
  const ed=p.id in edits.min?'<span class="pill e">Edited</span>':'';
  const bt=betsFor(p).length?'<span class="pill e">Bet</span>':'';
  const sub=withTeam?`${p.t} vs ${p.opp} · ${p.pos}`:`${p.pos} · ${f1(p.minutes)} min${p.starter?' · Starter':''}`;
  return `<button class="row ${p.playing?'':'off'}" data-do="player" data-t="${p.t}" data-i="${p.i}">
    <span class="rk num">${rank||''}</span><span class="who"><b>${esc(p.name)}${pill}${ed}${bt}</b><span class="num">${sub}</span></span>
    <span class="proj num">${p.playing?f1(p.result):'–'}</span></button>`;
}
function viewGame(c){
  const g=SLATE.games.find(x=>x.id===c.id), r=roster(c.team);
  return head(SPORT.league+' · '+day(g.utc)+' · '+clock(g.utc),g.away+' at '+g.home,'')+
  `<div class="seg" role="group" aria-label="Team">${[g.away,g.home].map(x=>`<button data-do="team" data-t="${x}" aria-pressed="${x===c.team}">${SLATE.teams[x].name}</button>`).join('')}</div>
  <div class="sec">Projected ${SPORT.stat}</div>
  <div class="card">${r.on.map((p,k)=>rowHTML(p,k+1)).join('')||'<div class="row plain">No players</div>'}</div>
  ${r.off.length?`<div class="sec">Not playing</div><div class="card">${r.off.map(p=>rowHTML(p)).join('')}</div>`:''}
  <p class="note">Tap a player to see the steps, change his minutes or add a bet.</p>`;
}
function viewTop(){
  const list=leaders(topPos).slice(0,25);
  return head(slateTag(),'Top picks',`Highest projections · ${day(SLATE.games[0].utc)}`)+dayPicker()+
  `<div class="seg" role="group" aria-label="Position">${[['','All'],...Object.entries(SPORT.groups).map(([k,g])=>[k,g.label])].map(([k,l])=>`<button data-do="pos" data-p="${k}" aria-pressed="${k===topPos}">${l}</button>`).join('')}</div>
  <div class="card">${list.map((p,k)=>rowHTML(p,k+1,true)).join('')||'<div class="row plain">No players</div>'}</div>`;
}
/* bets */
const BSTAT={open:['op','Open'],won:['w','Won'],lost:['l','Lost'],void:['v','Void']};
function betLine(b){ return `${b.side==='under'?'Under':'Over'}${b.line!=null?' '+b.line:''} ${b.stat}`; }
function betRow(b){
  const pl=betPL(b), st=BSTAT[b.status];
  return `<button class="row nork" data-do="bet" data-id="${b.id}"><span class="who"><b>${esc(b.player)}<span class="pill ${st[0]}">${st[1]}</span></b>
    <span class="num">${b.team} vs ${b.opp} · ${betLine(b)}<br>${money(b.stake)} at ${b.odds.toFixed(2)}</span></span>
    <span class="pl num ${pl>0?'pos':pl<0?'neg':''}">${b.status==='open'?'':signed(pl)}</span></button>`;
}
function viewBets(){
  const open=bets.filter(b=>b.status==='open').sort((a,b)=>b.ts-a.ts), done=bets.filter(b=>b.status!=='open');
  const days=[...new Set(done.map(b=>b.date))].sort().reverse();
  return head('All sports','Bets',bets.length?`${bets.length} bet${bets.length===1?'':'s'} tracked`:'Nothing tracked yet')+sumHTML(false)+
  (bets.length?'':`<div class="card"><div class="row plain"><span class="k">To add a bet: open a game, tap a player, then tap Add a bet.</span></div></div>`)+
  (open.length?`<div class="sec">Open</div><div class="card">${open.map(betRow).join('')}</div>`:'')+
  days.map(d=>{const l=done.filter(b=>b.date===d), s=betStats(l);
    return `<div class="sec">${day(l[0].when)} · <span class="${s.pl>0?'pos':s.pl<0?'neg':''}">${signed(s.pl)}</span></div><div class="card">${l.sort((a,b)=>b.ts-a.ts).map(betRow).join('')}</div>`}).join('')+
  `<button class="btn2" data-do="backup">Back up or restore bets</button>
  <p class="note">Bets are saved on this iPhone only. Amounts are in euros and odds are decimal.</p>`;
}
function stepsHTML(p){
  const rows=p?SPORT.explain(p):SPORT.steps.map(t=>({t}));
  return rows.map((r,k)=>`<div class="step"><span class="n">${k+1}</span><span class="t">${r.t}${r.sub?`<small>${r.sub}</small>`:''}</span>${
    r.stepper!=null?`<span class="stepper"><button data-do="min" data-d="-1" aria-label="One minute less">−</button><b class="num">${r.stepper}</b><button data-do="min" data-d="1" aria-label="One minute more">+</button></span>`
    :r.v!=null?`<span class="v num">${r.v}</span>`:''}</div>`).join('');
}
function viewFormula(){
  const R=(k,v)=>`<div class="row plain"><span class="k">${k}</span><span class="v">${v}</span></div>`, src=SLATE.sources||{};
  return head(SPORT.league+' · how it works','Formula',`${SPORT.steps.length} steps for every player`)+
  `<div class="card steps">${stepsHTML()}</div>
  <div class="sec">Where the numbers come from</div>
  <div class="card">${R('Sport',SPORT.sport+' · '+SPORT.league)}${R('Player stats',src.stats||'–')}${R('Lineups and injuries',src.injuries||'–')}${R('Defense by position',src.defense||'–')}${R('Checked',SLATE.checked)}</div>
  <p class="note">Questionable players may not play. This is a simple estimate, not a guarantee.</p>
  ${hasEdits()?'<button class="btn2" data-do="resetall">Reset my minute changes</button>':''}
  ${STANDALONE?'':'<div class="sec">Install</div><div class="card"><div class="row plain"><span class="k">In Safari, tap Share, then Add to Home Screen.</span></div></div>'}`;
}
/* sheets */
function playerBody(p){
  const mine=betsFor(p);
  return `<div class="card result"><span>Projected ${SPORT.stat}<br>${p.t} vs ${p.opp}</span><b class="num">${p.playing?f1(p.result):'–'}</b></div>
  <div class="card steps">${stepsHTML(p)}</div>
  <div class="card steps"><div class="step"><span class="t" style="font-size:1.0625rem">Playing tonight</span><button class="sw" role="switch" aria-checked="${p.playing}" aria-label="Playing tonight" data-do="play"></button></div></div>
  <div class="card">${mine.map(betRow).join('')}<button class="row nork plain" data-do="addbet"><span class="k tintc">Add a bet</span></button></div>
  ${p.edited?'<button class="btn2" data-do="reset">Reset his minutes and status</button>':''}`;
}
function betBody(){
  const d=sheet.draft, S=(k,opts,val)=>`<div class="seg" role="group">${opts.map(([v,l])=>`<button data-do="${k}" data-v="${v}" aria-pressed="${v===val}">${l}</button>`).join('')}</div>`;
  const F=(id,label,ph)=>`<label class="fld" for="bf-${id}"><span>${label}</span><input id="bf-${id}" inputmode="decimal" autocomplete="off" placeholder="${ph}" value="${esc(d[id])}"></label>`;
  return `<div class="card result small"><span>${esc(d.player)}<br>${d.team} vs ${d.opp} · projected</span><b class="num">${f1(d.proj)}</b></div>
  ${S('bside',[['over','Over'],['under','Under']],d.side)}
  <div class="card">${F('line','Line ('+d.stat+')','Optional')}${F('stake','Stake (€)','10')}${F('odds','Odds','1.85')}</div>
  <div class="sec">Result</div>
  ${S('bstatus',[['open','Open'],['won','Won'],['lost','Lost'],['void','Void']],d.status)}
  ${sheet.id?'<button class="btn2 danger" data-do="betdel">Delete bet</button>':''}`;
}
function backupBody(){
  return `<p class="note">Copy this text and keep it somewhere safe, like Notes. To restore, paste a saved copy here and tap Restore.</p>
  <textarea id="bk" class="ta" spellcheck="false" autocomplete="off" aria-label="Bets backup text">${esc(JSON.stringify(bets))}</textarea>
  <button class="btn2" data-do="bkcopy">Copy</button><button class="btn2" data-do="bkrestore">Restore from this text</button>`;
}
function sheetParts(){
  if(sheet.kind==='player'){ const p=player(sheet.t,sheet.i); return {title:p.name,left:null,right:['Done','close'],body:playerBody(p)}; }
  if(sheet.kind==='bet') return {title:sheet.id?'Edit bet':'New bet',left:['Cancel','betcancel'],right:['Save','betsave'],body:betBody()};
  return {title:'Back up bets',left:null,right:['Done','close'],body:backupBody()};
}
