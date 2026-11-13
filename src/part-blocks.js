/* WEATHER-STYLE BLOCKS
   A section title and the cards after it become one block. While you scroll, the title stays pinned under the
   top bar, the block's content slides up underneath it and is cut off there, and when the block runs out the
   title rides up with it and the block fades. Team blocks in Results (details) work the same way. */
function blockify(root){
  [...root.children].forEach(el=>{
    if(!el.classList||!el.classList.contains('sec')||!el.parentNode) return;
    const parts=[]; let n=el.nextElementSibling;
    while(n&&n.matches('.card,.hs')){ parts.push(n); n=n.nextElementSibling; }
    if(!parts.length) return;
    const s=document.createElement('section'); s.className='sblock';
    el.parentNode.insertBefore(s,el); el.classList.add('sb-h'); s.appendChild(el); parts.forEach(p=>s.appendChild(p));
  });
  root.querySelectorAll('details.tblock').forEach(d=>{ d.classList.add('sblock'); const sm=d.querySelector('summary'); if(sm) sm.classList.add('sb-h'); });
}
let blkRaf=0;
function paintBlocks(){
  blkRaf=0;
  const row=navEl.querySelector('.nav-row'); if(!row) return;
  const line=row.getBoundingClientRect().bottom+4;
  view.querySelectorAll('.sblock').forEach(b=>{
    const h=b.querySelector(':scope > .sb-h'); if(!h) return;
    const r=b.getBoundingClientRect(), hh=h.offsetHeight, d=line-r.top;
    if(d<=0||r.bottom<0){ if(b.dataset.on){ b.style.clipPath=''; b.style.opacity=''; h.style.transform=''; delete b.dataset.on; } return; }
    const shift=Math.max(0,Math.min(d,r.height-hh)), left=r.bottom-line, fadeZone=hh*1.6;
    b.dataset.on='1';
    h.style.transform=`translateY(${shift}px)`;
    b.style.clipPath=`inset(${Math.max(0,d)}px 0 0 0 round 1.375rem)`;
    b.style.opacity=left<fadeZone?Math.max(0,left/fadeZone).toFixed(3):'';
  });
}
const queueBlocks=()=>{ if(!blkRaf) blkRaf=requestAnimationFrame(paintBlocks); };
addEventListener('scroll',queueBlocks,{passive:true});
addEventListener('resize',queueBlocks);
document.addEventListener('toggle',queueBlocks,true);
