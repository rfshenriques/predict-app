/* PREMIER LEAGUE DATA, one file per gameweek. Same idea as the NBA files: when the API is linked, load() returns this shape.
   table: per team, home [played, goals for, goals against] and away [played, for, against]
   out:   [name, pos G/D/M/F, league games this season, goals, assists, 'I' injury or 'S' suspension, reason, expected return yyyy-mm-dd or ''] */
(window.EPL_SLATES=window.EPL_SLATES||[]).push({
  date:"2026-11-21", label:"Gameweek 11", checked:"14 Nov 2026",
  sources:{corners:"Statz corners won per game (home and away, to 8 Nov) and APWin corners per match; conceded = match total minus won",table:"Sports Mole league table after gameweek 10 (home and away)",injuries:"Sportsgambler injuries and suspensions, updated 13 Nov 2026",fixtures:"Sportradar fixtures and win chances"},
  games:[
    {id:"g1",utc:"2026-11-21T12:30:00Z",home:"MCI",away:"FUL",prob:{home:69.7,draw:17.4,away:12.9}},
    {id:"g2",utc:"2026-11-21T15:00:00Z",home:"AVL",away:"SUN",prob:{home:53.9,draw:24.9,away:21.2}},
    {id:"g3",utc:"2026-11-21T15:00:00Z",home:"BOU",away:"NFO",prob:{home:47,draw:26.6,away:26.4}},
    {id:"g4",utc:"2026-11-21T15:00:00Z",home:"CFC",away:"LEE",prob:{home:50.9,draw:25.2,away:23.9}},
    {id:"g5",utc:"2026-11-21T15:00:00Z",home:"COV",away:"CRY",prob:{home:40.4,draw:26.3,away:33.3}},
    {id:"g6",utc:"2026-11-21T15:00:00Z",home:"TOT",away:"IPS",prob:{home:62,draw:21.1,away:16.9}},
    {id:"g7",utc:"2026-11-21T17:30:00Z",home:"NEW",away:"ARS",prob:{home:17,draw:22.1,away:60.9}},
    {id:"g8",utc:"2026-11-22T14:00:00Z",home:"HUL",away:"BRI",prob:{home:15.8,draw:20.6,away:63.6}},
    {id:"g9",utc:"2026-11-22T16:30:00Z",home:"LFC",away:"MUN",prob:{home:54.8,draw:22.6,away:22.6}},
    {id:"g10",utc:"2026-11-23T20:00:00Z",home:"BRE",away:"EVE",prob:{home:45.9,draw:26.2,away:27.9}}
  ],
  /* corners per game: h won at home, a won away, f won overall, ag conceded overall */
  corners:{TOT:{h:9.6,a:5.4,f:7.5,ag:4.1},MUN:{h:6.2,a:6.4,f:6.3,ag:3.8},MCI:{h:5.6,a:6.6,f:6.1,ag:3.8},FUL:{h:5.8,a:6.0,f:5.9,ag:4.4},
    ARS:{h:6.8,a:4.4,f:5.6,ag:4.2},CFC:{h:5.4,a:5.6,f:5.5,ag:5.3},LFC:{h:4.8,a:5.8,f:5.3,ag:4.1},BRI:{h:6.4,a:3.8,f:5.1,ag:5.0},
    BOU:{h:4.8,a:4.8,f:4.8,ag:3.8},EVE:{h:3.8,a:5.4,f:4.6,ag:5.4},NFO:{h:4.4,a:4.6,f:4.5,ag:4.4},LEE:{h:4.4,a:4.2,f:4.3,ag:4.1},
    NEW:{h:3.6,a:5.0,f:4.3,ag:5.2},HUL:{h:4.4,a:3.8,f:4.1,ag:6.2},SUN:{h:4.0,a:4.0,f:4.0,ag:4.0},BRE:{h:4.2,a:3.6,f:3.9,ag:5.3},
    COV:{h:4.2,a:3.0,f:3.6,ag:4.5},AVL:{h:4.2,a:2.6,f:3.4,ag:5.2},CRY:{h:4.8,a:1.8,f:3.3,ag:7.0},IPS:{h:2.2,a:3.4,f:2.8,ag:5.1}},
  cornersAvg:{home:5.0,away:4.5},
  table:{
    ARS:{h:[5,10,2],a:[5,5,3]}, BRI:{h:[5,15,1],a:[5,11,6]}, MCI:{h:[5,11,7],a:[5,10,6]}, LFC:{h:[5,4,6],a:[5,10,4]},
    CFC:{h:[5,13,8],a:[5,6,8]}, EVE:{h:[5,8,5],a:[5,4,5]}, BOU:{h:[5,7,4],a:[5,9,10]}, BRE:{h:[5,10,3],a:[5,6,8]},
    LEE:{h:[5,7,3],a:[5,3,5]}, AVL:{h:[5,6,7],a:[5,8,10]}, TOT:{h:[5,7,6],a:[5,3,5]}, NEW:{h:[5,6,7],a:[5,7,9]},
    HUL:{h:[5,7,5],a:[5,4,6]}, IPS:{h:[5,6,7],a:[5,9,13]}, FUL:{h:[5,7,8],a:[5,3,4]}, NFO:{h:[5,3,4],a:[5,6,9]},
    COV:{h:[5,7,9],a:[5,3,10]}, MUN:{h:[5,10,11],a:[5,4,8]}, SUN:{h:[5,2,4],a:[5,6,13]}, CRY:{h:[5,7,13],a:[5,3,11]}
  },
  teams:{
    ARS:{name:"Arsenal",out:[["Max Dowman","M",2,0,0,"S","Red card","2026-11-29"],["Ezri Konsa","D",9,1,0,"I","Other",""],["William Saliba","D",0,0,0,"I","Low back",""],["Bukayo Saka","F",7,3,0,"I","Thigh","2026-12-02"]]},
    AVL:{name:"Aston Villa",out:[["Matty Cash","D",8,0,0,"S","Yellow cards","2026-11-21"],["Matteo Ruggeri","M",4,0,0,"I","Thigh","2026-12-02"],["Amadou Onana","M",0,0,0,"I","Knee","2027-06-01"]]},
    BOU:{name:"Bournemouth",out:[["Veljko Milosavljevic","M",0,0,0,"I","Knee","2026-11-21"],["Juanlu Sanchez","D",1,0,0,"I","Ankle",""],["Alex Toth","M",2,0,0,"I","Thigh","2027-02-06"],["Julian Araujo","D",0,0,0,"I","Thigh","2026-11-21"]]},
    BRE:{name:"Brentford",out:[["Igor Thiago","F",10,2,2,"S","Red card","2026-12-05"],["Joshua Dasilva","M",0,0,0,"I","Thigh",""],["Fabio Carvalho","F",1,1,0,"I","Knock","2026-11-23"],["Rico Henry","D",1,0,0,"I","Groin","2026-11-23"],["Antoni Milambo","M",0,0,0,"I","Knee","2026-11-23"]]},
    BRI:{name:"Brighton",out:[["Matias Orozco","M",0,0,0,"S","Red card","2026-11-21"],["Chema Andres","M",7,1,1,"I","Hip",""],["Pascal Struijk","D",4,0,0,"I","Thigh","2026-11-22"],["Femi Azeez","F",0,0,0,"I","Thigh","2026-11-22"],["Zadok Yohanna","M",1,0,0,"I","Other","2026-11-22"],["Kaoru Mitoma","M",0,0,0,"I","Hamstring","2026-11-22"],["Stefanos Tzimas","F",0,0,0,"I","Cruciate ligament","2026-12-02"],["Eiran Cashin","D",0,0,0,"I","Calf",""],["Evan Ferguson","F",0,0,0,"I","Ankle","2026-11-22"]]},
    CFC:{name:"Chelsea",out:[["Mamadou Sarr","D",0,0,0,"I","Calf",""],["Emiliano Martinez","G",6,0,0,"I","Head","2026-11-21"],["Mykhaylo Mudryk","F",1,0,0,"I","Ankle","2026-11-21"],["Jorrel Hato","D",6,0,2,"I","Other","2026-11-21"],["Jamie Gittens","M",0,0,0,"I","Ankle","2026-11-21"],["Maxence Lacroix","D",8,0,1,"I","Thigh","2026-11-21"],["Joao Pedro","F",6,5,3,"I","Thigh","2026-11-21"],["Reece James","D",4,0,0,"I","Thigh","2027-01-03"]]},
    COV:{name:"Coventry",out:[["Frank Onyeka","M",7,0,0,"I","Other","2026-11-21"],["Bobby Thomas","D",8,0,0,"I","Calf","2026-11-21"],["Luke Woolfenden","D",0,0,0,"I","Knee","2026-11-21"],["Josh Eccles","M",0,0,0,"I","Other","2026-11-21"],["Haji Wright","F",0,0,0,"I","Thigh","2026-12-02"],["Aurele Amenda","D",4,0,0,"I","Calf","2026-12-19"]]},
    CRY:{name:"Crystal Palace",out:[["Jean-Philippe Mateta","F",4,0,0,"S","Red card","2026-12-02"],["Ismaila Sarr","F",2,0,0,"I","Groin","2026-11-21"],["Takehiro Tomiyasu","D",4,0,0,"I","Calf","2026-11-21"],["Chadi Riad","D",1,0,0,"I","Knee","2027-06-07"]]},
    EVE:{name:"Everton",out:[]},
    FUL:{name:"Fulham",out:[["Emile Smith Rowe","M",4,0,0,"I","Other","2026-11-21"],["Tom Cairney","M",3,0,0,"I","Knee","2026-11-21"]]},
    HUL:{name:"Hull City",out:[["Matt Crooks","M",6,0,0,"S","Yellow cards","2026-11-22"],["Mohamed Belloumi","F",9,3,2,"I","Hamstring",""],["Semi Ajayi","D",10,1,0,"I","Other",""],["Elliot Stroud","M",8,0,1,"I","Other",""],["Hidemasa Morita","M",5,0,0,"I","Groin","2026-11-22"],["Charlie Hughes","D",0,0,0,"I","Groin","2026-11-22"],["Darko Gyabi","M",0,0,0,"I","Thigh","2026-11-22"],["Ilyas Ansah","F",0,0,0,"I","Upper back","2026-11-22"],["Matt Targett","D",1,0,0,"I","Ankle","2026-12-19"],["Eliot Matazo","M",0,0,0,"I","Knee","2027-02-20"]]},
    IPS:{name:"Ipswich",out:[["Jack Taylor","M",0,0,0,"I","Knee","2026-11-21"],["Sammie Szmodics","M",0,0,0,"I","Knee",""]]},
    LEE:{name:"Leeds",out:[["Gabriel Gudmundsson","D",8,0,1,"I","Hamstring",""],["Anton Stach","M",9,1,0,"I","Ankle","2026-11-21"],["Mateo Joseph","F",0,0,0,"I","Ankle","2027-01-30"]]},
    LFC:{name:"Liverpool",out:[["Virgil van Dijk","D",10,0,0,"I","Other",""],["Dominik Szoboszlai","M",8,1,1,"I","Knee",""],["Ryan Gravenberch","M",7,0,1,"I","Calf","2026-11-22"],["Jeremie Frimpong","D",5,0,0,"I","Thigh","2026-11-22"],["Conor Bradley","D",0,0,0,"I","Knee","2026-12-02"],["Giovanni Leoni","D",0,0,0,"I","Cruciate ligament","2027-01-02"],["Hugo Ekitike","F",0,0,0,"I","Calf","2027-01-02"],["Vitezslav Jaros","G",0,0,0,"I","Other",""]]},
    MCI:{name:"Man City",out:[["Mateo Kovacic","M",3,0,1,"S","Red card",""],["Marc Guehi","D",9,1,1,"I","Hip",""],["Jack Grealish","M",6,0,0,"S","Banned by club",""],["Antoine Semenyo","F",7,2,3,"I","Knee","2026-12-19"]]},
    MUN:{name:"Man United",out:[["Lisandro Martinez","D",8,0,0,"S","Second yellow","2026-11-22"],["Harry Maguire","D",10,0,0,"I","Low back",""],["Marcus Rashford","F",6,0,0,"I","Groin","2026-11-22"],["Carlos Baleba","M",4,0,0,"I","Thigh","2026-12-02"],["Benjamin Sesko","F",4,1,0,"I","Calf","2027-01-02"],["Luke Shaw","D",5,0,1,"I","Other","2026-11-22"],["Manuel Ugarte","M",0,0,0,"I","Cruciate ligament","2027-04-03"]]},
    NEW:{name:"Newcastle",out:[["Jacob Ramsey","M",5,1,0,"S","Second yellow","2026-11-21"],["Malick Thiaw","D",9,0,0,"I","Other",""],["Joelinton","M",4,0,0,"I","Other","2026-11-21"],["Ewen Jaouen","G",0,0,0,"I","Thigh","2026-12-12"]]},
    NFO:{name:"Nott'm Forest",out:[["Nicolas Dominguez","M",2,0,0,"I","Other","2027-01-02"],["Nicolo Savona","D",0,0,0,"I","Knee","2026-11-21"]]},
    SUN:{name:"Sunderland",out:[["Omar Alderete","D",4,0,0,"S","Second yellow","2026-11-21"],["Granit Xhaka","M",10,0,0,"I","Calf",""],["Brian Brobbey","F",8,3,0,"I","Other",""],["Juan Riquelme Angulo","F",1,0,0,"I","Knock","2026-11-21"],["Daniel Ballard","D",5,0,0,"I","Thigh","2026-12-13"],["Habib Diarra","M",4,0,1,"I","Thigh","2026-12-13"],["Simon Adingra","F",0,0,0,"I","Physical discomfort",""],["Romaine Mundle","F",1,0,0,"I","Knee","2027-01-02"]]},
    TOT:{name:"Spurs",out:[["Mathys Tel","F",8,1,0,"I","Muscle",""],["Tosin Adarabioyo","D",2,0,0,"I","Calf","2026-11-21"],["Lucas Bergvall","M",4,0,0,"I","Knee","2026-11-21"],["Wilson Odobert","F",0,0,0,"I","Knee","2027-02-06"],["Savio","M",4,0,0,"I","Muscle","2026-11-21"],["Xavi Simons","M",0,0,0,"I","Cruciate ligament","2027-02-20"]]}
  }
});
