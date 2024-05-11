import connectDBV2 from "@/PageApi/db/connection";
import { errorHandle } from "@/PageApi/db/errorHandler/error";
import Game from "@/PageApi/models/userGameModel";
import { NextApiRequest, NextApiResponse } from "next";

connectDBV2();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { token } = req.cookies;
  const userId = errorHandle(token || "", req, res, "GET");

  const updateQuery: any = {};

  for (let i = 1; i <= 6; i++) {
    if (i === 1) {
      updateQuery[`lastGame.step${i}.word`] = "";
      updateQuery[`lastGame.step${i}.means`] = [];
      updateQuery[`lastGame.step${i}.status`] = true;
    } else {
      updateQuery[`lastGame.step${i}.word`] = "";
      updateQuery[`lastGame.step${i}.means`] = [];
      updateQuery[`lastGame.step${i}.status`] = false;
    }
  }

  try {
    await Game.findOneAndUpdate(
      { userId: userId },
      {
        $set: updateQuery,
      },
      { new: true }
    );

    return res.json({
      message: "Bilgiler başarılı bir şekilde güncellendi",
      status: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export default handler;
