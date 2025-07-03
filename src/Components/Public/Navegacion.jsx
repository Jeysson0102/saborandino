import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

export const Navegacion = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Inicio', path: '/' },
    { name: 'Nosotros', path: '/nosotros' },
    { name: 'Nuestra Carta', path: '/servicios' },
    { name: 'Contacto', path: '/contacto' },
  ];

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm fixed-top">
      <div className="container">
        <Link className="navbar-brand fw-bold text-uppercase text-warning" to="/">
          Sabor Andino
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {navItems.map((item) => (
              <li className="nav-item" key={item.path}>
                <Link
                  className={`nav-link fw-semibold px-3 ${
                    location.pathname === item.path ? 'text-warning border-bottom border-3 border-warning' : 'text-dark'
                  }`}
                  to={item.path}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            to="/reserva"
            className="btn btn-secondary px-4 py-2 rounded-pill shadow-sm fw-semibold"
          >
            Reserva
            
          </Link>
          <Link
            to="/login"
            className="btn btn-secondary px-4 py-2 rounded-pill shadow-sm fw-semibold ms-2"
          >
            Login

          </Link>
        </div>
      </div>
    </nav>
  );
};
