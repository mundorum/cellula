// Cellula kernel — reference implementation, extracted verbatim from the v5 design prototype
// (reference/Cellula v5.dc.html, band "KERNEL"). It has no DOM, no rendering and knows no scenario.
// Treat it as the executable specification: docs/02-kernel.md and docs/03-models.md explain it.
// It is plain ES5-style JavaScript because the prototype runtime required it; the production
// code should be TypeScript with the same behaviour (see docs/09-implementation-plan.md).

// ---- kinds: every thing that can be in a cell, with the properties models read
const KINDS = {
  '_':{pt:'vazio', en:'empty'},
  g:{pt:'vidro', en:'glass', solid:1, art:'art/glass.svg', tok:'#4aa7c4', fill:1},
  r:{pt:'pedra', en:'rock', solid:1, art:'art/rock01.svg', tok:'#94a6b0'},
  s:{pt:'areia', en:'sand', solid:1, art:'art/sand.svg', tok:'#e3c079', fill:1},
  p:{pt:'planta', en:'plant', art:'art/plant01.svg', tok:'#5da53f'},
  a:{pt:'alga', en:'alga', art:'art/cyanobacteria.svg', tok:'#2fa58c'},
  '>':{pt:'peixe →', en:'fish →', body:1, art:'art/fish-right.svg', tok:'#e2662c'},
  '<':{pt:'peixe ←', en:'fish ←', body:1, art:'art/fish-left.svg', tok:'#e2662c'},
  m:{pt:'partícula', en:'particle', body:1, drift:1, mass:1, dot:'a3', r:0.34},
  '+':{pt:'positiva', en:'positive', body:1, drift:1, mass:1, q:1, dot:'a2', r:0.42, glyph:'+'},
  '-':{pt:'negativa', en:'negative', body:1, drift:1, mass:1, q:-1, dot:'neg', r:0.42, glyph:'−'},
  n:{pt:'sal', en:'salt', body:1, drift:1, dot:'a2', r:0.26},
  u:{pt:'açúcar', en:'sugar', body:1, drift:1, dot:'a3', r:0.44},
  c:{pt:'planeta', en:'planet', body:1, drift:1, mass:0.03, dot:'a1', r:0.32},
  S:{pt:'estrela', en:'star', solid:1, mass:2, absorb:1, dot:'a2', r:0.85},
  x:{pt:'cristal', en:'crystal', solid:1, mass:1, sq:'a2'},
  h:{pt:'membrana', en:'membrane', solid:1, sq:'soft'},
  o:{pt:'poro', en:'pore', pore:1}
};
const BRUSHES = ['_','g','r','s','p','a','>','m','+','-','n','u','c','S','x','h','o'];
const RULE_KINDS = ['_','g','r','s','p','a','>','<','m','+','-','n','u','x'];
const DIRS = {right:[1,0], left:[-1,0], up:[0,-1], down:[0,1]};

// ---- number layers: one rule ("trade with your neighbours") serves every field
function makeField(w,h){ return {w:w,h:h,phi:new Float32Array(w*h),tmp:new Float32Array(w*h),rho:new Float32Array(w*h)}; }
function decayFor(R){ return 1/(1+4*R*R); }
function relax(F,decay,passes){
  var w=F.w,h=F.h,a=F.phi,b=F.tmp,rho=F.rho,k=(1-decay)*0.25;
  for(var p=0;p<passes;p++){
    for(var y=0;y<h;y++){ var row=y*w;
      for(var x=0;x<w;x++){ var i=row+x,c=a[i];
        b[i]=k*((x>0?a[i-1]:c)+(x<w-1?a[i+1]:c)+(y>0?a[i-w]:c)+(y<h-1?a[i+w]:c))+rho[i]; } }
    var t=a;a=b;b=t; }
  F.phi=a;F.tmp=b;
}
function gradCell(F,x,y){ var w=F.w,h=F.h,p=F.phi,i=y*w+x,c=p[i];
  return [((x<w-1?p[i+1]:c)-(x>0?p[i-1]:c))/2, ((y<h-1?p[i+w]:c)-(y>0?p[i-w]:c))/2]; }
function gradAt(F,px,py){ var w=F.w,h=F.h;
  if(px<0||py<0||px>w-1||py>h-1) return [0,0];
  var x0=Math.min(w-2,Math.floor(px)),y0=Math.min(h-2,Math.floor(py)),fx=px-x0,fy=py-y0;
  var a=gradCell(F,x0,y0),b=gradCell(F,x0+1,y0),c=gradCell(F,x0,y0+1),d=gradCell(F,x0+1,y0+1);
  return [(a[0]*(1-fx)+b[0]*fx)*(1-fy)+(c[0]*(1-fx)+d[0]*fx)*fy,(a[1]*(1-fx)+b[1]*fx)*(1-fy)+(c[1]*(1-fx)+d[1]*fx)*fy]; }
