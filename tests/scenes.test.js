import test from 'node:test';
import assert from 'node:assert/strict';
import { SCENES, DURATION, STEP, clampFrame, createRun, advance, result, replayFrame } from '../src/model.js';
import { createPack } from '../src/scenes.js';

function play(index, frame, fps = 60) {
  const run = createRun(index);
  for (let i = 0; i < fps * DURATION + 2; i++) advance(run, 1 / fps, frame);
  return run;
}
test('twelve distinct authored plays, four of each event, finite paths and reachable compositions', () => {
  assert.equal(SCENES.length, 12);
  assert.equal(new Set(SCENES.map(s => s.name)).size, 12);
  for (const type of ['interception','finish','escape']) assert.equal(SCENES.filter(s => s.type === type).length, 4);
  for (const scene of SCENES) {
    assert.deepEqual(clampFrame(scene.best), scene.best);
    assert.ok(scene.event > .3 && scene.event < DURATION - .3);
    assert.equal(new Set(scene.involved).size, 2);
    for (const index of scene.involved) assert.ok(scene.actors[index]);
    for (const path of [scene.puck,...scene.actors.map(a => a.path)]) {
      assert.equal(path[0][0], 0); assert.equal(path.at(-1)[0], DURATION);
      for (let i = 0; i < path.length; i++) {
        const [t,x,y] = path[i];
        assert.ok([t,x,y].every(Number.isFinite));
        assert.ok(x >= .08 && x <= .92 && y >= .1 && y <= .92);
        if (i) assert.ok(t > path[i-1][0]);
      }
    }
  }
});
test('every authored composition earns 100 across 30, 60 and 120fps batches', () => {
  for (let i = 0; i < SCENES.length; i++) for (const fps of [30,60,120]) {
    assert.equal(result(play(i,SCENES[i].best,fps)).total, 100, `${SCENES[i].name} at ${fps}fps`);
  }
});
test('center camping misses all plays after the forgiving opening', () => {
  const scores = SCENES.map((_,i) => result(play(i,{x:.5,y:.5})));
  assert.equal(scores[0].total,88);
  for (const score of scores.slice(1)) assert.equal(score.action,0);
  assert.ok(scores.reduce((sum,score) => sum + score.total,0) < 180);
});
test('seeded packs are repeatable, bounded and complete, with a fixed teaching opening', () => {
  assert.deepEqual(createPack(1), [0,1,2,4,5,3,6,8,7]);
  const originalOrders = new Set();
  const alternateOrders = new Set();
  for (let seed = 1; seed <= 9999; seed++) {
    const pack = createPack(seed);
    assert.deepEqual(pack,createPack(seed));
    assert.deepEqual(pack.slice(0,3),[0,1,2]);
    const alternate = seed % 2 === 0;
    const expected = alternate ? [0,1,2,3,4,5,9,10,11] : [0,1,2,3,4,5,6,7,8];
    assert.deepEqual([...pack].sort((a,b)=>a-b), expected);
    for (const type of ['interception','finish','escape']) assert.equal(pack.filter(index => SCENES[index].type === type).length, 3);
    (alternate ? alternateOrders : originalOrders).add(pack.join(','));
  }
  assert.equal(originalOrders.size, 36);
  assert.equal(alternateOrders.size, 36);
  for (const seed of [0,-1,10000,NaN,Infinity,1.5,'1',null]) assert.throws(()=>createPack(seed),RangeError);
});
test('recorded moving-camera takes reproduce their original score', () => {
  for (let i = 0; i < SCENES.length; i++) {
    const original = createRun(i);
    for (let tick = 1; tick <= DURATION / STEP; tick++) {
      const k = Math.min(1,tick*STEP/3);
      advance(original,STEP,{x:.5+(SCENES[i].best.x-.5)*k,y:.5+(SCENES[i].best.y-.5)*k});
    }
    const replay = createRun(i);
    for (let tick = 1; tick <= original.tick; tick++) advance(replay,STEP,replayFrame(original,tick*STEP));
    assert.deepEqual(result(replay),result(original));
  }
});
