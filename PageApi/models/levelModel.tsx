import mongoose from "mongoose";
const Schema = mongoose.Schema;

const WordSet = {
  step: Number,
  wordList: Array,
  reverseList: Array,
};

const levelSchema = new Schema({
  chepter: Number,
  levelStart: Number,
  levelEnd: Number,
  wordSet: {
    type: WordSet,
    default: { step: 1, wordList: [], reverseList: [] },
  },
});

const Levels = mongoose.models?.Levels || mongoose.model("Levels", levelSchema);

export default Levels;