function deposit(F,px,py,s){ var w=F.w,h=F.h;
  if(px<0||py<0||px>w-1||py>h-1) return;
  var x0=Math.min(w-2,Math.floor(px)),y0=Math.min(h-2,Math.floor(py)),fx=px-x0,fy=py-y0,r=F.rho,i=y0*w+x0;
  r[i]+=s*(1-fx)*(1-fy); r[i+1]+=s*fx*(1-fy); r[i+w]+=s*(1-fx)*fy; r[i+w+1]+=s*fx*fy; }

// ---- the world: terrain symbols + bodies on top, any number of law cards, one medium
function makeWorld(w,h,face){
  return {w:w,h:h,face:face||'cells',edge:'wall',T:new Array(w*h).fill('_'),bodies:[],laws:[],
    medium:{temp:0,drag:10,weight:0},pass:{n:true,u:false,m:true,'+':true,'-':false,c:true},
    F:makeField(w,h),V:null,B:null,tick:0,ev:{},mem:{},lens:{grid:true}};
}
function addBody(W,kind,x,y,vx,vy){
  var b={id:(W.nid=(W.nid||0)+1),kind:kind,x:x,y:y,vx:vx||0,vy:vy||0,ax:0,ay:0,fx:0,fy:0,self:null,h:kind==='<'?180:0,act:null,pc:0,trail:null,sum:0,la:null,rev:0,dead:false};
  W.bodies.push(b); return b;
}
function cellOf(W,b){ var x=Math.round(b.x), y=Math.round(b.y); return (x<0||y<0||x>=W.w||y>=W.h)?-1:y*W.w+x; }
// the view every rule reads: terrain with the bodies stamped on it
function buildView(W){
  var V=W.T.slice(), B=new Array(V.length).fill(null);
  for(var i=0;i<W.bodies.length;i++){ var b=W.bodies[i], c=cellOf(W,b); if(c>=0){ V[c]=b.kind; B[c]=b; } }
  W.V=V; W.B=B;
}
// a rule writes a kind into a cell; bodies are created, retyped, moved or removed as needed
function putKind(W,i,kind,body){
  var K=KINDS[kind], old=W.B[i];
  if(K.body){
    if(!body) body=addBody(W,kind,i%W.w,(i/W.w)|0);
    if(old&&old!==body) old.dead=true;
    if(body.kind!==kind){ body.kind=kind; if(kind==='<') body.h=180; if(kind==='>') body.h=0; }
    body.x=i%W.w; body.y=(i/W.w)|0; W.B[i]=body; W.T[i]='_'; W.V[i]=kind;
  } else { if(old) old.dead=true; W.B[i]=null; W.T[i]=kind; W.V[i]=kind; }
}

// ---- MODEL: pair rules (one pair at a time, random order)
function applyPair(W,i,j,r){
  var pool=[{b:W.B[i],k:W.V[i],slot:0},{b:W.B[j],k:W.V[j],slot:1}];
  var pick=function(slot,kind){ var o, t;
    var tests=[function(p){ return p.slot===slot&&p.k===kind; }, function(p){ return p.k===kind; },
               function(p){ return p.slot===slot; }, function(){ return true; }];
    for(t=0;t<4;t++) for(o=0;o<2;o++){ var p=pool[o]; if(p.b&&!p.used&&tests[t](p)){ p.used=true; return p.b; } }
    return null; };
  var b0=KINDS[r.a[0]].body?pick(0,r.a[0]):null, b1=KINDS[r.a[1]].body?pick(1,r.a[1]):null;
  pool.forEach(function(p){ if(p.b&&!p.used) p.b.dead=true; });
  W.B[i]=null; W.B[j]=null;
  putKind(W,i,r.a[0],b0); putKind(W,j,r.a[1],b1);
}
function pairsStep(W,rules){
  if(!rules.length) return;
  var n=W.w*W.h, used=new Uint8Array(n), order=new Array(n), i, k;
  for(i=0;i<n;i++) order[i]=i;
  for(i=n-1;i>0;i--){ k=Math.floor(Math.random()*(i+1)); var t=order[i]; order[i]=order[k]; order[k]=t; }
  var D=[[1,0],[-1,0],[0,1],[0,-1]];
  for(var o=0;o<n;o++){ i=order[o]; if(used[i]) continue;
    for(k=0;k<rules.length;k++){ var r=rules[k]; if(W.V[i]!==r.b[0]) continue;
      var d=r.dir==='any'?D[Math.floor(Math.random()*4)]:DIRS[r.dir];
      var nx=i%W.w+d[0], ny=((i/W.w)|0)+d[1];
      if(nx<0||ny<0||nx>=W.w||ny>=W.h) continue;
      var j=ny*W.w+nx; if(used[j]||W.V[j]!==r.b[1]) continue;
      if(Math.random()*100>r.prob) continue;
      applyPair(W,i,j,r); used[i]=1; used[j]=1; break; } }
}

// ---- MODEL: count rules (all at once, any neighbourhood up to 5x5)
function maskOf(kind){ var m=new Array(25).fill(0);
  for(var dy=-2;dy<=2;dy++) for(var dx=-2;dx<=2;dx++){ if(!dx&&!dy) continue;
    var on=kind==='4'?(Math.abs(dx)+Math.abs(dy)===1):kind==='8'?(Math.abs(dx)<=1&&Math.abs(dy)<=1):true;
    m[(dy+2)*5+dx+2]=on?1:0; } return m; }
