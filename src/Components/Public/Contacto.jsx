import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

export const Contacto = () => {
  return (
    <div className="container pt-5 mt-5 py-5">

      {/* Encabezado */}
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold text-warning">Contáctanos</h1>
        <p className="lead text-muted">
          ¿Tienes alguna consulta, sugerencia o deseas hacer una reserva? En <strong>Sabor Andino</strong> estamos para atenderte con la calidez que nos caracteriza.
        </p>
      </div>

      {/* Formulario */}
      <div className="row justify-content-center mb-5">
        <div className="col-md-8">
          <div className="bg-light p-4 p-md-5 rounded-4 shadow-sm">
            <h4 className="mb-4 text-dark">Formulario de Contacto</h4>
            <form>
              <div className="mb-3">
                <label htmlFor="nya" className="form-label fw-semibold">Nombres y Apellidos</label>
                <input
                  type="text"
                  className="form-control rounded-3"
                  id="nya"
                  placeholder="Ej. Carlos Torres Rojas"
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="email" className="form-label fw-semibold">Correo Electrónico</label>
                <input
                  type="email"
                  className="form-control rounded-3"
                  id="email"
                  placeholder="Ej. cliente@saborandino.com"
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="asunto" className="form-label fw-semibold">Asunto</label>
                <input
                  type="text"
                  className="form-control rounded-3"
                  id="asunto"
                  placeholder="Ej. Reserva para dos personas"
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="mensaje" className="form-label fw-semibold">Mensaje</label>
                <textarea
                  className="form-control rounded-3"
                  id="mensaje"
                  rows="4"
                  placeholder="Cuéntanos en qué podemos ayudarte..."
                  required
                ></textarea>
              </div>
              <button type="submit" className="btn btn-warning px-4 py-2 rounded-pill fw-semibold shadow-sm">
                Enviar mensaje
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Datos y Redes */}
      <div className="row g-5">

        {/* Información de contacto */}
        <div className="col-md-6">
          <h4 className="text-secondary mb-4">Datos de Contacto</h4>
          <ul className="list-unstyled text-muted fs-5">
            <li className="mb-3 d-flex align-items-center">
              <img src="/iconos/house-door.svg" alt="Dirección" width="24" className="me-3" />
              Av. Cordillera 123, Huaraz, Ancash
            </li>
            <li className="mb-3 d-flex align-items-center">
              <img src="/iconos/telephone-forward-fill.svg" alt="Teléfono" width="24" className="me-3" />
              (043) 444 444 | +51 999 999 999
            </li>
            <li className="d-flex align-items-center">
              <img src="/iconos/envelope.svg" alt="Correo" width="24" className="me-3" />
              contacto@saborandino.com
            </li>
          </ul>
        </div>

        {/* Redes sociales */}
        <div className="col-md-6">
          <h4 className="text-secondary mb-4">Síguenos en redes</h4>
          <div className="d-flex flex-wrap gap-3">
            {[
              'facebook',
              'instagram',
              'tiktok',
              'whatsapp',
              'youtube',
              'spotify',
              'twitter'
            ].map((platform) => (
              <a
                href="#"
                key={platform}
                title={platform}
                className="d-inline-block p-2 bg-white border rounded-circle shadow-sm hover-opacity"
              >
                <img
                  src={`/iconos/${platform}.svg`}
                  alt={platform}
                  width="32"
                  height="32"
                />
              </a>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
