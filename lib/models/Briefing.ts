import mongoose from 'mongoose';

const briefingSchema = new mongoose.Schema({
  datum: {
    type: Date,
    required: true
  },
  titel: {
    type: String,
    required: true
  },
  inhalt: {
    type: String,
    required: true
  },
  prioritaet: {
    type: String,
    enum: ['normal', 'wichtig', 'dringend'],
    default: 'normal'
  },
  anhang: String,
  erstelltVon: String,
  erstelltAm: {
    type: Date,
    default: Date.now
  },
  gelesenVon: [{
    type: String
  }]
});

export default mongoose.models.Briefing || mongoose.model('Briefing', briefingSchema);