import mongoose from "mongoose";
const Schema = mongoose.Schema;
const gameSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  gameLevel: {
    type: Number,
    default: 3, // 3,4,5,6 harfli oyunlar olabilir
  },
  correctWordPool: {
    type: [
      {
        word: String,
        date: Date,
        step: Number,
        
        wordPoint: Number,
        letterPoint: Number,
        time: Number,
        allWord: Array,
      },
    ],
    default: [],
  },
  wrongWordPool: {
    type: [
      {
        word: String,
        date: Date,
        time: Number,
        allWord: Array,
      },
    ],
    default: [],
  },
  currentWord: {
    type: String,
    default: "",
  },
  rowMeans: {
    type: Array,
    default: [],
  },
  lastGame: {
    // oyunda nerede kaldığını gösterir.
    // Değişkendir o anki oyun bittiğinde sıfırlanması lazım.
    // Her bir step o anki stepte hangi kelime olduğunu gösterir.
    type: {
      step1: {
        word: String,
        status: Boolean,
        solves: Array,
      },
      step2: {
        word: String,
        status: Boolean,
        solves: Array,
      },
      step3: {
        word: String,
        status: Boolean,
        solves: Array,
      },
      step4: {
        word: String,
        status: Boolean,
        solves: Array,
      },
      step5: {
        word: String,
        status: Boolean,
        solves: Array,
      },
      step6: {
        word: String,
        status: Boolean,
        solves: Array,
      },
    },
    default: {
      step1: {
        word: "",
        status: true,
        means: [],
      },
      step2: {
        word: "",
        status: false,
        means: [],
      },
      step3: {
        word: "",
        status: false,
        means: [],
      },
      step4: {
        word: "",
        status: false,
        means: [],
      },
      step5: {
        word: "",
        status: false,
        means: [],
      },
      step6: {
        word: "",
        status: false,
        means: [],
      },
    },
  },
  jokers: {
    type: {
      letterCount: {
        // Joker: harf almasını sağlar
        type: Number,
        default: 0,
      },
      wordCount: {
        // joker: kelime seçmesini sağlar
        type: Number,
        default: 0,
      },
      changeCount: {
        // joker: harf değiştirme hakkı sağlar
        type: Number,
        default: 0,
      },
    },
    default: {
      letterCount: 0,
      wordCount: 0,
      changeCount: 0,
    },
  },
});

const Games = mongoose.models?.Games || mongoose.model("Games", gameSchema);

export default Games;
