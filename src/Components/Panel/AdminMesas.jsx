import React, { useEffect, useState, useRef } from 'react';
import {
  Container, Row, Col, Card, Badge, Button, Modal,
  Form, InputGroup, Tab, Nav, Dropdown, Stack
} from 'react-bootstrap';
import {
  FaChair, FaEdit, FaTrash, FaPlus,
  FaGripVertical, FaStickyNote, FaCog
} from 'react-icons/fa';
import { getAvailability } from '../../utils/availability';

const MESAS_KEY    = 'saborandino_mesas';
const RESERVAS_KEY = 'saborandino_reservas';
const SETTINGS_KEY = 'saborandino_settings';
const SECCIONES    = ['Interior', 'Terraza', 'Privado'];

export default function AdminMesas() {
  const [mesas, setMesas] = useState([]);
  const [settings, setSettings] = useState({
    apertura: '11:00', cierre: '22:00',
    duracion: 60, limpieza: 2,
    openDays: [1,2,3,4,5,6,0], // Lun–Dom
    holidays: []
  });
  const [filterDate, setFilterDate]     = useState('');
  const [filterTime, setFilterTime]     = useState('');
  const [filterSec, setFilterSec]       = useState('Todas');
  const [filterEst, setFilterEst]       = useState('Todos');
  const [searchTerm, setSearchTerm]     = useState('');
  const [showModal, setShowModal]       = useState(false);
  const [formMesa, setFormMesa]         = useState({ numero:'', capacidad:1, seccion:'Interior', nota:'' });
  const [editingId, setEditingId]       = useState(null);
  const dragItem = useRef(), dragOver = useRef();

  /** Carga inicial de mesas y settings **/
  useEffect(() => {
    // Mesas
    let savedMesas = JSON.parse(localStorage.getItem(MESAS_KEY) || '[]');
    if (!savedMesas.length) {
      // crear 20 mesas por defecto
      const arr = [];
      SECCIONES.forEach(sec => {
        const count = sec==='Privado'?4:8;
        for (let i = 0; i < count; i++) {
          const num = String(arr.length+1).padStart(2,'0');
          arr.push({
            id: Date.now() + '-' + num,
            numero: num,
            capacidad: 4,
            seccion: sec,
            estado: 'libre',
            nota: ''
          });
        }
      });
      savedMesas = arr;
      localStorage.setItem(MESAS_KEY, JSON.stringify(arr));
    }
    setMesas(savedMesas);

    // Settings
    const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    setSettings(s => ({ ...s, ...s }));

    // filtros iniciales
    const now = new Date();
    setFilterDate(now.toISOString().slice(0,10));
    setFilterTime(now.toTimeString().slice(0,5));
  }, []);

  /** Sincronización multi-pestaña **/
  useEffect(() => {
    const onStorage = e => {
      if (e.key === MESAS_KEY) setMesas(JSON.parse(e.newValue || '[]'));
      if (e.key === RESERVAS_KEY) setMesas(m => [...m]); // forzar recalc
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  /** Persist y handlers **/
  const persistMesas = list => {
    setMesas(list);
    localStorage.setItem(MESAS_KEY, JSON.stringify(list));
  };
  const persistSettings = () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    alert('Ajustes guardados ✔️');
  };
  const openModal = mesa => {
    if (mesa) {
      setFormMesa({ numero: mesa.numero, capacidad: mesa.capacidad, seccion: mesa.seccion, nota: mesa.nota });
      setEditingId(mesa.id);
    } else {
      setFormMesa({ numero:'', capacidad:1, seccion:'Interior', nota:'' });
      setEditingId(null);
    }
    setShowModal(true);
  };
  const closeModal = () => setShowModal(false);
  const handleFormMesa = e => setFormMesa(f => ({ ...f, [e.target.name]: e.target.value }));
  const submitMesa = e => {
    e.preventDefault();
    const { numero, capacidad, seccion, nota } = formMesa;
    if (!numero) return;
    if (editingId) {
      persistMesas(mesas.map(m => m.id===editingId ? { ...m, numero, capacidad, seccion, nota } : m));
    } else {
      persistMesas([{ id: Date.now().toString(), numero, capacidad, seccion, estado:'libre', nota }, ...mesas]);
    }
    closeModal();
  };
  const deleteMesa = id => {
    if (window.confirm('¿Eliminar mesa?')) {
      persistMesas(mesas.filter(m=>m.id!==id));
      if (editingId===id) closeModal();
    }
  };
  const toggleManual = id => {
    persistMesas(mesas.map(m => m.id!==id
      ? m
      : { ...m, estado: m.estado==='no disponible' ? 'libre' : 'no disponible' }
    ));
  };
  const onDragStart = (_, pos) => dragItem.current = pos;
  const onDragEnter = (_, pos) => dragOver.current = pos;
  const onDrop = () => {
    const list = [...mesas];
    const dragged = list.splice(dragItem.current, 1)[0];
    list.splice(dragOver.current, 0, dragged);
    persistMesas(list);
    dragItem.current = dragOver.current = null;
  };

  /** Filtrado & estado **/
  const dayNum = new Date(`${filterDate}T${filterTime}`).getDay();
  const reservas = JSON.parse(localStorage.getItem(RESERVAS_KEY) || '[]');
  const filteredMesas = mesas
    .filter(m => filterSec==='Todas' || m.seccion===filterSec)
    .filter(m => filterEst==='Todos' || computeStatus(m).label===filterEst)
    .filter(m => m.numero.includes(searchTerm))
    .sort((a,b)=>a.numero.localeCompare(b.numero));

  function computeStatus(m) {
    // cerrado por día o festivo
    if (!settings.openDays.includes(dayNum) || settings.holidays.includes(filterDate)) {
      return { badge:'secondary', label:'Cerrado' };
    }
    if (m.estado==='no disponible') {
      return { badge:'warning', label:'No Disponible' };
    }
    const slots = getAvailability(m.id, filterDate, settings.apertura, settings.cierre, settings.duracion, settings.limpieza, reservas);
    const now = new Date(`${filterDate}T${filterTime}`);
    if (slots.some(s => now>=s.from && now<s.to && s.status==='ocupada')) {
      return { badge:'danger', label:'Ocupada' };
    }
    const lastEnd = slots.filter(s=>s.status==='ocupada').map(s=>s.to).sort((a,b)=>b-a)[0];
    if (lastEnd && (now - lastEnd) < settings.limpieza*60000) {
      return { badge:'info', label:'Limpiando' };
    }
    return { badge:'success', label:'Libre' };
  }

  return (
    <Container fluid className="py-4">
      <Tab.Container defaultActiveKey="mesas">
        <Nav variant="tabs">
          <Nav.Item><Nav.Link eventKey="mesas">Mesas</Nav.Link></Nav.Item>
          <Nav.Item><Nav.Link eventKey="ajustes">Ajustes</Nav.Link></Nav.Item>
        </Nav>
        <Tab.Content className="mt-3">

          {/* PANEL MESAS */}
          <Tab.Pane eventKey="mesas">
            <Stack direction="horizontal" gap={2} className="mb-3 flex-wrap align-items-center">
              <InputGroup style={{width:200}}>
                <InputGroup.Text>Fecha</InputGroup.Text>
                <Form.Control type="date" value={filterDate}
                  onChange={e=>setFilterDate(e.target.value)} />
              </InputGroup>
              <InputGroup style={{width:160}}>
                <InputGroup.Text>Hora</InputGroup.Text>
                <Form.Control type="time" value={filterTime}
                  onChange={e=>setFilterTime(e.target.value)} />
              </InputGroup>
              <Form.Select style={{width:140}} value={filterSec}
                onChange={e=>setFilterSec(e.target.value)}>
                <option>Todas</option>
                {SECCIONES.map(s=> <option key={s}>{s}</option>)}
              </Form.Select>
              <Form.Select style={{width:150}} value={filterEst}
                onChange={e=>setFilterEst(e.target.value)}>
                <option>Todos</option>
                {['Libre','Ocupada','Limpiando','No Disponible','Cerrado'].map(s=> <option key={s}>{s}</option>)}
              </Form.Select>
              <Form.Control placeholder="Buscar mesa #"
                style={{width:130}}
                value={searchTerm}
                onChange={e=>setSearchTerm(e.target.value)} />
              <Button variant="outline-secondary" onClick={()=>openModal(null)}>
                <FaPlus /> Mesa
              </Button>
            </Stack>

            <div style={{ height:'auto', overflowY:'auto'}} onDragOver={e=>e.preventDefault()} onDrop={onDrop}>
              <Row xs={1} sm={2} md={3} lg={4} className="g-4">
                {filteredMesas.map((m,i) => {
                  const { badge, label } = computeStatus(m);
                  return (
                    <Col key={m.id} draggable
                         onDragStart={e=>onDragStart(e,i)}
                         onDragEnter={e=>onDragEnter(e,i)}>
                      <Card className="h-100 shadow-sm">
                        <Card.Header className="d-flex justify-content-between">
                          <span><FaGripVertical className="me-2"/> Mesa {m.numero}</span>
                          <Badge bg={badge} style={{cursor:'pointer'}} onClick={()=>toggleManual(m.id)}>
                            {label}
                          </Badge>
                        </Card.Header>
                        <Card.Body className="position-relative">
                          <div className="text-center mb-2"><FaChair size={48} className="text-muted"/></div>
                          <div className="text-center"><strong>{m.seccion}</strong> | Cap: {m.capacidad}</div>
                          {m.nota && (
                            <Badge bg="info" className="position-absolute top-0 end-0 m-2">
                              <FaStickyNote /> {m.nota}
                            </Badge>
                          )}
                        </Card.Body>
                        <Card.Footer className="d-flex justify-content-end gap-1">
                          <Dropdown align="end">
                            <Dropdown.Toggle variant="light" size="sm"><FaEdit/></Dropdown.Toggle>
                            <Dropdown.Menu>
                              <Dropdown.Item onClick={()=>openModal(m)}>Editar</Dropdown.Item>
                              <Dropdown.Item onClick={()=>deleteMesa(m.id)}>Eliminar</Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </Card.Footer>
                      </Card>
                    </Col>
                  )
                })}
              </Row>
            </div>
          </Tab.Pane>

          {/* PANEL AJUSTES */}
          <Tab.Pane eventKey="ajustes">
            <Form style={{ maxWidth:600 }}>
              <Form.Group className="mb-3">
                <Form.Label>Días abiertos</Form.Label>
                <div className="d-flex flex-wrap">
                  {['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'].map((d,i)=>(
                    <Form.Check key={i} type="checkbox" id={`day${i}`} label={d} className="me-3"
                      checked={settings.openDays.includes(i)}
                      onChange={()=>{
                        const od = [...settings.openDays];
                        settings.openDays.includes(i)
                          ? od.splice(od.indexOf(i), 1)
                          : od.push(i);
                        setSettings(s=>({...s, openDays: od}));
                      }}/>
                  ))}
                </div>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Festivos (YYYY-MM-DD)</Form.Label>
                <Form.Control placeholder="2025-12-25,2025-01-01"
                  value={settings.holidays.join(',')}
                  onChange={e=>setSettings(s=>({
                    ...s,
                    holidays: e.target.value.split(',').map(x=>x.trim())
                  }))}/>
              </Form.Group>
              <InputGroup className="mb-3">
                <InputGroup.Text>Apertura / Cierre</InputGroup.Text>
                <Form.Control type="time" value={settings.apertura}
                  onChange={e=>setSettings(s=>({...s, apertura: e.target.value}))}/>
                <Form.Control type="time" value={settings.cierre}
                  onChange={e=>setSettings(s=>({...s, cierre: e.target.value}))}/>
              </InputGroup>
              <Form.Group className="mb-3">
                <Form.Label>Duración reserva (min)</Form.Label>
                <Form.Control type="number" min="1"
                  value={settings.duracion}
                  onChange={e=>setSettings(s=>({...s, duracion: +e.target.value}))}/>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Tiempo limpieza (min)</Form.Label>
                <Form.Control type="number" min="0"
                  value={settings.limpieza}
                  onChange={e=>setSettings(s=>({...s, limpieza: +e.target.value}))}/>
              </Form.Group>
              <Button onClick={persistSettings}>
                <FaCog className="me-1"/> Guardar Ajustes
              </Button>
            </Form>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>

      {/* Modal CRUD Mesa */}
      <Modal show={showModal} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingId ? 'Editar Mesa' : 'Nueva Mesa'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={submitMesa}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Número</Form.Label>
              <Form.Control name="numero" value={formMesa.numero} onChange={handleFormMesa} required/>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Capacidad</Form.Label>
              <Form.Control type="number" min="1" name="capacidad"
                value={formMesa.capacidad} onChange={handleFormMesa} required/>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Sección</Form.Label>
              <Form.Select name="seccion" value={formMesa.seccion} onChange={handleFormMesa}>
                {SECCIONES.map(s=> <option key={s}>{s}</option>)}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Nota</Form.Label>
              <Form.Control name="nota" value={formMesa.nota} onChange={handleFormMesa}/>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            {editingId && (
              <Button variant="danger" onClick={()=>deleteMesa(editingId)}>
                <FaTrash className="me-1"/> Eliminar
              </Button>
            )}
            <Button variant="secondary" onClick={closeModal}>Cancelar</Button>
            <Button type="submit" variant="success">
              <FaPlus className="me-1"/> {editingId?'Actualizar':'Crear'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}
