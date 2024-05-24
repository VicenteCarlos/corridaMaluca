import { api } from "../../services/api.js";

const getTrack = async () => {
  const { data } = await api.get("/pistas.json");
  const selectedTrack = data[Math.floor(Math.random() * data.length)];
  return selectedTrack;
};

const getRunners = async (countRunners) => {
  if (countRunners % 2 !== 0) {
    return "Insira um número par de corredores";
  }
  const { data } = await api.get("/personagens.json");
  const selectedRunners = data.filter((runner, i) => i < countRunners);
  const runners = selectedRunners.map((runner, i, arr) => ({
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
  return runners;
};

export const useCrazyRace = async () => {
  const [track, runners] = await Promise.all([getTrack(), getRunners(4)]);
  return { track, runners }
};
