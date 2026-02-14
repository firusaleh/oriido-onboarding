import mongoose from 'mongoose';

const SignatureSchema = new mongoose.Schema({
  signedBy: {
    name: String,
    email: String,
    role: String,
  },
  signedAt: Date,
  signature: String, // base64 image
  ipAddress: String,
  userAgent: String,
});

const ContractSchema = new mongoose.Schema({
  onboardingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Onboarding',
    required: true,
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ContractTemplate',
    required: true,
  },
  contractNumber: {
    type: String,
    unique: true,
    required: true,
  },
  type: {
    type: String,
    enum: ['partner', 'service', 'datenschutz', 'agb', 'sonstiges'],
    required: true,
  },
  status: {
    type: String,
    enum: ['entwurf', 'versandt', 'teilweise_unterzeichnet', 'vollstaendig_unterzeichnet', 'abgelaufen', 'storniert'],
    default: 'entwurf',
  },
  content: {
    type: String,
    required: true,
  },
  variables: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
  pdfUrl: String,
  signatures: [SignatureSchema],
  requiredSignatures: [{
    role: String,
    name: String,
    email: String,
    signed: {
      type: Boolean,
      default: false,
    },
  }],
  sendInfo: {
    sentAt: Date,
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    emailsSent: [{
      to: String,
      sentAt: Date,
      status: String,
    }],
  },
  validUntil: Date,
  notes: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: Date,
});

// Generate contract number
ContractSchema.pre('save', async function(next) {
  if (!this.contractNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.models.Contract.countDocuments({
      contractNumber: new RegExp(`^${year}-`)
    });
    this.contractNumber = `${year}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

export default mongoose.models.Contract || mongoose.model('Contract', ContractSchema);