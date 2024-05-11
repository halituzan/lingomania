import {
  setFilterWords,
  setFirstLetter,
  setResult,
  setSelectWord,
  winHandler,
} from "@/lib/features/letter/letterSlice";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import randomLetter from "../Helpers/randomLetter";
import { selectCurrentWord, wordsFilter } from "../Helpers/wordsFilter";
import Keyboard from "./Keyboard";
import Row from "./Row";
import { Icon } from "@iconify/react";
import axios from "axios";
type Props = {};

const Home = (props: Props) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation("common");
  const [showPopover, setShowPopover] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { firstLetter, selectWord, result, win } = useSelector(
    (state: any) => state.letter
  );

  const getWords = async (word: string) => {
    try {
      const res = await axios.get("/api/get-word?word=" + word);
      dispatch(setResult(res.data.word));
      return res.data;
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    const localLetter = window.localStorage.getItem("letter");

    const word = window.localStorage.getItem("word");
    const letter = randomLetter();
    const wordFilter = wordsFilter(letter);
    const currentWord = selectCurrentWord(wordFilter);
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
      getWords(word);
    } else {
      window.localStorage.setItem(
        "word",
        selectCurrentWord(wordsFilter(letter))
      );
      dispatch(setSelectWord(currentWord));
      getWords(currentWord);
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
  const [rowMeans, setRowMeans] = useState([]);

  const newGame = async () => {
    setLoading(true);
    const letter = randomLetter();
    const wordList = wordsFilter(letter);
    const currentWord = selectCurrentWord(wordList);
    await getWords(currentWord);
    dispatch(setFirstLetter(letter));
    window.localStorage.setItem("letter", letter);
    dispatch(setFilterWords(wordList));
    setKeyboardWord(letter);
    window.localStorage.setItem("word", currentWord);
    dispatch(setSelectWord(currentWord));
    dispatch(winHandler(""));
    dispatch(setResult({}));

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
    setRowMeans([]);
    setLoading(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    // Assert event.target to be of type EventTarget
    if (!popoverRef.current) return;
    if (
      popoverRef.current &&
      !popoverRef?.current?.contains(event.target as Node)
    ) {
      setShowPopover(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      className='flex flex-col justify-center items-center w-full text-center'
      style={{ height: "calc(100% - 95px)" }}
    >
      <div className='w-[330px] h-[390px] md:w-auto md:h-auto'>
        <Row
          keyboardWord={keyboardWord}
          means={rowMeans[0] ? rowMeans[0] : []}
          isOk={rowOk.row1.status}
          word={rowOk.row1.word}
        />
        <Row
          keyboardWord={keyboardWord}
          means={rowMeans[1] ? rowMeans[1] : []}
          isOk={rowOk.row2.status}
          word={rowOk.row2.word}
        />
        <Row
          keyboardWord={keyboardWord}
          means={rowMeans[2] ? rowMeans[2] : []}
          isOk={rowOk.row3.status}
          word={rowOk.row3.word}
        />
        <Row
          keyboardWord={keyboardWord}
          means={rowMeans[3] ? rowMeans[3] : []}
          isOk={rowOk.row4.status}
          word={rowOk.row4.word}
        />
        <Row
          keyboardWord={keyboardWord}
          means={rowMeans[4] ? rowMeans[4] : []}
          isOk={rowOk.row5.status}
          word={rowOk.row5.word}
        />
        <Row
          keyboardWord={keyboardWord}
          means={rowMeans[5] ? rowMeans[5] : []}
          isOk={rowOk.row6.status}
          word={rowOk.row6.word}
        />
      </div>

      {win !== selectWord && win !== "fail" ? (
        <Keyboard
          setKeyboardWord={setKeyboardWord}
          rowOk={rowOk}
          setRowOK={setRowOK}
          keyboardWord={keyboardWord}
          setRowMeans={setRowMeans}
        />
      ) : (
        ""
      )}
      {win === selectWord && (
        <div className='text-white mb-4'>
          <p className='text-white text-2xl my-4'>Bildiniz. Tebrikler.</p>
          <button
            className='bg-green-700 p-4 rounded-md disabled:bg-green-900'
            disabled={loading}
            onClick={newGame}
          >
            {loading ? (
              <span className='flex items-center'>
                <Icon icon='line-md:loading-loop' fontSize={32} />
                Yeni Oyuna Başlatılıyor
              </span>
            ) : (
              "Yeni Oyun Başlat"
            )}
          </button>
        </div>
      )}
      {win === "fail" && (
        <div className='text-white mb-4 flex flex-col items-center'>
          <p className='text-white text-2xl my-2'>Bilemediniz.</p>
          <p className='text-white text-2xl my-2 flex items-center'>Kelime: </p>
          <div className='text-white  my-2 flex items-center '>
            <p className='text-2xl uppercase'>{selectWord}</p>
            {result?.word && result.means.length > 0 && (
              <div className='ml-4 rounded-full bg-green-600 hover:bg-green-800 p-2 cursor-pointer relative'>
                <Icon
                  icon='akar-icons:chat-question'
                  fontSize={32}
                  onClick={() => setShowPopover(!showPopover)}
                />
                {showPopover && (
                  <div
                    ref={popoverRef}
                    className='absolute bottom-16 md:bottom-10 -left-32 md:left-10 min-w-[300px] max-h-[400px] p-4 rounded-xl md:rounded-bl-none shadow-md shadow-black bg-slate-600 overflow-y-auto'
                  >
                    <p className='flex flex-col uppercase border-b mb-2'>
                      {selectWord}: {result.lisan}
                    </p>
                    <div>
                      <ul>
                        {result?.means?.map(
                          (
                            item: { anlam: string; madde_id: string },
                            index: number
                          ) => {
                            return (
                              <li
                                className='text-start text-sm list-disc ml-4 mb-2'
                                key={item.madde_id + index}
                              >
                                {item.anlam}
                              </li>
                            );
                          }
                        )}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <button
            className='bg-red-700 p-4 rounded-md disabled:bg-green-900'
            disabled={loading}
            onClick={newGame}
          >
            {loading ? (
              <span className='flex items-center'>
                <Icon icon='line-md:loading-loop' fontSize={32} />
                Yeni Oyuna Başlatılıyor
              </span>
            ) : (
              "Yeni Oyun Başlat"
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
