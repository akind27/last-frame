import { SCENES, FRAME, STEP, DURATION, position, clampFrame, createRun, advance, result, replayFrame } from './model.js';
import { createPack } from './scenes.js';

const $ = id => document.getElementById(id);
const canvas = $('arena'), ctx = canvas.getContext('2d');
let mode = 'idle', sceneIndex = 0, camera = { x: .5, y: .5 }, run = null;
let completed = [], replayTime = 0, lastTime = null, pointer = null;
let packNumber = 1, pack = createPack(packNumber), slot = 0;
let transition = 0, replayReturn = 'result', lastActivity = performance.now();
const TRANSITION_SECONDS = 2.5, IDLE_SECONDS = 120;
const keys = new Set();
$('motion').checked = matchMedia('(prefers-reduced-motion: reduce)').matches;

function announce(message) { $('announcement').textContent = message; }
function clearInput() { keys.clear(); pointer = null; }
function setMode(next) {
  mode = next; document.body.dataset.mode = next;
  const review = next === 'result' || next === 'summary';
  $('signal').textContent = ({ idle: 'READY', playing: 'ON AIR', paused: 'PAUSED', result: 'TAKE COMPLETE', summary: 'BROADCAST COMPLETE', replay: 'REPLAY' })[next];
  $('monitor-state').textContent = ({ idle: 'SCOUT THE COURT', playing: 'LIVE', paused: 'PAUSED', result: 'TAKE COMPLETE', summary: 'BEST TAKE', replay: 'YOUR TAKE' })[next];
  $('pause').disabled = next !== 'playing' && !(next === 'result' && transition > 0);
  $('pause').textContent = next === 'result' ? 'Hold result' : 'Pause';
  $('pause-overlay').hidden = next !== 'paused';
  $('primary').hidden = next === 'playing' || next === 'paused';
  $('primary').disabled = next === 'replay';
  $('replay').hidden = !review && next !== 'replay';
  $('replay').textContent = next === 'replay' ? 'Stop replay' : next === 'summary' ? 'Replay best take' : 'Replay your take';
  $('feedback').hidden = !review && next !== 'replay';
  $('broadcast').hidden = next !== 'summary' && !(next === 'replay' && replayReturn === 'summary');
  $('next-pack').hidden = next !== 'idle' && next !== 'summary';
  $('shot-label').textContent = next === 'replay' ? 'YOUR RECORDED SHOT' : review ? 'YOUR DECISIVE MOMENT' : 'YOUR LIVE SHOT';
  $('shot-caption').textContent = review ? 'White dashed frame = ideal shot.' : 'This is what your audience sees.';
  clearInput(); lastTime = null;
}

function labelScene() {
  $('scene-number').textContent = `${String(slot + 1).padStart(2,'0')} / 09`;
  $('scene-name').textContent = SCENES[sceneIndex].name;
  $('instruction').textContent = SCENES[sceneIndex].hint;
  $('event-marker').style.left = `${SCENES[sceneIndex].event / DURATION * 100}%`;
  $('run-note').textContent = `PACK ${String(packNumber).padStart(4,'0')} · Nine plays. Same pack, same order. Silent game.`;
}

function reset() {
  slot = 0; sceneIndex = pack[0]; completed = []; run = null; transition = 0;
  camera = { x: .5, y: .5 }; lastActivity = performance.now();
  $('primary').textContent = 'Go live'; $('total').hidden = true;
  $('transition-note').textContent = ''; $('broadcast-list').replaceChildren();
  setMode('idle'); labelScene(); announce('Ready for a new broadcast.');
}

function startScene() {
  sceneIndex = pack[slot]; transition = 0;
  camera = { x: .5, y: .5 }; run = createRun(sceneIndex);
  $('total').hidden = true; $('transition-note').textContent = '';
  setMode('playing'); labelScene();
  announce(`Play ${slot + 1} of 9: ${SCENES[sceneIndex].name}. ${SCENES[sceneIndex].hint}`);
  canvas.focus({ preventScroll: true });
  const bounds = canvas.getBoundingClientRect();
  if (bounds.top < 0 || bounds.bottom > innerHeight) canvas.closest('.studio').scrollIntoView({ block: 'start', behavior: 'instant' });
}

