import { useSelector } from "react-redux";

type Props = {
  keyboardWord: string;
  word: string;
  isOk: boolean;
  rowOk?: any;
};

function Row({ isOk, keyboardWord, word }: Props) {
  const { firstLetter, selectWord, filterWords, win } = useSelector(
    (state: any) => state.letter
  );
  const divClass =
  "uppercase text-3xl md:text-4xl font-semibold flex justify-center items-center md:w-16 md:h-16 w-14 h-14 letter";
  const changingClass = (n: number) => {
    const isLetter = selectWord[n] === word[n];
    const isInclude = selectWord.includes(word[n]);
   

    return `
    ${
      isOk && !win
        ? isLetter
          ? "bg-green-700 text-white"
          : isInclude
          ? "bg-yellow-400 text-black"
          : "bg-slate-300 text-black"
        : isLetter
        ? "bg-green-700 text-white"
        : isInclude
        ? "bg-yellow-400 text-black"
        : "bg-slate-700 text-white"
    }
    ${divClass}`;
  };

  return (
    <div>
      <div className='grid grid-cols-5 gap-1 md:gap-4 mb-1 md:mb-3'>
        <div className={`bg-green-700 text-white ${divClass}`}>
          {firstLetter}
        </div>
        <div className={`${changingClass(1)} ${divClass}`}>
          {isOk || word ? (word ? word[1] : keyboardWord[1]) : ""}
        </div>
        <div className={`${changingClass(2)} ${divClass}`}>
          {isOk || word ? (word ? word[2] : keyboardWord[2]) : ""}
        </div>
        <div className={`${changingClass(3)} ${divClass}`}>
          {isOk || word ? (word ? word[3] : keyboardWord[3]) : ""}
        </div>
        <div className={`${changingClass(4)} ${divClass}`}>
          {isOk || word ? (word ? word[4] : keyboardWord[4]) : ""}
        </div>
      </div>
    </div>
  );
}

export default Row;
