import { useCrazyRace } from "./hooks/useCrazyRace/index.js";
import { useActionsOfRunner } from "./hooks/useActionsOfRunner/index.js";

const startRace = async () => {
  const { runners, track } = await useCrazyRace();
  const {
    useAdvantageOfTrack,
    useAcceleration,
    useSpeed,
    useDrift,
    useAllyAdvantage,
    useEnemyDisadvantage,
    useVerificationOfSpeed,
    useCheatingFromDickSwindler,
    useConditionOfWinner,
  } = useActionsOfRunner();
  let winner = undefined;

  runners.forEach((runner, i, arr) => useAdvantageOfTrack(arr[i], track));

  for (let indexOfRace = 0; indexOfRace < track.tamanho; indexOfRace++) {
    runners.forEach((runner, i, arr) => {
      useAcceleration(arr[i], indexOfRace, track);
      useSpeed(arr[i], indexOfRace, track);
      useDrift(arr[i], indexOfRace, track);
      useAllyAdvantage(arr[i]);
      useEnemyDisadvantage(arr[i]);
      useVerificationOfSpeed(arr[i]);
      useCheatingFromDickSwindler(arr[i], track);
      if (typeof useConditionOfWinner(arr[i], track) !== "string") {
        winner = useConditionOfWinner(arr[i], track);
      }
    });
    if (winner !== undefined) {
      return winner;
    }
  }
};

startRace();
