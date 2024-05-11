import mongoose from "mongoose";
const Schema = mongoose.Schema;

const badgeSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  criteria: {
    type: {
      minCorrectWordCount: {
        type: Number,
        default: 0,
      },
      minLevel: {
        type: Number,
        default: 1,
      },
    },
    required: true,
  },
});

const Badge = mongoose.models?.Badge || mongoose.model("Badge", badgeSchema);

export default Badge;
