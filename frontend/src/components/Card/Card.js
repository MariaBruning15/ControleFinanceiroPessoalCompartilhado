import './Card.css';

function CardComponent({ subtitle, children }) {
  return (
    <div className="card-container">
      <div className="card">
      <h1 className="card-title fs-1 fw-bolder mb-3">Mercúrio</h1>        <h3 className="card-subtitle fs-3 fw-medium mb-4">{subtitle}</h3>        
        <div className="card-content">
          {children}
        </div>
      </div>
    </div>
  );
}

export default CardComponent;