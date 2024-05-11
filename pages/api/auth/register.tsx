import connectDBV2 from "@/PageApi/db/connection";
import Game from "@/PageApi/models/userGameModel";
import User from "@/PageApi/models/userInfoModel";
import bcrypt from "bcryptjs";
import { NextApiRequest, NextApiResponse } from "next";

connectDBV2();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { firstName, lastName, email, password, userName } = req.body;
  console.log("req.body", req.body);

  if (!firstName || !lastName || !email || !password || !userName) {
    res.json({
      message: "Lütfen gerekli alanları doldurun!",
      status: false,
    });
  }

  try {
    // Check if user already exists

    const user = await User.findOne({
      $or: [{ email: email }],
    });
    console.log("user", user);

    if (user?.email === email) {
      res.json({
        message: "Bu Email İle Kullanıcı Mevcut",
        status: false,
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log(1);

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      userName,
    });
    await newUser
      .save()
      .then((user: { _id: string }) => {
        const newGame = new Game({
          userId: user._id,
        });
        return newGame.save();
      })
      .then((game: { _id: string }) => {
        return Game.findById(game._id).populate("userId");
      })
      .catch((error: any) => {
        console.error("Hata:", error);
      });
    console.log(2);
    res
      .status(201)
      .json({ message: "Kullanıcı Başarıyla Oluşturuldu", status: true });
  } catch (error) {
    const dbError = error as any;
    if (dbError.code === 11000) {
      return res
        .status(400)
        .json({ message: "Bu e-posta adresi zaten kayıtlıdır" });
    } else {
      return res.status(500).json({
        message: "Veritabanı Bağlantısı Hatası Lütfen Bizimle İletişime Geçin",
      });
    }
  }
};

export default handler;