function showScore(score) {
  $('score').textContent = score.total;
  $('action-score').textContent = `${score.action} / 60`;
  $('actors-score').textContent = `${score.actors} / 25`;
  $('steady-score').textContent = `${score.steady} / 15`;
  $('verdict').textContent = score.total >= 80 ? 'MOMENT CAUGHT' : score.total >= 35 ? 'ALMOST ON AIR' : 'OUT OF FRAME';
  $('explanation').textContent = score.total >= 95 ? 'You read the play and held the shot. Both sides of the moment made it on air.' : SCENES[sceneIndex].explanation;
}

function showSummary() {
  const best = completed.reduce((a,b) => b.score.total > a.score.total ? b : a);
  run = best.run; sceneIndex = run.sceneIndex; transition = 0;
  showScore(best.score); labelScene();
  $('scene-number').textContent = '09 / 09';
  $('scene-name').textContent = 'Your best take';
  $('instruction').textContent = SCENES[sceneIndex].name;
  $('total').hidden = false;
  $('total').textContent = `YOUR BROADCAST: ${completed.reduce((sum,item) => sum + item.score.total,0)} / 900`;
  $('broadcast-count').textContent = `${completed.filter(item => item.score.total >= 80).length} / 9 moments caught · 80+ points counts as caught`;
  $('broadcast-list').replaceChildren(...completed.map(item => {
    const row = document.createElement('li'), title = document.createElement('span'), value = document.createElement('strong');
    title.textContent = SCENES[item.run.sceneIndex].name; value.textContent = `${item.score.total} / 100`;
    row.append(title,value); return row;
  }));
  $('primary').textContent = 'Play same pack'; $('transition-note').textContent = 'Broadcast complete. Replay your best take, or go live again.';
  setMode('summary'); announce(`${$('total').textContent}. ${$('broadcast-count').textContent}.`);
  $('primary').focus({ preventScroll: true });
}

function finish() {
  const score = result(run); completed[slot] = { score, run };
  if (slot === pack.length - 1) { showSummary(); return; }
  showScore(score); transition = TRANSITION_SECONDS;
  $('primary').textContent = 'Next play';
  setMode('result');
  announce(`${$('verdict').textContent}. ${score.total} out of 100. Next play starts automatically. Choose Hold result to review.`);
}

function pause(reason) {
  if (mode === 'replay') { setMode(replayReturn); return; }
  if (mode === 'result') {
    transition = 0; $('transition-note').textContent = 'Result held. Select Next play when ready.'; setMode('result'); return;
  }
  if (mode !== 'playing') return;
  $('pause-reason').textContent = reason; setMode('paused'); announce(reason);
}

$('primary').addEventListener('click', () => {
  if (mode === 'idle' || mode === 'summary') { completed = []; slot = 0; }
  else if (mode === 'result') slot++;
  else return;
  startScene();
});
$('restart').addEventListener('click', reset);
$('next-pack').addEventListener('click', () => {
  if (mode !== 'idle' && mode !== 'summary') return;
  packNumber = packNumber % 9999 + 1; pack = createPack(packNumber); reset();
});
$('pause').addEventListener('click', () => pause('Your take is paused. Resume when you’re ready.'));
$('resume').addEventListener('click', () => { if (mode === 'paused') { setMode('playing'); canvas.focus({ preventScroll: true }); } });
$('replay').addEventListener('click', () => {
  if (mode === 'replay') setMode(replayReturn);
  else if (mode === 'result' || mode === 'summary') {
    replayReturn = mode; transition = 0; replayTime = 0;
    $('transition-note').textContent = 'Replay uses the camera movement you recorded. Scores are unchanged.';
    setMode('replay'); announce('Replaying your actual camera movement.');
  }
});
for (const event of ['pointerdown','pointermove','keydown','click']) document.addEventListener(event, () => { lastActivity = performance.now(); }, { passive: true });
document.addEventListener('visibilitychange', () => { if (document.hidden) pause('You left the tab. Your take is waiting right here.'); });
window.addEventListener('blur', () => pause('The window lost focus. Your take is paused.'));

