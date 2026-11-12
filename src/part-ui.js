const ICON={
  games:'<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3.5"/><path d="M12 5v14M7.5 10.5v3M16.5 10.5v3"/></svg>',
  top:'<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 20v-6M12 20V4M19 20v-10"/></svg>',
  formula:'<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M17 5H7l6 7-6 7h10"/></svg>',
  back:'<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>'
};
const TABS=[['games','Games'],['top','Top'],['formula','Formula']];
let nav=DB.get('nav',null);
if(!nav||!TABS.some(t=>t[0]===nav.tab)||!Array.isArray(nav.stack)||nav.stack.some(s=>!SLATE.games.some(g=>g.id===s.id))) nav={tab:'games',stack:[]};
let topPos=''; let sheet=null;
const cur=()=>nav.stack[nav.stack.length-1]||null;
function pageTitle(){
  const c=cur(); if(c){const g=SLATE.games.find(x=>x.id===c.id);return g.away+' at '+g.home}
  return {games:'Games',top:'Top picks',formula:'Formula'}[nav.tab];
}
function head(eyebrow,title,sub){
  return `<header class="lt-wrap"><span class="eyebrow">${eyebrow}</span><h1 class="lt" id="lt">${esc(title)}</h1>${sub?`<span class="sub">${sub}</span>`:''}</header>`;
}
function sideHTML(t){
  const top=roster(t).on[0];
  return `<div class="side"><span class="abbr">${t}</span><span class="nm">${SLATE.teams[t].name}<span class="topp">${top?esc(top.name):'No players'}</span></span><span class="big num">${top?f1(top.result):''}</span></div>`;
}
function viewGames(){
  const best=leaders()[0], d0=day(SLATE.games[0].utc);
  return sportPicker()+head(SPORT.league+' · next slate','Games',`${SLATE.games.length} games · ${d0}, your time`)+
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
  const pill=p.status==='Q'&&p.playing?'<span class="pill q">Questionable</span>':(!p.playing?'<span class="pill o">Out</span>':'');
  const ed=p.id in edits.min?'<span class="pill e">Edited</span>':'';
  const sub=withTeam?`${p.t} vs ${p.opp} · ${p.pos}`:`${p.pos} · ${f1(p.minutes)} min`;
  return `<button class="row ${p.playing?'':'off'}" data-do="player" data-t="${p.t}" data-i="${p.i}">
    <span class="rk num">${rank||''}</span><span class="who"><b>${esc(p.name)}${pill}${ed}</b><span class="num">${sub}</span></span>
    <span class="proj num">${p.playing?f1(p.result):'–'}</span></button>`;
}
function viewGame(c){
  const g=SLATE.games.find(x=>x.id===c.id), r=roster(c.team);
  return head(SPORT.league+' · '+day(g.utc)+' · '+clock(g.utc),g.away+' at '+g.home,'')+
  `<div class="seg" role="group" aria-label="Team">${[g.away,g.home].map(x=>`<button data-do="team" data-t="${x}" aria-pressed="${x===c.team}">${SLATE.teams[x].name}</button>`).join('')}</div>
  <div class="sec">Projected ${SPORT.stat}</div>
  <div class="card">${r.on.map((p,k)=>rowHTML(p,k+1)).join('')||'<div class="row plain">No players</div>'}</div>
  ${r.off.length?`<div class="sec">Not playing</div><div class="card">${r.off.map(p=>rowHTML(p)).join('')}</div>`:''}
  <p class="note">Tap a player to see the 5 steps and change his minutes.</p>`;
}
function viewTop(){
  const list=leaders(topPos).slice(0,25);
  return head(SPORT.league+' · next slate','Top picks','Highest projections across all games')+
  `<div class="seg" role="group" aria-label="Position">${[['','All'],...Object.entries(SPORT.groups).map(([k,g])=>[k,g.label])].map(([k,l])=>`<button data-do="pos" data-p="${k}" aria-pressed="${k===topPos}">${l}</button>`).join('')}</div>
  <div class="card">${list.map((p,k)=>rowHTML(p,k+1,true)).join('')||'<div class="row plain">No players</div>'}</div>`;
}
function stepsHTML(p){
  const rows=p?SPORT.explain(p):SPORT.steps.map(t=>({t}));
  return rows.map((r,k)=>`<div class="step"><span class="n">${k+1}</span><span class="t">${r.t}${r.sub?`<small>${r.sub}</small>`:''}</span>${
    r.stepper!=null?`<span class="stepper"><button data-do="min" data-d="-1" aria-label="One minute less">−</button><b class="num">${r.stepper}</b><button data-do="min" data-d="1" aria-label="One minute more">+</button></span>`
    :r.v!=null?`<span class="v num">${r.v}</span>`:''}</div>`).join('');
}
function sportPicker(){
  if(SPORT_ORDER.length<2) return '';
  return `<div class="seg" role="group" aria-label="Sport">${SPORT_ORDER.map(id=>`<button data-do="sport" data-s="${id}" aria-pressed="${id===SPORT.id}">${SPORTS[id].league}</button>`).join('')}</div>`;
}
function viewFormula(){
  const R=(k,v)=>`<div class="row plain"><span class="k">${k}</span><span class="v">${v}</span></div>`;
  return head(SPORT.league+' · how it works','Formula',`${SPORT.steps.length} steps for every player`)+
  `<div class="card steps">${stepsHTML()}</div>
  <div class="sec">Where the numbers come from</div>
  <div class="card">${R('Sport',SPORT.sport+' · '+SPORT.league)}${R('Player stats','ESPN')}${R('Injuries','ESPN')}${R('Defense by position','Hashtag Basketball')}${R('Checked',SLATE.checked)}</div>
  <p class="note">Questionable players may not play. This is a simple estimate, not a guarantee.</p>
  ${hasEdits()?'<button class="btn2" data-do="resetall">Reset my changes</button>':''}
  ${STANDALONE?'':'<div class="sec">Install</div><div class="card"><div class="row plain"><span class="k">In Safari, tap Share, then Add to Home Screen.</span></div></div>'}`;
}
function sheetBody(){
  const p=player(sheet.t,sheet.i);
  return `<div class="card result"><span>Projected ${SPORT.stat}<br>${p.t} vs ${p.opp}</span><b class="num">${p.playing?f1(p.result):'–'}</b></div>
  <div class="card steps">${stepsHTML(p)}</div>
  <div class="card steps"><div class="step"><span class="t" style="font-size:1.0625rem">Playing tonight</span><button class="sw" role="switch" aria-checked="${p.playing}" aria-label="Playing tonight" data-do="play"></button></div></div>
  ${p.edited?'<button class="btn2" data-do="reset">Reset his minutes and status</button>':''}`;
}
function sheetShell(title,body){
  return `<div class="scrim" data-do="close"></div><div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(title)}">
  <div class="grab"></div><div class="sh-head"><span class="sp"></span><h2>${esc(title)}</h2><button data-do="close" id="sh-done">Done</button></div>
  <div class="sh-body" id="sh-body">${body}</div></div>`;
}
