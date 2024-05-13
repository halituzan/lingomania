import mongoose from "mongoose";
const Schema = mongoose.Schema;
const userSchema = new Schema({
  firstName: {
    type: String,
    required: [true, "Adınızı girmeniz gerekiyor."],
  },
  lastName: {
    type: String,
    required: [true, "Soy adınızı girmeniz gerekiyor."],
  },
  email: {
    type: String,
    required: [true, "Email girmeniz gerekiyor"],
    unique: true,
  },
  userName: {
    type: String,
    required: [true, "Username girmeniz gerekiyor"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Şifre girmeniz gerekiyor"],
  },
  tkn: {
    type: String,
    default: "",
  },
  profileImage: {
    type: String,
    default: "1",
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  badges: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Badge",
    },
  ],
  totalScore: {
    type: Number,
    default: 0,
  },
  level: {
    type: Number,
    default: 1,
  },
});

const User = mongoose.models?.User || mongoose.model("User", userSchema);

export default User;
