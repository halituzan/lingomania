import mongoose from "mongoose";
const Schema = mongoose.Schema;
const str = mongoose.Schema.Types.String;
const englishSchema = new Schema({
  word: String,
  def: String,
});

const English =
  mongoose.models?.English || mongoose.model("English", englishSchema);

export default English;
