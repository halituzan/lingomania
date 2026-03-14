import connectDBV2 from "@/PageApi/db/connection";
import Englishes from "@/PageApi/models/englishModel";
import Libraries from "@/PageApi/models/libraryModel";
import { NextApiRequest, NextApiResponse } from "next";

connectDBV2();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const {
    letter_count = "5",
    lang = "turkish",
    letter = "",
  } = req.query;

  try {
    if (lang === "turkish") {
      const query: any = {};
      query.$regex = `^[a-zA-ZğĞüÜşŞıİöÖçÇâÂîÎûÛ]{${letter_count}}$`;

      const data = await Libraries.find({ madde: query }).select(
        "madde anlamlarListe lisan telaffuz"
      );

      let filtered = data;
      if (letter) {
        const lowerLetter = (letter as string).toLocaleLowerCase("tr");
        filtered = data.filter(
          (i: any) => i.madde?.toLocaleLowerCase("tr")[0] === lowerLetter
        );
      }

      const words = filtered.map((doc: any) => ({
        madde: doc.madde
          ?.toLocaleLowerCase("tr")
          .replace("â", "a")
          .replace("î", "i")
          .replace("û", "u"),
        anlamlarListe: doc.anlamlarListe || [],
        lisan: doc.lisan || "",
        telaffuz: doc.telaffuz || "",
      }));

      words.sort((a: any, b: any) =>
        a.madde.localeCompare(b.madde, "tr")
      );

      return res.json({ words, total: words.length });
    }

    if (lang === "english") {
      const query: any = {};
      query.$regex = `^[a-zA-Z]{${letter_count}}$`;

      const data = await Englishes.find({ word: query }).select(
        "word def pos"
      );

      let filtered = data;
      if (letter) {
        const lowerLetter = (letter as string).toLowerCase();
        filtered = data.filter(
          (i: any) => i.word?.toLowerCase()[0] === lowerLetter
        );
      }

      const words = filtered.map((doc: any) => ({
        word: doc.word?.toLowerCase(),
        def: doc.def || "",
        pos: doc.pos || "",
      }));

      words.sort((a: any, b: any) => a.word.localeCompare(b.word));

      return res.json({ words, total: words.length });
    }

    return res.status(400).json({ message: "Geçersiz dil parametresi" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Sunucu hatası" });
  }
};

export default handler;