function numsOf(list){ var n=new Array(25).fill(false); list.forEach(function(k){ n[k]=true; }); return n; }
function maskSize(m){ var n=0; for(var i=0;i<25;i++) n+=m[i]; return n; }
function isWide(m){ for(var dy=-2;dy<=2;dy++) for(var dx=-2;dx<=2;dx++) if((Math.abs(dx)>1||Math.abs(dy)>1)&&m[(dy+2)*5+dx+2]) return true; return false; }
function countAt(V,w,h,i,mask,what){ var n=0, x=i%w, y=(i/w)|0;
  for(var dy=-2;dy<=2;dy++) for(var dx=-2;dx<=2;dx++){ if(!mask[(dy+2)*5+dx+2]) continue;
    var cx=x+dx, cy=y+dy; if(cx<0||cy<0||cx>=w||cy>=h) continue; if(V[cy*w+cx]===what) n++; } return n; }
function countStep(W,rules){
  if(!rules.length) return;
  var V0=W.V.slice(), ch=[], i, k;
  for(i=0;i<V0.length;i++){ var c=V0[i];
    for(k=0;k<rules.length;k++){ var r=rules[k]; if(r.from!==c||r.to===c) continue;
      if(!r.nums[countAt(V0,W.w,W.h,i,r.mask,r.what)]) continue;
      if(r.prob<100&&Math.random()*100>r.prob) continue;
      ch.push([i,r.to]); break; } }
  for(k=0;k<ch.length;k++){ i=ch[k][0]; var b=W.B[i]; W.B[i]=null;
    if(KINDS[ch[k][1]].body) putKind(W,i,ch[k][1],b); else { if(b) b.dead=true; putKind(W,i,ch[k][1],null); } }
}

// ---- MODEL: forces (a field layer, or direct 1/r² in the free face). It only pushes.
function srcOf(card,kind){ var K=KINDS[kind]; return card.sign==='all'?(K.mass||0):(K.q||0); }
function forceOn(W,card,b,q){
  var all=card.sign==='all', s=card.strength/100, cpl=all?1:(q>0?-1:1), free=W.face==='free';
  if(free&&card.direct){
    var G=0.15*s, ax=0, ay=0, i, dx, dy, r2, inv;
    for(i=0;i<W.srcCells.length;i++){ var c=W.srcCells[i];
      dx=c.x-b.x; dy=c.y-b.y; r2=dx*dx+dy*dy+0.05; inv=1/(r2*Math.sqrt(r2)); ax+=G*c.q*cpl*dx*inv; ay+=G*c.q*cpl*dy*inv; }
    for(i=0;i<W.bodies.length;i++){ var o=W.bodies[i]; if(o===b||o.dead) continue; var oq=srcOf(card,o.kind); if(!oq) continue;
      dx=o.x-b.x; dy=o.y-b.y; r2=dx*dx+dy*dy+0.3; inv=1/(r2*Math.sqrt(r2)); ax+=G*oq*cpl*dx*inv; ay+=G*oq*cpl*dy*inv; }
    return [ax,ay];
  }
  var K=(all?0.06:0.15)*s, g, g2=[0,0];
  if(free){ g=gradAt(W.F,b.x,b.y); if(b.self) g2=gradAt(b.self,b.x,b.y); }
  else { var x=Math.round(b.x), y=Math.round(b.y); g=gradCell(W.F,x,y); if(b.self) g2=gradCell(b.self,x,y); }
  // a body must not feel its own field: the engine keeps each body's field and subtracts it
  return [cpl*K*(g[0]-g2[0]), cpl*K*(g[1]-g2[1])];
}
function forcePush(W,card){
  if(!card.strength) return;
  var F=W.F, w=W.w, d=decayFor(card.range), free=W.face==='free', i, b, q;
  W.srcCells=[];
  for(i=0;i<W.T.length;i++){ q=srcOf(card,W.T[i]); if(q) W.srcCells.push({x:i%w,y:(i/w)|0,q:q,i:i}); }
  if(!(free&&card.direct)){
    F.rho.fill(0);
    for(i=0;i<W.srcCells.length;i++) F.rho[W.srcCells[i].i]+=W.srcCells[i].q;
    // a new world starts with the field of its fixed sources already spread, so nothing has to wait for it
    if(!W.warm){ W.warm=true; if(W.srcCells.length) relax(F,d,400); }
    for(i=0;i<W.bodies.length;i++){ b=W.bodies[i]; q=srcOf(card,b.kind); if(!q) continue;
      if(free) deposit(F,b.x,b.y,q); else { var c=cellOf(W,b); if(c>=0) F.rho[c]+=q; } }
    relax(F,d,4);
    for(i=0;i<W.bodies.length;i++){ b=W.bodies[i]; q=srcOf(card,b.kind); if(!q||!KINDS[b.kind].drift) continue;
      if(!b.self||b.self.w!==w||b.self.h!==W.h) b.self=makeField(w,W.h);
      b.self.rho.fill(0);
      if(free) deposit(b.self,b.x,b.y,q); else { var c2=cellOf(W,b); if(c2>=0) b.self.rho[c2]=q; }
      relax(b.self,d,4); }
  }
  for(i=0;i<W.bodies.length;i++){ b=W.bodies[i]; if(!KINDS[b.kind].drift) continue; q=srcOf(card,b.kind); if(!q) continue;
    var f=forceOn(W,card,b,q); b.fx+=f[0]; b.fy+=f[1]; }
}

