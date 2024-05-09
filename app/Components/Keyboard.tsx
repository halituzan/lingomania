import { winHandler } from "@/lib/features/letter/letterSlice";
import { Icon } from "@iconify/react";
import React, { useEffect } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
type Props = {
  keyboardWord: string;
  setKeyboardWord: any;
  rowOk: any;
  setRowOK: any;
};

const Keyboard = ({
  keyboardWord,
  setKeyboardWord,
  rowOk,
  setRowOK,
}: Props) => {
  const dispatch = useDispatch();
  const { selectWord, win, filterWords, firstLetter } = useSelector(
    (state: any) => state.letter
  );
  const handleClick = (e: any, type = "click") => {
    if (keyboardWord.length >= 0 && keyboardWord.length <= 4) {
      if (type == "keydown") {
        setKeyboardWord((prev: string) => prev + e.key);
      } else
        setKeyboardWord(
          (prev: string) => prev + (e.target as HTMLButtonElement).innerHTML
        );
    }
  };
  const wordList = Object.keys(rowOk).map((i) => {
    return rowOk[i].word;
  });

  const handleEnterClick = (
    event:
      | React.MouseEvent<HTMLButtonElement>
      | React.KeyboardEvent<HTMLButtonElement>,
    type = "click"
  ) => {
    if (keyboardWord.length !== 5) {
      toast.error("Lütfen Tüm Harfleri Doldurun.");
      return;
    }
    if (!filterWords.includes(keyboardWord)) {
      toast.error("Kelime Mevcut Değil!");
      setKeyboardWord(firstLetter);
      return;
    }

    if (wordList.some((i) => i == keyboardWord)) {
      toast.error("Girdiğiniz Kelimeyi Giremezsiniz!");
      setKeyboardWord(firstLetter);
      return;
    }

    const keysArray = Object.keys(rowOk);
    let targetKey = null;
    let nextKey = null;

    for (const item of keysArray) {
      if (rowOk[item].status === true) {
        targetKey = item;
        nextKey = keysArray[keysArray.findIndex((i) => i == item) + 1];
        break;
      }
    }
    if (targetKey) {
      setRowOK({
        ...rowOk,
        [targetKey]: { ...rowOk[targetKey], status: false, word: keyboardWord },
        ...(nextKey
          ? { [nextKey]: { ...rowOk[nextKey], status: true, word: "" } }
          : {}),
      });
    }

    setKeyboardWord(keyboardWord[0]);

    if (keyboardWord === selectWord) {
      dispatch(winHandler(selectWord));
    } else {
      if (rowOk.row6.status && keyboardWord !== selectWord) {
        dispatch(winHandler("fail"));
      }
    }
  };

  const handleClearClick = () => {
    setKeyboardWord(keyboardWord[0]);
  };
  const handleDeleteClick = () => {
    if (keyboardWord.length === 1) {
      return;
    }
    setKeyboardWord((prev: string) => prev.slice(0, -1));
  };

  useEffect(() => {
    function keyDownHandler(e: any) {
      if (e.key === "Enter") {
        handleEnterClick(e, "keydown");
      } else if (e.key === "Backspace") {
        handleDeleteClick();
      } else if (e.code === "Space") {
        handleClearClick();
      } else if (turkishLetters.some((i) => i == e.key)) {
        handleClick(e, "keydown");
      }
    }

    document.addEventListener("keydown", keyDownHandler);
    return () => {
      document.removeEventListener("keydown", keyDownHandler);
    };
  });

  const letterButton = (item: string) => {
    const isUsed = wordList.some((i) => i.includes(item));
    const correctResult = [];
    const includeResult = [];
    const noneResult = [];
    for (const word of wordList) {
      if (word) {
        for (let i = 0; i < selectWord.length; i++) {
          let char1 = selectWord[i];
          let char2 = word[i];
          if (char1 === char2) {
            correctResult.push(word[i]);
          } else if (word.includes(char1)) {
            includeResult.push(word[i]);
          } else {
            noneResult.push(word[i]);
          }
        }
      }
    }

    return `${
      correctResult.some((i) => i == item)
        ? "bg-green-600"
        : includeResult.some((i) => i == item)
        ? "bg-yellow-600"
        : noneResult.some((i) => i == item)
        ? "bg-slate-900"
        : "bg-slate-600"
    } flex justify-center items-center  disabled:bg-slate-800 hover:bg-slate-400 uppercase md:m-[2px] text-white w-full h-10`;
  };
  const bigButton = `bg-slate-600 disabled:bg-slate-800 hover:bg-slate-400 uppercase md:m-[2px] text-white w-14 h-full`;
  return (
    <div className='mt-2 w-full'>
      <div className='grid grid-cols-6 gap-2 mb-[2px]'>
        {turkishLetters.map((item: string) => {
          return (
            <button
              key={item}
              disabled={win}
              onClick={handleClick}
              className={letterButton(item)}
            >
              {item}
            </button>
          );
        })}

        <button
          disabled={win}
          onClick={handleDeleteClick}
          className={letterButton("backspace")}
        >
          <Icon icon='iconamoon:backspace-duotone' fontSize={30} />
        </button>
      </div>
      <div className='grid grid-cols-2 gap-2 mt-2 mb-[2px]'>
        <button
          disabled={win}
          onClick={handleEnterClick}
          className={bigButton + " w-full"}
        >
          Seç
        </button>

        <button
          disabled={win}
          onClick={handleClearClick}
          className={bigButton + " w-full"}
        >
          Temizle
        </button>
      </div>
    </div>
  );
};

export default Keyboard;

const turkishLetters = [
  "e",
  "r",
  "t",
  "y",
  "u",
  "ı",
  "o",
  "p",
  "ğ",
  "ü",
  "a",
  "s",
  "d",
  "f",
  "g",
  "h",
  "j",
  "k",
  "l",
  "ş",
  "i",
  "z",
  "c",
  "v",
  "b",
  "n",
  "m",
  "ö",
  "ç",
];
