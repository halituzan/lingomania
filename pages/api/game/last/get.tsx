import connectDBV2 from "@/PageApi/db/connection";
import { errorHandle } from "@/PageApi/db/errorHandler/error";
import Games from "@/PageApi/models/userGameModel";
import { NextApiRequest, NextApiResponse } from "next";
import Users from "@/PageApi/models/userInfoModel";

connectDBV2();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { token } = req.cookies;
  // Error Methods
  const userId = errorHandle(token || "", res, req, "GET");
  try {
    const user = await Users.findOne({ _id: userId });
    if (!user) {
      return res.json({ message: "Böyle Bir Kullanıcı Bulunamıyor" });
    }
    const { lastGame } = await Games.findOne({ userId: userId });
    return res.json({ lastGame });
  } catch (error) {
    console.log(error);
  }
};

export default handler;
