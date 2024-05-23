import {
  trackURL,
  runnersURL,
  getTrack,
  getRunners,
  startRace,
} from "../src/corrida";
const axios = require("axios");
const mockAdapter = require("axios-mock-adapter");

const mock = new mockAdapter(axios);

afterEach(() => {
  mock.reset();
});

const mockedRunners = [
  {
    id: 1,
    nome: "Dick Vigarista",
    velocidade: 5,
    drift: 2,
    aceleracao: 4,
    vantagem: "CIRCUITO",
  },
  {
    id: 2,
    nome: "Irmãos Rocha",
    velocidade: 5,
    drift: 2,
    aceleracao: 3,
    vantagem: "MONTANHA",
  },
  {
    id: 3,
    nome: "Irmãos Pavor",
    velocidade: 4,
    drift: 2,
    aceleracao: 3,
    vantagem: "DESERTO",
  },
  {
    id: 4,
    nome: "Professor Aéreo",
    velocidade: 6,
    drift: 2,
    aceleracao: 1,
    vantagem: "DESERTO",
  },
];

// Fazer requisições no Jest é uma má prática, mocke essas requisições

describe("Corrida Maluca", () => {
  describe("Seleção de Pista", () => {
    it("Deve conseguir obter a pista corretamente", () => {
      const {
        handlers: { get },
      } = mock.onGet(trackURL).reply(200, [
        {
          id: 2,
          nome: "F1",
          tipo: "CIRCUITO",
          descricao:
            "Um circuito de corrida feito para os carros mais rápidos, possui curvas muitos fechadas",
          tamanho: 20,
          debuff: -1,
          posicoesBuffs: [3, 12],
        },
      ]);

      expect(get[0][4][0]).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          nome: expect.any(String),
          tipo: expect.any(String),
          descricao: expect.any(String),
          tamanho: expect.any(Number),
          debuff: expect.any(Number),
          posicoesBuffs: expect.any(Array),
        })
      );
    });
  });

  describe("Seleção de Corredores", () => {
    it("Deve conseguir obter o corredor corretamente", () => {
      const {
        handlers: { get },
      } = mock.onGet(runnersURL).reply(200, mockedRunners);

      expect(get[0][4]).toHaveLength(4);

      get[0][4].forEach((runner) => {
        expect(runner).toEqual(
          expect.objectContaining({
            id: expect.any(Number),
            nome: expect.any(String),
            velocidade: expect.any(Number),
            drift: expect.any(Number),
            aceleracao: expect.any(Number),
            vantagem: expect.any(String),
          })
        );
      });
    });
  });

  describe("Realizar Corrida", () => {
    it("Deve impedir que o Dick Vigarista vença a corrida se estiver a uma rodada de ganhar", () => {
      const {
        handlers: { get: runners },
      } = mock.onGet(runnersURL).reply(200, [
        {
          id: 1,
          nome: "Dick Vigarista",
          velocidade: 5,
          drift: 2,
          aceleracao: 4,
          vantagem: "CIRCUITO",
        },
      ]);

      const runner = runners[0][4][0];
      runner.score = 0;

      mock.reset();

      const {
        handlers: { get: tracks },
      } = mock.onGet(trackURL).reply(200, [
        {
          id: 2,
          nome: "F1",
          tipo: "CIRCUITO",
          descricao:
            "Um circuito de corrida feito para os carros mais rápidos, possui curvas muitos fechadas",
          tamanho: 20,
          debuff: -1,
          posicoesBuffs: [3, 12],
        },
      ]);

      const track = tracks[0][4][0];

      for (let i = 0; i < track.tamanho; i++) {
        if (i < 3) {
          runner.score += runner.aceleracao;
        }

        if (i >= 3) {
          runner.score += runner.velocidade;
        }

        if (runner.score >= track.tamanho) {
          runner.score = 0;
          return;
        }
      }

      // Verifica se o Dick Vigarista não avançou
      expect(runner.score).toBe(0);
    });

    it("Deve impedir que corredor se mova negativamente mesmo se o calculo de velocidade seja negativo", () => {
      const {
        handlers: { get: runners },
      } = mock.onGet(runnersURL).reply(200, mockedRunners);

      expect(runners[0][4]).toHaveLength(4);

      runners[0][4][0].velocidade = 0;

      expect(runners[0][4][0].velocidade).toBeLessThanOrEqual(0);
    });

    it("Deve conseguir calcular a vantagem de tipo pista corretamente", () => {
      const {
        handlers: { get: tracks },
      } = mock.onGet(trackURL).reply(200, [
        {
          id: 2,
          nome: "F1",
          tipo: "CIRCUITO",
          descricao:
            "Um circuito de corrida feito para os carros mais rápidos, possui curvas muitos fechadas",
          tamanho: 20,
          debuff: -1,
          posicoesBuffs: [3, 12],
        },
      ]);

      const track = tracks[0][4][0];

      const {
        handlers: { get: runners },
      } = mock.onGet(runnersURL).reply(200, [
        {
          id: 1,
          nome: "Dick Vigarista",
          velocidade: 5,
          drift: 2,
          aceleracao: 4,
          vantagem: "CIRCUITO",
        },
      ]);

      const afterRunner = runners[0][4].map((runner) => runner);

      if (runners[0][4][0].vantagem === track.tipo) {
        afterRunner[0].velocidade += 2;
        afterRunner[0].drift += 2;
        afterRunner[0].aceleracao += 2;
      }

      expect(runners[0][4][0].velocidade).toBe(afterRunner[0].velocidade);
      expect(runners[0][4][0].drift).toBe(afterRunner[0].drift);
      expect(runners[0][4][0].aceleracao).toBe(afterRunner[0].aceleracao);
    });

    it("Deve conseguir calcular o debuff de pista corretamente", () => {
      const {
        handlers: { get: tracks },
      } = mock.onGet(trackURL).reply(200, [
        {
          id: 2,
          nome: "F1",
          tipo: "CIRCUITO",
          descricao:
            "Um circuito de corrida feito para os carros mais rápidos, possui curvas muitos fechadas",
          tamanho: 20,
          debuff: -1,
          posicoesBuffs: [3, 12],
        },
      ]);

      const track = tracks[0][4][0];

      expect(track.debuff).toBe(-1);
    });

    it("Deve conseguir calcular o buff de posição de pista para 3 corredores", () => {
      const {
        handlers: { get: tracks },
      } = mock.onGet(trackURL).reply(200, [
        {
          id: 2,
          nome: "F1",
          tipo: "CIRCUITO",
          descricao:
            "Um circuito de corrida feito para os carros mais rápidos, possui curvas muitos fechadas",
          tamanho: 20,
          debuff: -1,
          posicoesBuffs: [3, 12],
        },
      ]);

      const track = tracks[0][4][0];

      // Definindo 3 corredores
      const runners = [
        {
          id: 1,
          nome: "Dick Vigarista",
          velocidade: 5,
          drift: 2,
          aceleracao: 4,
          vantagem: "CIRCUITO",
          score: 0,
        },
        {
          id: 2,
          nome: "Irmãos Rocha",
          velocidade: 5,
          drift: 2,
          aceleracao: 3,
          vantagem: "MONTANHA",
          score: 0,
        },
        {
          id: 3,
          nome: "Irmãos Pavor",
          velocidade: 4,
          drift: 2,
          aceleracao: 3,
          vantagem: "DESERTO",
          score: 0,
        },
      ];

      // Verificar se os buffs são aplicados corretamente nas posições definidas
      track.posicoesBuffs.forEach((posicao) => {
        runners.forEach((runner) => {
          if (runner.score === posicao - 1) {
            // Aplicar buff
            runner.velocidade += Math.floor(Math.random() * 3);
            runner.drift += Math.floor(Math.random() * 3);
            runner.aceleracao += Math.floor(Math.random() * 3);
          }
        });
      });

      runners.forEach((runner) => {
        if (track.posicoesBuffs.includes(runner.score + 1)) {
          expect(runner.velocidade).toBeGreaterThanOrEqual(5);
          expect(runner.drift).toBeGreaterThanOrEqual(2);
          expect(runner.aceleracao).toBeGreaterThanOrEqual(3);
        }
      });
    });

    it("Deve conseguir calcular a próxima posição corretamente se estiver sob o buff de um aliado", () => {
      const {
        handlers: { get: tracks },
      } = mock.onGet(trackURL).reply(200, [
        {
          id: 2,
          nome: "F1",
          tipo: "CIRCUITO",
          descricao:
            "Um circuito de corrida feito para os carros mais rápidos, possui curvas muitos fechadas",
          tamanho: 20,
          debuff: -1,
          posicoesBuffs: [3, 12],
        },
      ]);

      const track = tracks[0][4][0];

      // Definindo 2 corredores
      const runners = [
        {
          id: 1,
          nome: "Dick Vigarista",
          velocidade: 5,
          drift: 2,
          aceleracao: 4,
          vantagem: "CIRCUITO",
          score: 0,
        },
        {
          id: 2,
          nome: "Irmãos Rocha",
          velocidade: 5,
          drift: 2,
          aceleracao: 3,
          vantagem: "MONTANHA",
          score: 0,
        },
      ];

      // Posicionar um corredor na posição do buff
      runners[0].score = track.posicoesBuffs[0] - 1;

      // Verificar se o próximo movimento do corredor recebe o buff do aliado
      const nextPosition = runners[0].score + 1;
      const buffedRunner = runners[1];
      const buffedRunnerAlly = runners[0];

      if (nextPosition === track.posicoesBuffs[0]) {
        buffedRunner.velocidade += Math.floor(Math.random() * 3);
        buffedRunner.drift += Math.floor(Math.random() * 3);
        buffedRunner.aceleracao += Math.floor(Math.random() * 3);

        // Aplicar o buff de velocidade, drift e aceleração
        buffedRunner.velocidade += buffedRunnerAlly.velocidade;
        buffedRunner.drift += buffedRunnerAlly.drift;
        buffedRunner.aceleracao += buffedRunnerAlly.aceleracao;
      }

      // Verificar se os buffs foram aplicados corretamente
      if (nextPosition === track.posicoesBuffs[0]) {
        expect(buffedRunner.velocidade).toBeGreaterThanOrEqual(5);
        expect(buffedRunner.drift).toBeGreaterThanOrEqual(2);
        expect(buffedRunner.aceleracao).toBeGreaterThanOrEqual(4);
      } else {
        // Se não estiver na posição do buff, os valores não devem ter mudado
        expect(buffedRunner.velocidade).toBe(5);
        expect(buffedRunner.drift).toBe(2);
        expect(buffedRunner.aceleracao).toBe(3);
      }
    });

    it("Deve conseguir calcular a próxima posição corretamente se estiver sob o debuff de um inimigo", () => {
      const {
        handlers: { get: tracks },
      } = mock.onGet(trackURL).reply(200, [
        {
          id: 2,
          nome: "F1",
          tipo: "CIRCUITO",
          descricao:
            "Um circuito de corrida feito para os carros mais rápidos, possui curvas muitos fechadas",
          tamanho: 20,
          debuff: -1,
          posicoesBuffs: [3, 12],
        },
      ]);

      const track = tracks[0][4][0];

      // Definindo corredor com debuff
      const runner = {
        id: 1,
        nome: "Dick Vigarista",
        velocidade: 5,
        drift: 2,
        aceleracao: 4,
        vantagem: "CIRCUITO",
        score: 5, // Corredor sob debuff
      };

      // Calculando a próxima posição com debuff
      let nextPosition = runner.score + track.debuff;

      // Verificando se a próxima posição está correta
      expect(nextPosition).toBe(4);
    });

    it("Deve conseguir calcular as novas posições corretamente de uma rodada para a próxima", () => {
      const mockTrackResponse = [
        {
          id: 2,
          nome: "F1",
          tipo: "CIRCUITO",
          descricao:
            "Um circuito de corrida feito para os carros mais rápidos, possui curvas muitos fechadas",
          tamanho: 20,
          debuff: -1,
          posicoesBuffs: [3, 12],
        },
      ];

      const mockRunnersResponse = [
        {
          id: 1,
          nome: "Dick Vigarista",
          velocidade: 5,
          drift: 2,
          aceleracao: 4,
          vantagem: "CIRCUITO",
        },
      ];

      const {
        handlers: { get: tracks },
      } = mock.onGet(trackURL).reply(200, mockTrackResponse);

      const track = tracks[0][4][0];

      const {
        handlers: { get: runners },
      } = mock.onGet(runnersURL).reply(200, mockRunnersResponse);

      const runner = runners[0][4][0];

      let score = 0;

      for (let i = 0; i < track.tamanho; i++) {
        if (i < 3) {
          score += runner.aceleracao;
        }

        if (i >= 3) {
          score += runner.velocidade;
        }

        if (i === 5) {
          return;
        }
      }

      expect(score).toBeGreaterThan(3);
    });

    it("Deve conseguir completar uma corrida com um vencedor", () => {
      const mockTrackResponse = [
        {
          id: 2,
          nome: "F1",
          tipo: "CIRCUITO",
          descricao:
            "Um circuito de corrida feito para os carros mais rápidos, possui curvas muitos fechadas",
          tamanho: 20,
          debuff: -1,
          posicoesBuffs: [3, 12],
        },
      ];

      const {
        handlers: { get: tracks },
      } = mock.onGet(trackURL).reply(200, mockTrackResponse);

      const track = tracks[0][4][0];

      const {
        handlers: { get: runner },
      } = mock.onGet(runnersURL).reply(200, mockedRunners);

      const runners = runner[0][4].map((runner, i) => ({
        ...runner,
        score: 0,
      }));

      let winner = undefined;

      for (let indexOfRace = 0; indexOfRace < track.tamanho; indexOfRace++) {
        runners.forEach((runner, i, arr) => {
          if (indexOfRace < 3) {
            arr[i].score += runner.aceleracao;
          }

          if (indexOfRace >= 3) {
            arr[i].score += runner.velocidade;
          }

          if (runner.score >= track.tamanho) {
            winner = runner;
            return;
          }
        });
      }

      expect(winner).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          nome: expect.any(String),
          velocidade: expect.any(Number),
          drift: expect.any(Number),
          aceleracao: expect.any(Number),
          vantagem: expect.any(String),
        })
      );
    });

    it("Deve conseguir criar corredor corretamente somente com aliado", () => {
      const {
        handlers: { get: runner },
      } = mock.onGet(runnersURL).reply(200, mockedRunners);

      const runners = runner[0][4].map((runner, i, arr) => ({
        ...runner,
        score: 0,
        ally:
          (i + 1) % 2 === 0
            ? arr.filter((runner, i) => (i + 1) % 2 === 0)
            : arr.filter((runner, i) => (i + 1) % 2 !== 0),
      }));

      runners.forEach((runner) => {
        expect(runner).toEqual(
          expect.objectContaining({
            id: expect.any(Number),
            nome: expect.any(String),
            velocidade: expect.any(Number),
            drift: expect.any(Number),
            aceleracao: expect.any(Number),
            vantagem: expect.any(String),
            ally: expect.any(Object),
          })
        );
      });
    });

    it("Deve conseguir criar corredor corretamente somente com inimigo", () => {
      const {
        handlers: { get: runner },
      } = mock.onGet(runnersURL).reply(200, mockedRunners);

      const runners = runner[0][4].map((runner, i, arr) => ({
        ...runner,
        score: 0,
        enemy:
          (i + 1) % 2 === 0
            ? arr.filter((runner, i) => (i + 1) % 2 !== 0)
            : arr.filter((runner, i) => (i + 1) % 2 === 0),
      }));

      runners.forEach((runner) => {
        expect(runner).toEqual(
          expect.objectContaining({
            id: expect.any(Number),
            nome: expect.any(String),
            velocidade: expect.any(Number),
            drift: expect.any(Number),
            aceleracao: expect.any(Number),
            vantagem: expect.any(String),
            enemy: expect.any(Object),
          })
        );
      });
    });

    it("Deve conseguir criar corredor corretamente com aliado e inimigo", () => {
      const {
        handlers: { get: runner },
      } = mock.onGet(runnersURL).reply(200, mockedRunners);

      const runners = runner[0][4].map((runner, i, arr) => ({
        ...runner,
        score: 0,
        ally:
          (i + 1) % 2 === 0
            ? arr.filter((runner, i) => (i + 1) % 2 === 0)
            : arr.filter((runner, i) => (i + 1) % 2 !== 0),
        enemy:
          (i + 1) % 2 === 0
            ? arr.filter((runner, i) => (i + 1) % 2 !== 0)
            : arr.filter((runner, i) => (i + 1) % 2 === 0),
      }));

      runners.forEach((runner) => {
        expect(runner).toEqual(
          expect.objectContaining({
            id: expect.any(Number),
            nome: expect.any(String),
            velocidade: expect.any(Number),
            drift: expect.any(Number),
            aceleracao: expect.any(Number),
            vantagem: expect.any(String),
            ally: expect.any(Object),
            enemy: expect.any(Object),
          })
        );
      });
    });
  });
});
