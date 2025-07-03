import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

export const Footer = () => {
  return (
    <footer className="bg-dark text-white pt-5 pb-3 mt-5 border-top border-secondary">
      <div className="container">
        <div className="row">

          {/* Logo y descripción */}
          <div className="col-md-4 mb-4">
            <h4 className="fw-bold text-warning">Sabor Andino</h4>
            <p className="text-light">
              Conectamos la tradición culinaria de los Andes con una experiencia moderna y acogedora.
              Descubre los sabores que nos conectan con nuestras raíces.
            </p>
          </div>

          {/* Enlaces útiles */}
          <div className="col-md-4 mb-4">
            <h5 className="fw-bold text-warning">Enlaces rápidos</h5>
            <ul className="list-unstyled">
              {[
                { label: 'Inicio', to: '/' },
                { label: 'Nosotros', to: '/nosotros' },
                { label: 'Menú', to: '/servicios' },
                { label: 'Contacto', to: '/contacto' },
              ].map((link, i) => (
                <li key={i} className="mb-2">
                  <Link to={link.to} className="text-light text-decoration-none link-hover">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Redes sociales */}
          <div className="col-md-4 mb-4">
            <h5 className="fw-bold text-warning">Síguenos</h5>
            <div className="d-flex flex-wrap gap-3 mt-3">
              {[
                { href: '#', icon: 'facebook.svg', alt: 'Facebook' },
                { href: '#', icon: 'instagram.svg', alt: 'Instagram' },
                { href: '#', icon: 'tiktok.svg', alt: 'TikTok' },
                { href: '#', icon: 'whatsapp.svg', alt: 'WhatsApp' },
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  title={social.alt}
                  className="bg-light rounded-circle d-flex align-items-center justify-content-center p-2 shadow-sm"
                  style={{ width: 40, height: 40, transition: 'all 0.3s' }}
                >
                  <img
                    src={`/iconos/${social.icon}`}
                    alt={social.alt}
                    width="24"
                    height="24"
                    style={{ filter: 'invert(20%)' }}
                  />
                </a>
              ))}
            </div>
          </div>

        </div>

        {/* Línea inferior */}
        <div className="text-center border-top border-secondary pt-3 mt-4">
          <small className="text-muted">
            © {new Date().getFullYear()} <strong>Sabor Andino</strong> | Todos los derechos reservados
          </small>
        </div>
      </div>
    </footer>
  );
};
