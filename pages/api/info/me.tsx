import connectDBV2 from "@/PageApi/db/connection";
import User from "@/PageApi/models/userInfoModel";
import { JwtPayload, verify } from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";

connectDBV2();
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const token = req.cookies.token;

  // TODO: Yetki Kontrolü: token yoksa servise erişilemez
  if (!token) {
    return res.status(401).json({ message: "Giriş yetkiniz bulunmamaktadır!" });
  }
  if (!process.env.NEXT_PUBLIC_JWT_SECRET) {
    return;
  }
  const { userId } = verify(
    token,
    process.env.NEXT_PUBLIC_JWT_SECRET
  ) as JwtPayload;
  // TODO: Kullanıcı Kontrolü: userId dönmezse token geçersiz.
  if (!userId) {
    return res
      .status(401)
      .json({ message: "Oturum süresi dolmuş. Lütfen tekrar giriş yapın." });
  }
  // TODO: Method Kontrolü: GET methodu dışındaki istekleri engeller.
  if (req.method !== "GET") {
    return res.status(425).json({ message: "Method Yanlış" });
  }

  try {
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.json({ message: "Böyle Bir Kullanıcı Bulunamıyor" });
    }
    const { firstName, lastName, phone, email, profileImage, _id } = user;
    return res.status(200).json({
      data: {
        firstName,
        lastName,
        phone,
        email,
        profileImage,
        id: _id,
      },
      status: true,
    });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};
export default handler;
