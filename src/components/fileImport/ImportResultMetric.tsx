interface ImportResultMetricProps {
  label: string;
  value: number;
  icon: string;
  color: string;
  colClassName?: string;
}

const ImportResultMetric = ({label, value, icon, color, colClassName = 'col-12 col-sm-4'}: ImportResultMetricProps) => (
  <div className={colClassName}><div className={`rounded-3 border bg-${color}-subtle p-3 h-100`}><div className="d-flex align-items-center justify-content-between"><span className={`text-${color}-emphasis`}><i className={`bi ${icon} me-2`}/>{label}</span><strong className="fs-4">{value.toLocaleString()}</strong></div></div></div>
);

export default ImportResultMetric;
