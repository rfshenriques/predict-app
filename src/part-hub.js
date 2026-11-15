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
  const items=ms.flatMap(x=>[{x,stat:'goals',v:G(x),score:G(x)/ag},...(C(x)?[{x,stat:'corners',v:C(x),score:C(x)/ac}]:[])]);
  const used=new Set();
  return items.sort((a,b)=>b.score-a.score).filter(i=>{ const k=i.x.g.id+i.stat; if(used.has(k)) return false; used.add(k); return true; }).slice(0,n).map(({x,stat,v,score})=>{ const g=x.g;
    return {utc:g.utc,score,html:`<button class="pc fbpc" style="${tstyle(g.home)}" data-sport="${SPORT.id}" data-day="${DAY}" data-do="open" data-id="${g.id}" data-fb="${stat}" aria-label="${matchTitle(g)}, ${v.toFixed(1)} ${stat} expected">${label?`<span class="pcl">${SPORT.league}</span>`:''}<span class="pct">${tile(g.home,'sm')}${tile(g.away,'sm')}</span><b>${g.home} v ${g.away}</b><span class="pcv num">${v.toFixed(1)}</span><span class="pcs">${stat} expected · ${day(g.utc).split(' ')[0]} ${clock(g.utc)}</span></button>`}; });
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
