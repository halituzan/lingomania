import { LetterState } from "./game";

export const getKeyboardMapping = (guesses: any, solution: any) => {
  const charecters: any = {};
  const keyset: {
    correct: string[];
    none: string[];
    wrong: string[];
  } = {
    correct: [],
    none: [],
    wrong: [],
  };
  guesses.forEach((word: string) => {
    word.split("").forEach((letter: string, i: number) => {
      if (!solution.includes(letter)) {
        charecters[letter] = "none";
        keyset.wrong.push(letter);
        return;
      }
      if (letter === solution[i]) {
        charecters[letter] = "correct";
        keyset.correct.push(letter);
        return;
      }

      if (charecters[letter] !== "correct") {
        charecters[letter] = "wrong";
        keyset.none.push(letter);
        return;
      }
    });
  });

  return { charecters, keyset };
};

export const getGuessStatus = (guess: any, solution: any) => {
  const splitSolution = solution.split("");
  const splitGuess = guess.split("");

  const solutionCharsTaken = splitSolution.map((_: any) => false);

  const statuses = Array.from(Array(guess.length));

  splitGuess.forEach((letter: string, i: number) => {
    if (letter === splitSolution[i]) {
      statuses[i] = LetterState.correct;
      solutionCharsTaken[i] = true;
      return;
    }
  });

  splitGuess.forEach((letter: string, i: number) => {
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
