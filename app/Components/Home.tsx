import {
  setFilterWords,
  setFirstLetter,
  setSelectWord,
  winHandler,
} from "@/lib/features/letter/letterSlice";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import randomLetter from "../Helpers/randomLetter";
import { selectCurrentWord, wordsFilter } from "../Helpers/wordsFilter";
import Keyboard from "./Keyboard";
import Row from "./Row";
type Props = {};

const Home = (props: Props) => {
  const { t } = useTranslation("common");
  const localLetter = window.localStorage.getItem("letter");
  const word = window.localStorage.getItem("word");
  const dispatch = useDispatch();
  const { firstLetter, selectWord, filterWords, win } = useSelector(
    (state: any) => state.letter
  );
  console.log("win", win);

  useEffect(() => {
    const letter = randomLetter();
    //* Harf Seçici
    if (localLetter) {
      dispatch(setFirstLetter(localLetter));
      dispatch(setFilterWords(wordsFilter(localLetter)));
      setKeyboardWord(localLetter);
    } else {
      dispatch(setFirstLetter(letter));
      window.localStorage.setItem("letter", letter);
      dispatch(setFilterWords(wordsFilter(letter)));
      setKeyboardWord(letter);
    }

    //* Kelime Seçici
    if (word) {
      dispatch(setSelectWord(word));
    } else {
      window.localStorage.setItem(
        "word",
        selectCurrentWord(wordsFilter(letter))
      );
      dispatch(setSelectWord(selectCurrentWord(wordsFilter(letter))));
    }
  }, []);

  const [keyboardWord, setKeyboardWord] = useState(firstLetter);

  const [rowOk, setRowOK] = useState({
    row1: {
      status: true,
      word: "",
    },
    row2: {
      status: false,
      word: "",
    },
    row3: {
      status: false,
      word: "",
    },
    row4: {
      status: false,
      word: "",
    },
    row5: {
      status: false,
      word: "",
    },
    row6: {
      status: false,
      word: "",
    },
  });

  const newGame = () => {
    const letter = randomLetter();
    const wordList = wordsFilter(letter);
    const currentWord = selectCurrentWord(wordList);
    dispatch(setFirstLetter(letter));
    window.localStorage.setItem("letter", letter);
    dispatch(setFilterWords(wordList));
    setKeyboardWord(letter);
    window.localStorage.setItem("word", currentWord);
    dispatch(setSelectWord(currentWord));
    dispatch(winHandler(""));
    setRowOK({
      row1: {
        status: true,
        word: "",
      },
      row2: {
        status: false,
        word: "",
      },
      row3: {
        status: false,
        word: "",
      },
      row4: {
        status: false,
        word: "",
      },
      row5: {
        status: false,
        word: "",
      },
      row6: {
        status: false,
        word: "",
      },
    });
  };

  return (
    <div className='flex flex-col justify-center items-center max-w-[350px] text-center'>
      <Row
        keyboardWord={keyboardWord}
        isOk={rowOk.row1.status}
        word={rowOk.row1.word}
      />
      <Row
        keyboardWord={keyboardWord}
        isOk={rowOk.row2.status}
        word={rowOk.row2.word}
      />
      <Row
        keyboardWord={keyboardWord}
        isOk={rowOk.row3.status}
        word={rowOk.row3.word}
      />
      <Row
        keyboardWord={keyboardWord}
        isOk={rowOk.row4.status}
        word={rowOk.row4.word}
      />
      <Row
        keyboardWord={keyboardWord}
        isOk={rowOk.row5.status}
        word={rowOk.row5.word}
      />
      <Row
        keyboardWord={keyboardWord}
        isOk={rowOk.row6.status}
        word={rowOk.row6.word}
        rowOk={rowOk}
      />

      <Keyboard
        setKeyboardWord={setKeyboardWord}
        rowOk={rowOk}
        setRowOK={setRowOK}
        keyboardWord={keyboardWord}
      />
      {win === selectWord && (
        <div className='text-white mb-4'>
          <p className='text-white text-2xl my-4'>Bildiniz. Tebrikler.</p>
          <button className='bg-green-700 p-4 rounded-md' onClick={newGame}>
            Yeni bir kelime dene
          </button>
        </div>
      )}
      {win === "fail" && (
        <div className='text-white mb-4'>
          <p className='text-white text-2xl my-4'>Bilemediniz.</p>
          <p className='text-white text-2xl my-4'>Kelime: {selectWord}</p>
          <button className='bg-green-700 p-4 rounded-md' onClick={newGame}>
            Yeni bir kelime dene
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
