import connectDBV2 from "@/PageApi/db/connection";
import { errorHandle } from "@/PageApi/db/errorHandler/error";
import Libraries from "@/PageApi/models/libraryModel";
import Users from "@/PageApi/models/userInfoModel";
import { NextApiRequest, NextApiResponse } from "next";

connectDBV2();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { token } = req.cookies;
  const { letter_count = 3 } = req.query;
  // Error Methods
  const userId = errorHandle(token || "", req, res, "GET");
  try {
    const user = await Users.findOne({ _id: userId });
    if (!user) {
      return res.json({ message: "Böyle Bir Kullanıcı Bulunamıyor" });
    }

    let query: any = {};

    query.$regex = `^[a-zA-ZğĞüÜşŞıİöÖçÇ]{${letter_count}}$`;

    const data = await Libraries.find({
      madde: query,
    });
    const word3 = data.map((doc: any) => doc.madde.toLocaleLowerCase('tr'));

    return res.json({ word3 });
  } catch (error) {
    console.log(error);
  }
};

export default handler;
