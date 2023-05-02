const players = {
  mendoza: {code: '0', name: 'mendoza', obp: .2, slg: .2, pa: 0, h: 0, d: 0, t: 0, hr: 0},
  balanced: {code: '1', name: 'balanced', obp: .5, slg: 1, pa: 0, h: 0, d: 0, t: 0, hr: 0},
  obp: {code: '2', name: 'obp', obp: .65, slg: .65, pa: 0, h: 0, d: 0, t: 0, hr: 0},
  balanced_plus: {code: '3', name: 'balanced_plus', obp: .65, slg: 1, pa: 0, h: 0, d: 0, t: 0, hr: 0},
  masher: {code: '4', name: 'masher', obp: .75, slg: 3, pa: 0, h: 0, d: 0, t: 0, hr: 0},
};

const lineup = [
  players.mendoza,
  players.mendoza,
  players.mendoza,
  players.mendoza,
  players.balanced,
  players.balanced,
  players.obp,
  players.obp,
  players.balanced_plus,
  players.masher,
  players.masher,
];

const GAMES_TO_RUN = 10000;

function simulateLineup(lineup) {
  let totalRuns = 0;
  for (let game = 0; game < GAMES_TO_RUN; game++) {
    let iBatter = 0;
    let runs = 0;
    for (let i = 0; i < 5; i++) {
      let onFirst = false;
      let onSecond = false;
      let onThird = false;
      let outs = 0;
      let inningRuns = 0;
      while (outs < 3 && ((i < 4 && inningRuns <= 5) || (i === 4 && inningRuns <= 7))) {
        let batter = lineup[iBatter % lineup.length];
        batter.pa++;
        if (Math.random() <= batter.obp) {
          batter.h++;
          if (onThird) {
            inningRuns++;
          }
          onThird = onSecond;
          onSecond = onFirst;
          onFirst = true;
          let iso = batter.slg - batter.obp;
          if (Math.random() <= iso) {
            let extraBases = Math.ceil(Math.random() * 3);
            if (batter.slg === batter.obp * 4) {
              extraBases = 3;
            }
            switch (extraBases) {
              case 1:
                batter.d++;
                break;
              case 2:
                batter.t++;
                break;
              case 3:
                batter.hr++;
                break;
            }
            for (let b = 0; b < extraBases; b++) {
              if (onThird) {
                inningRuns++;
              }
              onThird = onSecond;
              onSecond = onFirst;
              onFirst = false;
            }
          }
        } else {
          outs++;
        }
        iBatter++;
      }
      if (i < 4 && inningRuns > 5) {
        runs += 5;
      } else if (i === 5 && inningRuns > 7) {
        runs += 7;
      } else {
        runs += inningRuns;
      }
    }
    totalRuns += runs;
  }
  return {averageRuns: totalRuns / GAMES_TO_RUN, lineup: lineup.map((l) => l.name).join(',')};
}

function permute(permutation, fn) {
  let length = permutation.length,
      c = new Array(length).fill(0),
      i = 1;
  let sim = 0;
  let results = [];
  let checked = new Set();

  while (i < length) {
    if (c[i] < i) {
      let k = i % 2 && c[i];
      let p = permutation[i];
      permutation[i] = permutation[k];
      permutation[k] = p;
      ++c[i];
      i = 1;
      let code = permutation.map((p) => p.code).join();
      if (!checked.has(code)) {
        checked.add(code);
        results.push(fn(permutation));
        if (sim % 10000 === 0) {
          let d = new Date();
          console.log(
              `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()} ${JSON.stringify(results[results.length - 1])}`);
        }
        sim++;
      }
    } else {
      c[i] = 0;
      ++i;
    }
  }
  return results;
}

function check() {
  for (let player of Object.values(players)) {
    console.log(`${player.name} expected obp ${player.obp}, actual ${player.h / player.pa}`);
    console.log(
        `${player.name} expected slg ${player.slg}, actual ${(player.h + player.d + player.t * 2 + player.hr * 3) /
        player.pa}`);
  }
}

function run() {

  let results = permute(lineup, simulateLineup);

  results.sort((a, b) => b.averageRuns - a.averageRuns);
  console.log(`${results[0].lineup} is best with ${results[0].averageRuns} runs.`);
  console.log(`${results[results.length - 1].lineup} is worst with ${results[results.length - 1].averageRuns} runs.`);

  check();
}

run();
