import { winHandler } from "@/lib/features/letter/letterSlice";
import React from "react";
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
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (keyboardWord.length >= 0 && keyboardWord.length <= 4) {
      setKeyboardWord(
        (prev: string) => prev + (e.target as HTMLButtonElement).innerHTML
      );
    }
  };
  const wordList = Object.keys(rowOk).map((i) => {
    return rowOk[i].word;
  });

  console.log(wordList);
  const handleEnterClick = () => {
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
        ...(nextKey ? { [nextKey]: { ...rowOk[nextKey], status: true, word: "" } } : {}),
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

  const letterButton = `bg-slate-600 disabled:bg-slate-800 hover:bg-slate-400 text-white w-12 h-12`;

  return (
    <div className='mt-10'>
      <div className='flex justify-center space-x-1 mb-2'>
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
        <button
          disabled={win}
          onClick={handleDeleteClick}
          className='bg-slate-600 disabled:bg-slate-800 hover:bg-slate-400 uppercase text-white w-16 h-12'
        >
          DELETE
        </button>
      </div>
      <div className='flex justify-center space-x-1 mb-2'>
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
      <div className='flex justify-center space-x-1'>
        <button
          disabled={win}
          onClick={handleEnterClick}
          className='bg-slate-600 disabled:bg-slate-800 hover:bg-slate-400 uppercase text-white w-16 h-12'
        >
          ENTER
        </button>
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
        <button
          disabled={win}
          onClick={handleClearClick}
          className='bg-slate-600 disabled:bg-slate-800 hover:bg-slate-400 uppercase text-white w-16 h-12'
        >
          CLEAR
        </button>
      </div>
    </div>
  );
};

export default Keyboard;
