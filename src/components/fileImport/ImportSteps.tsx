interface ImportStepsProps {
  labels: string[];
  currentStep: number;
}

const ImportSteps = ({labels, currentStep}: ImportStepsProps) => (
  <div className="row g-2 mb-4 store-import-steps" aria-label="등록 진행 단계">
    {labels.map((label, index) => {
      const step = index + 1;
      const active = currentStep >= step;
      return <div className="col" key={step}><div className={`rounded-3 border p-3 h-100 ${active ? 'border-primary bg-primary-subtle' : 'bg-body-tertiary'}`}>
        <div className="d-flex align-items-center gap-2"><span className={`badge rounded-pill ${active ? 'text-bg-primary' : 'text-bg-secondary'}`}>{step}</span><strong className={active ? 'text-primary-emphasis' : 'text-body-secondary'}>{label}</strong></div>
      </div></div>;
    })}
  </div>
);

export default ImportSteps;
