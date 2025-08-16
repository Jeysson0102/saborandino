import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { generateTimeSlots } from '../../utils/availability';
import { FaChair, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const MESAS_KEY    = 'saborandino_mesas';
const RESERVAS_KEY = 'saborandino_reservas';
const SETTINGS_KEY = 'saborandino_settings';

export const Reserva = () => {
  const [mesas, setMesas]         = useState([]);
  const [reservas, setReservas]   = useState([]);
  const [settings, setSettings]   = useState({
    apertura:'10:00', cierre:'22:00', duracion:60, limpieza:15,
    openDays:[1,2,3,4,5,6,0], holidays:[]
  });

  const [form, setForm] = useState({
    cliente:'', email:'', telefono:'',
    fecha:'', hora:'', mesaId:'', invitados:1, mensaje:'', status:'Pendiente'
  });

  useEffect(() => {
    try {
      const rawMesas = localStorage.getItem(MESAS_KEY) || '[]';
      const rawReservas = localStorage.getItem(RESERVAS_KEY) || '[]';
      const rawSettings = localStorage.getItem(SETTINGS_KEY);

      setMesas(JSON.parse(rawMesas));
      setReservas(JSON.parse(rawReservas));

      if (rawSettings) {
        const parsed = JSON.parse(rawSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      console.error('[Reserva] Error parseando localStorage en carga inicial:', e);
    }
  }, []);

  useEffect(() => {
    const handler = e => {
      try {
        if (e.key === MESAS_KEY) setMesas(JSON.parse(e.newValue || '[]'));
        if (e.key === RESERVAS_KEY) setReservas(JSON.parse(e.newValue || '[]'));
        if (e.key === SETTINGS_KEY) {
          const parsed = e.newValue ? JSON.parse(e.newValue) : null;
          if (parsed) setSettings(prev => ({ ...prev, ...parsed }));
        }
      } catch (err) {
        console.warn('[Reserva] Error en storage handler:', err);
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const handleChange = e => {
    const { id, value } = e.target;

    if (id === 'fecha' && value) {
      const day = new Date(value).getDay();
      const openDays = Array.isArray(settings.openDays) ? settings.openDays : [];
      const holidays = Array.isArray(settings.holidays) ? settings.holidays : [];

      if (!openDays.includes(day) || holidays.includes(value)) {
        alert('Lo sentimos, el restaurante está cerrado ese día.');
        return setForm(f => ({ ...f, fecha:'', hora:'', mesaId:'' }));
      }
      return setForm(f => ({ ...f, fecha:value, hora:'', mesaId:'', invitados:1 }));
    }

    if (id === 'invitados') {
      const valNum = Number(value) || 1;
      const capMax = mesas.find(m => m.id === form.mesaId)?.capacidad || 1;
      const bounded = Math.min(Math.max(valNum, 1), capMax);
      return setForm(f => ({ ...f, invitados: bounded }));
    }

    setForm(f => ({ ...f, [id]: value }));
  };

  const handleMesaClick = mesaId => {
    if (!form.fecha || !form.hora) {
      alert('Selecciona primero fecha y hora.');
      return;
    }
    if (reservas.find(r => r.mesaId===mesaId && r.fecha===form.fecha && r.hora===form.hora)) {
      alert('Esa mesa YA está ocupada en ese horario.');
      return;
    }
    setForm(f => ({ ...f, mesaId, invitados:1 }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    const { cliente, fecha, hora, mesaId } = form;
    if (!cliente||!fecha||!hora||!mesaId) {
      return alert('Completa todos los campos obligatorios.');
    }
    const nueva = { ...form, id:Date.now().toString() };
    const updated = [...reservas, nueva];
    localStorage.setItem(RESERVAS_KEY, JSON.stringify(updated));
    setReservas(updated);
    const mesaNumero = (mesas.find(m=>m.id===mesaId) || {}).numero;
    alert(`¡Reserva confirmada para Mesa ${mesaNumero || mesaId} a las ${hora}!`);
    setForm({
      cliente:'', email:'', telefono:'',
      fecha:'', hora:'', mesaId:'', invitados:1, mensaje:'', status:'Pendiente'
    });
  };

  const apertura = typeof settings.apertura === 'string' ? settings.apertura : '10:00';
  const cierre   = typeof settings.cierre === 'string' ? settings.cierre : '22:00';
  const duracion = 30;


  const timeOptions = form.fecha
    ? generateTimeSlots(apertura, cierre, duracion)
    : [];

  const mesasEstado = mesas.map(m => {
    const ocupada = form.fecha && form.hora
      ? reservas.some(r =>
          r.mesaId===m.id && r.fecha===form.fecha && r.hora===form.hora
        )
      : false;
    const seleccionada = m.id===form.mesaId;
    return { ...m, ocupada, seleccionada };
  });

  const capMax = mesas.find(m=>m.id===form.mesaId)?.capacidad || 1;

  return (
    <div className="container pt-5 mt-5 py-5">
      <h1 className="text-center text-warning mb-4">Reserva tu mesa</h1>

      <form className="row g-4 mb-4">
        <div className="col-md-6">
          <label htmlFor="fecha" className="form-label">Fecha</label>
          <input type="date" id="fecha" className="form-control"
                 value={form.fecha} onChange={handleChange} required />
        </div>
        <div className="col-md-6">
          <label htmlFor="hora" className="form-label">Hora</label>
          <select id="hora" className="form-select"
                  value={form.hora} onChange={handleChange} required>
            <option value="">-- Elige hora --</option>
            {timeOptions.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          {!form.fecha && (
            <div className="form-text">Selecciona fecha para ver horas</div>
          )}
        </div>
      </form>

      {/* Mesas SIEMPRE visibles con mejor diseño */}
      <div className="d-flex flex-wrap gap-4 justify-content-center mb-5">
        {mesasEstado.map(m => (
          <div
            key={m.id}
            onClick={() => !m.ocupada && handleMesaClick(m.id)}
            style={{
              width: 120,
              padding: '20px',
              borderRadius: '15px',
              boxShadow: m.seleccionada
                ? '0 4px 15px rgba(255, 193, 7, 0.7)'
                : '0 3px 8px rgba(0, 0, 0, 0.15)',
              backgroundColor: m.ocupada
                ? '#6c757d'
                : m.seleccionada
                ? '#ffc107'
                : '#f8f9fa',
              color: m.ocupada
                ? '#fff'
                : m.seleccionada
                ? '#000'
                : '#333',
              cursor: m.ocupada ? 'not-allowed' : 'pointer',
              textAlign: 'center',
              transition: 'all 0.3s ease-in-out',
              transform: m.seleccionada ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            <FaChair size={28} style={{ marginBottom: 5 }} />
            <h6 className="fw-bold">Mesa {m.numero}</h6>
            <div className="small">
              {m.ocupada ? (
                <>
                  <FaTimesCircle className="me-1" /> Ocupada
                </>
              ) : m.seleccionada ? (
                <>
                  <FaCheckCircle className="me-1" /> Seleccionada
                </>
              ) : (
                <>
                  <FaCheckCircle className="me-1 text-success" /> Disponible
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Formulario final */}
      {form.fecha && form.hora && (
        <form onSubmit={handleSubmit} className="row g-4">
          <div className="col-md-6">
            <label htmlFor="cliente" className="form-label">Nombre</label>
            <input type="text" id="cliente" className="form-control"
                   value={form.cliente} onChange={handleChange} required/>
          </div>
          <div className="col-md-6">
            <label htmlFor="email" className="form-label">Email</label>
            <input type="email" id="email" className="form-control"
                   value={form.email} onChange={handleChange} required/>
          </div>
          <div className="col-md-6">
            <label htmlFor="telefono" className="form-label">Teléfono</label>
            <input type="tel" id="telefono" className="form-control"
                   value={form.telefono} onChange={handleChange} required/>
          </div>
          <div className="col-md-6">
            <label htmlFor="invitados" className="form-label">Invitados</label>
            <input type="number" id="invitados" className="form-control"
                   min="1" max={capMax}
                   value={form.invitados} onChange={handleChange} required/>
            <div className="form-text">
              Máximo {capMax} según capacidad
            </div>
          </div>
          <div className="col-12">
            <label htmlFor="mensaje" className="form-label">Mensaje (opcional)</label>
            <textarea id="mensaje" className="form-control" rows="2"
                      value={form.mensaje} onChange={handleChange}/>
          </div>
          <div className="col-12 d-grid">
            <button type="submit" className="btn btn-warning btn-lg rounded-pill">
              Confirmar Reserva
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
