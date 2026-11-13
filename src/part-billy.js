/* BILLY, the GOAT. One drawing, many moods: the classes on the wrapper decide which eyes and mouth show. */
const BILLY_DEFS='<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>'+
 '<linearGradient id="bhorn" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFDC5C"/><stop offset=".55" stop-color="#FEC40B"/><stop offset="1" stop-color="#D99500"/></linearGradient>'+
 '<linearGradient id="bface" x1=".2" y1="0" x2=".8" y2="1"><stop offset="0" stop-color="#FFF8EA"/><stop offset=".5" stop-color="#FDEFD6"/><stop offset="1" stop-color="#EFD3A4"/></linearGradient>'+
 '<linearGradient id="bmuz" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F5DDB5"/><stop offset="1" stop-color="#E3BF89"/></linearGradient>'+
 '<linearGradient id="bbeard" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF6E6"/><stop offset="1" stop-color="#E6C796"/></linearGradient>'+
 '<clipPath id="bhead"><path d="M128 76C162 76 176 100 172 130C168 162 152 200 128 208C104 200 88 162 84 130C80 100 94 76 128 76Z"/></clipPath>'+
 '</defs></svg>';
function billy(cls,label){
  return `<span class="billy ${cls||''}" ${label?`role="img" aria-label="${label}"`:'aria-hidden="true"'}><svg viewBox="40 26 176 216">
  <g class="b-horns"><path d="M108 86C98 50 74 36 56 50C48 57 50 68 58 70M148 86C158 50 182 36 200 50C208 57 206 68 198 70" fill="none" stroke="#B47A00" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>
   <path d="M106 84C96 50 74 38 57 50C50 56 51 65 57 67M150 84C160 50 182 38 199 50C206 56 205 65 199 67" fill="none" stroke="url(#bhorn)" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
   <path d="M94 62l9-4M84 50l6-7M70 44l1-8M168 58l-9-4M174 48l-6-7M188 44l-1-8" stroke="#C88A00" stroke-width="3.5" stroke-linecap="round"/></g>
  <g class="b-earL"><ellipse cx="72" cy="128" rx="31" ry="13" transform="rotate(24 72 128)" fill="#E6C694"/><ellipse cx="72" cy="125" rx="30" ry="12" transform="rotate(24 72 125)" fill="#FDEFD6"/><ellipse cx="76" cy="127" rx="19" ry="5.5" transform="rotate(24 76 127)" fill="#E2B386"/></g>
  <g class="b-earR"><ellipse cx="184" cy="128" rx="31" ry="13" transform="rotate(-24 184 128)" fill="#E0BD88"/><ellipse cx="184" cy="125" rx="30" ry="12" transform="rotate(-24 184 125)" fill="#F4E0BD"/><ellipse cx="180" cy="127" rx="19" ry="5.5" transform="rotate(-24 180 127)" fill="#D9A777"/></g>
  <g class="b-jaw"><path d="M106 192Q112 226 128 240Q144 226 150 192Z" fill="url(#bbeard)"/><path d="M128 206Q130 222 128 232M118 204Q120 218 124 228M138 204Q137 218 133 228" fill="none" stroke="#D9B47E" stroke-width="2.5" stroke-linecap="round"/></g>
  <path d="M128 76C162 76 176 100 172 130C168 162 152 200 128 208C104 200 88 162 84 130C80 100 94 76 128 76Z" fill="url(#bface)"/>
  <g clip-path="url(#bhead)"><path d="M150 70C186 96 182 170 128 214L200 214L200 70Z" fill="#E7C796" opacity=".55"/><ellipse cx="110" cy="96" rx="22" ry="12" transform="rotate(-18 110 96)" fill="#FFFBF3" opacity=".9"/></g>
  <path d="M112 84Q118 66 128 76Q134 62 144 82Q134 78 128 86Q120 78 112 84Z" fill="#FFF6E4"/>
  <g class="b-brows"><path d="M92 116L118 122M164 115L139 122" stroke="#5C0D1F" stroke-width="6.5" stroke-linecap="round"/></g>
  <g class="b-sadbrows"><path d="M94 124L118 116M162 124L138 116" stroke="#5C0D1F" stroke-width="6.5" stroke-linecap="round"/></g>
  <g class="b-eyeL"><ellipse cx="106" cy="139" rx="14" ry="14" fill="#EBCF9F"/><circle cx="106" cy="138" r="11.5" fill="#3A0A14"/><circle cx="106" cy="141" r="6" fill="#5C0D1F"/><circle cx="110" cy="133.5" r="4" fill="#FFFBF3"/></g>
  <g class="b-eyeR"><ellipse cx="151" cy="139" rx="14" ry="14" fill="#E3C391"/><circle cx="151" cy="138" r="11.5" fill="#3A0A14"/><circle cx="151" cy="141" r="6" fill="#5C0D1F"/><circle cx="155" cy="133.5" r="4" fill="#FFFBF3"/></g>
  <g class="b-wink"><path d="M139 140Q151 129 163 140" fill="none" stroke="#3A0A14" stroke-width="7" stroke-linecap="round"/><path d="M163 140l5 3" stroke="#3A0A14" stroke-width="4" stroke-linecap="round"/></g>
  <g class="b-sadeyes"><path d="M96 142Q106 136 116 142M141 142Q151 136 161 142" fill="none" stroke="#3A0A14" stroke-width="6" stroke-linecap="round"/></g>
  <ellipse cx="98" cy="164" rx="10" ry="6" fill="#D4566F" opacity=".22"/><ellipse cx="158" cy="164" rx="10" ry="6" fill="#D4566F" opacity=".22"/>
  <g class="b-muz"><ellipse cx="128" cy="187" rx="25" ry="19" fill="url(#bmuz)"/><ellipse cx="122" cy="179" rx="10" ry="5" fill="#FBEBCF" opacity=".9"/>
   <path d="M119 180Q128 187 137 180" fill="none" stroke="#3A0A14" stroke-width="6" stroke-linecap="round"/>
   <path class="b-smile" d="M117 195Q128 202 141 192" fill="none" stroke="#731328" stroke-width="4.5" stroke-linecap="round"/>
   <path class="b-frown" d="M117 199Q128 191 139 199" fill="none" stroke="#731328" stroke-width="4.5" stroke-linecap="round"/></g>
  </svg></span>`;
}
document.body.insertAdjacentHTML('afterbegin',BILLY_DEFS);
const calm=()=>{try{return matchMedia('(prefers-reduced-motion:reduce)').matches}catch(e){return false}};
/* launch: pops in, winks, then gets out of the way. Once per app session. */
function billyHello(){
  let seen=false; try{ seen=sessionStorage.getItem('billy-hi')==='1'; sessionStorage.setItem('billy-hi','1'); }catch(e){}
  if(seen) return;
  const el=document.createElement('div'); el.id='billy-hi'; el.setAttribute('aria-hidden','true');
  el.innerHTML=billy('hello')+'<b>Billy\'s picks</b>';
  document.body.appendChild(el);
  setTimeout(()=>el.classList.add('out'),calm()?700:1500);
  setTimeout(()=>el.remove(),calm()?900:1900);
  el.addEventListener('click',()=>el.remove());
}
/* a bet just settled: Billy jumps for a win, droops for a loss */
function billyReact(status,pl){
  if(status!=='won'&&status!=='lost') return;
  const old=document.getElementById('billy-react'); if(old) old.remove();
  const el=document.createElement('div'); el.id='billy-react'; el.className=status; el.setAttribute('role','status');
  const conf=status==='won'&&!calm()?Array.from({length:18},(_,i)=>`<i style="--x:${(i*37%100)}%;--d:${(i%6)*.07}s;--r:${(i*53)%360}deg;--c:${['#FEC40B','#731328','#FDEFD6'][i%3]}"></i>`).join(''):'';
  el.innerHTML=`<div class="conf">${conf}</div><div class="br-card">${billy(status==='won'?'jump':'sad')}<span><b>${status==='won'?'Green!':'Red one.'}</b>${status==='won'?signed(pl)+' in the bag':'Billy\'s on the next pick'}</span></div>`;
  document.body.appendChild(el);
  const go=()=>{ el.classList.add('out'); setTimeout(()=>el.remove(),300); };
  el.addEventListener('click',go); setTimeout(go,2400);
}
