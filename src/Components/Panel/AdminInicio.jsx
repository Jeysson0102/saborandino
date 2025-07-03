// src/Components/Panel/AdminInicio.jsx
import React, { useEffect, useState } from 'react';
import { FaUtensils, FaConciergeBell, FaTable } from 'react-icons/fa';

const MESAS_KEY = 'saborandino_mesas';
const RESERVAS_KEY = 'saborandino_reservas';
const CARTA_KEY = 'saborandino_carta';

const AdminInicio = () => {
  const [mesas, setMesas] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [platos, setPlatos] = useState([]);

  useEffect(() => {
    setMesas(JSON.parse(localStorage.getItem(MESAS_KEY) || '[]'));
    setReservas(JSON.parse(localStorage.getItem(RESERVAS_KEY) || '[]'));
    setPlatos(JSON.parse(localStorage.getItem(CARTA_KEY) || '[]'));
  }, []);

  const totMesas = mesas.length;
  const libres = mesas.filter(m => m.estado === 'libre').length;
  const ocupadas = totMesas - libres;
  const totReservas = reservas.length;
  const totPlatos = platos.length;

  return (
    <div className="p-4 admin-inicio bg-light rounded shadow-sm">
      <h2 className="mb-4 text-vino fw-bold">📊 Resumen General</h2>

      <div className="row g-4">
        {/* Tarjeta Mesas */}
        <div className="col-md-4">
          <div className="card h-100 border-0 shadow bg-gradient-mesas text-white">
            <div className="card-body d-flex flex-column justify-content-between">
              <div className="d-flex align-items-center">
                <FaTable size={40} className="me-3" />
                <div>
                  <h5 className="card-title mb-0 fw-bold">Mesas</h5>
                  <small>Total: {totMesas}</small>
                </div>
              </div>
              <div className="mt-4">
                <h2 className="display-5">{totMesas}</h2>
                <p className="mb-0">
                  <span className="badge bg-success me-2">Libres: {libres}</span>
                  <span className="badge bg-danger">Ocupadas: {ocupadas}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tarjeta Reservas */}
        <div className="col-md-4">
          <div className="card h-100 border-0 shadow bg-gradient-reservas text-white">
            <div className="card-body d-flex flex-column justify-content-between">
              <div className="d-flex align-items-center">
                <FaConciergeBell size={40} className="me-3" />
                <div>
                  <h5 className="card-title mb-0 fw-bold">Reservas</h5>
                  <small>En total</small>
                </div>
              </div>
              <div className="mt-4">
                <h2 className="display-5">{totReservas}</h2>
                <p className="mb-0 text-white-50">Últimas actualizaciones cargadas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tarjeta Carta */}
        <div className="col-md-4">
          <div className="card h-100 border-0 shadow bg-gradient-carta text-white">
            <div className="card-body d-flex flex-column justify-content-between">
              <div className="d-flex align-items-center">
                <FaUtensils size={40} className="me-3" />
                <div>
                  <h5 className="card-title mb-0 fw-bold">Platos</h5>
                  <small>En la carta</small>
                </div>
              </div>
              <div className="mt-4">
                <h2 className="display-5">{totPlatos}</h2>
                <p className="mb-0 text-white-50">Alta gastronomía disponible</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminInicio;