for (const element of [canvas, $('pad')]) {
  element.addEventListener('pointerdown', event => {
    if (mode !== 'playing' || pointer || !event.isPrimary || event.button !== 0) return;
    event.preventDefault(); element.focus({ preventScroll: true });
    const rect = canvas.getBoundingClientRect();
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, frame: { ...camera }, width: rect.width, height: rect.height, direct: element === canvas, rect };
    element.setPointerCapture(event.pointerId);
    if (pointer.direct) camera = clampFrame({ x: (event.clientX - rect.left) / rect.width, y: (event.clientY - rect.top) / rect.height });
  });
  element.addEventListener('pointermove', event => {
    if (mode !== 'playing' || !pointer || pointer.id !== event.pointerId) return;
    camera = clampFrame(pointer.direct
      ? { x: (event.clientX - pointer.rect.left) / pointer.width, y: (event.clientY - pointer.rect.top) / pointer.height }
      : { x: pointer.frame.x + (event.clientX - pointer.x) / pointer.width, y: pointer.frame.y + (event.clientY - pointer.y) / pointer.height });
  });
  element.addEventListener('pointerup', event => { if (pointer?.id === event.pointerId) pointer = null; });
  element.addEventListener('pointercancel', event => { if (pointer?.id === event.pointerId) { pointer = null; pause('Touch was interrupted. Resume to keep your take.'); } });
  element.addEventListener('lostpointercapture', event => { if (pointer?.id === event.pointerId) pointer = null; });
  element.addEventListener('keydown', event => {
    if (mode === 'playing' && ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)) { event.preventDefault(); keys.add(event.key); }
    if (event.key === 'Escape') pause('Your take is paused.');
  });
  element.addEventListener('keyup', event => keys.delete(event.key));
  element.addEventListener('blur', () => keys.clear());
}
window.addEventListener('resize', () => { if (pointer) pause('The view changed during your drag. Resume when ready.'); });

function line(x1,y1,x2,y2,color,width=1) { ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke(); }
function circle(x,y,r,color,fill=true) { ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx[fill?'fillStyle':'strokeStyle']=color;ctx[fill?'fill':'stroke'](); }
function text(value,x,y,size,color,align='left') {ctx.font=`800 ${size}px BarlowCondensed, Arial, sans-serif`;ctx.textAlign=align;ctx.fillStyle=color;ctx.fillText(value,x,y);}
function polygon(points,fill,stroke=null,width=.002) {
  ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();
  ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}
}
function box(x,y,w,h,color) {ctx.fillStyle=color;ctx.fillRect(x,y,w,h);}
function ellipse(x,y,rx,ry,color) {ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();}
const scenery=document.createElement('canvas');
const sceneryCtx=scenery.getContext('2d');
let scenerySize=0;

