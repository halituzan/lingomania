import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Icon } from "@iconify/react";
type Props = {
  keyboardWord: string;
  word: string;
  isOk: boolean;
  means?: any;
};

function Row({ isOk, keyboardWord, word, means }: Props) {
  const [showPopover, setShowPopover] = useState(false);

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
  const popoverRef = useRef<HTMLDivElement>(null);
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
    <div className='grid grid-cols-5 gap-1 md:gap-4 mb-2'>
      <div className={`bg-green-700 text-white relative ${divClass}`}>
        <p className='z-0'>
          {firstLetter}
          {means?.length > 0 && (
            <span
              className='cursor-pointer text-[14px] absolute -top-3 -left-3 p-1 -rotate-45 rounded-full bg-orange-600'
              onClick={() => setShowPopover(!showPopover)}
            >
              <Icon
                icon='ph:seal-question-duotone'
                fontSize={24}
                className='text-white'
              />
            </span>
          )}
        </p>
        {showPopover && means.length > 0 && (
          <div
            ref={popoverRef}
            className='absolute top-2 left-5 min-w-[250px] z-50 max-h-[400px] p-4 rounded-xl rounded-tl-none shadow-md shadow-black bg-slate-600 overflow-y-auto'
          >
            <div>
              <ul>
                {means?.map(
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
  );
}

export default Row;
