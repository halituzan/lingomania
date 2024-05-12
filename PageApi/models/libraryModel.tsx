import mongoose from "mongoose";
const Schema = mongoose.Schema;
const str = mongoose.Schema.Types.String;
const librarySchema = new Schema({
  _id: {
    type: Number,
  },
  madde_id: {
    type: str,
  },
  kelime_no: {
    type: str,
  },
  madde: {
    type: str,
  },
  anlam_say: {
    type: str,
  },
  cesit_say: {
    type: str,
  },
  lisan_kodu: {
    type: str,
  },
  lisan: {
    type: str,
  },
  telaffuz: {
    type: str,
  },
  birlesikler: {
    type: str,
  },
  madde_duz: {
    type: str,
  },
  anlamlarListe: {
    type: mongoose.Schema.Types.Array,
  },
});

const Libraries =
  mongoose.models?.Libraries || mongoose.model("Libraries", librarySchema);

export default Libraries;
