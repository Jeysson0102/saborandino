import React, { useEffect, useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  Container, Button, Modal, Form,
  Table, Badge, InputGroup, FormControl,
  Alert, ToastContainer, Toast
} from 'react-bootstrap';
import { FaCalendarCheck, FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';

const MESAS_KEY    = 'saborandino_mesas';
const RESERVAS_KEY = 'saborandino_reservas';
const SETTINGS_KEY = 'saborandino_settings';
const STATUS_OPTIONS = ['Pendiente', 'Confirmada', 'Cancelada'];

export default function AdminReservas() {
  const [mesas, setMesas]         = useState([]);
  const [reservas, setReservas]   = useState([]);
  const [filtered, setFiltered]   = useState([]);
  const [settings, setSettings]   = useState({});
  const [form, setForm]           = useState({
    id:'', cliente:'', email:'', telefono:'',
    fecha:'', hora:'', mesaId:'', invitados:1, mensaje:'', status:'Pendiente'
  });
  const [search, setSearch]       = useState('');
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [alertMsg, setAlertMsg]   = useState('');
  const [toastMsg, setToastMsg]   = useState('');
  const calendarRef = useRef();

  /** Carga inicial **/
  useEffect(() => {
    setMesas(JSON.parse(localStorage.getItem(MESAS_KEY) || '[]'));
    const res = JSON.parse(localStorage.getItem(RESERVAS_KEY) || '[]');
    setReservas(res);
    setFiltered(res);
    setSettings(JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'));
  }, []);

  /** Sincronización multi-pestaña **/
  useEffect(() => {
    const onStorage = e => {
      if (e.key === MESAS_KEY) setMesas(JSON.parse(e.newValue || '[]'));
      if (e.key === RESERVAS_KEY) {
        const r = JSON.parse(e.newValue || '[]');
        setReservas(r);
        setFiltered(applySearch(r, search));
        calendarRef.current?.getApi().refetchEvents();
      }
      if (e.key === SETTINGS_KEY) setSettings(JSON.parse(e.newValue || '{}'));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [search]);

  /** Persist **/
  const persist = list => {
    setReservas(list);
    setFiltered(applySearch(list, search));
    localStorage.setItem(RESERVAS_KEY, JSON.stringify(list));
    calendarRef.current?.getApi().refetchEvents();
  };

  const applySearch = (list, term) =>
    list.filter(r =>
      r.cliente.toLowerCase().includes(term.toLowerCase()) ||
      (mesas.find(m=>m.id===r.mesaId)?.numero||'').includes(term)
    );

  /** Abrir / cerrar modal **/
  const openForm = (r=null, dateStr='') => {
    if (r) {
      setForm(r);
      setEditingId(r.id);
    } else {
      setForm({
        id:'', cliente:'', email:'', telefono:'',
        fecha: dateStr, hora:'', mesaId:'', invitados:1, mensaje:'', status:'Pendiente'
      });
      setEditingId(null);
    }
    setAlertMsg('');
    setShowModal(true);
  };
  const closeForm = () => setShowModal(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f=> ({ ...f, [name]: value }));
  };

  /** Submit / delete **/
  const handleSubmit = e => {
    e.preventDefault();
    const { cliente, fecha, hora, mesaId } = form;
    // validación según settings
    const dayNum = new Date(`${fecha}T${hora}`).getDay();
    if (!settings.openDays.includes(dayNum)) {
      return setAlertMsg('El restaurante está cerrado ese día.');
    }
    if (settings.holidays.includes(fecha)) {
      return setAlertMsg('El restaurante está cerrado (festivo).');
    }
    if (hora < settings.apertura || hora >= settings.cierre) {
      return setAlertMsg(`Horario válido: ${settings.apertura}–${settings.cierre}.`);
    }
    if (!cliente || !fecha || !hora || !mesaId) {
      return setAlertMsg('Completa todos los campos obligatorios.');
    }
    // conflicto de mesa+hora
    if (reservas.some(r =>
      r.id !== editingId &&
      r.mesaId === mesaId &&
      r.fecha === fecha &&
      r.hora === hora
    )) {
      return setAlertMsg('⚠️ Esa mesa ya está ocupada a esa hora.');
    }
    const nueva = { ...form, id: editingId || Date.now().toString() };
    if (editingId) persist(reservas.map(r=>r.id===editingId? nueva: r));
    else persist([nueva, ...reservas]);
    closeForm();
    setToastMsg(editingId? 'Reserva actualizada.' : 'Reserva creada.');
  };

  const handleDelete = () => {
    if (!editingId) return;
    if (window.confirm('Eliminar reserva?')) {
      persist(reservas.filter(r=>r.id!==editingId));
      closeForm();
      setToastMsg('Reserva eliminada.');
    }
  };

  /** Eventos para el calendario **/
  const events = reservas.map(r => {
    const m = mesas.find(x=>x.id===r.mesaId) || {};
    return {
      id: r.id,
      title: `${r.cliente} (${r.invitados} pers.)`,
      start: `${r.fecha}T${r.hora}`,
      backgroundColor:
        r.status==='Confirmada' ? '#28a745' :
        r.status==='Cancelada'  ? '#dc3545' :
        '#ffc107',
      textColor: '#fff',
      extendedProps: { reserva: r }
    };
  });

  return (
    <Container fluid className="py-4" style={{ background:'#f0f2f5', minHeight:'100vh' }}>
      <ToastContainer position="top-end" className="p-3">
        <Toast onClose={()=>setToastMsg('')}
               show={!!toastMsg} delay={2000} autohide bg="success">
          <Toast.Body>{toastMsg}</Toast.Body>
        </Toast>
      </ToastContainer>

      <div className="d-flex align-items-center mb-3">
        <FaCalendarCheck size={28} className="text-primary me-2" />
        <h2 className="me-auto">Gestión de Reservas</h2>
        <Button onClick={()=>openForm(null, new Date().toISOString().slice(0,10))}>
          <FaPlus className="me-1"/> Nueva Reserva
        </Button>
      </div>

      {alertMsg && <Alert variant="danger">{alertMsg}</Alert>}

      <div className="bg-white rounded shadow-sm mb-4 p-2">
        <FullCalendar
          ref={calendarRef}
          plugins={[ dayGridPlugin, interactionPlugin ]}
          initialView="dayGridMonth"
          height="auto"
          locales={[ esLocale ]} locale="es"
          headerToolbar={{ left:'prev,next today', center:'title', right:'dayGridMonth,dayGridWeek' }}
          events={events}
          dateClick={info=>openForm(null, info.dateStr)}
          eventClick={info=>openForm(info.event.extendedProps.reserva)}
        />
      </div>

      <InputGroup className="mb-3" style={{ maxWidth:300 }}>
        <InputGroup.Text><FaSearch/></InputGroup.Text>
        <FormControl placeholder="Buscar cliente o mesa"
                     value={search}
                     onChange={e=>{
                       setSearch(e.target.value);
                       setFiltered(applySearch(reservas, e.target.value));
                     }}/>
      </InputGroup>


      <h5>Listado de Reservas</h5>
      <div style={{ Height:'auto', overflowY:'auto' }}>
        <Table hover bordered size="sm" className="bg-white rounded shadow-sm">
          <thead className="table-dark">
            <tr>
              <th>N°</th><th>Cliente</th><th>Fecha</th><th>Hora</th>
              <th>Mesa</th><th>Personas</th><th>Estado</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? filtered.map((r,i)=>{
              const m = mesas.find(x=>x.id===r.mesaId);
              return (
                <tr key={r.id}>
                  <td>{i+1}</td>
                  <td>{r.cliente}</td>
                  <td>{r.fecha}</td>
                  <td>{r.hora}</td>
                  <td>{m?`Mesa ${m.numero}`:'--'}</td>
                  <td>{r.invitados}</td>
                  <td>
                    <Badge bg={
                      r.status==='Confirmada'?'success':
                      r.status==='Cancelada'?'danger':'warning'
                    }>{r.status}</Badge>
                  </td>
                  <td>
                    <Button size="sm" variant="warning" className="me-1"
                            onClick={()=>openForm(r)}>
                      <FaEdit/>
                    </Button>
                    <Button size="sm" variant="danger"
                            onClick={()=>{setEditingId(r.id); handleDelete();}}>
                      <FaTrash/>
                    </Button>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan="8" className="text-center py-3">No hay reservas.</td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* Modal Reserva */}
      <Modal show={showModal} onHide={closeForm} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingId?'Editar Reserva':'Nueva Reserva'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-2">
              <Form.Label>Cliente</Form.Label>
              <Form.Control name="cliente" value={form.cliente}
                            onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" name="email"
                            value={form.email}
                            onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control name="telefono" value={form.telefono}
                            onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Fecha</Form.Label>
              <Form.Control type="date" name="fecha"
                            value={form.fecha}
                            onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Hora</Form.Label>
              <Form.Control type="time" name="hora"
                            min={settings.apertura} max={settings.cierre}
                            value={form.hora}
                            onChange={handleChange} required />
              <Form.Text>
                Horario: {settings.apertura} – {settings.cierre}
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Mesa</Form.Label>
              <Form.Select name="mesaId" value={form.mesaId}
                           onChange={handleChange} required>
                <option value="">Selecciona una mesa</option>
                {mesas.map(m=>(
                  <option key={m.id} value={m.id}>
                    Mesa {m.numero} (Cap. {m.capacidad})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Invitados</Form.Label>
              <Form.Control type="number" name="invitados"
                            min="1"
                            max={mesas.find(m=>m.id===form.mesaId)?.capacidad||1}
                            value={form.invitados}
                            onChange={handleChange}
                            required />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Mensaje (opcional)</Form.Label>
              <Form.Control as="textarea" rows={2} name="mensaje"
                            value={form.mensaje} onChange={handleChange}/>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Status</Form.Label>
              <Form.Select name="status" value={form.status}
                           onChange={handleChange}>
                {STATUS_OPTIONS.map(o=> <option key={o}>{o}</option>)}
              </Form.Select>
            </Form.Group>
            {alertMsg && <Alert variant="danger">{alertMsg}</Alert>}
          </Modal.Body>
          <Modal.Footer>
            {editingId && (
              <Button variant="danger" onClick={handleDelete}>
                <FaTrash className="me-1"/> Eliminar
              </Button>
            )}
            <Button variant="secondary" onClick={closeForm}>Cancelar</Button>
            <Button type="submit" variant="primary">
              {editingId? 'Actualizar' : 'Crear'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}
