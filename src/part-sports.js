/* SPORTS REGISTRY
   To add a sport: 1) add its data file (same shape as part-data-nba.js)  2) add one registerSport({...}) block below.
   The screens read everything from the active sport, so they need no changes. */
const SPORTS={}, SPORT_ORDER=[];
function registerSport(def){SPORTS[def.id]=def;SPORT_ORDER.push(def.id)}

registerSport({
  id:'nba', league:'NBA', sport:'Basketball', stat:'points', unit:'pts',
  slate:NBA_SLATE,
  async load(){ return this.slate; },           // the API call goes here later
  // position groups: which defense columns each group uses, and how to name it
  groups:{G:{cols:[0,1],name:'guards',label:'Guards'},F:{cols:[2,3],name:'forwards',label:'Forwards'},C:{cols:[4],name:'centers',label:'Centers'}},
  steps:['Points per minute','Minutes he plays','Multiply 1 by 2','Points per game, adjusted for the defense he faces','Add 3 and 4, divide by 2'],
  // the model from the video
  project(seasonMin,seasonAvg,minutesTonight,matchup){
    const rate=seasonMin>0?seasonAvg/seasonMin:0, byMinutes=rate*minutesTonight, vsDefense=seasonAvg*matchup;
    return {rate,byMinutes,avg:seasonAvg,matchup,vsDefense,result:(byMinutes+vsDefense)/2};
  },
  // the same model, written out for one player (shown in his sheet)
  explain(p){
    const g=this.groups[p.pos]||this.groups.F;
    return [
      {t:'Points per minute',v:p.rate.toFixed(2)},
      {t:'Minutes tonight',stepper:f1(p.minutes)},
      {t:`${f1(p.minutes)} × ${p.rate.toFixed(2)}`,v:f1(p.byMinutes)},
      {t:`${f1(p.avg)} points per game × ${p.matchup.toFixed(2)}`,sub:`${p.opp} allow ${g.name} ${pct(p.matchup)}`,v:f1(p.vsDefense)},
      {t:`(${f1(p.byMinutes)} + ${f1(p.vsDefense)}) ÷ 2`,v:f1(p.result)}
    ];
  }
});

let SPORT=SPORTS[DB.get('sport','nba')]||SPORTS.nba, SLATE=SPORT.slate;
function setSport(id){ if(!SPORTS[id]) return; SPORT=SPORTS[id]; SLATE=SPORT.slate; DB.set('sport',id); }
