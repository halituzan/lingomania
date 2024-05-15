import connectDBV2 from "@/PageApi/db/connection";
import { errorHandle } from "@/PageApi/db/errorHandler/error";
import English from "@/PageApi/models/englishModel";
import Libraries from "@/PageApi/models/libraryModel";
import Users from "@/PageApi/models/userInfoModel";
import { NextApiRequest, NextApiResponse } from "next";

connectDBV2();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { token } = req.cookies;
  const { letter_count = 3, lang = "turkish" } = req.query;
  // Error Methods
  const userId = errorHandle(token || "", res, req, "GET");
  try {
    const user = await Users.findOne({ _id: userId });
    if (!user) {
      return res.json({ message: "Böyle Bir Kullanıcı Bulunamıyor" });
    }

    if (lang === "turkish") {
      let query: any = {};

      query.$regex = `^[a-zA-ZğĞüÜşŞıİöÖçÇ]{${letter_count}}$`;
      const data = await Libraries.find({
        madde: query,
      });
      const wordData = data.map((doc: any) =>
        doc.madde.toLocaleLowerCase("tr")
      );

      return res.json({ words: wordData });
    }
    if (lang === "english") {
      let query: any = {};

      query.$regex = `^[a-zA-Z]{${letter_count}}$`;
      const data = await English.find({
        madde: query,
      });
      // const word3 = data.map((doc: any) => doc.word.toLowerCase());

      return res.json({ words: data });
    }
  } catch (error) {
    console.log(error);
  }
};

export default handler;
