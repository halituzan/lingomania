import Network from "@/app/Helpers/Network";
import React, { useState, useCallback, useEffect } from "react";

const TURKISH_LETTERS = [
  "a", "b", "c", "ç", "d", "e", "f", "g", "ğ", "h",
  "ı", "i", "j", "k", "l", "m", "n", "o", "ö", "p",
  "r", "s", "ş", "t", "u", "ü", "v", "y", "z",
];

const ENGLISH_LETTERS = [
  "a", "b", "c", "d", "e", "f", "g", "h", "i", "j",
  "k", "l", "m", "n", "o", "p", "q", "r", "s", "t",
  "u", "v", "w", "x", "y", "z",
];

const LETTER_COUNTS = [3, 4, 5, 6, 7, 8, 9];

type TurkishWord = {
  madde: string;
  anlamlarListe: any[];
  lisan: string;
  telaffuz: string;
};

type EnglishWord = {
  word: string;
  def: string;
  pos: string;
};

const KelimeAra = () => {
  const [lang, setLang] = useState<"turkish" | "english">("turkish");
  const [letter, setLetter] = useState("");
  const [letterCount, setLetterCount] = useState(5);
  const [words, setWords] = useState<TurkishWord[] | EnglishWord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const letters = lang === "turkish" ? TURKISH_LETTERS : ENGLISH_LETTERS;

  const handleSearch = useCallback(async () => {
    setLoading(true);
    setSearched(true);
    setExpandedIndex(null);
    try {
      const params = new URLSearchParams({
        lang,
        letter_count: letterCount.toString(),
        ...(letter && { letter }),
      });
      const data = await Network.getData(
        `/library/search-words?${params.toString()}`
      );
      setWords(data.words || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error(error);
      setWords([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [lang, letter, letterCount]);

  const handleLangChange = (newLang: "turkish" | "english") => {
    setLang(newLang);
    setLetter("");
    setWords([]);
    setSearched(false);
  };

  const handleLetterSelect = (l: string) => {
    setLetter(letter === l ? "" : l);
  };

  const escapeCsv = (val: string) => {
    if (val == null) return "";
    const s = String(val);
    if (/[";\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const downloadExcel = useCallback(() => {
    const BOM = "\uFEFF";
    let csv = "";

    if (lang === "turkish") {
      const rows = words as TurkishWord[];
      csv =
        BOM +
        "Kelime;Telaffuz;Lisan;Anlamlar\n" +
        rows
          .map((w) => {
            const anlamlar = (w.anlamlarListe || [])
              .map((a: any) => (a.anlam || "").replace(/;/g, ","))
              .join(" | ");
            return [w.madde, w.telaffuz || "", w.lisan || "", anlamlar].map(escapeCsv).join(";");
          })
          .join("\n");
    } else {
      const rows = words as EnglishWord[];
      csv =
        BOM +
        "Kelime;Tür;Anlam\n" +
        rows
          .map((w) => [w.word, w.pos || "", w.def || ""].map(escapeCsv).join(";"))
          .join("\n");
    }

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kelimeler-${lang}-${letterCount}harf${letter ? `-${letter}` : ""}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [lang, words, letterCount, letter]);

  const renderMeanings = (anlamlarListe: any[]) => {
    if (!anlamlarListe || anlamlarListe.length === 0) return null;

    return (
      <div className='mt-2 space-y-2'>
        {anlamlarListe.map((anlam: any, idx: number) => (
          <div key={idx} className='pl-3 border-l-2 border-emerald-500/30'>
            {anlam.anlam && (
              <p className='text-gray-300 text-sm'>{anlam.anlam}</p>
            )}
            {anlam.fiil && (
              <span className='text-xs text-emerald-400/70 mr-2'>
                {anlam.fiil}
              </span>
            )}
            {anlam.opikaListesi && anlam.opikaListesi.length > 0 && (
              <div className='mt-1'>
                {anlam.opikaListesi.map((ornek: any, oi: number) => (
                  <p key={oi} className='text-xs text-gray-500 italic'>
                    &quot;{ornek.ornek}&quot;
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const filterSummary =
    (lang === "turkish" ? "Türkçe" : "İngilizce") +
    " · " +
    letterCount +
    " harf" +
    (letter ? " · " + letter.toLocaleUpperCase(lang === "turkish" ? "tr" : "en") : "");

  const filtersContent = (
    <>
      {/* Dil + Harf sayısı + Ara - tek satır kompakt */}
      <div className='flex flex-wrap items-center gap-2'>
        <div className='flex rounded-lg overflow-hidden bg-gray-800/80 p-0.5'>
          <button
            onClick={() => handleLangChange("turkish")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              lang === "turkish"
                ? "bg-emerald-500 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            TR
          </button>
          <button
            onClick={() => handleLangChange("english")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              lang === "english"
                ? "bg-emerald-500 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            EN
          </button>
        </div>
        <div className='flex gap-1'>
          {LETTER_COUNTS.map((count) => (
            <button
              key={count}
              onClick={() => setLetterCount(count)}
              className={`w-8 h-8 rounded-md text-xs font-medium transition-all ${
                letterCount === count
                  ? "bg-emerald-500 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {count}
            </button>
          ))}
        </div>
        <button
          onClick={handleSearch}
          disabled={loading}
          className='ml-auto px-4 py-1.5 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed shrink-0'
        >
          {loading ? (
            <svg className='animate-spin h-4 w-4 inline' viewBox='0 0 24 24'>
              <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' fill='none' />
              <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z' />
            </svg>
          ) : (
            "Ara"
          )}
        </button>
      </div>
      {/* Baş harf - tek satır yatay scroll */}
      <div className='flex items-center gap-1.5'>
        <span className='text-gray-500 text-xs shrink-0'>Baş harf:</span>
        <div className='flex gap-1 overflow-x-auto pb-1'>
          {letters.map((l) => (
            <button
              key={l}
              onClick={() => handleLetterSelect(l)}
              className={`w-7 h-7 shrink-0 rounded text-xs font-medium transition-all ${
                letter === l ? "bg-emerald-500 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {l.toLocaleUpperCase(lang === "turkish" ? "tr" : "en")}
            </button>
          ))}
        </div>
      </div>
    </>
  );

  const showCollapsible = isMobile && searched;

  return (
    <div className='w-full max-w-2xl mx-auto px-4 py-4 flex flex-col gap-4'>
      <h1 className='text-xl font-bold text-white text-center'>Kelime Ara</h1>

      {/* Mobil: arama sonrası filtreler açılır-kapanır */}
      {showCollapsible ? (
        <div className='rounded-lg bg-gray-800/60 border border-gray-700/50 overflow-hidden'>
          <button
            type='button'
            onClick={() => setFiltersOpen((o) => !o)}
            className='w-full flex items-center justify-between px-4 py-2.5 text-left'
          >
            <span className='text-gray-300 text-sm font-medium'>Filtreler</span>
            <span className='text-gray-500 text-xs truncate max-w-[60%]'>{filterSummary}</span>
            <svg
              className={`w-4 h-4 text-gray-500 shrink-0 transition-transform ${filtersOpen ? "rotate-180" : ""}`}
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
            </svg>
          </button>
          {filtersOpen && <div className='px-4 pb-4 pt-0 flex flex-col gap-3 border-t border-gray-700/50'>{filtersContent}</div>}
        </div>
      ) : (
        <div className='rounded-lg bg-gray-800/40 border border-gray-800 p-3 flex flex-col gap-3'>
          {filtersContent}
        </div>
      )}

      {/* Sonuçlar */}
      {searched && !loading && (
        <div>
          <div className='flex flex-wrap items-center justify-center gap-2 mb-3'>
            <p className='text-gray-500 text-xs'>
              {total} kelime bulundu
            </p>
            {words.length > 0 && (
              <button
                type='button'
                onClick={downloadExcel}
                className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-medium hover:bg-emerald-500/30 transition-colors border border-emerald-500/30'
              >
                <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                  <path strokeLinecap='round' strokeLinejoin='round' d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4' />
                </svg>
                Excel’e indir
              </button>
            )}
          </div>

          {words.length === 0 ? (
            <p className='text-gray-600 text-center py-8'>
              Sonuç bulunamadı
            </p>
          ) : (
            <div className='space-y-2 overflow-y-auto pr-1'>
              {lang === "turkish"
                ? (words as TurkishWord[]).map((w, i) => (
                    <div
                      key={i}
                      onClick={() =>
                        setExpandedIndex(expandedIndex === i ? null : i)
                      }
                      className='bg-gray-800/50 rounded-lg p-3 cursor-pointer 
                                 hover:bg-gray-800 transition-all border border-gray-800
                                 hover:border-gray-700'
                    >
                      <div className='flex items-center justify-between'>
                        <span className='text-white font-medium'>
                          {w.madde}
                        </span>
                        <div className='flex items-center gap-2'>
                          {w.lisan && (
                            <span className='text-[10px] text-gray-500 bg-gray-900 px-2 py-0.5 rounded'>
                              {w.lisan}
                            </span>
                          )}
                          <svg
                            className={`w-4 h-4 text-gray-500 transition-transform ${
                              expandedIndex === i ? "rotate-180" : ""
                            }`}
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M19 9l-7 7-7-7'
                            />
                          </svg>
                        </div>
                      </div>
                      {w.telaffuz && (
                        <p className='text-xs text-gray-500 mt-0.5'>
                          [{w.telaffuz}]
                        </p>
                      )}
                      {expandedIndex === i && renderMeanings(w.anlamlarListe)}
                    </div>
                  ))
                : (words as EnglishWord[]).map((w, i) => (
                    <div
                      key={i}
                      className='bg-gray-800/50 rounded-lg p-3 border border-gray-800'
                    >
                      <div className='flex items-center justify-between'>
                        <span className='text-white font-medium'>{w.word}</span>
                        {w.pos && (
                          <span className='text-[10px] text-emerald-400/70 bg-emerald-400/10 px-2 py-0.5 rounded'>
                            {w.pos}
                          </span>
                        )}
                      </div>
                      {w.def && (
                        <p className='text-gray-400 text-sm mt-1'>{w.def}</p>
                      )}
                    </div>
                  ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default KelimeAra;
