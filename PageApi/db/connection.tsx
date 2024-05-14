import mongoose from "mongoose";

const connectDBV2 = async () => {
  try {
    await mongoose.connect(process.env.NEXT_PUBLIC_MONGODB_URI || "");
    console.log("MongoDB Version 2 connected");
  } catch (error) {
    console.error(error);
  }
};

export default connectDBV2;
