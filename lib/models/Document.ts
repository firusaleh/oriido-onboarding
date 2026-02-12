import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  titel: { 
    type: String, 
    required: true 
  },
  beschreibung: String,
  kategorie: {
    type: String,
    required: true,
    enum: ['vor_gespraech', 'im_gespraech', 'nach_zusage', 'intern']
  },
  dateiUrl: {
    type: String,
    required: true
  },
  dateiName: String,
  dateiGroesse: Number,
  dateiTyp: {
    type: String,
    enum: ['pdf', 'pptx', 'docx', 'xlsx', 'jpg', 'png', 'mp4']
  },
  tags: [String],
  version: {
    type: Number,
    default: 1
  },
  hochgeladenAm: {
    type: Date,
    default: Date.now
  },
  aktualisiertAm: {
    type: Date,
    default: Date.now
  },
  hochgeladenVon: String,
  gepinnt: {
    type: Boolean,
    default: false
  },
  sortierung: {
    type: Number,
    default: 0
  }
});

export default mongoose.models.Document || mongoose.model('Document', documentSchema);