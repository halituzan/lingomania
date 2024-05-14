import connectDBV2 from "@/PageApi/db/connection";
import Users from "@/PageApi/models/userInfoModel";
import { NextApiRequest, NextApiResponse } from "next";

connectDBV2();
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { userName } = req.query;

  try {
    const user = await Users.findOne({ userName: userName });
    console.log(user);
    if (!user) {
      res.json({ message: "Kullanıcı Adı Mevcut Değil", status: true });
      return;
    }
    res.json({ message: "Kullanıcı Adı Mevcut ", status: false });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};
export default handler;
