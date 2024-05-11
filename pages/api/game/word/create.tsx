import connectDBV2 from "@/PageApi/db/connection";
import { errorHandle } from "@/PageApi/db/errorHandler/error";
import Game from "@/PageApi/models/userGameModel";
import { NextApiRequest, NextApiResponse } from "next";
connectDBV2();
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const word = req.body?.word;
  const { token } = req.cookies;

  const userId = errorHandle(token || "", req, res, "POST");

  try {
    await Game.findOneAndUpdate(
      { userId: userId },
      {
        currentWord: word,
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
