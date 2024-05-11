import connectDBV2 from "@/PageApi/db/connection";
import { errorHandle } from "@/PageApi/db/errorHandler/error";
import Game from "@/PageApi/models/userGameModel";
import { NextApiRequest, NextApiResponse } from "next";
import User from "@/PageApi/models/userInfoModel";

connectDBV2();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { token } = req.cookies;
  // Error Methods
  const userId = errorHandle(token || "", req, res, "GET");
  try {
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.json({ message: "Böyle Bir Kullanıcı Bulunamıyor" });
    }
    const { lastGame } = await Game.findOne({ userId: userId });
    return res.json({ lastGame });
  } catch (error) {
    console.log(error);
  }
};

export default handler;
