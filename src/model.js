import { EXTRA_SCENES } from './scenes.js';
export const STEP = 1 / 60;
export const DURATION = 6.5;
export const FRAME = Object.freeze({ w: 0.46, h: 0.34 });
export const SCENES = [
  {
    name: 'The interception', type: 'interception', hint: 'The coral runner is closing in. Watch where the pass is going.',
    event: 4.5, point: { x: .64, y: .40 }, best: { x: .70, y: .36 },
    explanation: 'The interception happened high on the right. Catch the coral runner and the intended receiver together.',
    actors: [
      { team: 'cyan', path: [[0,.16,.76],[3,.28,.72],[6.5,.35,.72]] },
      { team: 'cyan', path: [[0,.83,.18],[3,.79,.27],[4.5,.78,.30],[6.5,.8,.33]] },
      { team: 'coral', path: [[0,.76,.76],[2.7,.78,.58],[4.5,.64,.4],[6.5,.72,.7]] },
    ],
    puck: [[0,.16,.76],[3,.28,.72],[4.5,.64,.4],[6.5,.72,.7]], involved: [1,2],
  },
  {
    name: 'The winning pass', type: 'finish', hint: 'A runner is breaking toward the lower goal. Follow the play, not just the puck.',
    event: 4.8, point: { x: .24, y: .86 }, best: { x: .31, y: .79 },
    explanation: 'The finish was low on the left. Bring the runner, the defender and the goal into the same shot.',
    actors: [
      { team: 'cyan', path: [[0,.72,.24],[2.6,.50,.46],[6.5,.52,.48]] },
      { team: 'cyan', path: [[0,.18,.38],[2.7,.21,.60],[4,.26,.73],[4.8,.25,.80],[6.5,.24,.87]] },
      { team: 'coral', path: [[0,.70,.65],[2.7,.57,.75],[4.8,.40,.78],[6.5,.32,.83]] },
    ],
    puck: [[0,.72,.24],[2.6,.50,.46],[4,.26,.73],[4.45,.25,.78],[4.8,.24,.86],[6.5,.24,.91]], involved: [1,2],
  },
  ...EXTRA_SCENES,
];

export function position(path, time) {
  if (time <= path[0][0]) return { x: path[0][1], y: path[0][2] };
  for (let i = 1; i < path.length; i++) {
    if (time <= path[i][0]) {
      const a = path[i - 1], b = path[i], k = (time - a[0]) / (b[0] - a[0]);
      return { x: a[1] + (b[1] - a[1]) * k, y: a[2] + (b[2] - a[2]) * k };
    }
  }
  return { x: path.at(-1)[1], y: path.at(-1)[2] };
}

export function clampFrame(frame) {
  return {
    x: Math.min(1 - FRAME.w / 2, Math.max(FRAME.w / 2, Number.isFinite(frame.x) ? frame.x : .5)),
    y: Math.min(1 - FRAME.h / 2, Math.max(FRAME.h / 2, Number.isFinite(frame.y) ? frame.y : .5)),
  };
}

export function contains(frame, point) {
  return Math.abs(frame.x - point.x) <= FRAME.w / 2 + 1e-9 && Math.abs(frame.y - point.y) <= FRAME.h / 2 + 1e-9;
}

export function createRun(sceneIndex) {
  if (!SCENES[sceneIndex]) throw new RangeError('Unknown scene');
  return { sceneIndex, tick: 0, accumulator: 0, done: false, trace: [], samples: 0, action: 0, actors: 0, steady: 0, previous: null };
}

export function advance(run, delta, camera) {
  if (run.done || !Number.isFinite(delta) || delta <= 0 || delta > .25) return;
  const scene = SCENES[run.sceneIndex];
  run.accumulator += delta;
  while (run.accumulator >= STEP - 1e-10 && !run.done) {
    run.accumulator -= STEP;
    run.tick++;
    const t = run.tick * STEP, frame = clampFrame(camera);
    run.trace.push(frame);
    if (Math.abs(t - scene.event) <= .30 + 1e-9) {
      const caught = contains(frame, scene.point);
      const players = scene.involved.filter(i => contains(frame, position(scene.actors[i].path, t))).length / scene.involved.length;
      const speed = run.previous ? Math.hypot(frame.x - run.previous.x, frame.y - run.previous.y) / STEP : 0;
      run.samples++; run.action += Number(caught); run.actors += players;
      run.steady += caught && speed <= .16 ? 1 : 0;
    }
    run.previous = frame;
    if (run.tick >= Math.round(DURATION / STEP)) run.done = true;
  }
}

export function result(run) {
  if (!run.done) throw new Error('Scene has not finished');
  const count = Math.max(1, run.samples);
  const action = Math.round(60 * run.action / count), actors = Math.round(25 * run.actors / count), steady = Math.round(15 * run.steady / count);
  return { action, actors, steady, total: action + actors + steady };
}

export function replayFrame(run, time) {
  const index = Math.max(0, Math.min(run.trace.length - 1, Math.floor(time / STEP) - 1));
  return run.trace[index] ?? { x: .5, y: .5 };
}
