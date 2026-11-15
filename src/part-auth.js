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
