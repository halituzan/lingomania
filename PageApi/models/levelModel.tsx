import mongoose from "mongoose";
const Schema = mongoose.Schema;

const levelSchema = new Schema({
  chepter: Number,
  wordSet: Array,
});

const Levels = mongoose.models?.Levels || mongoose.model("Levels", levelSchema);

export default Levels;
