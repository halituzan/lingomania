import connectDBV2 from "@/PageApi/db/connection";
import User from "@/PageApi/models/userInfoModel";
import { NextApiRequest, NextApiResponse } from "next";

connectDBV2();
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { userName } = req.query;

  try {
    const user = await User.findOne({ userName: userName });

    if (!user) {
      res
        .status(200)
        .json({ message: "Kullanıcı Adı Mevcut Değil", status: true });
    } else {
      res.status(200).json({ message: "Kullanıcı Adı Mevcut ", status: false });
    }
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};
export default handler;
