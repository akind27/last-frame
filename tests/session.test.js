import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import * as model from '../src/model.js';
import { createPack } from '../src/scenes.js';

// Exercise the actual UI controller with a deterministic clock and minimal DOM.
// Canvas drawing is stubbed; these are lifecycle checks, not visual/browser tests.
function browser() {
  let now = 0, frame;
  const elements = new Map(), docEvents = {}, winEvents = {};
  const context2d = new Proxy({}, { get: (target,key) => target[key] ?? (()=>{}), set: (target,key,value) => (target[key]=value,true) });
  function element(id) {
    if (elements.has(id)) return elements.get(id);
    const e = { id,hidden:false,disabled:false,textContent:'',checked:false,width:800,height:800,clientWidth:800,style:{},dataset:{},children:[],events:{},
      getContext:()=>context2d, getBoundingClientRect:()=>({left:0,top:0,x:0,y:0,width:800,height:800,bottom:800}),
      closest:()=>({scrollIntoView(){}}),focus(){},setPointerCapture(){},
      append(...children){this.children.push(...children);},replaceChildren(...children){this.children=children;},
      addEventListener(name,fn){(this.events[name]??=[]).push(fn);} };
    elements.set(id,e); return e;
  }
  const body={dataset:{}};
  const document={body,hidden:false,fonts:{ready:Promise.resolve()},getElementById:element,createElement:tag=>element(Symbol(tag)),addEventListener:(n,f)=>(docEvents[n]??=[]).push(f)};
  const sandbox={...model,createPack,document,window:{addEventListener:(n,f)=>(winEvents[n]??=[]).push(f)},performance:{now:()=>now},matchMedia:()=>({matches:false}),devicePixelRatio:1,innerHeight:1000,requestAnimationFrame:fn=>{frame=fn;}};
  vm.createContext(sandbox);
  const source=readFileSync(new URL('../src/main.js',import.meta.url),'utf8').replace(/^import .*;\n/gm,'');
  vm.runInContext(source,sandbox);
  function event(id,type,props={}) {
    const e={preventDefault(){},...props};
    for(const fn of element(id).events[type]??[])fn(e);
    for(const fn of docEvents[type]??[])fn(e);
  }
  function click(id) { assert.ok(!element(id).disabled && !element(id).hidden, `${id} must be usable`);event(id,'click'); }
  function tick(seconds) { for(let i=0;i<Math.ceil(seconds*60);i++){now+=1000/60;frame(now);} }
  function aim(point) { event('arena','pointerdown',{pointerId:1,isPrimary:true,button:0,clientX:point.x*800,clientY:point.y*800});event('arena','pointerup',{pointerId:1}); }
  function until(mode,limit=10) {for(let i=0;i<limit*60 && body.dataset.mode!==mode;i++)tick(1/60);assert.equal(body.dataset.mode,mode);}
  return {element,click,event,tick,aim,until,mode:()=>body.dataset.mode,windowEvent:name=>(winEvents[name]??[]).forEach(fn=>fn()),setHidden:()=>{document.hidden=true;for(const fn of docEvents.visibilitychange??[])fn();}};
}

test('full automatic broadcast sums nine scores and replays the actual best take',()=>{
  const b=browser();b.click('primary');let total=0,bestName='';
  for(let i=0;i<9;i++) {
    const scene=model.SCENES.find(s=>s.name===b.element('scene-name').textContent);
    // First take deliberately misses; later takes are perfect. Best must be play two.
    b.aim(i===0?{x:.23,y:.83}:scene.best);
    b.until(i===8?'summary':'result');
    if(i<8)total+=Number(b.element('score').textContent);
    else total+=100;
    if(i===1)bestName=scene.name;
    if(i<8)b.until('playing',3);
  }
  assert.equal(b.element('broadcast-list').children.length,9);
  assert.equal(b.element('total').textContent,`YOUR BROADCAST: ${total} / 900`);
  assert.equal(b.element('instruction').textContent,bestName);
  const before=b.element('total').textContent;
  b.click('replay');assert.equal(b.mode(),'replay');assert.equal(b.element('primary').disabled,true);
  b.until('summary',7);assert.equal(b.element('total').textContent,before);
  b.click('primary');assert.equal(b.mode(),'playing');assert.equal(b.element('scene-number').textContent,'01 / 09');
  b.click('restart');assert.equal(b.element('broadcast-list').children.length,0);
});

test('held results, replay interruption and next play do not double-count',()=>{
  const b=browser();b.click('primary');b.aim(model.SCENES[0].best);b.until('result');b.click('pause');b.tick(5);assert.equal(b.mode(),'result');
  b.click('replay');b.tick(2);b.windowEvent('blur');assert.equal(b.mode(),'result');b.tick(4);assert.equal(b.mode(),'result');
  b.click('primary');assert.equal(b.element('scene-number').textContent,'02 / 09');
  b.aim(model.SCENES[1].best);b.until('result');assert.equal(Number(b.element('score').textContent),100);
});

test('pause, hidden tab, cancellation and idle timeout keep a clean session',()=>{
  const b=browser();b.click('primary');b.tick(1);b.setHidden();assert.equal(b.mode(),'paused');
  const time=b.element('clock').textContent;b.tick(10);assert.equal(b.element('clock').textContent,time);
  b.click('resume');b.aim(model.SCENES[0].best);b.event('arena','pointerdown',{pointerId:1,isPrimary:true,button:0,clientX:560,clientY:288});b.event('arena','pointercancel',{pointerId:1});assert.equal(b.mode(),'paused');
  b.tick(121);assert.equal(b.mode(),'idle');assert.equal(b.element('total').hidden,true);
  b.click('primary');assert.equal(b.element('scene-number').textContent,'01 / 09');
});

test('50 resets clear each interrupted take and pack changes preserve the opening',()=>{
  const b=browser();
  for(let i=0;i<50;i++){b.click('primary');b.tick(.1);b.click('restart');assert.equal(b.mode(),'idle');assert.equal(b.element('broadcast-list').children.length,0);}
  b.click('next-pack');assert.match(b.element('run-note').textContent,/PACK 0002/);b.click('primary');b.aim(model.SCENES[0].best);b.until('result');assert.equal(Number(b.element('score').textContent),100);
});