// ---- MODEL: the medium (jiggle and weight push; drag is applied by motion)
function mediumPush(W,dt){
  var sig=0.5*W.medium.temp/100*Math.sqrt(dt), g=0.012*W.medium.weight/100;
  if(!sig&&!g) return;
  for(var i=0;i<W.bodies.length;i++){ var b=W.bodies[i]; if(!KINDS[b.kind].drift) continue;
    b.fx+=(Math.random()*2-1)*sig; b.fy+=(Math.random()*2-1)*sig+g; }
}

// ---- MODEL: the fish brain (sensors wired to block programs)
const SENSORS = { free:['frente livre','front is free'], wall:['parede','wall'], food:['vê alga','sees alga'], plant:['vê planta','sees a plant'],
  crowd:['vê vizinhos','sees neighbours'], pull:['sente puxão','feels a pull'], dice:['1 em 4','1 in 4'] };
const ACTIONS = { fwd:['nadar','swim'], turn:['dar meia-volta','turn around'], rand:['virar','turn'], eat:['comer','eat'], wait:['esperar','wait'] };
const BLOCKS = { step:['↑','passo','step'], left:['↺','esquerda','left'], right:['↻','direita','right'], act:['◉','agir','act'], wait:['❙❙','esperar','wait'], p1:['P1','chamar P1','call P1'] };
// a mount places a sensor on the body: angle from the front (90 = right), range in cells, opening in degrees
function mountById(card,id){ var M=card.mounts||[]; for(var i=0;i<M.length;i++) if(M[i].id===id) return M[i]; return null; }
function dirCell(b,ang,d){ var rad=(b.h+ang)*Math.PI/180; return [Math.round(b.x+Math.cos(rad)*d), Math.round(b.y+Math.sin(rad)*d)]; }
function coneCells(b,ang,r,f){ var out=[], seen={}, step=Math.max(10,f/6);
  for(var d=1;d<=Math.ceil(r);d++) for(var o=-f/2;o<=f/2+0.01;o+=step){ var p=dirCell(b,ang+o,Math.min(d,r)), k=p[0]+','+p[1]; if(!seen[k]){ seen[k]=1; out.push(p); } }
  return out; }
function aheadOf(b,d){ return dirCell(b,0,d); }
function openCell(W,x,y){ if(x<0||y<0||x>=W.w||y>=W.h) return false; var i=y*W.w+x; return !KINDS[W.T[i]].solid && !W.B[i]; }
function terrainAt(W,x,y){ return (x<0||y<0||x>=W.w||y>=W.h)?'g':W.T[y*W.w+x]; }
function senses(W,b,m){
  var id=m.s, ang=m.a, r=m.r, f=m.f, p, d, i, cells;
  if(id==='free'){ p=dirCell(b,ang,1); return openCell(W,p[0],p[1]); }
  if(id==='wall'){ for(d=1;d<=Math.max(1,Math.round(r));d++){ p=dirCell(b,ang,d); if(KINDS[terrainAt(W,p[0],p[1])].solid) return true; } return false; }
  if(id==='food'||id==='plant'){ var k=id==='food'?'a':'p';
    if(Math.abs(ang)<1&&terrainAt(W,Math.round(b.x),Math.round(b.y))===k) return true;   // a front sensor also feels what it is on
    cells=coneCells(b,ang,r,f); for(i=0;i<cells.length;i++) if(terrainAt(W,cells[i][0],cells[i][1])===k) return true; return false; }
  if(id==='crowd'){ var n=0; cells=coneCells(b,ang,r,f);
    for(i=0;i<cells.length;i++){ var x=cells[i][0], y=cells[i][1]; if(x<0||y<0||x>=W.w||y>=W.h) continue; var o=W.B[y*W.w+x]; if(o&&o!==b) n++; } return n>=2; }
  if(id==='pull'){ var g=gradCell(W.F,Math.max(0,Math.min(W.w-1,Math.round(b.x))),Math.max(0,Math.min(W.h-1,Math.round(b.y)))), rad=(b.h+ang)*Math.PI/180;
    return g[0]*Math.cos(rad)+g[1]*Math.sin(rad)>0.01; }   // the field layer rises that way
  if(id==='dice') return Math.random()<0.25;
  return false;
}
// the next block of the running action, following a call into P1 and back
function nextBlock(card,b){ var main=card.programs[b.act]||[], p1=card.p1||[], guard=0;
  while(guard++<20){
    if(b.pp>=0){ if(b.pp<p1.length){ b.last=['p1',b.pp]; return p1[b.pp++]; } b.pp=-1; continue; }
    if(b.pc<main.length){ var k=main[b.pc++]; if(k==='p1'){ if(p1.length) b.pp=0; continue; } b.last=['main',b.pc-1]; return k; }
    return null; }
  return null; }
