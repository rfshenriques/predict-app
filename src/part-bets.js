/* BETS. Saved on the device. One record per bet, for any sport. */
let bets=DB.get('bets',[]); if(!Array.isArray(bets)) bets=[];
const saveBets=()=>DB.set('bets',bets);
// profit or loss of one bet: won = stake x (odds - 1), lost = -stake, open and void = 0
function betPL(b){ return b.status==='won'?b.stake*(b.odds-1):b.status==='lost'?-b.stake:0; }
function betStats(list){
  const s={pl:0,won:0,lost:0,void:0,open:0,openStake:0,staked:0};
  for(const b of list){ s.pl+=betPL(b); s[b.status]++; if(b.status==='open') s.openStake+=b.stake; else if(b.status!=='void') s.staked+=b.stake; }
  s.settled=s.won+s.lost; s.green=s.settled?s.won/s.settled*100:null; s.roi=s.staked?s.pl/s.staked*100:null;
  return s;
}
const money=n=>'€'+Math.abs(n).toFixed(2);
const signed=n=>(n>0.004?'+':n<-0.004?'−':'')+'€'+Math.abs(n).toFixed(2);
const num=v=>{ const n=parseFloat(String(v).replace(',','.')); return isFinite(n)?n:null; };
function betsFor(p){ return bets.filter(b=>b.sport===SPORT.id&&b.date===SLATE.date&&b.team===p.t&&b.player===p.name); }
function validBet(b){ return b&&typeof b.id==='string'&&typeof b.player==='string'&&typeof b.stake==='number'&&typeof b.odds==='number'&&['open','won','lost','void'].includes(b.status); }
