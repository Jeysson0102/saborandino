import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

export const Inicio = () => {
  return (
    <div>

      {/* Hero */}
      <div
        className="text-white text-center d-flex align-items-center justify-content-center"
        style={{
          backgroundImage: "url('/img/portada-restaurante.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "85vh",
          flexDirection: "column",
          backgroundRepeat: "no-repeat",
        }}
      >
        <h1 className="display-3 fw-bold bg-dark bg-opacity-75 px-4 py-3 rounded-4 shadow">
          Bienvenido a <span className="text-warning">Sabor Andino</span>
        </h1>
        <p className="lead bg-dark bg-opacity-50 px-4 py-2 rounded-3 shadow-sm fst-italic">
          Tradición, cultura y sabor en cada plato
        </p>
        <Link to="/servicios" className="btn btn-warning btn-lg mt-4 px-4 rounded-pill shadow-sm fw-semibold">
          Ver nuestros platos
        </Link>
      </div>

      {/* Nosotros */}
      <section className="container my-5 py-4">
        <div className="row align-items-center">
          <div className="col-md-6 mb-4 mb-md-0">
            <img
              src="/img/chef-cocina.jpg"
              alt="Chef Sabor Andino"
              className="img-fluid rounded-4 shadow-lg"
            />
          </div>
          <div className="col-md-6">
            <h2 className="fw-bold mb-3 text-dark">Sabores que conectan con tus raíces</h2>
            <p className="text-muted fs-5">
              En <strong className="text-warning">Sabor Andino</strong> fusionamos lo ancestral con lo moderno.
              Disfruta de platos preparados con ingredientes de los Andes y técnicas que honran la cocina peruana.
            </p>
            <Link to="/nosotros" className="btn btn-outline-warning mt-3 px-4 rounded-pill fw-semibold">
              Conócenos más
            </Link>
          </div>
        </div>
      </section>

      {/* Platos recomendados */}
      <section className="bg-light py-5">
        <div className="container">
          <h3 className="text-center mb-5 fw-bold text-dark">Platos Recomendados</h3>
          <div className="row g-4">
            {[
              { img: 'ceviche.jpg', title: 'Ceviche Andino', desc: 'Frescura marina con sabor serrano.' },
              { img: 'pachamanca.jpg', title: 'Pachamanca', desc: 'Cocinada bajo tierra, como dicta la tradición.' },
              { img: 'trucha.jpg', title: 'Trucha Frita', desc: 'Crocante y acompañada con quinua.' },
            ].map((plato, i) => (
              <div className="col-md-4" key={i}>
                <div className="card h-100 border-0 shadow-lg rounded-4 hover-shadow">
                  <img
                    src={`/img/${plato.img}`}
                    className="card-img-top rounded-top-4"
                    alt={plato.title}
                  />
                  <div className="card-body">
                    <h5 className="card-title fw-semibold text-warning">{plato.title}</h5>
                    <p className="card-text text-muted">{plato.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-warning text-white text-center py-5">
        <div className="container">
          <h4 className="mb-3 fw-bold display-6">¡Reserva tu mesa hoy!</h4>
          <p className="lead">No te quedes sin probar lo mejor de la gastronomía andina.</p>
          <Link to="/reserva" className="btn btn-light px-5 py-2 rounded-pill fw-semibold shadow">
            Reservar ahora
          </Link>
        </div>
      </section>

    </div>
  );
};
