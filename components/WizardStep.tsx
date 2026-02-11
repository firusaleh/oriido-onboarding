interface WizardStepProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export default function WizardStep({ title, description, children }: WizardStepProps) {
  return (
    <div className="bg-surface border border-border rounded-xl p-6 md:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary mb-2">{title}</h2>
        <p className="text-secondary">{description}</p>
      </div>
      <div>{children}</div>
    </div>
  );
}