function brainAct(W,card){
  var list=W.bodies.slice();
  for(var n=0;n<list.length;n++){ var b=list[n]; if(b.dead||(b.kind!=='>'&&b.kind!=='<')) continue;
    if(b.pp===undefined) b.pp=-1;
    var main=card.programs[b.act]||[], p1=card.p1||[];
    var busy=!!b.act&&((b.pp>=0&&b.pp<p1.length)||b.pc<main.length);
    if(!busy){ // an action runs to the end before sensors are read again
      var hit=null; for(var k=0;k<card.wires.length;k++){ var mt=mountById(card,card.wires[k][0]); if(mt&&senses(W,b,mt)){ hit=card.wires[k]; break; } }
      b.act=card.only||(hit?hit[1]:'fwd'); b.pc=0; b.pp=-1; }
    var blk=nextBlock(card,b); if(!blk) continue;
    var x=Math.round(b.x), y=Math.round(b.y), i=y*W.w+x, p;
    if(blk==='step'){ p=aheadOf(b,1);
      if(openCell(W,p[0],p[1])){ W.B[i]=null; W.V[i]=W.T[i]; b.x=p[0]; b.y=p[1]; var j=p[1]*W.w+p[0]; W.B[j]=b; W.V[j]=b.kind; } }
    else if(blk==='left'||blk==='right'){ b.h=(b.h+(blk==='left'?270:90))%360;
      var c=Math.cos(b.h*Math.PI/180); if(c>0.5) b.kind='>'; else if(c<-0.5) b.kind='<'; W.V[i]=b.kind; }
    else if(blk==='act'){ // eats where it is and the three cells in front of its mouth
      [[x,y],aheadOf(b,1),dirCell(b,-45,1.42),dirCell(b,45,1.42)].forEach(function(q){ if(terrainAt(W,q[0],q[1])==='a'&&q[0]>=0&&q[1]>=0&&q[0]<W.w&&q[1]<W.h){ var e=q[1]*W.w+q[0];
        W.T[e]='_'; if(!W.B[e]) W.V[e]='_'; W.ev.eat=(W.ev.eat||0)+1; } }); }
  }
}

// ---- MODEL: motion — the only model that moves drifting bodies
function canEnter(W,x,y,b){
  if(x<0||y<0||x>=W.w||y>=W.h) return false;
  var i=y*W.w+x; if(W.B[i]) return false;
  var t=W.T[i]; if(t==='_') return true;
  return !!KINDS[t].pore && !!W.pass[b.kind];
}
function moveCells(W){
  var P=W.bodies.filter(function(b){ return KINDS[b.kind].drift&&!b.dead; }), keep=1-W.medium.drag/100, i;
  for(i=P.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)), t=P[i]; P[i]=P[j]; P[j]=t; }
  for(i=0;i<P.length;i++){ var b=P[i], w=W.w;
    b.vx=Math.max(-0.9,Math.min(0.9,(b.vx+b.fx)*keep)); b.vy=Math.max(-0.9,Math.min(0.9,(b.vy+b.fy)*keep));
    b.ax+=b.vx; b.ay+=b.vy;
    if(Math.abs(b.ax)>=1){ var dx=b.ax>0?1:-1; // a hop happens when the saved-up movement crosses a whole cell
      if(canEnter(W,b.x+dx,b.y,b)){ var c=b.y*w+b.x; W.B[c]=null; W.V[c]=W.T[c]; b.x+=dx; c=b.y*w+b.x; W.B[c]=b; W.V[c]=b.kind; b.ax-=dx; }
      else { b.vx*=-0.2; b.ax=0; } }
    if(Math.abs(b.ay)>=1){ var dy=b.ay>0?1:-1;
      if(canEnter(W,b.x,b.y+dy,b)){ var c3=b.y*w+b.x; W.B[c3]=null; W.V[c3]=W.T[c3]; b.y+=dy; c3=b.y*w+b.x; W.B[c3]=b; W.V[c3]=b.kind; b.ay-=dy; }
      else { b.vy*=-0.2; b.ay=0; } }
  }
}
function moveFree(W,dt){
  var keep=1-W.medium.drag/100*dt, star=null, i;
  for(i=0;i<W.T.length;i++) if(KINDS[W.T[i]].absorb){ star={x:i%W.w,y:(i/W.w)|0}; break; }
  for(i=0;i<W.bodies.length;i++){ var b=W.bodies[i]; if(!KINDS[b.kind].drift||b.dead) continue;
    b.vx=(b.vx+b.fx*dt)*keep; b.vy=(b.vy+b.fy*dt)*keep;
    var ox=b.x, oy=b.y; b.x+=b.vx*dt; b.y+=b.vy*dt;
    var cx=Math.round(b.x), cy=Math.round(b.y), inside=cx>=0&&cy>=0&&cx<W.w&&cy<W.h;
    if(inside){ var K=KINDS[W.T[cy*W.w+cx]];
      if(K.absorb){ var ddx=b.x-cx, ddy=b.y-cy; if(ddx*ddx+ddy*ddy<0.8){ b.dead=true; W.ev.capture=(W.ev.capture||0)+1; continue; } }
      else if(K.solid||(K.pore&&!W.pass[b.kind])){ if(Math.round(ox)!==cx){ b.vx=-b.vx*0.8; b.x=ox; } if(Math.round(oy)!==cy){ b.vy=-b.vy*0.8; b.y=oy; } } }
    else if(W.edge==='wall'){ if(cx<0||cx>=W.w){ b.vx=-b.vx*0.8; b.x=ox; } if(cy<0||cy>=W.h){ b.vy=-b.vy*0.8; b.y=oy; } }
    else if(b.x<-12||b.y<-12||b.x>W.w+12||b.y>W.h+12){ b.dead=true; W.ev.escape=(W.ev.escape||0)+1; continue; }
    if(star){ var a=Math.atan2(b.y-star.y,b.x-star.x);
      if(b.la!==null){ var da=a-b.la; if(da>Math.PI) da-=6.2832; if(da<-Math.PI) da+=6.2832; b.sum+=da;
        var rev=Math.floor(Math.abs(b.sum)/6.2832); if(rev>b.rev){ W.ev.orbit=(W.ev.orbit||0)+rev-b.rev; b.rev=rev; } }
      b.la=a; }
    if(!b.trail) b.trail=[]; b.trail.push(b.x,b.y); if(b.trail.length>700) b.trail.splice(0,2);
  }
}

