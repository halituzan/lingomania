import mongoose from "mongoose";
const Schema = mongoose.Schema;

const levelSchema = new Schema({
  level: Number,
  word: String,
});

const AllLevels =
  mongoose.models?.AllLevels || mongoose.model("AllLevels", levelSchema);

export default AllLevels;
