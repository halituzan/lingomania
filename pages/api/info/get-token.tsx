import connectDBV2 from "@/PageApi/db/connection";
import User from "@/PageApi/models/userInfoModel";
import { NextApiRequest, NextApiResponse } from "next";

connectDBV2();
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { accessToken } = req.query;
  console.log("accessToken===>>>",accessToken);
  
  try {
    const user = await User.findOne({ tkn: accessToken });
    if (!user) {
      return res.status(200).json({ message: "Token Geçersiz" });
    }
    if (!user.isActive) {
      await User.findOneAndUpdate(
        { _id: user._id },
        {
          isActive: true,
          token: "",
        },
        { new: true }
      );
      res.status(200).json({ message: "Token Geçerli", status: true });
    } else {
      res.status(405).json({ message: "Kullanıcı zaten onaylanmış." });
    }
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};
export default handler;
