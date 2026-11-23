# Last Frame

You do not play the hero. You catch the moment.

Watch a fictional sports play, move a broadcast camera into position and catch the decisive action with both players in frame. Each broadcast contains nine plays covering interceptions, finishes and escapes. Twelve plays are available across packs. Each lasts 6.5 seconds, with short automatic transitions and a final broadcast score out of 900. The game is silent.

## Run locally

Requires Node 22.12+ (22.x) or Node 24.x. No package installation is needed.

```sh
npm run dev
```

Open http://127.0.0.1:4173. The server listens only on the local computer and serves an explicit list of game files. Set `LAST_FRAME_PORT=4174` to use another available port.

## Play

Select **Go live**. Drag on the court to position the yellow frame directly, drag the pad to move it relatively, or use arrow keys while the court or pad is focused. Keep the action and both involved players inside the frame. Hold steady when the play lands.

Each play awards up to 100 points: action 60, both players 25, steadiness 15. A score of 80 or more counts as a caught moment. A white dashed frame shows an ideal composition after each play.

The next play starts after 2.5 seconds. Select **Hold result** to read the feedback at your own pace, **Next play** to advance immediately, or **Replay your take** to watch your recorded camera movement. Replaying holds the result until you choose to continue. The final screen lists all nine scores and offers a replay of your highest-scoring take; ties choose the earliest take.

**Play same pack** repeats the same plays in the same order. **Try next pack** switches between two sets of closing plays and shuffles the later plays deterministically. The first three teach the event types in a fixed order. Pack numbers are shown on screen. Scores are not saved.

**Pause**, **Resume take**, **Start over** and **Less motion** are available. Leaving the window or a stalled animation pauses a live take. After two minutes without pointer or keyboard activity, the game returns to its ready screen. A paused or held result can also time out. There is no audio to mute.

## Checks and release preparation

```sh
npm run check
npm run release
```

The checks validate public files, JavaScript syntax and deterministic model tests. They run without private workspace documents or Git history. The release command copies only named source, test, font, license and instruction files into a new `dist/last-frame-*` directory and adds file checksums. It does not deploy or publish anything. Run `npm run check` inside the candidate directory before distributing it.

Physical touch devices, first-time player learning and prolonged booth operation still require testing. Automated model tests do not establish enjoyment or phone performance.

## How it works

Plain JavaScript modules, Canvas 2D and HTML/CSS. No runtime packages, network services, accounts or data storage. Authored paths replace a simulated match. Scoring samples a 0.6-second event window at a fixed 60 Hz, and replay uses the camera positions actually recorded during that take. Seeded packs select and reorder curated blocks of authored plays.

Court and player artwork is drawn by the renderer. Source is offered under the MIT License; Barlow fonts remain under the SIL Open Font License in `public/fonts/OFL.txt`. See [NOTICE.md](NOTICE.md).
