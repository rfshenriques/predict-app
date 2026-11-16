/* UEFA NATIONS LEAGUE, Matchday 6. Every result so far feeds the model; teams are rated against their own group.
   results: [group, home, away, home goals, away goals]
   out: [name, pos, Nations League games known, goals, assists, 'I'/'S', reason, return ('' = doubtful, 'x' = out for this window)] */
(window.UNL_SLATES=window.UNL_SLATES||[]).push({
  date:"2026-11-15", label:"Matchday 6", checked:"16 Nov 2026",
  sources:{results:"UEFA.com league phase fixtures and results (Matchdays 1–5 complete; Matchday 6 results added as they finish)",corners:"Statz Nations League corners won per match, home and away, to 14 Nov",injuries:"Team news: Yahoo Sports and Al Jazeera (France, Italy), Khel Now (Spain). No confirmed absences found for other teams."},
  results:[
    ["A1","ITA","BEL",0,2],["A1","TUR","FRA",0,1],["A1","BEL","FRA",0,1],["A1","TUR","ITA",1,4],["A1","BEL","TUR",3,0],["A1","FRA","ITA",1,1],["A1","FRA","BEL",4,1],["A1","ITA","TUR",3,1],["A1","TUR","BEL",1,2],["A1","ITA","FRA",3,1],
    ["A2","NED","GER",1,1],["A2","SRB","GRE",1,2],["A2","SRB","NED",1,2],["A2","GER","GRE",0,1],["A2","GER","SRB",2,0],["A2","GRE","NED",2,2],["A2","GRE","GER",0,0],["A2","NED","SRB",2,1],["A2","NED","GRE",7,0],["A2","SRB","GER",1,3],
    ["A3","CZE","CRO",1,2],["A3","ENG","ESP",2,3],["A3","CZE","ENG",0,2],["A3","ESP","CRO",4,1],["A3","CRO","ENG",0,7],["A3","ESP","CZE",3,1],["A3","CRO","ESP",1,2],["A3","ENG","CZE",3,0],["A3","CZE","ESP",0,2],["A3","ENG","CRO",2,1],
    ["A4","NOR","WAL",3,1],["A4","POR","DEN",1,4],["A4","NOR","DEN",3,2],["A4","POR","WAL",1,0],["A4","DEN","WAL",2,0],["A4","NOR","POR",1,2],["A4","DEN","POR",2,4],["A4","WAL","NOR",2,1],["A4","POR","NOR",2,1],["A4","WAL","DEN",0,1],
    ["B1","SVN","SCO",0,0],["B1","MKD","SUI",0,3],["B1","SCO","SUI",0,3],["B1","SVN","MKD",2,0],["B1","MKD","SCO",0,2],["B1","SUI","SVN",2,1],["B1","SCO","SVN",1,2],["B1","SUI","MKD",3,0],["B1","SCO","MKD",2,1],["B1","SVN","SUI",0,0],
    ["B2","GEO","HUN",0,2],["B2","NIR","UKR",1,0],["B2","GEO","NIR",0,1],["B2","HUN","UKR",0,1],["B2","GEO","UKR",0,0],["B2","NIR","HUN",0,0],["B2","HUN","GEO",1,0],["B2","UKR","NIR",0,3],["B2","NIR","GEO",0,0],["B2","UKR","HUN",1,2],
    ["B3","AUT","IRL",1,0],["B3","KOS","ISR",0,0],["B3","AUT","ISR",3,1],["B3","KOS","IRL",1,0],["B3","AUT","KOS",3,1],["B3","ISR","IRL",0,3],["B3","ISR","KOS",0,0],["B3","IRL","AUT",2,2],["B3","KOS","AUT",1,1],["B3","IRL","ISR",1,1],
    ["B4","SWE","BIH",3,2],["B4","ROU","POL",2,1],["B4","POL","BIH",0,0],["B4","SWE","ROU",2,1],["B4","ROU","BIH",2,4],["B4","SWE","POL",3,1],["B4","BIH","SWE",1,1],["B4","POL","ROU",6,0],["B4","BIH","POL",1,0],["B4","ROU","SWE",0,1],
    ["C1","SMR","FIN",0,7],["C1","ALB","BLR",2,0],["C1","FIN","BLR",0,0],["C1","SMR","ALB",0,3],["C1","FIN","ALB",2,1],["C1","BLR","SMR",4,0],["C1","ALB","SMR",2,1],["C1","BLR","FIN",1,0],["C1","ALB","FIN",2,0],["C1","SMR","BLR",0,2],
    ["C2","ARM","LVA",2,0],["C2","MNE","CYP",2,1],["C2","ARM","MNE",2,3],["C2","LVA","CYP",0,0],["C2","CYP","ARM",2,0],["C2","LVA","MNE",1,2],["C2","CYP","LVA",2,1],["C2","MNE","ARM",0,0],["C2","ARM","CYP",1,1],["C2","MNE","LVA",2,1],
    ["C3","FRO","KAZ",1,1],["C3","SVK","MDA",2,0],["C3","MDA","FRO",1,1],["C3","SVK","KAZ",2,1],["C3","KAZ","MDA",1,2],["C3","FRO","SVK",1,1],["C3","KAZ","FRO",2,2],["C3","MDA","SVK",0,4],["C3","MDA","KAZ",2,1],["C3","SVK","FRO",2,2],
    ["C4","BUL","LUX",1,2],["C4","ISL","EST",1,1],["C4","BUL","EST",0,0],["C4","LUX","ISL",0,3],["C4","EST","LUX",1,0],["C4","ISL","BUL",3,0],["C4","EST","ISL",0,0],["C4","LUX","BUL",0,2],["C4","BUL","ISL",0,5],["C4","LUX","EST",0,1],
    ["D1","AND","MLT",1,2],["D1","GIB","AND",0,0],["D1","MLT","GIB",1,1],["D1","MLT","AND",1,0],["D1","AND","GIB",2,0],
    ["D2","LIE","LTU",0,2],["D2","LTU","AZE",1,1],["D2","AZE","LIE",0,0],["D2","AZE","LTU",1,0],["D2","LIE","AZE",0,1]
  ],
  games:[
    {id:"n1",group:"C2",utc:"2026-11-15T14:00:00Z",home:"CYP",away:"MNE",final:{home:1,away:4}},{id:"n2",group:"C2",utc:"2026-11-15T14:00:00Z",home:"LVA",away:"ARM",final:{home:0,away:0}},
    {id:"n3",group:"C1",utc:"2026-11-15T17:00:00Z",home:"BLR",away:"ALB",final:{home:0,away:2}},{id:"n4",group:"C1",utc:"2026-11-15T17:00:00Z",home:"FIN",away:"SMR",final:{home:7,away:2}},
    {id:"n5",group:"A1",utc:"2026-11-15T19:45:00Z",home:"BEL",away:"ITA",final:{home:4,away:1}},{id:"n6",group:"A1",utc:"2026-11-15T19:45:00Z",home:"FRA",away:"TUR",final:{home:2,away:1}},
    {id:"n7",group:"A3",utc:"2026-11-15T19:45:00Z",home:"CRO",away:"CZE",final:{home:2,away:1}},{id:"n8",group:"A3",utc:"2026-11-15T19:45:00Z",home:"ESP",away:"ENG",final:{home:2,away:3}},
    {id:"n9",group:"C3",utc:"2026-11-16T15:00:00Z",home:"FRO",away:"MDA"},{id:"n10",group:"C3",utc:"2026-11-16T15:00:00Z",home:"KAZ",away:"SVK"},
    {id:"n11",group:"C4",utc:"2026-11-16T17:00:00Z",home:"EST",away:"BUL"},{id:"n12",group:"C4",utc:"2026-11-16T17:00:00Z",home:"ISL",away:"LUX"},
    {id:"n13",group:"D2",utc:"2026-11-16T17:00:00Z",home:"LTU",away:"LIE"},
    {id:"n14",group:"A2",utc:"2026-11-16T19:45:00Z",home:"GER",away:"NED"},{id:"n15",group:"A2",utc:"2026-11-16T19:45:00Z",home:"GRE",away:"SRB"},
    {id:"n16",group:"B1",utc:"2026-11-16T19:45:00Z",home:"MKD",away:"SVN"},{id:"n17",group:"B1",utc:"2026-11-16T19:45:00Z",home:"SUI",away:"SCO"},
    {id:"n18",group:"D1",utc:"2026-11-16T19:45:00Z",home:"GIB",away:"MLT"},
    {id:"n19",group:"A4",utc:"2026-11-17T19:45:00Z",home:"DEN",away:"NOR"},{id:"n20",group:"A4",utc:"2026-11-17T19:45:00Z",home:"WAL",away:"POR"},
    {id:"n21",group:"B2",utc:"2026-11-17T19:45:00Z",home:"HUN",away:"NIR"},{id:"n22",group:"B2",utc:"2026-11-17T19:45:00Z",home:"UKR",away:"GEO"},
    {id:"n23",group:"B3",utc:"2026-11-17T19:45:00Z",home:"ISR",away:"AUT"},{id:"n24",group:"B3",utc:"2026-11-17T19:45:00Z",home:"IRL",away:"KOS"},
    {id:"n25",group:"B4",utc:"2026-11-17T19:45:00Z",home:"BIH",away:"ROU"},{id:"n26",group:"B4",utc:"2026-11-17T19:45:00Z",home:"POL",away:"SWE"}
  ],
  /* corners won per match: h at home, a away, f overall. Conceded corners are not published for this competition. */
  corners:{SVK:{h:8.0,a:6.5,f:7.4},ARM:{h:7.7,a:6.5,f:7.2},NED:{h:7.7,a:6.0,f:7.0},SUI:{h:6.0,a:7.3,f:6.8},ALB:{h:6.7,a:6.0,f:6.4},POR:{h:8.0,a:4.5,f:6.3},
    ENG:{h:6.0,a:6.0,f:6.0},GER:{h:10.0,a:3.3,f:6.0},ESP:{h:5.5,a:6.3,f:6.0},MNE:{h:7.7,a:3.0,f:5.8},POL:{h:5.0,a:6.0,f:5.5},FRA:{h:7.5,a:4.0,f:5.4},
    TUR:{h:4.3,a:7.0,f:5.4},MLT:{h:7.0,a:2.0,f:5.3},GEO:{h:6.5,a:4.0,f:5.3},ISL:{h:8.0,a:3.3,f:5.2},KAZ:{h:8.0,a:3.0,f:5.0},SCO:{h:4.0,a:6.5,f:5.0},
    SVN:{h:6.0,a:3.5,f:5.0},AZE:{h:4.5,a:5.5,f:5.0},CYP:{h:4.0,a:5.3,f:4.8},FRO:{h:4.5,a:5.0,f:4.8},FIN:{h:7.5,a:3.0,f:4.8},MDA:{h:5.7,a:3.5,f:4.8},
    AUT:{h:4.5,a:5.0,f:4.8},HUN:{h:6.0,a:3.0,f:4.5},NOR:{h:5.5,a:3.5,f:4.5},LTU:{h:0.0,a:6.5,f:4.3},EST:{h:5.0,a:3.7,f:4.2},BUL:{h:5.0,a:2.5,f:4.0},
    GRE:{h:4.0,a:4.0,f:4.0},LVA:{h:4.5,a:3.7,f:4.0},CRO:{h:2.0,a:5.0,f:3.8},AND:{h:3.0,a:4.5,f:3.8},DEN:{h:2.5,a:5.0,f:3.8},UKR:{h:6.0,a:1.0,f:3.5},
    BLR:{h:3.5,a:3.3,f:3.4},BEL:{h:2.0,a:4.3,f:3.4},ITA:{h:3.7,a:3.0,f:3.4},NIR:{h:5.5,a:1.0,f:3.3},LUX:{h:3.0,a:3.5,f:3.2},BIH:{h:3.0,a:3.0,f:3.0},
    WAL:{h:3.0,a:3.0,f:3.0},ISR:{h:3.0,a:2.5,f:2.8},SWE:{h:3.5,a:2.0,f:2.8},KOS:{h:2.0,a:3.0,f:2.5},IRL:{h:3.0,a:2.0,f:2.5},ROU:{h:4.5,a:0.5,f:2.5},
    MKD:{h:0.5,a:3.7,f:2.4},SMR:{h:2.3,a:2.5,f:2.4},GIB:{h:4.0,a:1.5,f:2.3},SRB:{h:1.7,a:2.5,f:2.0},CZE:{h:2.0,a:1.0,f:1.6},LIE:{h:0.5,a:0.0,f:0.3}},
  cornersAvg:{home:4.8,away:3.8}, cornersN:5,
  teams:{
    FRA:{name:"France",out:[["Kylian Mbappé","F",1,1,0,"I","Hamstring",""],["Marcus Thuram","F",0,0,0,"I","Injury","x"],["Pierre Kalulu","D",0,0,0,"I","Injury","x"],["Aurélien Tchouaméni","M",0,0,0,"I","Foot","x"],["Manu Koné","M",0,0,0,"I","Injury","x"],["William Saliba","D",0,0,0,"I","Injury","x"],["Jules Koundé","D",0,0,0,"I","Injury","x"],["Maxence Lacroix","D",0,0,0,"I","Injury","x"],["Ousmane Dembélé","F",0,0,0,"I","Injury","x"],["Maghnes Akliouche","M",0,0,0,"I","Injury","x"],["Esteban Lepaul","F",0,0,0,"I","Injury","x"]]},
    ITA:{name:"Italy",out:[["Gianluca Mancini","D",0,0,0,"I","Muscle","x"],["Giovanni Di Lorenzo","D",0,0,0,"I","Injury","x"],["Giacomo Raspadori","F",0,0,0,"I","Injury","x"],["Moise Kean","F",0,0,0,"I","Injury","x"]]},
    ESP:{name:"Spain",out:[["Dani Olmo","M",0,0,3,"I","Adductor","x"],["Rodri","M",0,0,0,"I","Hamstring","x"],["Luis Milla","M",0,0,0,"I","Not in squad","x"],["Víctor Muñoz","F",0,0,0,"I","Not in squad","x"],["Eric García","D",0,0,0,"I","Knee","x"]]},
    BEL:{name:"Belgium"},TUR:{name:"Türkiye"},CRO:{name:"Croatia"},CZE:{name:"Czechia"},ENG:{name:"England"},GER:{name:"Germany"},NED:{name:"Netherlands"},GRE:{name:"Greece"},SRB:{name:"Serbia"},
    DEN:{name:"Denmark"},NOR:{name:"Norway"},WAL:{name:"Wales"},POR:{name:"Portugal"},SCO:{name:"Scotland"},SVN:{name:"Slovenia"},SUI:{name:"Switzerland"},MKD:{name:"North Macedonia"},
    GEO:{name:"Georgia"},HUN:{name:"Hungary"},NIR:{name:"Northern Ireland"},UKR:{name:"Ukraine"},AUT:{name:"Austria"},ISR:{name:"Israel"},KOS:{name:"Kosovo"},IRL:{name:"Ireland"},
    ROU:{name:"Romania"},POL:{name:"Poland"},SWE:{name:"Sweden"},BIH:{name:"Bosnia"},ALB:{name:"Albania"},FIN:{name:"Finland"},BLR:{name:"Belarus"},SMR:{name:"San Marino"},
    ARM:{name:"Armenia"},CYP:{name:"Cyprus"},LVA:{name:"Latvia"},MNE:{name:"Montenegro"},KAZ:{name:"Kazakhstan"},MDA:{name:"Moldova"},SVK:{name:"Slovakia"},FRO:{name:"Faroe Islands"},
    EST:{name:"Estonia"},ISL:{name:"Iceland"},LUX:{name:"Luxembourg"},BUL:{name:"Bulgaria"},AND:{name:"Andorra"},GIB:{name:"Gibraltar"},MLT:{name:"Malta"},LTU:{name:"Lithuania"},
    AZE:{name:"Azerbaijan"},LIE:{name:"Liechtenstein"}
  }
});
