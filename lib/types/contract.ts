export interface ContractTemplate {
  _id?: string;
  name: string;
  description: string;
  category: 'partner' | 'service' | 'datenschutz' | 'agb' | 'sonstiges';
  content: string;
  variables: {
    key: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'select' | 'boolean';
    required?: boolean;
    defaultValue?: string;
    options?: string[];
  }[];
  active: boolean;
  version: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Contract {
  _id?: string;
  onboardingId: string;
  templateId: string;
  contractNumber: string;
  type: 'partner' | 'service' | 'datenschutz' | 'agb' | 'sonstiges';
  status: 'entwurf' | 'versandt' | 'teilweise_unterzeichnet' | 'vollstaendig_unterzeichnet' | 'abgelaufen' | 'storniert';
  content: string;
  variables?: Map<string, any>;
  pdfUrl?: string;
  signatures?: {
    signedBy: {
      name: string;
      email: string;
      role: string;
    };
    signedAt: Date;
    signature: string;
    ipAddress?: string;
    userAgent?: string;
  }[];
  requiredSignatures: {
    role: string;
    name: string;
    email: string;
    signed: boolean;
  }[];
  sendInfo?: {
    sentAt: Date;
    sentBy: string;
    emailsSent: {
      to: string;
      sentAt: Date;
      status: string;
    }[];
  };
  validUntil?: Date;
  notes?: string;
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
  completedAt?: Date;
}