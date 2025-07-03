import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, ProgressBar } from 'react-bootstrap';
import { FaCalendarAlt, FaChair, FaBan, FaUsers, FaArrowUp, FaArrowDown } from 'react-icons/fa';

const MESAS_KEY = 'saborandino_mesas';
const RESERVAS_KEY = 'saborandino_reservas';
const PERIODS = [
  { label: 'Día', value: 'day' },
  { label: 'Semana', value: 'week' },
  { label: 'Mes', value: 'month' }
];

export default function Reportes() {
  const [mesas, setMesas] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [reportDate, setReportDate] = useState('');
  const [period, setPeriod] = useState('day');

  useEffect(() => {
    setMesas(JSON.parse(localStorage.getItem(MESAS_KEY) || '[]'));
    setReservas(JSON.parse(localStorage.getItem(RESERVAS_KEY) || '[]'));
    setReportDate(new Date().toISOString().slice(0,10));
  }, []);

  // Utility to get current and previous date ranges
  const getRanges = () => {
    const current = new Date(reportDate);
    let start, end, prevStart, prevEnd;
    if (period === 'week') {
      start = new Date(current);
      start.setDate(current.getDate() - 6);
      end = current;
      prevEnd = new Date(start);
      prevEnd.setDate(start.getDate() - 1);
      prevStart = new Date(prevEnd);
      prevStart.setDate(prevEnd.getDate() - 6);
    } else if (period === 'month') {
      start = new Date(current.getFullYear(), current.getMonth(), 1);
      end = current;
      prevEnd = new Date(start);
      prevEnd.setDate(0); // last day prev month
      prevStart = new Date(prevEnd.getFullYear(), prevEnd.getMonth(), 1);
    } else {
      start = new Date(reportDate);
      end = new Date(reportDate);
      prevEnd = new Date(start);
      prevEnd.setDate(start.getDate() - 1);
      prevStart = new Date(prevEnd);
    }
    return { start, end, prevStart, prevEnd };
  };

  const { start, end, prevStart, prevEnd } = getRanges();
  const totalDays = Math.round((end - start)/(1000*60*60*24)) + 1;
  const prevDays = Math.round((prevEnd - prevStart)/(1000*60*60*24)) + 1;

  const filterByRange = (list, s, e) => list.filter(r => {
    const d = new Date(r.fecha);
    return d >= s && d <= e;
  });

  // Current and previous data
  const curr = filterByRange(reservas, start, end);
  const prev = filterByRange(reservas, prevStart, prevEnd);
  const totalRes = curr.length;
  const prevRes = prev.length;

  const totalMesas = mesas.length;
  const currOcc = new Set(curr.map(r => `${r.mesaId}-${r.fecha}`)).size;
  const prevOcc = new Set(prev.map(r => `${r.mesaId}-${r.fecha}`)).size;
  const occPct = totalMesas > 0 ? Math.round((currOcc/(totalMesas*totalDays))*100) : 0;
  const prevOccPct = totalMesas > 0 ? Math.round((prevOcc/(totalMesas*prevDays))*100) : 0;

  const cancelCurr = curr.filter(r => r.status === 'Cancelada').length;
  const cancelPrev = prev.filter(r => r.status === 'Cancelada').length;
  const cancelRate = totalRes > 0 ? Math.round((cancelCurr/totalRes)*100) : 0;
  const prevCancelRate = prevRes > 0 ? Math.round((cancelPrev/prevRes)*100) : 0;

  const guestsCurr = curr.reduce((sum, r) => sum + (r.invitados || 0), 0);
  const guestsPrev = prev.reduce((sum, r) => sum + (r.invitados || 0), 0);
  const avgGuests = totalRes > 0 ? (guestsCurr/totalRes).toFixed(1) : 0;
  const avgPrev = prevRes > 0 ? (guestsPrev/prevRes).toFixed(1) : 0;

  const delta = (currVal, prevVal) => {
    const diff = currVal - prevVal;
    return {
      diff,
      up: diff >= 0
    };
  };

  const resDelta = delta(totalRes, prevRes);
  const occDelta = delta(occPct, prevOccPct);
  const cancelDelta = delta(cancelRate, prevCancelRate);
  const guestsDelta = delta(parseFloat(avgGuests), parseFloat(avgPrev));

  // CSV Export
  const exportCSV = () => {
    const header = ['Fecha','Hora','Mesa','Cliente','Invitados','Status'];
    const rows = curr.map(r => [r.fecha, r.hora, mesas.find(m=>m.id===r.mesaId)?.numero||'', r.cliente, r.invitados, r.status]);
    const csv = [header, ...rows].map(r=>r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `reportes_${period}_${reportDate}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const renderDelta = ({ diff, up }) => (
    <small className={up ? 'text-success' : 'text-danger'}>
      {up ? <FaArrowUp /> : <FaArrowDown />} {Math.abs(diff)}
    </small>
  );

  return (
    <Container fluid className="py-4">
      <Row className="align-items-end mb-3">
        <Col md={3} lg={2}>
          <Form.Label>Fecha</Form.Label>
          <Form.Control type="date" value={reportDate} onChange={e=>setReportDate(e.target.value)} />
        </Col>
        <Col md={3} lg={2}>
          <Form.Label>Periodo</Form.Label>
          <Form.Select value={period} onChange={e=>setPeriod(e.target.value)}>
            {PERIODS.map(p=><option key={p.value} value={p.value}>{p.label}</option>)}
          </Form.Select>
        </Col>
        <Col md={3} lg={2} className="mt-2 mt-md-0">
          <Button variant="outline-secondary" onClick={exportCSV}>Exportar CSV</Button>
        </Col>
      </Row>

      <Row className="g-4">
        {/* Total reservas */}
        <Col md={6} lg={3}>
          <Card className="h-100 shadow-sm text-center">
            <Card.Body>
              <FaCalendarAlt size={36} className="mb-2 text-info" />
              <Card.Title>Total reservas</Card.Title>
              <h3>{totalRes} {renderDelta(resDelta)}</h3>
              <small className="text-muted">vs previo: {prevRes}</small>
            </Card.Body>
          </Card>
        </Col>

        {/* Ocupación */}
        <Col md={6} lg={3}>
          <Card className="h-100 shadow-sm text-center">
            <Card.Body>
              <FaChair size={36} className="mb-2 text-primary" />
              <Card.Title>Ocupación</Card.Title>
              <h3>{occPct}% {renderDelta(occDelta)}</h3>
              <ProgressBar now={occPct} className="mt-2" />
              <small className="text-muted">vs previo: {prevOccPct}%</small>
            </Card.Body>
          </Card>
        </Col>

        {/* Tasa cancelación */}
        <Col md={6} lg={3}>
          <Card className="h-100 shadow-sm text-center">
            <Card.Body>
              <FaBan size={36} className="mb-2 text-danger" />
              <Card.Title>Tasa de cancelación</Card.Title>
              <h3>{cancelRate}% {renderDelta(cancelDelta)}</h3>
              <small className="text-muted">vs previo: {prevCancelRate}%</small>
            </Card.Body>
          </Card>
        </Col>

        {/* Tamaño promedio */}
        <Col md={6} lg={3}>
          <Card className="h-100 shadow-sm text-center">
            <Card.Body>
              <FaUsers size={36} className="mb-2 text-success" />
              <Card.Title>Tamaño promedio</Card.Title>
              <h3>{avgGuests} {renderDelta(guestsDelta)}</h3>
              <small className="text-muted">vs previo: {avgPrev}</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
