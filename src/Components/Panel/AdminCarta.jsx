// src/Components/Panel/AdminCarta.jsx
import React, { useEffect, useState, useRef, useCallback } from 'react';

const CARTA_KEY = 'saborandino_carta';
const CANTIDAD_INICIAL = 6;
const CANTIDAD_CARGA = 6;

const AdminCarta = () => {
  const [platos, setPlatos] = useState([]);
  const [form, setForm] = useState({
    nombre: '',
    precio: '',
    descripcion: '',
    imagen: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [visibleCount, setVisibleCount] = useState(CANTIDAD_INICIAL);
  const observer = useRef();

  // 1) Carga inicial y conversión de precios a número
  useEffect(() => {
    const raw = JSON.parse(localStorage.getItem(CARTA_KEY) || '[]');
    const datos = raw.map(p => ({
      ...p,
      precio: Number(p.precio)  // <— aquí convertimos string → número
    }));
    setPlatos(datos);
  }, []);

  // 2) Función para persistir (ya guarda números correctos)
  const persist = (arr) => {
    setPlatos(arr);
    localStorage.setItem(CARTA_KEY, JSON.stringify(arr));
  };

  // Cambios en inputs (incluye FileReader para imagen)
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'imagen' && files[0]) {
      const reader = new FileReader();
      reader.onload = () => setForm(f => ({ ...f, imagen: reader.result }));
      reader.readAsDataURL(files[0]);
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  // Crear o actualizar un plato
  const handleSubmit = (e) => {
    e.preventDefault();
    const { nombre, precio, descripcion, imagen } = form;
    const precioNum = parseFloat(precio);
    if (isNaN(precioNum)) {
      alert('El precio debe ser un número válido.');
      return;
    }

    let nuevos;
    if (editingId) {
      nuevos = platos.map(p =>
        p.id === editingId
          ? { ...p, nombre, precio: precioNum, descripcion, imagen }
          : p
      );
    } else {
      nuevos = [
        { id: Date.now().toString(), nombre, precio: precioNum, descripcion, imagen },
        ...platos
      ];
    }
    persist(nuevos);

    setForm({ nombre: '', precio: '', descripcion: '', imagen: '' });
    setEditingId(null);
  };

  // Preparar edición
  const handleEdit = (p) => {
    setForm({
      nombre: p.nombre,
      precio: p.precio.toString(), // volvemos a string para el input
      descripcion: p.descripcion,
      imagen: p.imagen
    });
    setEditingId(p.id);
  };

  // Eliminar un plato
  const handleDelete = (id) => {
    if (window.confirm('¿Eliminar este plato?')) {
      const filtrados = platos.filter(p => p.id !== id);
      persist(filtrados);
      if (editingId === id) {
        setForm({ nombre: '', precio: '', descripcion: '', imagen: '' });
        setEditingId(null);
      }
    }
  };

  // Infinite scroll ligero
  const lastRef = useCallback(node => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && visibleCount < platos.length) {
        setVisibleCount(v => v + CANTIDAD_CARGA);
      }
    });
    if (node) observer.current.observe(node);
  }, [visibleCount, platos.length]);

  return (
    <div className="p-4">
      <h2 className="mb-4">🧾 Gestión de la Carta</h2>

      {/* Formulario de creación/edición */}
      <form className="row g-3 mb-5" onSubmit={handleSubmit}>
        <div className="col-md-3">
          <input
            name="nombre"
            className="form-control"
            placeholder="Nombre del plato"
            value={form.nombre}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-2">
          <input
            name="precio"
            type="number"
            step="0.01"
            min="0"
            className="form-control"
            placeholder="Precio"
            value={form.precio}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-4">
          <input
            name="descripcion"
            className="form-control"
            placeholder="Descripción"
            value={form.descripcion}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-2">
          <input
            type="file"
            name="imagen"
            accept="image/*"
            className="form-control"
            onChange={handleChange}
          />
        </div>
        <div className="col-md-1">
          <button type="submit" className="btn btn-success w-100">
            {editingId ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </form>

      {/* Lista de platos con carga incremental */}
      <div
        className="row gy-4"
        style={{
          height: 'auto',
          overflowY: 'auto',
          paddingRight: '10px',
          border: '1px solid #ddd',
          borderRadius: '10px'
        }}
      >
        {platos.slice(0, visibleCount).map((p, i) => {
          const isLast = i === visibleCount - 1;
          return (
            <div
              key={p.id}
              ref={isLast ? lastRef : null}
              className="col-sm-6 col-md-4 col-lg-3"
            >
              <div className="card shadow-sm h-100">
                {p.imagen && (
                  <img
                    src={p.imagen}
                    alt={p.nombre}
                    className="card-img-top"
                    style={{ objectFit: 'cover', height: '180px' }}
                  />
                )}
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title text-primary">{p.nombre}</h5>
                  <p className="card-text text-muted mb-1">{p.descripcion}</p>
                  {/* Aquí p.precio ya es número */}
                  <p className="card-text fw-bold text-success">
                    S/ {p.precio.toFixed(2)}
                  </p>
                  <div className="mt-auto d-flex gap-2">
                    <button
                      onClick={() => handleEdit(p)}
                      className="btn btn-sm btn-outline-primary w-100"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="btn btn-sm btn-outline-danger w-100"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {visibleCount >= platos.length && platos.length > 0 && (
        <p className="text-center mt-4 text-muted">🔚 Fin de la lista</p>
      )}
    </div>
  );
};

export default AdminCarta;
