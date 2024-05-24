const useAdvantageOfTrack = (runner, track) => {
  if (runner.vantagem === track.tipo) {
    runner.velocidade += 2;
    runner.drift += 2;
    runner.aceleracao += 2;
  }
  return runner;
};
const useAcceleration = (runner, indexOfRace, track) => {
  if (indexOfRace < 3) {
    runner.score += runner.aceleracao;

    runner.ally.forEach((ally, i, arr) => {
      if (i > 0) {
        arr[i].score += ally.aceleracao;
      }
    });

    runner.enemy.forEach((enemy, i, arr) => {
      arr[i].score += enemy.aceleracao;
    });

    useDebuffOfTrack(runner, track);
    useBuffOfTrack(runner, track);
  }

  return runner;
};
const useSpeed = (runner, indexOfRace, track) => {
  if (indexOfRace > 3 && indexOfRace !== runner.forDrift) {
    runner.score += runner.velocidade;

    runner.ally.forEach((ally, i, arr) => {
      if (i > 0) {
        arr[i].score += ally.velocidade;
      }
    });

    runner.enemy.forEach((enemy, i, arr) => {
      arr[i].score += enemy.velocidade;
    });

    useDebuffOfTrack(runner, track);
    useBuffOfTrack(runner, track);
  }
};
const useDrift = (runner, indexOfRace, track) => {
  if (runner.forDrift === indexOfRace) {
    runner.score += runner.drift;
    runner.forDrift += 4;

    runner.ally.forEach((ally, i, arr) => {
      if (i > 0) {
        arr[i].score += ally.drift;
        arr[i].forDrift += 4;
      }
    });

    runner.enemy.forEach((enemy, i, arr) => {
      arr[i].score += enemy.drift;
      arr[i].forDrift += 4;
    });

    useDebuffOfTrack(runner, track);
    useBuffOfTrack(runner, track);
  }

  return runner;
};
const useAllyAdvantage = (runner) => {
  runner.ally.forEach((ally, i) => {
    if (i > 0) {
      if (runner.score - 2 === ally.score || runner.score + 2 === ally.score) {
        ++runner.score;
        return;
      }
    }
  });
  return runner;
};
const useEnemyDisadvantage = (runner) => {
  runner.enemy.forEach((enemy, i) => {
    if (runner.score - 2 === enemy.score || runner.score + 2 === enemy.score) {
      --runner.score;
      return;
    }
  });
  return runner;
};
const useVerificationOfSpeed = (runner) => {
  if (runner.velocidade <= 0) {
    runner.score = runner.score;
  }
};
const useCheatingFromDickSwindler = (runner, track) => {
  if (runner.nome === "Dick Vigarista" && runner.score >= track.tamanho - 1) {
    arr[i].velocidade = 0;
    arr[i].drift = 0;
    arr[i].aceleracao = 0;
    arr[i].score = 0;
  }
};
const useConditionOfWinner = (runner, track) => {
  if (runner.score >= track.tamanho) {
    return runner;
  }
  return `${runner.nome} ainda não venceu`;
};
const useDebuffOfTrack = (runner, track) => {
  if (runner.vantagem !== track.tipo) {
    runner.score -= track.debuff;
  }
  return runner;
};
const useBuffOfTrack = (runner, track, indexOfRace) => {
  if (track.posicoesBuffs.includes(indexOfRace + 1)) {
    runner.score += Math.floor(Math.random() * 3);
  }
  return runner;
};

export const useActionsOfRunner = () => ({
  useAdvantageOfTrack,
  useAcceleration,
  useSpeed,
  useDrift,
  useAllyAdvantage,
  useEnemyDisadvantage,
  useVerificationOfSpeed,
  useCheatingFromDickSwindler,
  useConditionOfWinner,
});
