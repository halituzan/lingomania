import { winHandler } from "@/lib/features/letter/letterSlice";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
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
  const handleClick = (
    e: any,
    type = "click"
  ) => {
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

  console.log(wordList);
  const handleEnterClick = (
    event:
      | React.MouseEvent<HTMLButtonElement>
      | React.KeyboardEvent<HTMLButtonElement>,
    type = "click"
  ) => {
    console.log(event);
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
  console.log(turkceHarfler);
  useEffect(() => {
    function keyDownHandler(e: any) {
      console.log("first", e);
      console.log(e.key);
      if (e.key === "Enter") {
        handleEnterClick(e, "keydown");
      } else if (e.key === "Backspace") {
        handleDeleteClick();
      } else if (e.code === "Space") {
        handleClearClick();
      } else if (turkceHarfler.some((i) => i == e.key)) {
        handleClick(e, "keydown");
      }
    }

    document.addEventListener("keydown", keyDownHandler);
    return () => {
      document.removeEventListener("keydown", keyDownHandler);
    };
  });

  const letterButton = `bg-slate-600 disabled:bg-slate-800 hover:bg-slate-400 uppercase m-1 md:m-[2px] text-white md:w-12 md:h-12 w-10 h-10`;
  const bigButton = `bg-slate-600 disabled:bg-slate-800 hover:bg-slate-400 uppercase m-1 md:m-[2px] text-white md:w-16 w-14 md:h-12 h-10`;
  return (
    <div className='mt-10'>
      <div className='flex justify-center flex-wrap md:flex-nowrap mb-[2px]'>
        <button disabled={win} onClick={handleClick} className={letterButton}>
          e
        </button>
        <button disabled={win} onClick={handleClick} className={letterButton}>
          r
        </button>
        <button disabled={win} onClick={handleClick} className={letterButton}>
          t
        </button>
        <button disabled={win} onClick={handleClick} className={letterButton}>
          y
        </button>
        <button disabled={win} onClick={handleClick} className={letterButton}>
          u
        </button>
        <button disabled={win} onClick={handleClick} className={letterButton}>
          ı
        </button>
        <button disabled={win} onClick={handleClick} className={letterButton}>
          o
        </button>
        <button disabled={win} onClick={handleClick} className={letterButton}>
          p
        </button>
        <button disabled={win} onClick={handleClick} className={letterButton}>
          ğ
        </button>
        <button disabled={win} onClick={handleClick} className={letterButton}>
          ü
        </button>
      </div>
      <div className='flex justify-center  flex-wrap md:flex-nowrap    mb-[2px]'>
        <button disabled={win} onClick={handleClick} className={letterButton}>
          a
        </button>
        <button disabled={win} onClick={handleClick} className={letterButton}>
          s
        </button>
        <button disabled={win} onClick={handleClick} className={letterButton}>
          d
        </button>
        <button disabled={win} onClick={handleClick} className={letterButton}>
          f
        </button>
        <button disabled={win} onClick={handleClick} className={letterButton}>
          g
        </button>
        <button disabled={win} onClick={handleClick} className={letterButton}>
          h
        </button>
        <button disabled={win} onClick={handleClick} className={letterButton}>
          j
        </button>
        <button disabled={win} onClick={handleClick} className={letterButton}>
          k
        </button>
        <button disabled={win} onClick={handleClick} className={letterButton}>
          l
        </button>
        <button disabled={win} onClick={handleClick} className={letterButton}>
          ş
        </button>
        <button disabled={win} onClick={handleClick} className={letterButton}>
          i
        </button>
      </div>
      <div className='flex justify-center  flex-wrap md:flex-nowrap mb-[2px] '>
        <button disabled={win} onClick={handleClick} className={letterButton}>
          z
        </button>
        <button disabled={win} onClick={handleClick} className={letterButton}>
          c
        </button>
        <button disabled={win} onClick={handleClick} className={letterButton}>
          v
        </button>
        <button disabled={win} onClick={handleClick} className={letterButton}>
          b
        </button>
        <button disabled={win} onClick={handleClick} className={letterButton}>
          n
        </button>
        <button disabled={win} onClick={handleClick} className={letterButton}>
          m
        </button>
        <button disabled={win} onClick={handleClick} className={letterButton}>
          ö
        </button>
        <button disabled={win} onClick={handleClick} className={letterButton}>
          ç
        </button>
      </div>
      <div className='flex justify-center flex-wrap md:flex-nowrap mb-[2px]'>
        <button disabled={win} onClick={handleEnterClick} className={bigButton}>
          ENTER
        </button>
        <button
          disabled={win}
          onClick={handleDeleteClick}
          className={bigButton}
        >
          DELETE
        </button>
        <button disabled={win} onClick={handleClearClick} className={bigButton}>
          CLEAR
        </button>
      </div>
    </div>
  );
};

export default Keyboard;
var turkceHarfler = [
  "a",
  "b",
  "c",
  "ç",
  "d",
  "e",
  "f",
  "g",
  "ğ",
  "h",
  "ı",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "ö",
  "p",
  "r",
  "s",
  "ş",
  "t",
  "u",
  "ü",
  "v",
  "y",
  "z",
];
