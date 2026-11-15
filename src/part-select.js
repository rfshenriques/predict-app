/* active sport and day. Loaded after every sport has registered. */
let SPORT=SPORTS[DB.get('sport','nba')]||SPORTS.nba, DAY=SPORT.slates.length-1, SLATE=SPORT.slates[DAY];
function setDay(i){ if(!SPORT.slates[i]) return; DAY=i; SLATE=SPORT.slates[i]; }
function setSport(id){ if(!SPORTS[id]) return; SPORT=SPORTS[id]; setDay(SPORT.slates.length-1); DB.set('sport',id); }
function slateName(s){ return s.label||day(s.games[0].utc); }
/* run fn with another sport (latest slate) active, then put everything back */
function withSport(id,fn){ const S=SPORT,D=DAY,L=SLATE; SPORT=SPORTS[id]; DAY=SPORT.slates.length-1; SLATE=SPORT.slates[DAY];
  try{ return fn(); } finally { SPORT=S; DAY=D; SLATE=L; } }
