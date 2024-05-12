import connectDBV2 from "@/PageApi/db/connection";
import { errorHandle } from "@/PageApi/db/errorHandler/error";

import User from "@/PageApi/models/userInfoModel";
import { NextApiRequest, NextApiResponse } from "next";
connectDBV2();
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { point } = req.body;
  const { token } = req.cookies;

  const userId = errorHandle(token || "", req, res, "POST");

  try {
    const user = await User.findOne({ _id: userId });
    await User.findOneAndUpdate(
      { _id: userId },
      {
        totalScore: user.totalScore + point,
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
