const view=$('#view'), navEl=$('#nav'), bar=$('#tabbar'), root=$('#sheet-root'), toastEl=$('#toast');
const REDUCE=()=>{try{return matchMedia('(prefers-reduced-motion:reduce)').matches}catch(e){return false}};
let ltObs=null, pgUntil=0;
function renderAll(){
  const c=cur();
  view.innerHTML=c?viewGame(c):nav.tab==='games'?viewGames():nav.tab==='top'?viewTop():viewFormula();
  navEl.innerHTML=`<div class="nav-bg"></div><div class="nav-row">${c?`<button class="glassbtn" data-do="back" aria-label="Back">${ICON.back}</button>`:'<span class="nb-sp"></span>'}<span class="nav-title" aria-hidden="true">${esc(pageTitle())}</span><span class="nb-sp"></span></div>`;
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
/* tab bar */
bar.style.setProperty('--n',TABS.length);
bar.innerHTML='<span class="tb-ind"></span>'+TABS.map(([k,l])=>`<button data-do="tab" data-tab="${k}">${ICON[k]}<span>${l}</span></button>`).join('');
let lastY=0;
addEventListener('scroll',()=>{
  const y=scrollY;
  if(y<=8) bar.classList.remove('min'); else if(y>lastY+4&&y>12) bar.classList.add('min'); else if(y<lastY-4) bar.classList.remove('min');
  lastY=y;
},{passive:true});
function tapBar(){bar.classList.remove('tap');void bar.offsetWidth;bar.classList.add('tap');setTimeout(()=>bar.classList.remove('tap'),650)}
/* sheet */
let opener=null;
function openSheet(t,i){
  if(sheet) return; sheet={t,i}; opener={t,i};
  root.classList.remove('closing'); root.innerHTML=sheetShell(player(t,i).name,sheetBody());
  document.documentElement.style.setProperty('--sy',(scrollY-view.offsetTop+innerHeight*.3)+'px');
  document.body.classList.add('sheet-open'); view.inert=true; bar.inert=true; navEl.inert=true;
  const d=$('#sh-done'); if(d) d.focus({preventScroll:true});
  bindDrag(root.querySelector('.sheet'));
}
function closeSheet(){
  if(!sheet) return; sheet=null; root.classList.add('closing');
  document.body.classList.remove('sheet-open'); document.documentElement.style.removeProperty('--pscale');
  view.inert=false; bar.inert=false; navEl.inert=false;
  const sc=root.querySelector('.scrim'); if(sc) sc.style.opacity='';
  setTimeout(()=>{ if(!sheet){root.innerHTML='';root.classList.remove('closing')} },REDUCE()?20:300);
  if(opener){const b=view.querySelector(`[data-do="player"][data-t="${opener.t}"][data-i="${opener.i}"]`); if(b) b.focus({preventScroll:true});}
}
function bindDrag(el){
  let y0=null,dy=0,t0=0,h=0; const body=el.querySelector('.sh-body'), sc=root.querySelector('.scrim');
  el.addEventListener('touchstart',e=>{
    if(e.target.closest('button')&&!e.target.closest('.sh-head')) {y0=null;return}
    if(body.contains(e.target)&&body.scrollTop>0){y0=null;return}
    y0=e.touches[0].clientY;dy=0;t0=Date.now();h=el.offsetHeight;el.style.animation='none';el.style.transition='none';
  },{passive:true});
  el.addEventListener('touchmove',e=>{
    if(y0==null) return; dy=e.touches[0].clientY-y0;
    const m=dy>0?dy:dy/6; el.style.transform=`translateY(${m}px)`;
    const pr=Math.max(0,Math.min(1,dy/h));
    document.documentElement.style.setProperty('--pscale',.95+.05*pr); if(sc) sc.style.opacity=1-pr;
    if(dy>0&&e.cancelable) e.preventDefault();
  },{passive:false});
  el.addEventListener('touchend',()=>{
    if(y0==null) return; const v=dy/Math.max(1,Date.now()-t0); y0=null;
    if(dy>h*.28||(v>.5&&dy>24)){
      el.style.transition='transform .3s cubic-bezier(.32,.72,0,1)'; el.style.transform=`translateY(${h+32}px)`;
      sheet=sheet; const s=sheet; sheet=null; document.body.classList.remove('sheet-open'); document.documentElement.style.removeProperty('--pscale');
      view.inert=false; bar.inert=false; navEl.inert=false; if(sc){sc.style.transition='opacity .3s';sc.style.opacity=0}
      setTimeout(()=>{ if(!sheet) root.innerHTML='' },300);
    }else{
      el.style.transition='transform .42s cubic-bezier(.2,.9,.3,1)'; el.style.transform='';
      document.documentElement.style.removeProperty('--pscale'); if(sc) sc.style.opacity='';
    }
  });
}
/* toast */
let toastT=0, undo=null;
function toast(msg,undoFn){
  undo=undoFn||null; toastEl.innerHTML=`<span>${esc(msg)}</span>${undo?'<button data-do="undo">Undo</button>':''}`;
  toastEl.classList.add('on'); clearTimeout(toastT); toastT=setTimeout(()=>toastEl.classList.remove('on'),4000);
}
function refresh(){ const y=scrollY; renderAll(); scrollTo(0,y); if(sheet){const b=$('#sh-body'); if(b) b.innerHTML=sheetBody();} }
/* events */
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-do]'); if(!b) return; const d=b.dataset;
  switch(d.do){
    case 'tab':
      tapBar();
      if(d.tab===nav.tab&&!cur()){ scrollTo({top:0,behavior:REDUCE()?'auto':'smooth'}); break; }
      nav.tab=d.tab; nav.stack=[]; nav.y=0; renderAll(); scrollTo(0,0); break;
    case 'open': push({v:'game',id:d.id,team:SLATE.games.find(g=>g.id===d.id).away}); break;
    case 'back': pop(); break;
    case 'team': cur().team=d.t; refresh(); break;
    case 'pos': topPos=d.p; refresh(); break;
    case 'sport': setSport(d.s); topPos=''; nav={tab:'games',stack:[]}; renderAll(); scrollTo(0,0); break;
    case 'player': openSheet(d.t,+d.i); break;
    case 'close': closeSheet(); break;
    case 'undo': if(undo){undo();undo=null;toastEl.classList.remove('on')} break;
    case 'resetall': { const old=JSON.parse(JSON.stringify(edits)); edits={min:{},play:{}}; DB.set('edits',edits); refresh();
      toast('Changes reset',()=>{edits=old;DB.set('edits',edits);refresh()}); break; }
    default: if(sheet){
      const p=player(sheet.t,sheet.i);
      if(d.do==='min') edits.min[p.id]=Math.max(0,Math.min(48,Math.round(p.minutes+(+d.d))));
      if(d.do==='play') edits.play[p.id]=!p.playing;
      if(d.do==='reset'){delete edits.min[p.id];delete edits.play[p.id]}
      DB.set('edits',edits); refresh();
    }
  }
});
document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&sheet) closeSheet(); });
SPORT.load().then(s=>{ SLATE=s; renderAll(); scrollTo(0,0); });
if('serviceWorker' in navigator && location.protocol==='https:'){ try{navigator.serviceWorker.register('sw.js').catch(()=>{})}catch(e){} }
