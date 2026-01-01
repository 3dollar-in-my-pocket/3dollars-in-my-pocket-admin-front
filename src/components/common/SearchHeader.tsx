const SearchHeader = ({title, description, icon = "bi-search"}) => {
  return (
    <div className="text-center mb-5">
      <div className="d-inline-flex align-items-center gap-3 bg-white rounded-pill px-4 py-3 shadow-lg mb-3"
           style={{backdropFilter: 'blur(10px)', background: 'rgba(255,255,255,0.9)'}}>
        <div className="bg-primary bg-opacity-10 rounded-circle p-2">
          <i className={`bi ${icon} fs-3 text-primary`}></i>
        </div>
        <div>
          <h2 className="mb-0 fw-bold bg-gradient text-primary" style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>{title}</h2>
          <p className="mb-0 text-muted small">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default SearchHeader;
