import connectDBV2 from "@/PageApi/db/connection";
import Users from "@/PageApi/models/userInfoModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";

connectDBV2();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { email, password } = req.body;
  const { device } = req.query;

  try {
    // Check if user exists
    const user = await Users.findOne({
      $or: [{ email: email }, { userName: email }],
    });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Email veya Şifreniz Yanlış", status: false });
    }

    // Check if password is correct
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Email veya Şifreniz Yanlış", status: false });
    }
    // Check if verify is correct
    if (!user.isActive) {
      return res.status(400).json({
        message: "Eposta Adresiniz Onaylanmamıştır.",
        status: false,
      });
    } else {
      // Create JWT token
      if (!process.env.NEXT_PUBLIC_JWT_SECRET) {
        return;
      }
      const token = jwt.sign(
        { userId: user._id },
        process.env.NEXT_PUBLIC_JWT_SECRET
      );

      if (device === "web") {
        // Set cookie
        res.setHeader(
          "Set-Cookie",
          `token=${token}; HttpOnly; Max-Age=${
            30 * 24 * 60 * 60
          }; SameSite=Lax; Path=/`
        );
      }

      if (device === "mobile") {
        return res.json({
          message: "Giriş Başarılı",
          status: true,
          token: token,
        });
      }
      res.json({
        message: "Giriş Başarılı",
        status: true,
      });
    }
  } catch (error) {
    console.error(error);
    res.json({ message: "OPPSS! Bir şeyler yanlış gitti.", status: false });
  }
};
export default handler;
