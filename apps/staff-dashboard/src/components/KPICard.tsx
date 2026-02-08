import './KPICard.css';

interface KPICardProps {
  title: string;
  value: number;
  color: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, color }) => {
  return (
    <div className="kpi-card" style={{ borderTopColor: color }}>
      <div className="kpi-content">
        <h3 className="kpi-title">{title}</h3>
        <p className="kpi-value" style={{ color }}>
          {value}
        </p>
      </div>
    </div>
  );
};

export default KPICard;
