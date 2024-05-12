import words from "./word5";

export const wordsFilter = (letter: string) => {
  return words.filter((i) => i.startsWith(letter));
};

export const selectWords = (list: string[]) => {
  const randomWords = [];
  for (let i = 0; i < 5; i++) {
    const randomIndex = Math.floor(Math.random() * list.length);
    randomWords.push(list[randomIndex]);
  }
  return randomWords;
};
export const selectCurrentWord = (list: string[]) => {
  const randomIndex = Math.floor(Math.random() * list.length);
  return list[randomIndex];
};
