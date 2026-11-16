/* GATE: runs before the app. Signs people in, shows the plans, then loads the data and the app. */
(()=>{
const G=document.getElementById('gate'), LS=k=>{try{return JSON.parse(localStorage.getItem('propline:'+k))}catch(e){return null}}, SS=(k,v)=>{try{localStorage.setItem('propline:'+k,JSON.stringify(v))}catch(e){}};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const LOCAL=location.protocol==='file:';
async function api(path,body){
  const r=await fetch('/api/'+path,{method:body?'POST':'GET',credentials:'same-origin',headers:body?{'content-type':'application/json'}:{},body:body?JSON.stringify(body):undefined});
  const j=await r.json().catch(()=>({})); if(!r.ok){ const e=new Error(j.error||'Something went wrong'); e.status=r.status; throw e; } return j;
}
window.PLAPI=api;
const FEAT={
  starter:['Top picks every day, all sports','Track your bets, synced to your account'],
  plus:['Everything in Starter','Every player and every game','Goals and over/under lines','Results: projected vs scored'],
  pro:['Everything in Plus','Corners and correct-score grid','How each projection is worked out','Share pictures of your bets']};
function load(src){ return new Promise((ok,no)=>{ const s=document.createElement('script'); s.src=src; s.async=false; s.onload=ok; s.onerror=no; document.body.appendChild(s); }); }
function busy(b,on){ if(!b) return; b.disabled=on; b.style.opacity=on?.55:''; }
function msg(t){ const m=G.querySelector('.g-msg'); if(m){ m.textContent=t||''; m.hidden=!t; } }
let mode=LS('gmode')||'new';
function authView(){
  G.hidden=false; document.body.classList.add('gated');
  G.innerHTML=`<div class="g-wrap"><img class="g-logo" src="apple-touch-icon.png" alt=""><h1>Propline</h1><p class="g-sub">Projections for tonight's games, sport by sport.</p>
  <div class="seg" role="group" aria-label="Account"><button data-g="mode" data-v="new" aria-pressed="${mode==='new'}">Create account</button><button data-g="mode" data-v="in" aria-pressed="${mode==='in'}">Sign in</button></div>
  <form class="card g-form" novalidate>
    <label class="g-f"><span>Email</span><input id="g-email" type="email" autocomplete="email" inputmode="email" autocapitalize="off" spellcheck="false" placeholder="you@example.com" required></label>
    <label class="g-f"><span>Password</span><input id="g-pw" type="password" autocomplete="${mode==='new'?'new-password':'current-password'}" placeholder="${mode==='new'?'At least 8 characters':'Your password'}" required minlength="8"></label>
  </form>
  <p class="g-msg" role="alert" hidden></p>
  <button class="btn" data-g="auth">${mode==='new'?'Create account':'Sign in'}</button>
  <p class="note">Your bets are saved to your account, so they follow you to any device.</p></div>`;
}
function plansView(me){
  G.hidden=false; document.body.classList.add('gated');
  const P=me.plans, cur=me.tier;
  G.innerHTML=`<div class="g-wrap"><img class="g-logo sm" src="apple-touch-icon.png" alt=""><h1>${cur?'Change plan':'Choose a plan'}</h1>
  <p class="g-sub">${me.owner?'You own Propline, so you can switch plans for free to see each one.':'Monthly. Cancel any time.'}</p>
  ${['starter','plus','pro'].map(k=>`<div class="card g-plan${k==='plus'?' pop':''}${k===cur?' on':''}"><div class="g-ph"><b>${P[k].name}</b>${k==='plus'?'<span class="pill w">Most picked</span>':''}<span class="g-pr num">€${(P[k].price/100).toFixed(2)}<small>/month</small></span></div>
    <ul>${FEAT[k].map(f=>`<li>${f}</li>`).join('')}</ul>
    <button class="${k==='plus'?'btn':'btn2'}" data-g="plan" data-v="${k}" ${k===cur?'disabled':''}>${k===cur?'Your plan':me.owner?'Switch to '+P[k].name:'Choose '+P[k].name}</button></div>`).join('')}
  <p class="g-msg" role="alert" hidden></p>
  ${me.test&&!me.owner?'<p class="note">Test mode: pay with card 4242 4242 4242 4242, any future date, any CVC.</p>':''}
  <div class="g-links">${cur?'<button class="link" data-g="close">Not now</button>':''}<button class="link" data-g="out">Sign out ${esc(me.email)}</button></div></div>`;
  G.scrollTop=0; scrollTo(0,0);
}
function checkoutView(me,k){
  const P=me.plans[k], price='€'+(P.price/100).toFixed(2);
  G.innerHTML=`<div class="g-wrap"><img class="g-logo sm" src="apple-touch-icon.png" alt=""><h1>Checkout</h1><p class="g-sub">Simulated payment. No card is needed and nothing is charged.</p>
  <div class="card g-plan"><div class="g-ph"><b>Propline ${P.name}</b><span class="g-pr num">${price}<small>/month</small></span></div><ul>${FEAT[k].map(f=>`<li>${f}</li>`).join('')}</ul></div>
  <div class="card g-sum"><div class="row"><span>Billed monthly</span><b class="num">${price}</b></div><div class="row"><span>Due today</span><b class="num">€0.00</b></div></div>
  <p class="g-msg" role="alert" hidden></p>
  <button class="btn" data-g="pay" data-v="${k}">Confirm and subscribe</button>
  <div class="g-links"><button class="link" data-g="back">Back to plans</button></div></div>`;
  scrollTo(0,0);
}
window.showPlans=me=>plansView(me||window.ME);
async function start(me){
  window.ME=me; SS('me',me);
  if(!me.tier){ plansView(me); return; }
  G.hidden=true; G.innerHTML=''; document.body.classList.remove('gated');
  if(window.APP_LOADED) return location.reload();
  try{ await load('/api/data.js'); }catch(e){}
  if(window.LOCKED){ plansView(me); return; }
  await load('app.js'); window.APP_LOADED=true;
}
G.addEventListener('click',async e=>{
  const b=e.target.closest('[data-g]'); if(!b) return; const v=b.dataset.v;
  if(b.dataset.g==='mode'){ mode=v; SS('gmode',v); authView(); return; }
  if(b.dataset.g==='close'){ G.hidden=true; document.body.classList.remove('gated'); return; }
  if(b.dataset.g==='out'){ try{ await api('logout',{}); }catch(e){} SS('me',null); location.replace('/'); return; }
  if(b.dataset.g==='auth'){
    const email=G.querySelector('#g-email').value.trim(), password=G.querySelector('#g-pw').value;
    if(!email||!password) return msg('Type your email and password');
    busy(b,true); msg('');
    try{ await start(await api(mode==='new'?'register':'login',{email,password})); }catch(err){ msg(err.message); busy(b,false); }
    return;
  }
  if(b.dataset.g==='plan'&&!window.ME?.owner&&!window.ME?.payments){ checkoutView(window.ME,v); return; }
  if(b.dataset.g==='back'){ plansView(window.ME); return; }
  if(b.dataset.g==='plan'||b.dataset.g==='pay'){
    busy(b,true); msg('');
    try{ const r=await api('checkout',{tier:v});
      if(r.url){ location.href=r.url; return; }
      await start(await api('me')); }
    catch(err){ msg(err.message); busy(b,false); }
  }
});
G.addEventListener('submit',e=>{ e.preventDefault(); G.querySelector('[data-g="auth"]').click(); });
G.addEventListener('keydown',e=>{ if(e.key==='Enter'&&e.target.id==='g-pw'){ e.preventDefault(); G.querySelector('[data-g="auth"]').click(); } });
(async()=>{
  if(LOCAL){ window.ME={email:'local@test',tier:'pro',owner:true,plans:{}}; for(const s of (window.LOCAL_SCRIPTS||[])) await load(s); return; }
  const q=new URLSearchParams(location.search);
  if(q.get('checkout')){ history.replaceState(null,'',location.pathname); }
  let me=null;
  try{
    if(q.get('checkout')==='done'&&q.get('session_id')) me=await api('checkout-verify',{session_id:q.get('session_id')});
    else me=await api('me');
  }catch(e){
    if(e.status===401){ SS('me',null); return authView(); }
    me=LS('me');                                  // offline: use the last known account
    if(!me) return authView();
  }
  start(me);
})();
})();
