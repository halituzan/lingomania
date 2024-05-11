import connectDBV2 from "@/PageApi/db/connection";
import { errorHandle } from "@/PageApi/db/errorHandler/error";
import Game from "@/PageApi/models/userGameModel";
import { NextApiRequest, NextApiResponse } from "next";


connectDBV2();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { step, means, word } = req.body;
  const { token } = req.cookies;
  const userId = errorHandle(token || "", req, res, "POST");

  if (step <= 0 || step > 6) {
    return res
      .status(406)
      .json({ message: "Step değeri 0 dan büyük 6'ya eşit ve düşük olmalı" });
  }
  const updateQuery: any = {};
  updateQuery[`lastGame.step${step}.word`] = word;
  updateQuery[`lastGame.step${step}.means`] = means;
  updateQuery[`lastGame.step${step}.status`] = false;
  updateQuery[`lastGame.step${step + 1}.status`] = true;

//   //   console.log(updateQuery);
//   const game = await Game.findOne({ userId: userId });
//   console.log("game", game);
//   console.log("userId", userId);

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
