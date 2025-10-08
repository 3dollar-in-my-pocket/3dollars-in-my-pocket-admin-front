const ItemCard = ({
  item,
  onClick,
  borderColor = '#6c757d',
  children,
  className = '',
  style = {}
}) => {
  return (
    <div
      className={`card border-0 shadow-lg h-100 position-relative overflow-hidden ${className}`}
      style={{
        cursor: 'pointer',
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        borderRadius: '20px',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        border: `3px solid ${borderColor}20`,
        ...style
      }}
      onClick={() => onClick(item)}
      onMouseEnter={(e: any) => {
        e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
        e.currentTarget.style.boxShadow = `0 20px 40px ${borderColor}30`;
        e.currentTarget.style.border = `3px solid ${borderColor}60`;
      }}
      onMouseLeave={(e: any) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
        e.currentTarget.style.border = `3px solid ${borderColor}20`;
      }}
    >
      {/* 글로우 효과 */}
      <div className="position-absolute top-0 start-0 w-100 h-100" style={{
        background: `linear-gradient(135deg, ${borderColor}10 0%, transparent 50%, ${borderColor}05 100%)`,
        borderRadius: '20px',
        pointerEvents: 'none'
      }}></div>

      <div className="card-body p-3">
        {children}
      </div>
    </div>
  );
};

export default ItemCard;