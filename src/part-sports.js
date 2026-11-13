/* SPORTS REGISTRY
   To add a sport: 1) add its data files (same shape as part-data-nba-DATE.js, one per day)  2) add one registerSport({...}) block below.
   The screens read everything from the active sport, so they need no changes. */
const SPORTS={}, SPORT_ORDER=[];
function registerSport(def){SPORTS[def.id]=def;SPORT_ORDER.push(def.id)}

registerSport({
  id:'nba', league:'NBA', sport:'Basketball', stat:'points', unit:'pts',
  slates:NBA_SLATES.sort((a,b)=>a.date<b.date?-1:1),   // one entry per day, oldest first
  async load(){ return this.slates; },           // the API call goes here later
  // what people actually call them; everyone else is shown by last name
  nick:{"Shai Gilgeous-Alexander":"SGA","Victor Wembanyama":"Wemby","Giannis Antetokounmpo":"Giannis","Karl-Anthony Towns":"KAT","Nickeil Alexander-Walker":"NAW","Kentavious Caldwell-Pope":"KCP","LeBron James":"LeBron","Stephen Curry":"Steph","Kevin Durant":"KD","Anthony Davis":"AD","Anthony Edwards":"Ant","Damian Lillard":"Dame","Zion Williamson":"Zion","Ja Morant":"Ja","Luka Doncic":"Luka","Kyrie Irving":"Kyrie","Trae Young":"Trae","LaMelo Ball":"LaMelo","Cade Cunningham":"Cade","Paolo Banchero":"Paolo","Scottie Barnes":"Scottie","Draymond Green":"Draymond","Klay Thompson":"Klay","Bam Adebayo":"Bam","Jrue Holiday":"Jrue","Chet Holmgren":"Chet","Tyrese Haliburton":"Hali","Donovan Mitchell":"Spida","Jaylen Brown":"JB","Franz Wagner":"Franz","Deni Avdija":"Deni","Kawhi Leonard":"Kawhi","Jimmy Butler":"Jimmy","Kristaps Porzingis":"KP","Russell Westbrook":"Russ","RJ Barrett":"RJ","OG Anunoby":"OG","CJ McCollum":"CJ","Scoot Henderson":"Scoot","Jalen Williams":"J-Dub","Jabari Smith Jr.":"Jabari","Amen Thompson":"Amen","Ausar Thompson":"Ausar","Dejounte Murray":"Dejounte","Fred VanVleet":"FVV","Bones Hyland":"Bones","Jaren Jackson Jr.":"JJJ","Herbert Jones":"Herb Jones","P.J. Washington":"PJ","Isaiah Hartenstein":"I-Hart"},
  // team colours: [primary, secondary]
  colors:{"ATL":["#E03A3E","#C1D32F"],"BOS":["#007A33","#BA9653"],"BKN":["#000000","#FFFFFF"],"CHA":["#1D1160","#00788C"],"CHI":["#CE1141","#000000"],"CLE":["#860038","#041E42"],"DAL":["#00538C","#002B5E"],"DEN":["#0E2240","#FEC524"],"DET":["#C8102E","#1D42BA"],"GSW":["#1D428A","#FFC72C"],"HOU":["#CE1141","#000000"],"IND":["#002D62","#FDBB30"],"LAC":["#C8102E","#1D428A"],"LAL":["#552583","#FDB927"],"MEM":["#5D76A9","#12173F"],"MIA":["#98002E","#F9A01B"],"MIL":["#00471B","#EEE1C6"],"MIN":["#0C2340","#236192"],"NOP":["#0C2340","#C8102E"],"NYK":["#006BB6","#F58426"],"OKC":["#007AC1","#EF3B24"],"ORL":["#0077C0","#C4CED4"],"PHI":["#006BB6","#ED174C"],"PHX":["#1D1160","#E56020"],"POR":["#E03A3E","#000000"],"SAC":["#5A2D81","#63727A"],"SAS":["#C4CED4","#000000"],"TOR":["#CE1141","#000000"],"UTA":["#002B5C","#00471B"],"WAS":["#002B5C","#E31837"]},
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

let SPORT=SPORTS[DB.get('sport','nba')]||SPORTS.nba, DAY=SPORT.slates.length-1, SLATE=SPORT.slates[DAY];
function setDay(i){ if(!SPORT.slates[i]) return; DAY=i; SLATE=SPORT.slates[i]; }
function setSport(id){ if(!SPORTS[id]) return; SPORT=SPORTS[id]; setDay(SPORT.slates.length-1); DB.set('sport',id); }