// ---- THE ENGINE: fixed phases, and within a phase the order of the cards in the list
function stepWorld(W){
  var L=W.laws.filter(function(c){ return c.on; }), free=W.face==='free', subs=free?2:1, dt=free?0.5:1, i, s;
  buildView(W);
  for(s=0;s<subs;s++){
    for(i=0;i<W.bodies.length;i++){ W.bodies[i].fx=0; W.bodies[i].fy=0; }
    for(i=0;i<L.length;i++) if(L[i].type==='force') forcePush(W,L[i]);      // 1 · push
    mediumPush(W,dt);
    if(s===0) for(i=0;i<L.length;i++) if(L[i].type==='brain') brainAct(W,L[i]); // 2 · act
    if(free) moveFree(W,dt); else moveCells(W);                               // 3 · move
  }
  if(free){ W.bodies=W.bodies.filter(function(b){ return !b.dead; }); buildView(W); }
  pairsStep(W,L.filter(function(c){ return c.type==='pair'; }));             // 4 · rules, one pair at a time
  countStep(W,L.filter(function(c){ return c.type==='count'; }));            // 5 · rules, all at once
  W.bodies=W.bodies.filter(function(b){ return !b.dead; });
  for(i=0;i<W.bodies.length;i++){ var b=W.bodies[i]; if(b.kind==='>'||b.kind==='<'){ if(b.x<=1) W.mem.hitL=1; if(b.x>=W.w-2) W.mem.hitR=1; } }
  W.tick++;
}

// ---- probes: what charts and goals read (never flags set inside a model)
function biggestCluster(W){
  var at={}, seen={}, big=0, i;
  for(i=0;i<W.bodies.length;i++) if(KINDS[W.bodies[i].kind].drift) at[Math.round(W.bodies[i].x)+','+Math.round(W.bodies[i].y)]=1;
  for(var k in at){ if(seen[k]) continue; var st=[k], n=0; seen[k]=1;
    while(st.length){ var c=st.pop().split(','), x=+c[0], y=+c[1]; n++;
      for(var dy=-1;dy<=1;dy++) for(var dx=-1;dx<=1;dx++){ var q=(x+dx)+','+(y+dy); if(at[q]&&!seen[q]){ seen[q]=1; st.push(q); } } }
    if(n>big) big=n; }
  return big;
}
const PROBES = {
  tick:function(W){ return W.tick; },
  walls:function(W){ return (W.mem.hitL?1:0)+(W.mem.hitR?1:0); },
  orbits:function(W){ return W.ev.orbit||0; }, escapes:function(W){ return W.ev.escape||0; }, captures:function(W){ return W.ev.capture||0; },
  eaten:function(W){ return W.ev.eat||0; },
  reach:function(W,arg){ var t=arg.split(','), tx=+t[0], ty=+t[1];
    for(var i=0;i<W.bodies.length;i++){ var b=W.bodies[i]; if((b.kind==='>'||b.kind==='<')&&Math.abs(b.x-tx)<=1&&Math.abs(b.y-ty)<=1) return 1; } return 0; },
  blocks:function(W){ var n=0; W.laws.forEach(function(c){ if(c.type!=='brain') return; n+=(c.p1||[]).length; for(var k in c.programs) n+=c.programs[k].length; }); return n; },
  biggest:biggestCluster,
  count:function(W,k){ var n=0, i; for(i=0;i<W.T.length;i++) if(W.T[i]===k) n++; for(i=0;i<W.bodies.length;i++) if(W.bodies[i].kind===k) n++; return n; },
  right:function(W,k){ var n=0, mid=(W.w-1)/2; for(var i=0;i<W.bodies.length;i++) if(W.bodies[i].kind===k&&W.bodies[i].x>mid) n++; return n; }
};

