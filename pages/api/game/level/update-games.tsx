import connectDBV2 from "@/PageApi/db/connection";
import { errorHandle } from "@/PageApi/db/errorHandler/error";
import Games from "@/PageApi/models/userGameModel";
import Users from "@/PageApi/models/userInfoModel";
import { NextApiRequest, NextApiResponse } from "next";

connectDBV2();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const token = req.cookies.token || req.headers.token;
  const { data, status, level } = req.body;
  console.log("data", data);
  console.log("status", status);
  console.log("level", level);
  // Error Methods
  const userId = errorHandle(token || "", res, req, "POST");
  try {
    const user = await Users.findOne({ _id: userId });
    if (!user) {
      return res.json({ message: "Böyle Bir Kullanıcı Bulunamıyor" });
    }

    const queryArray: any = {};
    const queryStatus: any = {};

    queryArray[`winGames.${level - 1}.gameRow`] = data;
    queryArray[`winGames.${level - 1}.status`] = status;
    await Games.findOneAndUpdate(
      { userId: user._id },
      { $push: queryArray },
      { new: true }
    );

    // if (status !== null && status !== undefined) {
    //   queryStatus[`winGames.${level - 1}.status`] = status;
    //   await Games.findOneAndUpdate(
    //     { userId: user._id },
    //     { $set: queryStatus },
    //     { new: true }
    //   );
    // }
    //* Push İşlemi
    // await Users.findByIdAndUpdate(
    //     { _id: userId },
    //     {
    //       $push: { "winGames.0.gameRow": newItem }  // newItem burada eklenecek yeni öğe olacak
    //     },
    //     { new: true }
    //   );

    return res.json({
      message: "Section Güncellendi.",
      status: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export default handler;
