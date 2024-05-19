import connectDBV2 from "@/PageApi/db/connection";
import { errorHandle } from "@/PageApi/db/errorHandler/error";
import Users from "@/PageApi/models/userInfoModel";
import { NextApiRequest, NextApiResponse } from "next";

connectDBV2();
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const token = req.cookies.token || req.headers.token || "";
  console.log(req.headers.token);

  const userId = errorHandle(token, res, req, "GET");
  try {
    const user = await Users.findOne({ _id: userId });
    if (!user) {
      return res
        .status(404)
        .json({ message: "Böyle Bir Kullanıcı Bulunamıyor" });
    }
    if (!user.isActive) {
      return res.status(406).json({ message: "Lütfen Hesabınızı Onaylayın." });
    }

    const {
      firstName,
      lastName,
      phone,
      email,
      profileImage,
      _id,
      userName,
      badges,
      totalScore,
      level,
      isActive,
    } = user;
    return res.status(200).json({
      data: {
        firstName,
        lastName,
        phone,
        email,
        profileImage,
        userName,
        badges,
        id: _id,
        totalScore,
        level,
        isActive,
      },
      status: true,
    });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};
export default handler;
