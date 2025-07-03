import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { generateTimeSlots } from '../../utils/availability';

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

  // carga inicial
  useEffect(() => {
    setMesas(JSON.parse(localStorage.getItem(MESAS_KEY) || '[]'));
    setReservas(JSON.parse(localStorage.getItem(RESERVAS_KEY) || '[]'));
    const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    setSettings(s);
  }, []);

  // sincroniza cambios multi-pestaña
  useEffect(() => {
    const handler = e => {
      if (e.key === MESAS_KEY) setMesas(JSON.parse(e.newValue||'[]'));
      if (e.key === RESERVAS_KEY) setReservas(JSON.parse(e.newValue||'[]'));
      if (e.key === SETTINGS_KEY) setSettings(JSON.parse(e.newValue||settings));
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [settings]);

  const handleChange = e => {
    const { id, value } = e.target;
    // validación de días abiertos y festivos al cambiar fecha
    if (id === 'fecha' && value) {
      const day = new Date(value).getDay();
      if (!settings.openDays.includes(day) || settings.holidays.includes(value)) {
        alert('Lo sentimos, el restaurante está cerrado ese día.');
        return setForm(f => ({ ...f, fecha:'', hora:'', mesaId:'' }));
      }
      // al cambiar fecha, reset hora y mesa
      return setForm(f => ({ ...f, fecha:value, hora:'', mesaId:'', invitados:1 }));
    }
    setForm(f => ({ ...f, [id]: value }));
  };

  const handleMesaClick = mesaId => {
    if (!form.fecha || !form.hora) {
      alert('Selecciona primero fecha y hora.');
      return;
    }
    // comprobar conflicto
    if (reservas.find(r => r.mesaId===mesaId && r.fecha===form.fecha && r.hora===form.hora)) {
      alert('Esa mesa YA está ocupada en ese horario.');
      return;
    }
    setForm(f => ({ ...f, mesaId, invitados:1 }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    const { cliente, fecha, hora, mesaId, invitados } = form;
    if (!cliente||!fecha||!hora||!mesaId) {
      return alert('Completa todos los campos obligatorios.');
    }
    const nueva = { ...form, id:Date.now().toString() };
    const updated = [...reservas, nueva];
    localStorage.setItem(RESERVAS_KEY, JSON.stringify(updated));
    setReservas(updated);
    alert(`¡Reserva confirmada para Mesa ${mesas.find(m=>m.id===mesaId).numero} a las ${hora}!`);
    setForm({
      cliente:'', email:'', telefono:'',
      fecha:'', hora:'', mesaId:'', invitados:1, mensaje:'', status:'Pendiente'
    });
  };

  // ** GENERA las horas disponibles según configuración **
  const timeOptions = form.fecha
    ? generateTimeSlots(settings.apertura, settings.cierre, settings.duracion)
    : [];

  // estado de mesas en la franja seleccionada
  const mesasEstado = mesas.map(m => {
    const ocupada = reservas.some(r =>
      r.mesaId===m.id && r.fecha===form.fecha && r.hora===form.hora
    );
    const seleccionada = m.id===form.mesaId;
    return { ...m, ocupada, seleccionada };
  });

  // capacidad máxima según la mesa elegida
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

      {/* Mesas */}
      {form.fecha && form.hora ? (
        <div className="d-flex flex-wrap gap-3 justify-content-center mb-5">
          {mesasEstado.map(m => (
            <div key={m.id}
                 onClick={()=>!m.ocupada && handleMesaClick(m.id)}
                 className={`mesa-card p-3 text-center rounded-4 fw-semibold ${
                   m.ocupada
                     ? 'bg-secondary text-white'
                     : m.seleccionada
                       ? 'bg-warning text-dark border-dark'
                       : 'bg-light text-dark'
                 }`}
                 style={{width:100, cursor: m.ocupada?'not-allowed':'pointer'}}>
              Mesa {m.numero}
              <div className="small">
                {m.ocupada?'Ocupada': m.seleccionada?'Seleccionada':'Disponible'}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="alert alert-info text-center">
          Elige fecha y hora para mostrar mesas.
        </div>
      )}

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
