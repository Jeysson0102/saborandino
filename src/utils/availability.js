// src/utils/availability.js
export function getAvailability(
  mesaId, date,
  apertura, cierre,
  duracion, limpieza,
  reservas = []
) {
  const slots = [];
  const [ah, am] = apertura.split(':').map(Number);
  const [ch, cm] = cierre.split(':').map(Number);
  let cursor = new Date(`${date}T${String(ah).padStart(2,'0')}:${String(am).padStart(2,'0')}`);
  const endDay = new Date(`${date}T${String(ch).padStart(2,'0')}:${String(cm).padStart(2,'0')}`);

  while (cursor < endDay) {
    const from = new Date(cursor);
    const to   = new Date(+cursor + duracion*60000);
    const ocupado = reservas.some(r => 
      r.mesaId === mesaId &&
      r.fecha === date &&
      !( new Date(`${r.fecha}T${r.hora}`) >= to ||
         new Date(+new Date(`${r.fecha}T${r.hora}`) + duracion*60000) <= from )
    );
    slots.push({ from, to, status: ocupado ? 'ocupada' : 'libre' });
    cursor = new Date(+to + limpieza*60000);
  }
  return slots;
}

/**
 * Genera array de strings "HH:MM" desde apertura hasta cierre con paso duracion.
 */
export function generateTimeSlots(apertura, cierre, duracion) {
  const times = [];
  const [ah, am] = apertura.split(':').map(Number);
  const [ch, cm] = cierre.split(':').map(Number);
  let cursor = new Date();
  cursor.setHours(ah, am, 0, 0);
  const end = new Date();
  end.setHours(ch, cm, 0, 0);

  while (cursor < end) {
    times.push(cursor.toTimeString().slice(0,5));
    cursor = new Date(+cursor + duracion*60000);
  }
  return times;
}