function tree(x,y,size) {
  ellipse(x+.016,y+.035,size*.85,size*.33,'#285d4c45');
  polygon([[x-.006,y],[x+.006,y],[x+.009,y+.04],[x-.008,y+.04]],'#80684c');
  polygon([[x,y-size],[x+size*.85,y-size*.25],[x+size*.75,y+.015],[x-.65*size,y+.025],[x-size,y-size*.26]],'#277e5a');
  polygon([[x,y-size],[x+size*.55,y-size*.26],[x-.1*size,y+.003],[x-size,y-size*.26]],'#65ba59');
  polygon([[x,y-size],[x-.1*size,y+.003],[x-size,y-size*.26]],'#8ed36a');
}
function goal(x,y,w,h) {
  polygon([[x,y+h],[x+w,y+h],[x+w+.012,y+h+.014],[x+.012,y+h+.014]],'#0a436d55');
  box(x,y,w,h,'#163f69');
  for(let i=1;i<8;i++) line(x+w*i/8,y,x+w*i/8,y+h,'#7da9bf',.0013);
  for(let i=1;i<4;i++) line(x,y+h*i/4,x+w,y+h*i/4,'#7da9bf',.0013);
  ctx.strokeStyle='#e7f6ef';ctx.lineWidth=.006;ctx.strokeRect(x,y,w,h);
  line(x,y+h,x+w,y+h,'#ffe487',.005);
}
function drawScenery() {
  box(0,0,1,1,'#77ba67');
  polygon([[0,0],[.37,0],[.09,.29],[0,.27]],'#a4cc77');
  polygon([[.74,0],[1,0],[1,.35]],'#519868');
  polygon([[0,.74],[.34,1],[0,1]],'#91c975');
  polygon([[.7,1],[1,.74],[1,1]],'#4f9c68');
  for(let i=0;i<18;i++) {
    const x=((i*137)%100)/100,y=i%2?.975:.027;
    polygon([[x,y],[x+.008,y-.009],[x+.014,y],[x+.02,y-.006],[x+.026,y+.002]],'#448b57');
  }
  // Raised concrete surround, with a sunlit lip and a shaded south wall.
  polygon([[.052,.077],[.948,.077],[.972,.112],[.972,.952],[.063,.952],[.052,.932]],'#626e77');
  box(.043,.065,.914,.868,'#e5d6a1');
  box(.066,.086,.868,.823,'#154c70');
  box(.079,.096,.842,.799,'#289eb6');
  polygon([[.079,.096],[.921,.096],[.921,.496],[.079,.496]],'#319bb4');
  polygon([[.079,.496],[.921,.496],[.921,.895],[.079,.895]],'#2486a7');
  // Painted goal zones and broad, readable markings.
  box(.355,.108,.29,.138,'#27789c');
  box(.126,.766,.23,.115,'#286d98');
  ctx.strokeStyle='#c1ece0';ctx.lineWidth=.0035;ctx.strokeRect(.105,.122,.79,.745);
  line(.105,.496,.895,.496,'#b0ded7',.0035);
  ctx.lineWidth=.0035;circle(.5,.496,.115,'#b0ded7',false);circle(.5,.496,.007,'#b0ded7');
  ctx.strokeRect(.355,.122,.29,.135);ctx.strokeRect(.126,.745,.23,.122);
  line(.48,.496,.52,.496,'#b0ded7',.003);line(.5,.476,.5,.516,'#b0ded7',.003);
  // Original painted court emblem; kept below the action contrast.
  polygon([[.507,.421],[.468,.49],[.498,.49],[.476,.555],[.54,.477],[.51,.477],[.53,.421]],'#65b8c6');
  text('LAST FRAME',.5,.659,.061,'#5cb2bf','center');
  text('CATCH THE PLAY',.5,.687,.016,'#78c6cc','center');
  goal(.388,.085,.224,.055);goal(.15,.852,.18,.05);
  // Sideline planks, stanchions and equipment give the arena a physical edge.
  for(const x of [.048,.93]) {
    for(let i=0;i<6;i++) {
      const y=.17+i*.105;
      box(x+.007,y+.01,.017,.075,'#254d6490');
      box(x,y,.014,.075,'#244d7f');box(x-.002,y,.014,.018,'#5792b7');
    }
  }
  for(let i=0;i<4;i++) {
    const x=.15+i*.058;
    polygon([[x,.037],[x+.045,.037],[x+.047,.065],[x,.065]],'#0c5582');
    box(x,.033,.045,.015,i%2?'#55cad7':'#ffe076');
  }
  for(let i=0;i<4;i++) {box(.59+i*.058,.924,.045,.019,'#0a5282');box(.59+i*.058,.916,.045,.012,i%2?'#ff997f':'#ffe076');}
  tree(.965,.07,.055);tree(.02,.77,.04);tree(.9,.978,.06);
  polygon([[.018,.957],[.036,.934],[.065,.94],[.074,.97],[.035,.983]],'#73918a');
  polygon([[.018,.957],[.036,.934],[.065,.94],[.048,.96]],'#b5c1a0');
  // Tiny corner pennants, still unless the play itself moves.
  for(const [x,y,c] of [[.09,.075,'#ffe347'],[.91,.925,'#ff907c']]) {
    line(x+.008,y+.045,x+.008,y-.015,'#183c65',.003);
    polygon([[x+.008,y-.015],[x+.048,y-.006],[x+.008,y+.01]],c);
  }
}
function drawPlayer(actor,i,t) {
  const p=position(actor.path,t),next=position(actor.path,Math.min(DURATION,t+.1));
  const moving=Math.hypot(next.x-p.x,next.y-p.y)>.0001;
  const stride=$('motion').checked||!moving?0:Math.sin(t*15+i*2);
  const lean=Math.max(-.003,Math.min(.003,(next.x-p.x)*.3));
  const blue=actor.team==='cyan',jersey=blue?'#70e8fa':'#ff927b',shade=blue?'#1689bf':'#bf485b';
  const skin=i===1?'#c58358':'#f0b183',skinShade=i===1?'#94543f':'#bf795a';
  ctx.save();ctx.translate(p.x,p.y);
  ellipse(.014,.032,.035,.012,'#093f6b55');
  ctx.lineWidth=.002;circle(0,.011,.034,blue?'#95effa':'#ffc2a5',false);
  // Boots and trousers: counter-moving limbs read as a run at small sizes.
  line(-.012,.007,-.014+stride*.004,.031+stride*.007,'#162b55',.015);
  line(.012,.007,.014-stride*.004,.031-stride*.007,'#162b55',.015);
  line(-.019+stride*.004,.034+stride*.007,-.006+stride*.004,.034+stride*.007,'#e9f7eb',.009);
  line(.007-stride*.004,.034-stride*.007,.02-stride*.004,.034-stride*.007,'#e9f7eb',.009);
  // Squared shoulder pads, swinging forearms and a shaded jersey.
  line(-.022,-.012,-.031,-.001+stride*.008,shade,.017);
  line(-.031,-.001+stride*.008,-.028,.012+stride*.009,skin,.011);
  line(.022,-.012,.031,-.001-stride*.008,shade,.017);
  line(.031,-.001-stride*.008,.029,.012-stride*.009,skin,.011);
  polygon([[-.023,-.024],[.023,-.024],[.021,.009],[.011,.017],[-.015,.014],[-.023,.003]],jersey,'#16385e',.003);
  polygon([[.01,-.022],[.023,-.024],[.021,.009],[.011,.017]],shade);
  box(-.019,.006,.037,.007,'#15325a');
  text(String(i+1),-.003,.001,.019,'#11355e','center');
  // Exaggerated head, asymmetric hair and eye band keep the cast distinct.
  ctx.translate(lean,-Math.abs(stride)*.002);
  polygon([[-.017,-.046],[.013,-.049],[.021,-.037],[.016,-.023],[.004,-.017],[-.014,-.024],[-.021,-.036]],skin,'#17365b',.003);
  polygon([[.013,-.047],[.021,-.037],[.016,-.023],[.004,-.017],[.007,-.035]],skinShade);
  if(blue) {
    polygon([[-.021,-.037],[-.023,-.05],[-.012,-.057],[.002,-.052],[.014,-.057],[.022,-.045],[.012,-.038],[.002,-.043],[-.013,-.037]],i===1?'#252747':'#4c3c40');
    line(-.014,-.031,-.007,-.031,'#152b4e',.003);line(.003,-.031,.01,-.031,'#152b4e',.003);
  } else {
    polygon([[-.022,-.037],[-.019,-.054],[.012,-.057],[.024,-.043],[.022,-.033],[.009,-.044],[-.008,-.043]],'#b83b5c');
    polygon([[-.019,-.039],[.018,-.039],[.016,-.029],[-.016,-.029]],'#1f3059');
    line(-.013,-.036,.005,-.036,'#c9f6ff',.002);
  }
  ctx.restore();
}
function draw(t,frame,reveal=false) {
  const w=canvas.clientWidth,scale=Math.min(devicePixelRatio||1,2);
  const size=Math.round(w*scale);
  if(canvas.width!==size){canvas.width=size;canvas.height=size;}
  ctx.setTransform(size,0,0,size,0,0);
  if(scenerySize!==size){
    drawScenery();scenery.width=size;scenery.height=size;
    sceneryCtx.drawImage(canvas,0,0);scenerySize=size;
  } else ctx.drawImage(scenery,0,0,1,1);
  const scene=SCENES[sceneIndex],puck=position(scene.puck,t);
  if(!$('motion').checked) {
    for(let j=5;j>0;j--){const p=position(scene.puck,Math.max(0,t-j*.045));circle(p.x,p.y,.004+(5-j)*.001,`rgba(238,255,249,${.12+(5-j)*.08})`);}
  }
  // Depth-sort actors by their court position, not their team.
  scene.actors.map((actor,i)=>({actor,i,y:position(actor.path,t).y})).sort((a,b)=>a.y-b.y).forEach(({actor,i})=>drawPlayer(actor,i,t));
  ellipse(puck.x+.006,puck.y+.008,.015,.007,'#093f6b70');
  circle(puck.x,puck.y,.013,'#163856');circle(puck.x,puck.y-.002,.0105,'#fffcdd');circle(puck.x-.003,puck.y-.005,.0035,'#fff');
  if(t>=scene.event&&t<scene.event+.5){
    const r=$('motion').checked?.044:.03+(t-scene.event)*.09;
    ctx.lineWidth=.003;circle(scene.point.x,scene.point.y,r,'#ffed89',false);
    text(({interception:'STOLEN!',finish:'SCORED!',escape:'ESCAPED!'})[scene.type],scene.point.x,scene.point.y-.09,.035,'#fff5a5','center');
  }
  const x=frame.x-FRAME.w/2,y=frame.y-FRAME.h/2;
  // Copy the real framed pixels before adding the operator-only overlays.
  const shot=$('shot'),shotCtx=shot.getContext('2d');
  shotCtx.drawImage(canvas,x*size,y*size,FRAME.w*size,FRAME.h*size,0,0,shot.width,shot.height);
  ctx.fillStyle='#071c514d';ctx.fillRect(0,0,1,y);ctx.fillRect(0,y+FRAME.h,1,1-y-FRAME.h);ctx.fillRect(0,y,x,FRAME.h);ctx.fillRect(x+FRAME.w,y,1-x-FRAME.w,FRAME.h);
  ctx.strokeStyle='#142e5e';ctx.lineWidth=.006;ctx.strokeRect(x,y,FRAME.w,FRAME.h);
  ctx.strokeStyle='#ffe347';ctx.lineWidth=.002;ctx.strokeRect(x,y,FRAME.w,FRAME.h);
  const l=.037;
  for(const [cx,cy,dx,dy] of [[x,y,1,1],[x+FRAME.w,y,-1,1],[x,y+FRAME.h,1,-1],[x+FRAME.w,y+FRAME.h,-1,-1]]){
    line(cx,cy,cx+dx*l,cy,'#ffe347',.009);line(cx,cy,cx,cy+dy*l,'#ffe347',.009);
  }
  box(x+.01,y+.01,.115,.029,'#0a275de6');text(mode==='replay'?'REPLAY':'YOUR SHOT',x+.019,y+.031,.019,'#ffe347');
  line(frame.x-.011,frame.y,frame.x+.011,frame.y,'#fff8',.0015);line(frame.x,frame.y-.011,frame.x,frame.y+.011,'#fff8',.0015);
  if(reveal){
    const bx=scene.best.x-FRAME.w/2,by=scene.best.y-FRAME.h/2;
    ctx.setLineDash([.009,.007]);ctx.strokeStyle='#ffffff';ctx.lineWidth=.003;ctx.strokeRect(bx,by,FRAME.w,FRAME.h);ctx.setLineDash([]);
    const labelY=Math.min(.96,by+FRAME.h+.034);
    box(bx,labelY-.025,.22,.032,'#103466');text('IDEAL SHOT',bx+.012,labelY,.024,'#fff');
  }
  const progress = mode === 'idle' ? 0 : (mode === 'result' || mode === 'summary') ? 1 : Math.min(1,t/DURATION);
  $('time-fill').style.width=`${progress*100}%`;
}