function goalMet(W,goal){ return goal.tests.every(function(t){ var p=t[0].split(':'), v=PROBES[p[0]](W,p[1]); return t[1]==='<='?v<=t[2]:v>=t[2]; }); }

// ---- saving and restoring a world (this is all a scenario is: data)
function snapshot(W){
  return JSON.stringify({w:W.w,h:W.h,face:W.face,edge:W.edge,T:W.T.join(''),
    bodies:W.bodies.map(function(b){ return [b.kind,b.x,b.y,b.vx,b.vy]; }),laws:W.laws,medium:W.medium,pass:W.pass,lens:W.lens});
}
function restore(json){
  var d=JSON.parse(json), W=makeWorld(d.w,d.h,d.face);
  W.edge=d.edge; W.T=d.T.split(''); W.laws=d.laws; W.medium=d.medium; W.pass=d.pass; W.lens=d.lens;
  d.bodies.forEach(function(b){ addBody(W,b[0],b[1],b[2],b[3],b[4]); });
  buildView(W); return W;
}

// ---- recording: a photograph of the world, and what each model can read from two of them
function photo(W){ buildView(W); var pos={};
  W.bodies.forEach(function(b){ pos[b.id]=[Math.round(b.x),Math.round(b.y),b.kind]; });
  return {w:W.w,h:W.h,V:W.V.slice(),pos:pos}; }
function movesBetween(A,B){ var M=[];
  for(var id in A.pos){ var a=A.pos[id], b=B.pos[id]; if(!b) continue; var dx=b[0]-a[0], dy=b[1]-a[1]; if(!dx&&!dy) continue;
    M.push({id:id,kind:a[2],ax:a[0],ay:a[1],bx:b[0],by:b[1],dx:dx,dy:dy,far:Math.abs(dx)+Math.abs(dy)>1}); }
  return M; }
