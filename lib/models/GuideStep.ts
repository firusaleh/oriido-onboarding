import mongoose from 'mongoose';

const guideStepSchema = new mongoose.Schema({
  schritt: {
    type: Number,
    required: true,
    unique: true
  },
  phase: {
    type: String,
    required: true,
    enum: ['einstieg', 'bedarfsanalyse', 'praesentation', 'einwaende', 'abschluss', 'nachbereitung']
  },
  titel: {
    type: String,
    required: true
  },
  dauer: String,
  beschreibung: String,
  sprechtext: String,
  tipps: [String],
  donts: [String],
  toolVerweis: String,
  toolVerweisText: String,
  aktiv: {
    type: Boolean,
    default: true
  },
  erstelltAm: {
    type: Date,
    default: Date.now
  },
  aktualisiertAm: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.GuideStep || mongoose.model('GuideStep', guideStepSchema);