function render(now) {
  const delta = lastTime === null ? 0 : (now-lastTime)/1000; lastTime=now;
  if(mode !== 'idle' && now-lastActivity >= IDLE_SECONDS*1000) reset();
  if(mode==='playing') {
    if(delta>.25) pause('Playback was interrupted. Resume for a fair take.');
    else {
      const dx=Number(keys.has('ArrowRight'))-Number(keys.has('ArrowLeft')),dy=Number(keys.has('ArrowDown'))-Number(keys.has('ArrowUp'));
      camera=clampFrame({x:camera.x+dx*delta*.65,y:camera.y+dy*delta*.65});
      advance(run,delta,camera);
      if(run.done) finish();
    }
  } else if(mode==='result' && transition > 0) {
    if(delta > .25) pause('Transition paused after an interruption.');
    else {
      transition = Math.max(0,transition-delta);
      $('transition-note').textContent = `Next: ${SCENES[pack[slot+1]].name} · ${transition.toFixed(1)}s — Hold result to review.`;
      if(transition === 0) { slot++; startScene(); }
    }
  } else if(mode==='replay') {
    replayTime+=Math.min(delta,.1);
    if(replayTime>=DURATION) setMode(replayReturn);
  }
  const t=mode==='idle'?2.4:mode==='replay'?replayTime:(mode==='result'||mode==='summary')?SCENES[sceneIndex].event:run?.tick*STEP||0;
  const view=mode==='replay'||mode==='result'||mode==='summary'?replayFrame(run,t):camera;
  draw(t,view,mode==='result'||mode==='summary');
  $('clock').textContent=(mode==='result'||mode==='summary'?'00.0':Math.max(0,DURATION-(mode==='idle'?0:t)).toFixed(1).padStart(4,'0'));
  requestAnimationFrame(render);
}
document.fonts.ready.then(() => { scenerySize=0; });
setMode('idle');labelScene();requestAnimationFrame(render);
