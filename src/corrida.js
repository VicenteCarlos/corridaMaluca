const axios = require("axios");
const trackURL =
  "https://gustavobuttenbender.github.io/gus.github/corrida-maluca/pistas.json";
const runnersURL =
  "https://gustavobuttenbender.github.io/gus.github/corrida-maluca/personagens.json";

// Função responsável por pegar as pistas de corridas:

const getTrack = async (url) => {
  const { data } = await axios.get(url);
  const selectedTrack = data[Math.floor(Math.random() * data.length)];

  return selectedTrack;
};

// -----

// Função responsável por pegar os corredores:

const getRunners = async (url, countRunners) => {
  const { data } = await axios.get(url);

  if (countRunners % 2 !== 0) {
    alert("Insira um número par de corredores");
    return;
  }

  const selectedRunners = data.filter((runner, i) => i < countRunners);

  return selectedRunners;
};

// -----

// Função responsável por iniciar a corrida:

const startRace = async (trackURL, runnersURL) => {
  /* 
  Dessa linha até a linha onde se encontra o próximo comentário (61), 
  está sendo definido a pista, a quantidade de corredores (ambos usando a sua função assíncrona),
  além disso, faz-se necessário a adição de propriedades no objeto de cada corredor
  */

  const [track, runners] = await Promise.all([
    getTrack(trackURL),
    getRunners(runnersURL, 4),
  ]);

  const mainRunners = runners.map((runner, i, arr) => ({
    ...runner,
    ally:
      runner.id % 2 !== 0
        ? arr.filter((runner) => runner.id % 2 !== 0)
        : arr.filter((runner) => runner.id % 2 === 0),
    enemy:
      runner.id % 2 !== 0
        ? arr.filter((runner) => runner.id % 2 === 0)
        : arr.filter((runner) => runner.id % 2 !== 0),
    forDrift: 4,
    score: 0,
  }));

  console.log(mainRunners[0]);

  // Definindo vantagem de terreno dos corredores:

  mainRunners.forEach((runner, i, arr) => {
    if (runner.vantagem === track.tipo) {
      arr[i].velocidade += 2;
      arr[i].drift += 2;
      arr[i].aceleracao += 2;
    }
  });

  // -----

  // Iniciando a corrida logo abaixo:

  for (let indexOfRace = 0; indexOfRace < track.tamanho; indexOfRace++) {
    let winner = undefined;

    mainRunners.forEach((runner, i, arr) => {
      // Aplica a regra do uso de aceleração somente nas 3 primeiras rodadas (3 primeiros índices da corrida)

      if (indexOfRace < 3) {
        arr[i].score += runner.aceleracao;

        arr[i].ally.forEach((ally, i, arr) => {
          if (i > 0) {
            arr[i].score += ally.aceleracao;
          }
        });

        arr[i].enemy.forEach((enemy, i, arr) => {
          arr[i].score += enemy.aceleracao;
        });
      }

      // -----

      // Aplica a regra de velocidade após 4 rodadas:

      if (indexOfRace > 3 && indexOfRace !== runner.forDrift) {
        arr[i].score += runner.velocidade
       
        arr[i].ally.forEach((ally, i, arr) => {
          if (i > 0) {
            arr[i].score += ally.velocidade;
          }
        });

        arr[i].enemy.forEach((enemy, i, arr) => {
          arr[i].score += enemy.velocidade;
        });
      }

      // -----

      // Aplica a regra de drift a cada 4 rodadas:

      if (runner.forDrift === indexOfRace) {
        arr[i].score += runner.drift;
        arr[i].forDrift += 4;

        arr[i].ally.forEach((ally, i, arr) => {
          if (i > 0) {
            arr[i].score += ally.drift;
            arr[i].forDrift += 4;
          }
        });

        arr[i].enemy.forEach((enemy, i, arr) => {
          arr[i].score += enemy.drift;
          arr[i].forDrift += 4;
        });
      }

      // -----

      // Aplica as regras de desvantagem caso o tipo da pista não seja equivalente a vantagem presente no objeto do corredor

      if (runner.vantagem !== track.tipo) {
        arr[i].score -= track.debuff;
      }

      // Aplica as regras de aliados dos corredores (incluindo o próprio corredor)

      runner.ally.forEach((ally, i) => {
        if (i > 0) {
          if (
            arr[i].score - 2 === ally.score ||
            arr[i].score + 2 === ally.score
          ) {
            ++arr[i].score;
            return;
          }
        }
      });

      // -----

      // Aplica as regras de inimigos dos corredores (incluindo o próprio corredor)

      runner.enemy.forEach((enemy, i) => {
        if (
          arr[i].score - 2 === enemy.score ||
          arr[i].score + 2 === enemy.score
        ) {
          --arr[i].score;
          return;
        }
      });

      // -----

      // Aplica a regra de buffs da pista de acordo com as rodadas presentes no objeto da corrida

      if (track.posicoesBuffs.includes(indexOfRace + 1)) {
        arr[i].score += Math.floor(Math.random() * 3);
      }

      // -----

      // Aplica a regra de que o corredor não avance na rodada atual caso a sua velocidade seja igual a zero

      if (runner.velocidade <= 0) {
        arr[i].score = arr[i].score;
      }

      // -----

      // Caso o Dick Vigarista esteja a uma rodada de ganhar, ele para para fazer uma trapaça, ou seja, não finaliza a corrida porque tem seus atributos zerados

      if (
        runner.nome === "Dick Vigarista" &&
        runner.score >= track.tamanho - 1
      ) {
        arr[i].velocidade = 0;
        arr[i].drift = 0;
        arr[i].aceleracao = 0;
        arr[i].score = 0;
        console.log("Essa será a minha maior vigarice! Hahahaha");
      }

      // -----

      // Aplica a regra de verificação de vitória:

      if (runner.score >= track.tamanho) {
        winner = runner;
        return;
      }
    });

    console.log(`Rodada ${indexOfRace + 1}: \n\n\n`);
    console.log(mainRunners);

    if (winner !== undefined) {
      console.log(`${winner.nome} venceu a corrida!`);

      return;
    }
  }
};

startRace(trackURL, runnersURL);
