import connectDBV2 from "@/PageApi/db/connection";
import Users from "@/PageApi/models/userInfoModel";
import { NextApiRequest, NextApiResponse } from "next";

connectDBV2();
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { accessToken } = req.query;

  try {
    const user = await Users.findOne({ tkn: accessToken });
    if (!user) {
      return res.status(200).json({
        message: "Eposta onay bağlantınızın süresi dolmuş veya geçersiz.",
        status: 2,
      });
    }
    if (!user.isActive) {
      await Users.findOneAndUpdate(
        { _id: user._id },
        {
          isActive: true,
          token: "",
        },
        { new: true }
      );
      res.status(200).json({
        message: "Eposta adresiniz onaylanmıştır. Giriş yapabilirsiniz.",
        status: 1,
      });
    } else {
      res
        .status(200)
        .json({ message: "Bu kullanıcı zaten onaylanmış.", status: 3 });
    }
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};
export default handler;
