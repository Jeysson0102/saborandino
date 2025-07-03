import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

export const Nosotros = () => {
  return (
    <section className="container pt-5 mt-5 py-5">

      {/* Título principal */}
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold text-warning">Sobre Nosotros</h1>
        <p className="lead text-secondary fst-italic">
          En <strong className="text-dark">Sabor Andino</strong> celebramos la riqueza culinaria de los Andes peruanos. Combinamos tradición, sabor y hospitalidad para brindarte una experiencia única e inolvidable.
        </p>
      </div>

      {/* Historia */}
      <div className="row align-items-center mb-5 g-4">
        <div className="col-md-6">
          <img
            src="img/nosotros.jpg"
            alt="Sabor Andino - Nuestra Historia"
            className="img-fluid rounded-4 shadow-lg"
          />
        </div>
        <div className="col-md-6">
          <p className="fs-5 text-muted">
            Fundado con pasión por la cocina ancestral, <strong className="text-warning">Sabor Andino</strong> es más que un restaurante: es un homenaje a nuestras raíces. Usamos ingredientes autóctonos y técnicas tradicionales para revivir los sabores auténticos del Perú profundo. Desde un desayuno típico hasta un banquete festivo, buscamos que cada plato cuente una historia y despierte tus sentidos.
          </p>
        </div>
      </div>

      {/* Objetivo, Misión, Visión */}
      <div className="row g-4">
        {[
          {
            img: 'objetivo.jpg',
            title: 'Objetivo',
            text: 'Promover la identidad gastronómica andina a través de una experiencia culinaria auténtica, cálida y sostenible.',
          },
          {
            img: 'mision.jpg',
            title: 'Misión',
            text: 'Brindar a nuestros comensales una vivencia única de los sabores del Perú profundo, con ingredientes frescos y atención cálida.',
          },
          {
            img: 'vision.jpg',
            title: 'Visión',
            text: 'Ser reconocidos como embajadores de la cocina andina a nivel nacional e internacional, manteniendo viva nuestra esencia.',
          },
        ].map((card, i) => (
          <div className="col-md-4" key={i}>
            <div className="card h-100 border-0 shadow-lg rounded-4">
              <img src={`img/${card.img}`} className="card-img-top rounded-top-4" alt={card.title} />
              <div className="card-body">
                <h5 className="card-title text-center fw-bold text-warning">{card.title}</h5>
                <p className="card-text text-muted text-center">{card.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
};
