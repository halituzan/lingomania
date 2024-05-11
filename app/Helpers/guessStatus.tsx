export const getGuessStatus = (guess: any, solution: any) => {
  const splitSolution = solution.split("");
  const splitGuess = guess.split("");

  const solutionCharsTaken = splitSolution.map((_: any) => false);

  const statuses = Array.from(Array(guess.length));

  splitGuess.forEach((letter: any, i: number) => {
    if (letter === splitSolution[i]) {
      statuses[i] = LetterState.correct;
      solutionCharsTaken[i] = true;
      return;
    }
  });

  splitGuess.forEach((letter: any, i: number) => {
    if (statuses[i]) return;

    if (!splitSolution.includes(letter)) {
      statuses[i] = LetterState.wrong;
      return;
    }

    const indexOfPresentChar = splitSolution.findIndex(
      (x: any, index: number) => x === letter && !solutionCharsTaken[index]
    );

    if (indexOfPresentChar > -1) {
      statuses[i] = LetterState.none;
      solutionCharsTaken[indexOfPresentChar] = true;
      return;
    } else {
      statuses[i] = LetterState.wrong;
      return;
    }
  });

  return statuses;
};

const LetterState = {
  correct: 1,
  none: 2,
  wrong: 3,
};
