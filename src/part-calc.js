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
