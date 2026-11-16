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
