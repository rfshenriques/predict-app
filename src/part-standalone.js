/* storage shim: same interface a synced DB would have */
const DB={
  get(k,d){try{const v=JSON.parse(localStorage.getItem('propline:'+k));return v==null?d:v}catch(e){return d}},
  set(k,v){try{localStorage.setItem('propline:'+k,JSON.stringify(v))}catch(e){}}
};
const STANDALONE=(()=>{try{return matchMedia('(display-mode: standalone)').matches||navigator.standalone===true}catch(e){return false}})();
