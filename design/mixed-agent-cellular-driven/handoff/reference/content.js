// Cellula content — the ready worlds, the challenges and the free bench, extracted verbatim from
// the v5 design prototype (band "CONTENT"). Every scenario is data plus a small make() function
// that builds a world with kernel calls. Adding a scenario must never require a kernel change.

import { KINDS, BRUSHES, RULE_KINDS, DIRS, makeField, decayFor, relax, gradCell, gradAt, deposit, makeWorld, addBody, cellOf, buildView, putKind, applyPair, pairsStep, maskOf, numsOf, maskSize, isWide, countAt, countStep, srcOf, forceOn, forcePush, mediumPush, SENSORS, ACTIONS, BLOCKS, mountById, dirCell, coneCells, aheadOf, openCell, terrainAt, senses, nextBlock, brainAct, canEnter, moveCells, moveFree, stepWorld, biggestCluster, PROBES, goalMet, snapshot, restore, photo, movesBetween, HARVEST, harvestAll } from './kernel.js';

function pair(b0,b1,a0,a1,dir,prob){ return {type:'pair',on:true,b:[b0,b1],a:[a0,a1],dir:dir,prob:prob||100}; }
function count(from,what,list,to,mask,prob){ return {type:'count',on:true,from:from,what:what,nums:numsOf(list),to:to,mask:maskOf(mask||'8'),prob:prob||100}; }
function force(sign,strength,range,direct){ return {type:'force',on:true,sign:sign,strength:strength,range:range,direct:!!direct}; }
// when no wire is true the fish runs "fwd", so swimming needs no wire of its own
function brain(o){ o=o||{}; return {type:'brain',on:true,nid:3,
  mounts:[{id:'m1',s:'wall',a:0,r:1,f:40},{id:'m2',s:'food',a:0,r:1,f:40}],
  wires:o.wires||[['m1','turn'],['m2','eat']], p1:[],
  programs:o.programs||{fwd:['step'],turn:['left','left'],rand:['right'],eat:['act'],wait:['wait']}}; }
function put(W,x,y,k,vx,vy){ if(KINDS[k].body) addBody(W,k,x,y,vx,vy); else W.T[y*W.w+x]=k; }
function tank(W){ for(var y=0;y<W.h;y++){ W.T[y*W.w]='g'; W.T[y*W.w+W.w-1]='g'; } for(var x=1;x<W.w-1;x++) W.T[(W.h-1)*W.w+x]='s'; }
function scatter(W,k,n,x0,x1){ var tries=0; buildView(W);
  while(n>0&&tries++<5000){ var x=x0+Math.floor(Math.random()*(x1-x0+1)), y=Math.floor(Math.random()*W.h), i=y*W.w+x;
    if(W.V[i]!=='_') continue; put(W,x,y,k); W.V[i]=k; n--; } }
function wallColumn(W,x,step){ for(var y=0;y<W.h;y++) W.T[y*W.w+x]=(y%step===Math.floor(step/2))?'o':'h'; }

