import test from 'node:test';
import assert from 'node:assert/strict';
import { SCENES, FRAME, STEP, DURATION, createRun, advance, result, contains, clampFrame, position, replayFrame } from '../src/model.js';

function play(index,frame,fps=60){const run=createRun(index);for(let i=0;i<fps*DURATION+2;i++) advance(run,1/fps,frame);return run;}
test('both intended compositions earn full score',()=>{for(let i=0;i<2;i++)assert.equal(result(play(i,SCENES[i].best)).total,100);});
test('stationary compositions agree across 30/60/120fps rendering batches',()=>{for(let i=0;i<2;i++){const scores=[30,60,120].map(fps=>result(play(i,SCENES[i].best,fps)));assert.deepEqual(scores[0],scores[1]);assert.deepEqual(scores[1],scores[2]);}});
test('off-action framing earns zero and center camping cannot ace the broadcast',()=>{assert.equal(result(play(1,{x:.75,y:.2})).total,0);assert.ok([0,1].reduce((n,i)=>n+result(play(i,{x:.5,y:.5})).total,0)<120);});
test('boundary points count, points beyond edge do not',()=>{const frame={x:.5,y:.5};assert.equal(contains(frame,{x:.5+FRAME.w/2,y:.5}),true);assert.equal(contains(frame,{x:.5+FRAME.w/2+.00001,y:.5}),false);});
test('clamps camera to board and contains malformed input safely',()=>{assert.deepEqual(clampFrame({x:NaN,y:Infinity}),{x:.5,y:.5});assert.deepEqual(clampFrame({x:-1,y:2}),{x:FRAME.w/2,y:1-FRAME.h/2});});
test('interrupted/invalid clock increments cannot advance or score',()=>{const run=createRun(0);for(const dt of [NaN,Infinity,-1,0,1,60])advance(run,dt,SCENES[0].best);assert.equal(run.tick,0);assert.equal(run.samples,0);});
test('completed scene is immutable and exactly bounded',()=>{const run=play(0,SCENES[0].best);assert.equal(run.trace.length,Math.round(DURATION/STEP));const before=JSON.stringify(run);advance(run,.1,{x:0,y:0});assert.equal(JSON.stringify(run),before);});
test('replay uses recorded camera movement and clamps times',()=>{const run=createRun(0);advance(run,STEP,{x:.3,y:.2});advance(run,STEP,{x:.7,y:.8});assert.deepEqual(replayFrame(run,0),run.trace[0]);assert.deepEqual(replayFrame(run,2*STEP),run.trace[1]);assert.deepEqual(replayFrame(run,100),run.trace[1]);});
test('fresh run contains no prior trace or score',()=>{const finished=play(0,SCENES[0].best), fresh=createRun(1);assert.equal(finished.done,true);assert.equal(fresh.done,false);assert.equal(fresh.samples,0);assert.equal(fresh.trace.length,0);assert.throws(()=>result(fresh),/not finished/);});
test('paths interpolate and remain at endpoints beyond authored time',()=>{assert.deepEqual(position([[0,0,0],[2,1,1]],1),{x:.5,y:.5});assert.deepEqual(position([[0,0,0],[2,1,1]],-1),{x:0,y:0});assert.deepEqual(position([[0,0,0],[2,1,1]],4),{x:1,y:1});});
