import mongoose from "mongoose";
const Schema = mongoose.Schema;
const englishSchema = new Schema({
  word: String,
  def: String,
  pos: String,
});

const Englishes =
  mongoose.models?.Englishes || mongoose.model("Englishes", englishSchema);

export default Englishes;
