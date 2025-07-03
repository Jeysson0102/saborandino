import React, { useEffect, useState } from 'react';

export const Servicios = () => {
  const [platos, setPlatos] = useState([]);

  useEffect(() => {
    const data = localStorage.getItem('saborandino_carta');
    if (data) {
      setPlatos(JSON.parse(data));
    }
  }, []);

  return (
    <section className="container pt-5 mt-5 py-5">
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold text-warning">Nuestra Carta</h1>
        <p className="lead text-secondary fst-italic">
          Descubre el sabor de la tradición andina con un toque gourmet.
        </p>
      </div>

      <div className="row g-4">
        {platos.map((plato, index) => (
          <div key={index} className="col-sm-6 col-md-4">
            <article className="card h-100 shadow-lg border-0 rounded-4 overflow-hidden">
              {plato.imagen && (
                <img
                  src={plato.imagen}
                  alt={plato.nombre}
                  className="card-img-top"
                  style={{ objectFit: 'cover', height: '220px' }}
                />
              )}
              <div className="card-body text-center">
                <h5 className="card-title text-warning fw-bold">{plato.nombre}</h5>
                <p className="card-text text-muted">{plato.descripcion}</p>
                {/* Aquí convertimos plato.precio a número antes de usar toFixed */}
                <p className="fw-bold text-success">
                  S/ {Number(plato.precio).toFixed(2)}
                </p>
              </div>
            </article>
          </div>
        ))}
      </div>
    </section>
  );
};
