import './Card.css';

/**
 * Card reutilizável do sistema.
 *
 * Variantes (prop "variant"):
 *  - "auth" (padrão): cartão central das telas de login, cadastro e senha.
 *                     Usa "subtitle" e mostra a marca "Mercúrio" no topo.
 *  - "painel":        cartão das telas internas (Dashboard etc.).
 *                     "title" é opcional; "className" permite ajustar (ex.: h-100).
 */
function CardComponent({ variant = 'auth', subtitle, title, className = '', children }) {
  if (variant === 'painel') {
    return (
      <div className={`card card-painel text-white p-3 ${className}`}>
        {title && <h5 className="mb-3">{title}</h5>}
        {children}
      </div>
    );
  }

  return (
    <div className="card-container">
      <div className="card">
        <h1 className="card-title fs-1 fw-bolder mb-3">Mercúrio</h1>
        <h3 className="card-subtitle fs-3 fw-medium mb-4">{subtitle}</h3>
        <div className="card-content">
          {children}
        </div>
      </div>
    </div>
  );
}

export default CardComponent;
