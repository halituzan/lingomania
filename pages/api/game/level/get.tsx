import connectDBV2 from "@/PageApi/db/connection";
import { errorHandle } from "@/PageApi/db/errorHandler/error";
import Games from "@/PageApi/models/userGameModel";
import { NextApiRequest, NextApiResponse } from "next";
import Users from "@/PageApi/models/userInfoModel";
import Levels from "@/PageApi/models/levelModel";

connectDBV2();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const token = req.cookies.token || req.headers.token;
  console.log("token", token);

  // Error Methods
  const userId = errorHandle(token || "", res, req, "GET");
  try {
    const user = await Users.findOne({ _id: userId });
    if (!user) {
      return res.json({ message: "Böyle Bir Kullanıcı Bulunamıyor" });
    }
    const { chapter } = await Games.findOne({ userId: userId });
    console.log("chapter", chapter);

    const wordData = await Levels.findOne({ chapter: chapter.section });
    const allWord = await Levels.find();

    return res.json({ allWord, wordData, chapter });
  } catch (error) {
    console.log(error);
  }
};

export default handler;
