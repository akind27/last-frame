// Seven additional authored plays; the original two remain in model.js.
export const EXTRA_SCENES = [
  {
    name: 'The sideline escape', type: 'escape',
    hint: 'The blue runner is trapped on the right. Watch for the cut past the defender.',
    event: 4.4, point: { x: .78, y: .62 }, best: { x: .72, y: .61 },
    explanation: 'The escape happened on the right sideline. Keep the runner and the chasing defender together.',
    actors: [
      { team: 'cyan', path: [[0,.3,.3],[2,.61,.4],[3.5,.82,.48],[4.4,.78,.62],[6.5,.51,.8]] },
      { team: 'cyan', path: [[0,.23,.75],[3,.28,.7],[6.5,.36,.73]] },
      { team: 'coral', path: [[0,.7,.25],[2,.74,.4],[3.5,.75,.48],[4.4,.72,.55],[6.5,.57,.71]] },
    ],
    puck: [[0,.3,.3],[2,.61,.4],[3.5,.82,.48],[4.4,.78,.62],[6.5,.51,.8]], involved: [0,2],
  },
  {
    name: 'The cross-court steal', type: 'interception',
    hint: 'A long pass is coming from the right. The coral runner has read it.',
    event: 4.6, point: { x: .25, y: .35 }, best: { x: .29, y: .32 },
    explanation: 'The pass was cut out high on the left. Include the interceptor and the waiting blue receiver.',
    actors: [
      { team: 'cyan', path: [[0,.79,.73],[3,.7,.64],[6.5,.64,.65]] },
      { team: 'cyan', path: [[0,.19,.2],[3,.2,.24],[4.6,.21,.27],[6.5,.2,.36]] },
      { team: 'coral', path: [[0,.54,.21],[2.7,.46,.22],[4.6,.25,.35],[6.5,.35,.59]] },
    ],
    puck: [[0,.79,.73],[3,.7,.64],[4.6,.25,.35],[6.5,.35,.59]], involved: [1,2],
  },
  {
    name: 'The near-post finish', type: 'finish',
    hint: 'The pass goes up the middle. Keep the receiver and the trailing defender in view.',
    event: 4.7, point: { x: .5, y: .14 }, best: { x: .51, y: .23 },
    explanation: 'The shot finished at the upper goal. A frame slightly below the goal includes both players.',
    actors: [
      { team: 'cyan', path: [[0,.19,.68],[2.8,.31,.51],[6.5,.4,.5]] },
      { team: 'cyan', path: [[0,.7,.58],[2.8,.6,.36],[4.7,.5,.2],[6.5,.47,.2]] },
      { team: 'coral', path: [[0,.81,.48],[2.8,.73,.34],[4.7,.63,.25],[6.5,.57,.23]] },
    ],
    puck: [[0,.19,.68],[2.8,.31,.51],[4.2,.52,.24],[4.7,.5,.14],[6.5,.5,.12]], involved: [1,2],
  },
  {
    name: 'The corner cut', type: 'escape',
    hint: 'The defender closes the lower lane. The blue runner has one way out: left.',
    event: 4.5, point: { x: .19, y: .65 }, best: { x: .27, y: .64 },
    explanation: 'The runner slipped past on the left. Frame the change of direction and the defender being left behind.',
    actors: [
      { team: 'cyan', path: [[0,.65,.3],[2.7,.37,.52],[3.7,.26,.69],[4.5,.19,.65],[6.5,.2,.39]] },
      { team: 'cyan', path: [[0,.73,.78],[3,.69,.7],[6.5,.58,.67]] },
      { team: 'coral', path: [[0,.2,.77],[2.7,.28,.72],[3.7,.29,.68],[4.5,.29,.64],[6.5,.25,.46]] },
    ],
    puck: [[0,.65,.3],[2.7,.37,.52],[3.7,.26,.69],[4.5,.19,.65],[6.5,.2,.39]], involved: [0,2],
  },
  {
    name: 'The late interception', type: 'interception',
    hint: 'The lower-right receiver looks open. Watch the defender arriving from the middle.',
    event: 4.9, point: { x: .73, y: .76 }, best: { x: .7, y: .75 },
    explanation: 'The late interception was low on the right. Include the receiver and the defender cutting across.',
    actors: [
      { team: 'cyan', path: [[0,.24,.2],[3.2,.32,.35],[6.5,.34,.4]] },
      { team: 'cyan', path: [[0,.84,.44],[3.2,.82,.64],[4.9,.82,.76],[6.5,.78,.8]] },
      { team: 'coral', path: [[0,.42,.66],[3.2,.53,.66],[4.9,.73,.76],[6.5,.69,.56]] },
    ],
    puck: [[0,.24,.2],[3.2,.32,.35],[4.9,.73,.76],[6.5,.69,.56]], involved: [1,2],
  },
  {
    name: 'The give-and-go', type: 'finish',
    hint: 'Two quick passes open the lower goal. Follow the returning runner.',
    event: 4.8, point: { x: .28, y: .86 }, best: { x: .3, y: .78 },
    explanation: 'The return pass led to the lower goal. Keep the scorer and the recovering defender in the frame.',
    actors: [
      { team: 'cyan', path: [[0,.76,.3],[2.2,.5,.51],[3.3,.38,.65],[4.8,.28,.8],[6.5,.24,.84]] },
      { team: 'cyan', path: [[0,.27,.34],[2.2,.25,.53],[3.3,.23,.62],[6.5,.2,.65]] },
      { team: 'coral', path: [[0,.55,.77],[2.2,.45,.7],[3.3,.42,.7],[4.8,.4,.79],[6.5,.35,.82]] },
    ],
    puck: [[0,.76,.3],[1.5,.58,.44],[2.2,.25,.53],[2.8,.24,.58],[3.3,.38,.65],[4.5,.3,.77],[4.8,.28,.86],[6.5,.28,.9]], involved: [0,2],
  },
  {
    name: 'The final breakaway', type: 'escape',
    hint: 'The blue runner sells a turn toward the middle, then breaks toward the upper-left corner.',
    event: 4.6, point: { x: .26, y: .22 }, best: { x: .31, y: .26 },
    explanation: 'The breakaway happened high on the left. Include the runner and the defender reacting to the cut.',
    actors: [
      { team: 'cyan', path: [[0,.77,.67],[2.6,.51,.4],[3.5,.46,.34],[4.6,.26,.22],[6.5,.19,.37]] },
      { team: 'cyan', path: [[0,.24,.75],[3,.3,.63],[6.5,.39,.64]] },
      { team: 'coral', path: [[0,.7,.47],[2.6,.45,.33],[3.5,.49,.3],[4.6,.37,.27],[6.5,.26,.38]] },
    ],
    puck: [[0,.77,.67],[2.6,.51,.4],[3.5,.46,.34],[4.6,.26,.22],[6.5,.19,.37]], involved: [0,2],
  },
  {
    name: 'The outlet pick', type: 'interception',
    hint: 'The outlet drifts toward the upper sideline. Watch the coral runner cut across the lane.',
    event: 4.2, point: { x: .43, y: .18 }, best: { x: .43, y: .24 },
    explanation: 'The outlet was picked off along the upper sideline. Frame the interceptor and the receiver together.',
    actors: [
      { team: 'cyan', path: [[0,.78,.58],[2.3,.68,.48],[6.5,.58,.49]] },
      { team: 'cyan', path: [[0,.19,.38],[2.6,.25,.22],[4.2,.32,.19],[6.5,.36,.28]] },
      { team: 'coral', path: [[0,.62,.28],[2.9,.53,.30],[4.2,.43,.18],[6.5,.53,.34]] },
    ],
    puck: [[0,.78,.58],[2.3,.68,.48],[3.6,.53,.26],[4.2,.43,.18],[6.5,.53,.34]], involved: [1,2],
  },
  {
    name: 'The back-post finish', type: 'finish',
    hint: 'The puck slips behind the defense. Track the runner arriving on the lower right.',
    event: 5.1, point: { x: .79, y: .89 }, best: { x: .73, y: .78 },
    explanation: 'The runner finished at the lower back post. Keep the trailing defender and the puck in frame.',
    actors: [
      { team: 'cyan', path: [[0,.22,.56],[2.8,.48,.61],[6.5,.60,.64]] },
      { team: 'cyan', path: [[0,.76,.28],[2.4,.85,.49],[4,.86,.67],[5.1,.79,.82],[6.5,.74,.87]] },
      { team: 'coral', path: [[0,.56,.32],[2.7,.61,.56],[5.1,.65,.78],[6.5,.70,.82]] },
    ],
    puck: [[0,.22,.56],[2.8,.48,.61],[4,.86,.67],[4.8,.81,.77],[5.1,.79,.89],[6.5,.79,.92]], involved: [1,2],
  },
  {
    name: 'The reverse escape', type: 'escape',
    hint: 'The cyan runner slows near the middle, then cuts back toward the upper right.',
    event: 3.9, point: { x: .74, y: .30 }, best: { x: .68, y: .32 },
    explanation: 'The runner escaped toward the upper right. Show the change of direction and the defender it wrong-footed.',
    actors: [
      { team: 'cyan', path: [[0,.81,.62],[2.4,.58,.49],[3.1,.56,.44],[3.9,.74,.30],[6.5,.85,.21]] },
      { team: 'cyan', path: [[0,.16,.74],[3.2,.29,.66],[6.5,.44,.59]] },
      { team: 'coral', path: [[0,.49,.30],[2.4,.53,.40],[3.1,.55,.48],[3.9,.58,.37],[6.5,.72,.26]] },
    ],
    puck: [[0,.81,.62],[2.4,.58,.49],[3.1,.56,.44],[3.9,.74,.30],[6.5,.85,.21]], involved: [0,2],
  },
];

// Keep the teaching plays and middle block. Alternate the closing block each pack.
export function createPack(seed = 1) {
  if (!Number.isInteger(seed) || seed < 1 || seed > 9999) throw new RangeError('Pack must be 1–9999');
  let state = seed;
  const random = () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296; };
  const pack = [0,1,2];
  const closingBlock = seed % 2 === 0 ? [9,10,11] : [6,7,8];
  for (const block of [[3,4,5],closingBlock]) {
    for (let i = block.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [block[i],block[j]] = [block[j],block[i]]; }
    pack.push(...block);
  }
  return pack;
}
