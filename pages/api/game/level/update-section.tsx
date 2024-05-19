import connectDBV2 from "@/PageApi/db/connection";
import { errorHandle } from "@/PageApi/db/errorHandler/error";
import Games from "@/PageApi/models/userGameModel";
import Users from "@/PageApi/models/userInfoModel";
import { NextApiRequest, NextApiResponse } from "next";


connectDBV2();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const token = req.cookies.token || req.headers.token;

  // Error Methods
  const userId = errorHandle(token || "", res, req, "GET");
  try {
    const user = await Users.findOne({ _id: userId });
    if (!user) {
      return res.json({ message: "Böyle Bir Kullanıcı Bulunamıyor" });
    }

    await Games.findOneAndUpdate(
      { userId: user._id },
      {
        $inc: { "chapter.section": 1 },
      },
      { new: true }
    );

    return res.json({
      message: "Section Güncellendi.",
      status: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export default handler;