const HARVEST = {
  // pair rules: something next to something became something else (v4's two-pass diff)
  pair:function(A,B,M){
    var w=A.w,h=A.h,b=A.V,a=B.V,groups={},taken={},skip={},i,x,y,d,NB={right:[1,0],left:[-1,0],down:[0,1],up:[0,-1]};
    M.forEach(function(m){ if(m.far){ skip[m.ay*w+m.ax]=1; skip[m.by*w+m.bx]=1; } });
    var add=function(bp,ap,dir){ if(bp[0]===ap[0]&&bp[1]===ap[1]) return; var key='pair:'+bp.join('')+'>'+ap.join('')+':'+dir;
      if(!groups[key]) groups[key]={type:'pair',key:key,n:0,b:bp,a:ap,dir:dir}; groups[key].n++; };
    for(i=0;i<b.length;i++){ if(b[i]===a[i]||b[i]==='_'||taken[i]||skip[i]) continue; x=i%w; y=(i/w)|0;
      for(d in NB){ var nx=x+NB[d][0], ny=y+NB[d][1]; if(nx<0||ny<0||nx>=w||ny>=h) continue; var j=ny*w+nx; if(taken[j]||skip[j]) continue;
        if(a[j]===b[i]&&b[j]!==a[j]){ add([b[i],b[j]],[a[i],a[j]],d); taken[i]=1; taken[j]=1; break; } } }
    for(i=0;i<b.length;i++){ if(b[i]===a[i]||taken[i]||skip[i]) continue; x=i%w; y=(i/w)|0; var best=null, fb=null;
      for(d in NB){ var cx=x+NB[d][0], cy=y+NB[d][1]; if(cx<0||cy<0||cx>=w||cy>=h) continue; var q=cy*w+cx; if(b[q]!==a[q]) continue;
        if(b[q]!=='_'){ best=[q,d]; break; } if(!fb) fb=[q,d]; }
      var ch=best||fb; if(!ch) continue; add([b[i],b[ch[0]]],[a[i],a[ch[0]]],ch[1]); taken[i]=1; }
    var list=Object.keys(groups).map(function(k){ return groups[k]; }), seen={};
    list.forEach(function(g){ var k=g.b.join('')+':'+g.dir; seen[k]=(seen[k]||0)+1; });
    list.forEach(function(g){ g.clash=seen[g.b.join('')+':'+g.dir]>1; g.thin=g.b[0]==='_'&&g.b[1]==='_';
      g.card={type:'pair',on:true,b:g.b,a:g.a,dir:g.dir,prob:g.n>1?100:60}; });
    return list.sort(function(p,q){ return q.n-p.n; }).slice(0,4);
  },
  // count rules: the cells that changed all saw a number the unchanged ones never saw
  count:function(A,B,M){
    var w=A.w,h=A.h,b=A.V,a=B.V,skip={},groups={},i,out=[],m8=maskOf('8'),kinds={};
    M.forEach(function(m){ skip[m.ay*w+m.ax]=1; skip[m.by*w+m.bx]=1; });
    for(i=0;i<b.length;i++){ if(b[i]!=='_') kinds[b[i]]=1; if(b[i]===a[i]||skip[i]) continue; var k=b[i]+'>'+a[i]; (groups[k]=groups[k]||[]).push(i); }
    Object.keys(groups).forEach(function(k){ var cells=groups[k]; if(cells.length<2) return; var from=k[0], to=k[2];
      var order=[to,from].concat(Object.keys(kinds)).filter(function(q,n,arr){ return q!=='_'&&arr.indexOf(q)===n; });
      for(var o=0;o<order.length;o++){ var what=order[o], cs={}, us={}, clean=true, c;
        cells.forEach(function(q){ cs[countAt(b,w,h,q,m8,what)]=1; });
        for(c=0;c<b.length;c++) if(b[c]===from&&a[c]===from&&!skip[c]) us[countAt(b,w,h,c,m8,what)]=1;
        for(c in cs) if(us[c]) clean=false;
        if(!clean||!Object.keys(us).length) continue;
        var nums=Object.keys(cs).map(Number);
        out.push({type:'count',key:'count:'+k+':'+what+':'+nums.join(','),n:cells.length,
          card:{type:'count',on:true,from:from,what:what,nums:numsOf(nums),to:to,mask:m8.slice(),prob:100}}); break; } });
    return out;
  },
  // forces: bodies moved toward or away from their nearest neighbour. Only the sign can be read.
  force:function(A,B,M){
    var D=M.filter(function(m){ return KINDS[m.kind].drift; }), t={n:0,app:0,likeAway:0,likeApp:0,unApp:0,unAway:0};
    D.forEach(function(m){ var best=null, bd=1e9, id;
      for(id in A.pos){ if(id===m.id||!KINDS[A.pos[id][2]].drift) continue; var o=A.pos[id], d=Math.hypot(o[0]-m.ax,o[1]-m.ay); if(d<bd){ bd=d; best=o; } }
      if(!best) return; var d1=Math.hypot(best[0]-m.bx,best[1]-m.by); if(Math.abs(d1-bd)<0.01) return;
      var app=d1<bd, qa=KINDS[m.kind].q||0, qb=KINDS[best[2]].q||0; t.n++; if(app) t.app++;
      if(qa&&qb){ if(qa*qb>0){ if(app) t.likeApp++; else t.likeAway++; } else { if(app) t.unApp++; else t.unAway++; } } });
    var out=[];
    if(t.likeAway+t.unApp>=2&&!t.likeApp&&!t.unAway) out.push({type:'force',key:'force:like',n:t.likeAway+t.unApp,card:{type:'force',on:true,sign:'like',strength:60,range:6,direct:false}});
    else if(t.n>=2&&t.app===t.n) out.push({type:'force',key:'force:all',n:t.n,card:{type:'force',on:true,sign:'all',strength:60,range:6,direct:false}});
    return out;
  },
  // the medium: everything sank (weight), or everything wandered with no pattern (jiggle)
  medium:function(A,B,M){
    var D=M.filter(function(m){ return KINDS[m.kind].drift; }), n=D.length, sx=0, sy=0, len=0, down=0;
    if(n<3) return [];
    D.forEach(function(m){ sx+=m.dx; sy+=m.dy; len+=Math.hypot(m.dx,m.dy); if(m.dy>0&&Math.abs(m.dy)>=Math.abs(m.dx)) down++; });
    if(down===n) return [{type:'medium',key:'medium:weight',n:n,medium:{weight:50}}];
    if(n>=4&&Math.hypot(sx,sy)/len<0.45) return [{type:'medium',key:'medium:temp',n:n,medium:{temp:40}}];
    return [];
  }
};
function harvestAll(A,B){ if(!A||!B||A.w!==B.w||A.h!==B.h) return []; var M=movesBetween(A,B), out=[];
  ['pair','count','force','medium'].forEach(function(k){ out=out.concat(HARVEST[k](A,B,M)); });
  // a count rule that explains a change makes the pair reading of the same change redundant
  var cov={}; out.forEach(function(g){ if(g.type==='count') cov[g.card.from+'>'+g.card.to]=1; });
  out=out.filter(function(g){ if(g.type!=='pair') return true;
    for(var k=0;k<2;k++) if(g.b[k]!==g.a[k]&&!cov[g.b[k]+'>'+g.a[k]]) return true; return false; });
  return out.sort(function(p,q){ return q.n-p.n; }); }

export { KINDS, BRUSHES, RULE_KINDS, DIRS, makeField, decayFor, relax, gradCell, gradAt, deposit, makeWorld, addBody, cellOf, buildView, putKind, applyPair, pairsStep, maskOf, numsOf, maskSize, isWide, countAt, countStep, srcOf, forceOn, forcePush, mediumPush, SENSORS, ACTIONS, BLOCKS, mountById, dirCell, coneCells, aheadOf, openCell, terrainAt, senses, nextBlock, brainAct, canEnter, moveCells, moveFree, stepWorld, biggestCluster, PROBES, goalMet, snapshot, restore, photo, movesBetween, HARVEST, harvestAll };
