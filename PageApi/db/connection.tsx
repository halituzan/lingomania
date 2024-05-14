import mongoose from "mongoose";

const connectDBV2 = async () => {
  if (!process.env.NEXT_PUBLIC_MONGODB_URI) {
    throw new Error(
      "Environment variable NEXT_PUBLIC_MONGODB_URI is not defined."
    );
  }
  try {
    await mongoose.connect(process.env.NEXT_PUBLIC_MONGODB_URI);
    console.log("MongoDB Version 2 connected");
  } catch (error) {
    console.error(error);
  }
};

export default connectDBV2;
