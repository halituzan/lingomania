import connectDBV2 from "@/PageApi/db/connection";
import { errorHandle } from "@/PageApi/db/errorHandler/error";
import Games from "@/PageApi/models/userGameModel";
import Users from "@/PageApi/models/userInfoModel";
import { NextApiRequest, NextApiResponse } from "next";

connectDBV2();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const token = req.cookies.token || req.headers.token;
  const { level } = req.body;

  // Error Methods
  const userId = errorHandle(token || "", res, req, "POST");
  try {
    const user = await Users.findOne({ _id: userId });
    if (!user) {
      return res.json({ message: "Böyle Bir Kullanıcı Bulunamıyor" });
    }
    const { winGames } = await Games.findOne({ userId: userId });

    return res.json({
      data: winGames[level - 1]
        ? winGames[level - 1]
        : {
            gameRow: [],
            status: false,
          },
    });
  } catch (error) {
    console.log(error);
  }
};

export default handler;