const SCENARIOS = [
  { id:'fish', pt:'O peixe que vai e volta', en:'The fish that turns around',
    dpt:'Quatro regras de par fazem o peixe nadar e bater no vidro.', den:'Four pair rules make the fish swim and bounce off the glass.',
    tags:['pair'], every:16, probes:[['walls','paredes tocadas','walls touched']], goal:{tests:[['walls','>=',2]],pt:'Faça o peixe tocar as duas paredes de vidro.',en:'Make the fish touch both glass walls.'},
    make:function(){ var W=makeWorld(11,9); tank(W); put(W,2,3,'>'); put(W,3,7,'p'); put(W,8,7,'p');
      W.laws=[pair('>','_','_','>','right'),pair('>','g','<','g','right'),pair('<','_','_','<','left'),pair('<','g','>','g','left')]; return W; } },
  { id:'tank', pt:'Aquário vivo', en:'A living aquarium',
    dpt:'As plantas crescem por regras; o peixe tem um cérebro e come as algas.', den:'Plants grow by rules; the fish has a brain and eats the algae.',
    tags:['pair','brain'], every:12, lens:['cones','grid'], probes:[['eaten','algas comidas','algae eaten'],['count:p','plantas','plants']], chart:['count:p','count:a'], goal:{tests:[['eaten','>=',5]],pt:'Deixe o peixe comer 5 algas.',en:'Let the fish eat 5 algae.'},
    make:function(){ var W=makeWorld(11,9); tank(W); put(W,2,3,'>'); put(W,3,7,'p'); put(W,8,7,'p'); put(W,6,3,'a'); put(W,4,5,'a');
      W.lens={grid:true,cones:true};
      W.laws=[brain(),pair('p','_','p','p','any',6),pair('p','p','p','_','any',5),pair('s','_','s','a','up',6),pair('a','_','_','a','up',20)]; return W; } },
  { id:'orbit', pt:'Órbitas', en:'Orbits',
    dpt:'Uma estrela puxa tudo. Lance planetas e veja quem entra em órbita.', den:'A star pulls everything. Launch planets and see which ones go into orbit.',
    tags:['force'], every:1, tap:'launch:c', knobs:['force.strength'], lens:['trails','grid'],
    probes:[['orbits','órbitas','orbits'],['escapes','fugas','escapes'],['captures','capturas','captures']], goal:{tests:[['orbits','>=',3]],pt:'Consiga 3 voltas completas.',en:'Get 3 full orbits.'},
    make:function(){ var W=makeWorld(31,31,'free'); W.edge='open'; W.medium.drag=0; put(W,15,15,'S'); put(W,23,15,'c',0,0.15);
      W.laws=[force('all',60,12,true)]; W.lens={grid:false,trails:true}; return W; } },
  { id:'dust', pt:'Poeira de estrelas', en:'Stardust',
    dpt:'Todas as partículas se atraem, e a água as agita. Quem vence?', den:'Every particle attracts the others, and the water jiggles them. Who wins?',
    tags:['force','medium'], every:2, knobs:['force.strength','medium.temp'], lens:['field','conc','grid'], chart:['biggest'], probes:[['biggest','maior grupo','biggest group']],
    make:function(){ var W=makeWorld(31,21); scatter(W,'m',60,0,30); W.medium.temp=45; W.laws=[force('all',60,4)]; W.lens={grid:true,field:true}; return W; } },
  { id:'charge', pt:'Cargas', en:'Charges',
    dpt:'Iguais se afastam, diferentes se atraem. Aqueça e os pares se soltam.', den:'Like repels, unlike attracts. Heat it and the pairs come apart.',
    tags:['force','medium'], every:2, knobs:['medium.temp','force.strength'], lens:['field','grid'], probes:[['biggest','maior grupo','biggest group']],
    make:function(){ var W=makeWorld(31,21); scatter(W,'+',16,0,30); scatter(W,'-',16,0,30); W.medium.temp=30; W.laws=[force('like',60,6)]; W.lens={grid:true,field:true}; return W; } },
  { id:'memb', pt:'Duas câmaras', en:'Two chambers',
    dpt:'O sal passa pelos poros; o açúcar não. Veja o que se iguala.', den:'Salt passes the pores; sugar does not. See what evens out.',
    tags:['medium'], every:2, knobs:['medium.temp'], lens:['conc','grid'], chart:['right:n','right:u'], probes:[['right:n','sal à direita','salt on the right'],['right:u','açúcar à direita','sugar on the right']],
    make:function(){ var W=makeWorld(31,19); wallColumn(W,15,4); scatter(W,'n',34,0,14); scatter(W,'u',24,0,14); W.medium.temp=50; return W; } },
  { id:'life', pt:'Jogo da Vida', en:'Game of Life',
    dpt:'Cada casa conta as vizinhas e decide: nasce, morre ou fica.', den:'Each cell counts its neighbours and decides: born, dies or stays.',
    tags:['count'], every:7, tap:'paint:a', lens:['numbers','grid'], chart:['count:a'], probes:[['tick','passo','step'],['count:a','algas','algae']],
    make:function(){ var W=makeWorld(31,21); for(var i=0;i<W.T.length;i++) if(Math.random()<0.28) W.T[i]='a';
      W.laws=[count('_','a',[3],'a'),count('a','a',[0,1,4,5,6,7,8],'_')]; return W; } },
  { id:'crystal', pt:'Cristal', en:'Crystal',
    dpt:'Força, agitação e contagem juntas: quem fica cercada vira cristal.', den:'Force, jiggle and counting together: whoever gets surrounded becomes crystal.',
    tags:['force','medium','count'], every:2, knobs:['force.strength','medium.temp'], lens:['field','grid'], chart:['count:x'], probes:[['count:x','cristais','crystals']],
    make:function(){ var W=makeWorld(31,21); scatter(W,'m',60,0,30); W.medium.temp=45;
      W.laws=[force('all',60,4),count('m','m',[5,6,7,8],'x'),count('m','x',[2,3,4,5,6,7,8],'x')]; return W; } }
];
// challenges: a ready world plus ONE small tool, declared in `edit`
const ONLY_FWD = function(list){ return {fwd:list,turn:[],rand:[],eat:[],wait:[]}; };
const QUESTS = [
  { id:'walk', pt:'Um peixe que anda', en:'A fish that walks',
    dpt:'Leve o peixe até a planta só com blocos de passo e giro.', den:'Take the fish to the plant with step and turn blocks only.',
    tags:['brain'], every:10, edit:{tabs:['blocks'],acts:['fwd'],noP1:true}, probes:[['blocks','blocos usados','blocks used']],
    goal:{tests:[['reach:8,7','>=',1]],pt:'Chegue à planta do outro lado.',en:'Reach the plant on the other side.'},
    make:function(){ var W=makeWorld(11,9); tank(W); put(W,2,3,'>'); put(W,8,7,'p'); W.laws=[brain({wires:[],programs:ONLY_FWD(['step'])})]; return W; } },
  { id:'twin', pt:'O mesmo peixe, outro cérebro', en:'Same fish, another brain',
    dpt:'O problema do primeiro mundo, agora com um sensor ligado a uma ação.', den:'The first world’s problem, now with a sensor wired to an action.',
    tags:['brain'], every:10, edit:{tabs:['wiring']}, lens:['cones','grid'], probes:[['walls','paredes tocadas','walls touched']],
    goal:{tests:[['walls','>=',2]],pt:'Faça o peixe tocar as duas paredes: ligue um sensor a “dar meia-volta”.',en:'Make the fish touch both walls: wire a sensor to “turn around”.'},
    make:function(){ var W=makeWorld(11,9); tank(W); put(W,2,3,'>'); put(W,3,7,'p'); W.lens={grid:true,cones:true}; W.laws=[brain({wires:[]})]; return W; } },
  { id:'eyes', pt:'Olhos que giram', en:'Eyes that turn',
    dpt:'As algas estão fora da linha do peixe. Monte um sensor de lado.', den:'The algae are off the fish’s line. Mount a sensor on its side.',
    tags:['brain'], every:8, edit:{tabs:['body','wiring']}, lens:['cones','grid'], probes:[['eaten','algas comidas','algae eaten']],
    goal:{tests:[['eaten','>=',2]],pt:'Coma as 2 algas. Dica: um sensor “vê alga” à direita, ligado a “virar”.',en:'Eat both algae. Hint: a “sees alga” sensor on the right, wired to “turn”.'},
    make:function(){ var W=makeWorld(11,9); tank(W); put(W,2,3,'>'); put(W,4,6,'a'); put(W,6,2,'a'); W.lens={grid:true,cones:true}; W.laws=[brain()]; return W; } },
  { id:'short', pt:'Atalhos que se repetem', en:'Shortcuts that repeat',
    dpt:'Quatro algas, no máximo 6 blocos. Guarde o trecho repetido em P1.', den:'Four algae, at most 6 blocks. Put the repeated part in P1.',
    tags:['brain'], every:8, edit:{tabs:['blocks'],acts:['fwd']}, probes:[['eaten','algas comidas','algae eaten'],['blocks','blocos usados','blocks used']],
    goal:{tests:[['eaten','>=',4],['blocks','<=',6]],pt:'Coma as 4 algas usando no máximo 6 blocos ao todo.',en:'Eat all 4 algae using at most 6 blocks in total.'},
    make:function(){ var W=makeWorld(11,9); tank(W); put(W,2,2,'>'); put(W,4,2,'a'); put(W,6,2,'a'); put(W,6,4,'a'); put(W,6,6,'a'); W.laws=[brain({wires:[],programs:ONLY_FWD(['step'])})]; return W; } }
];
const BENCH = { id:'bench', pt:'Bancada livre', en:'Free bench', dpt:'', den:'', tags:[], every:4, lens:['grid','field','conc','trails','numbers','cones'], probes:[['tick','passo','step']],
  make:function(){ var W=makeWorld(21,15); for(var y=0;y<W.h;y++){ W.T[y*W.w]='g'; W.T[y*W.w+W.w-1]='g'; } for(var x=0;x<W.w;x++){ W.T[x]='g'; W.T[(W.h-1)*W.w+x]='g'; } W.medium.temp=40; return W; } };

export { pair, count, force, brain, put, tank, scatter, wallColumn, SCENARIOS, ONLY_FWD, QUESTS, BENCH };
