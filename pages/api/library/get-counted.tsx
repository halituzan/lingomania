import connectDBV2 from "@/PageApi/db/connection";
import { errorHandle } from "@/PageApi/db/errorHandler/error";
import Englishes from "@/PageApi/models/englishModel";
import Libraries from "@/PageApi/models/libraryModel";
import Users from "@/PageApi/models/userInfoModel";
import { NextApiRequest, NextApiResponse } from "next";

connectDBV2();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { token } = req.cookies;
  const { letter_count = 5, lang = "turkish", letter = "" } = req.query;
  // Error Methods
  const userId = errorHandle(token || "", res, req, "GET");
  try {
    const user = await Users.findOne({ _id: userId });
    if (!user) {
      return res.json({ message: "Böyle Bir Kullanıcı Bulunamıyor" });
    }

    if (letter) {
      if (lang === "turkish") {
        let query: any = {};

        query.$regex = `^[a-zA-ZğĞüÜşŞıİöÖçÇâÂîÎûÛ]{${letter_count}}$`;
        const data = await Libraries.find({
          madde: query,
        });
        const wordData = data
          .filter((i) => i.madde[0] == letter)
          .map((doc: any) =>
            doc.madde
              .toLocaleLowerCase("tr")
              .replace("â", "a")
              .replace("î", "i")
              .replace("û", "u")
          );

        return res.json({ words: wordData.sort() });
      }
      if (lang === "english") {
        let query: any = {};

        query.$regex = `^[a-zA-Z]{${letter_count}}$`;
        const wordEn = await Englishes.find({
          word: query,
        });
        // const word3 = data.map((doc: any) => doc.word.toLowerCase());

        return res.json({
          words: wordEn.filter(
            (i) =>
              (i.word[0] as string).toLowerCase() ==
              (letter as string).toLowerCase()
          ),
        });
      }
    } else {
      if (lang === "turkish") {
        let query: any = {};

        query.$regex = `^[a-zA-ZğĞüÜşŞıİöÖçÇâÂîÎûÛ]{${letter_count}}$`;
        const data = await Libraries.find({
          madde: query,
        });
        const wordData = data.map((doc: any) =>
          doc.madde
            .toLocaleLowerCase("tr")
            .replace("â", "a")
            .replace("î", "i")
            .replace("û", "u")
        );

        return res.json({ words: wordData.sort() });
      }
      if (lang === "english") {
        let query: any = {};

        query.$regex = `^.{${letter_count}}$`;

        const wordEn = await Englishes.find({
          word: query,
        });
        console.log(wordEn);

        // const word3 = data.map((doc: any) => doc.word.toLowerCase());

        return res.json({ words: wordEn });
      }
    }
  } catch (error) {
    console.log(error);
  }
};

export default handler;
