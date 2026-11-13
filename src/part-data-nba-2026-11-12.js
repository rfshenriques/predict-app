/* NBA DATA. Today this is a saved snapshot. When the API is linked, load() in part-sports.js returns the same shape. */
(window.NBA_SLATES=window.NBA_SLATES||[]).push({
  date: "2026-11-12", sources: {stats:"ESPN", injuries:"ESPN", defense:"Hashtag Basketball"},
  checked: "12 Nov 2026",
  games: [
    {id:"tor-phi", ml:{away:3.21,home:1.37,src:"DraftKings via ESPN"}, final:{away:112,home:123}, utc:"2026-11-13T00:00:00Z", away:"TOR", home:"PHI"},
    {id:"det-was", ml:{away:1.23,home:4.41,src:"DraftKings via ESPN"}, final:{away:144,home:140}, utc:"2026-11-13T00:00:00Z", away:"DET", home:"WAS"},
    {id:"dal-min", ml:{away:2.85,home:1.45,src:"DraftKings via ESPN"}, final:{away:94,home:133}, utc:"2026-11-13T01:00:00Z", away:"DAL", home:"MIN"},
    {id:"cha-phx", ml:{away:2.9,home:1.44,src:"DraftKings via ESPN"}, final:{away:96,home:101}, utc:"2026-11-13T02:00:00Z", away:"CHA", home:"PHX"}
  ],
  // points per game each defense allows to PG, SG, SF, PF, C (2026-27 season) and the league average
  defense: {
    PHI:[22.6,20.1,22.7,24.3,16.7], TOR:[28.2,21.2,24.0,22.2,18.5], WAS:[22.5,22.1,25.9,22.4,18.5], DET:[23.7,18.8,22.2,18.0,22.1],
    MIN:[28.0,19.9,14.7,25.0,19.3], DAL:[23.3,21.3,15.2,28.6,16.8], PHX:[28.7,20.2,17.3,25.2,26.4], CHA:[25.4,19.4,23.9,20.8,20.4]
  },
  leagueDefense: [26.1,21.8,20.8,22.3,20.8],
  // points each player actually scored (box scores; players missing here were not in the feed)
  actual: {"PHI":{"VJ Edgecombe":15,"Tacko Fall":0,"Justin Edwards":0,"Anfernee Simons":17,"Tyrese Maxey":27,"Labaron Philon Jr.":0,"Dean Wade":6,"Joel Embiid":20,"Kentavious Caldwell-Pope":11},"TOR":{"Kyle Anderson":0,"Allen Graves":0,"Ja'Kobe Walter":6,"RJ Barrett":31,"Collin Murray-Boyles":14,"Jamison Battle":13,"Alijah Martin":7,"Jamal Shead":5,"Immanuel Quickley":26,"Jaden Bradley":1},"WAS":{"Kyshawn George":14,"Tre Johnson":13,"Bilal Coulibaly":4,"Bub Carrington":2,"Will Riley":3,"Deandre Ayton":2,"AJ Dybantsa":5},"DET":{"Ausar Thompson":17,"Duncan Robinson":13,"Javonte Green":5,"John Collins":10,"Cade Cunningham":52,"Daniss Jenkins":21,"Kevin Huerter":11,"Ronald Holland II":2},"MIN":{"Joan Beringer":13,"Terrence Shannon Jr.":6,"Rudy Gobert":9,"Trey Lyles":2,"Bones Hyland":24,"Isaiah Evans":2,"Jaylen Clark":7,"Jaden McDaniels":16,"Jonathan Kuminga":14,"LaMelo Ball":22,"Cody Williams":0},"DAL":{"Tobi Lawal":0,"Morez Johnson Jr.":0,"Cooper Flagg":12,"Santi Aldama":3,"Moussa Cisse":0,"Zaccharie Risacher":22,"Marcus Sasser":3,"Daniel Gafford":3,"Caleb Martin":7,"P.J. Washington":10,"Naji Marshall":13,"Jett Howard":3,"Walter Clayton Jr.":5},"PHX":{"Jordan Goodwin":6,"Devin Booker":30,"Collin Gillespie":13,"Oso Ighodaro":2,"Dillon Brooks":15,"Ryan Dunn":0,"Jalen Green":12,"Luke Kennard":8,"Miles Bridges":11},"CHA":{"Royce O'Neale":7,"Ryan Kalkbrenner":2,"Tidjane Salaun":2,"Christian Anderson":13,"Moussa Diabate":7,"Naz Reid":16,"Coby White":21}},
  teams: {
    // player: [name, position, season minutes per game, season points per game, status]  status: ""=playing, "Q"=questionable, "O"=out
    PHI:{name:"76ers", players:[
      ["Tyrese Maxey","G",36.5,26.9,""],["Jaylen Brown","G",35.8,22.3,""],["Joel Embiid","C",31.9,17.9,"Q"],
      ["LeBron James","F",32.9,15.6,"Q"],["VJ Edgecombe","G",33.5,13.2,""],["Anfernee Simons","G",21.9,9.0,""],
      ["Kentavious Caldwell-Pope","G",21.9,5.7,""],["Jabari Walker","F",10.9,5.3,""],["Dean Wade","F",24.7,3.2,""],
      ["Labaron Philon Jr.","G",6.3,2.5,""],["Adem Bona","C",14.2,2.1,"O"],["Rayan Rupert","G",2.0,2.0,""],
      ["Justin Edwards","F",2.3,1.3,""],["Tacko Fall","C",3.0,0.0,""]]},
    TOR:{name:"Raptors", players:[
      ["RJ Barrett","F",31.3,22.0,""],["Scottie Barnes","F",30.5,19.8,"Q"],["Kawhi Leonard","F",26.0,19.5,"O"],
      ["Immanuel Quickley","G",28.5,17.5,""],["Ja'Kobe Walter","G",26.5,13.3,""],["Collin Murray-Boyles","F",17.8,6.8,""],
      ["Jamison Battle","F",14.0,6.0,""],["Jamal Shead","G",21.0,6.0,""],["Allen Graves","F",16.0,5.3,""],
      ["Trayce Jackson-Davis","F",9.3,4.5,"Q"],["Jakob Poeltl","C",19.5,2.8,"Q"],["Alijah Martin","G",4.3,2.5,""],
      ["Jaden Bradley","G",3.8,1.5,""],["Kyle Anderson","F",6.7,0.0,""]]},
    WAS:{name:"Wizards", players:[
      ["Anthony Davis","F",33.0,23.4,""],["Kyshawn George","F",33.0,18.5,""],["Trae Young","G",35.2,18.4,""],
      ["AJ Dybantsa","F",31.5,16.0,""],["Alex Sarr","C",25.8,10.6,""],["Tre Johnson","G",21.7,9.6,""],
      ["Justin Champagnie","F",18.3,7.3,"O"],["Bilal Coulibaly","G",25.8,7.2,""],["Bub Carrington","G",19.3,5.7,""],
      ["Deandre Ayton","C",15.2,5.3,""],["Khris Middleton","F",13.8,2.4,""],["Will Riley","G",7.1,2.0,""],
      ["Tre Mann","G",5.5,1.0,""],["Anthony Gill","F",5.0,0.5,""],["Felix Okpara","F",2.0,0.5,""],["Reece Beekman","G",1.0,0.0,"O"]]},
    DET:{name:"Pistons", players:[
      ["Cade Cunningham","G",32.4,23.7,""],["Duncan Robinson","F",30.0,17.9,""],["Paul Reed","F",26.9,13.4,""],
      ["Jalen Duren","C",19.0,13.0,"O"],["Daniss Jenkins","G",24.4,9.9,""],["Ausar Thompson","G",26.5,9.7,""],
      ["John Collins","F",25.6,8.4,""],["Isaiah Joe","G",14.0,7.3,"O"],["Javonte Green","G",18.9,6.7,""],
      ["Kevin Huerter","G",20.6,6.3,""],["Ronald Holland II","F",16.3,6.1,""],["Chaz Lanier","G",3.7,4.3,""],
      ["Taurean Prince","F",7.0,2.0,""],["Ebuka Okorie","G",3.5,1.5,""],["Tolu Smith","F",3.7,0.8,""],
      ["Isaac Jones","C",3.7,0.7,""],["Elijah Harkless","G",3.0,0.0,""]]},
    MIN:{name:"Timberwolves", players:[
      ["Anthony Edwards","G",33.8,33.3,"O"],["LaMelo Ball","G",26.1,16.9,""],["Jaden McDaniels","F",32.8,16.8,""],
      ["Ayo Dosunmu","G",30.1,15.8,""],["Jonathan Kuminga","F",30.8,12.3,""],["Terrence Shannon Jr.","G",22.0,12.0,"Q"],
      ["Rudy Gobert","C",30.1,7.4,""],["Bones Hyland","G",12.0,7.1,""],["Joan Beringer","F",18.1,6.5,""],
      ["Trey Lyles","F",16.8,6.4,""],["Jaylen Clark","G",11.0,3.7,""],["Zyon Pullin","G",3.0,2.0,""],
      ["Cody Williams","F",3.8,0.0,""],["Isaiah Evans","F",2.5,0.0,""]]},
    DAL:{name:"Mavericks", players:[
      ["Cooper Flagg","F",33.6,24.0,""],["Kyrie Irving","G",29.5,21.4,"Q"],["P.J. Washington","F",33.5,14.8,""],
      ["Naji Marshall","F",24.7,11.9,""],["Santi Aldama","F",14.0,10.0,"Q"],["Daniel Gafford","F",22.2,9.8,""],
      ["Morez Johnson Jr.","F",17.0,7.6,"Q"],["Zaccharie Risacher","F",25.1,7.4,""],["Walter Clayton Jr.","G",15.4,7.3,""],
      ["Max Christie","G",21.2,6.1,"Q"],["Marcus Sasser","G",16.4,5.9,""],["Sergio de Larrea","F",11.5,5.3,"O"],
      ["Caleb Martin","F",18.3,4.2,""],["Jett Howard","G",2.4,2.4,""],["Moussa Cisse","C",3.0,1.7,""],["Tobi Lawal","F",2.5,1.5,""]]},
    PHX:{name:"Suns", players:[
      ["Devin Booker","G",35.0,25.3,""],["Miles Bridges","F",32.3,16.9,""],["Dillon Brooks","F",31.1,16.8,""],
      ["Jalen Green","G",29.0,12.4,""],["Luke Kennard","G",16.1,8.3,""],["Jordan Goodwin","G",18.6,7.8,""],
      ["Khaman Maluach","C",19.6,7.4,""],["Collin Gillespie","G",24.6,6.8,""],["Oso Ighodaro","F",21.7,6.5,""],
      ["Ryan Dunn","F",16.0,5.6,""],["Duop Reath","C",5.4,3.4,""],["Jamaree Bouyea","G",3.5,2.0,""],
      ["Koa Peat","F",3.5,1.5,""],["Pat Spencer","G",4.0,1.0,""],["Rasheer Fleming","F",7.5,0.5,""]]},
    CHA:{name:"Hornets", players:[
      ["Brandon Miller","F",32.9,22.0,"Q"],["Naz Reid","C",29.6,16.9,""],["Grayson Allen","G",26.4,15.7,""],
      ["Dennis Schroder","G",29.9,10.2,"O"],["Moussa Diabate","F",28.8,8.9,"Q"],["Coby White","G",17.0,5.5,""],
      ["Tidjane Salaun","F",13.8,5.3,""],["Sion James","G",25.2,5.2,""],["Ryan Kalkbrenner","C",16.8,4.6,""],
      ["Royce O'Neale","F",18.0,4.4,""],["Kon Knueppel","G",6.0,3.0,"O"],["Hannes Steinbach","F",7.7,2.7,""],
      ["Christian Anderson","G",10.3,2.6,""],["Liam McNeeley","G",7.0,1.8,""],["PJ Hall","C",5.5,0.0,""]]}
  }
});
