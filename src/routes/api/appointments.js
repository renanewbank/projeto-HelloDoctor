import { Router } from 'express';
import { pool } from '../../db.js';

const router = Router();
const n = v => (v === '' || v === undefined ? null : v);

// junta "YYYY-MM-DD" + "HH:mm" -> TIMESTAMP (sem timezone)
function toStartsAt(dateStr, timeStr) {
  return `${dateStr} ${timeStr}:00`;
}

/* ====== LISTAS ====== */

// /api/appointments/day?date=YYYY-MM-DD
router.get('/day', async (req, res) => {
  const date = (req.query.date || '').slice(0, 10);
  if (!date) return res.status(400).json({ error: 'date is required (YYYY-MM-DD)' });

  const q = await pool.query(
    `
    SELECT a.id, a.starts_at, a.appointment_type, a.status, a.notes, a.value_amount,
           p.id AS patient_id, p.full_name AS patient_name,
           i.id AS insurance_id, i.name AS insurance_name
      FROM appointments a
      JOIN patients p   ON p.id = a.patient_id
      LEFT JOIN insurances i ON i.id = a.insurance_id
     WHERE a.starts_at::date = $1::date
     ORDER BY a.starts_at ASC
    `,
    [date]
  );
  res.json(q.rows);
});

// /api/appointments/week?start=YYYY-MM-DD
router.get('/week', async (req, res) => {
  const start = (req.query.start || '').slice(0, 10);
  if (!start) return res.status(400).json({ error: 'start is required (YYYY-MM-DD)' });

  const q = await pool.query(
    `
    SELECT a.id, a.starts_at, a.appointment_type, a.status, a.notes, a.value_amount,
           p.id AS patient_id, p.full_name AS patient_name,
           i.id AS insurance_id, i.name AS insurance_name
      FROM appointments a
      JOIN patients p   ON p.id = a.patient_id
      LEFT JOIN insurances i ON i.id = a.insurance_id
     WHERE a.starts_at >= $1::date
       AND a.starts_at <  ($1::date + INTERVAL '7 day')
     ORDER BY a.starts_at ASC
    `,
    [start]
  );
  res.json(q.rows);
});

/* ====== CRUD ====== */

// POST /api/appointments
// { patient_id, date:'YYYY-MM-DD', time:'HH:mm', appointment_type, insurance_id?, notes?, value_amount? }
router.post('/', async (req, res) => {
  const b = req.body || {};
  if (!b.patient_id)        return res.status(400).json({ error: 'patient_id is required' });
  if (!b.date || !b.time)   return res.status(400).json({ error: 'date and time are required' });
  if (!b.appointment_type)  return res.status(400).json({ error: 'appointment_type is required' });

  const starts_at = toStartsAt(b.date, b.time);

  const r = await pool.query(
    `
    INSERT INTO appointments (
      patient_id, insurance_id, appointment_type, status, starts_at, value_amount, notes
    ) VALUES ($1,$2,$3,'MARCADO',$4,$5,$6)
    RETURNING id
    `,
    [b.patient_id, n(b.insurance_id), b.appointment_type, starts_at, n(b.value_amount), n(b.notes)]
  );

  res.status(201).json({ id: r.rows[0].id });
});

// GET /api/appointments/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const q = await pool.query(
    `
    SELECT a.id, a.patient_id, a.insurance_id, a.appointment_type, a.status,
           a.starts_at, a.value_amount, a.notes,
           p.full_name AS patient_name
      FROM appointments a
      JOIN patients p ON p.id = a.patient_id
     WHERE a.id = $1
    `,
    [id]
  );
  if (!q.rowCount) return res.status(404).json({ error: 'not found' });

  // quebra starts_at em date/time para facilitar o front
  const row = q.rows[0];
  const d = new Date(row.starts_at);
  res.json({
    ...row,
    date: d.toISOString().slice(0, 10),
    time: d.toTimeString().slice(0, 5),
  });
});

// PUT /api/appointments/:id
// aceita os mesmos campos do POST
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const b = req.body || {};
  if (!b.patient_id)        return res.status(400).json({ error: 'patient_id is required' });
  if (!b.date || !b.time)   return res.status(400).json({ error: 'date and time are required' });
  if (!b.appointment_type)  return res.status(400).json({ error: 'appointment_type is required' });

  const starts_at = toStartsAt(b.date, b.time);

  const r = await pool.query(
    `
    UPDATE appointments SET
      patient_id=$2,
      insurance_id=$3,
      appointment_type=$4,
      starts_at=$5,
      value_amount=$6,
      notes=$7,
      updated_at=NOW()
     WHERE id=$1
     RETURNING id
    `,
    [id, b.patient_id, n(b.insurance_id), b.appointment_type, starts_at, n(b.value_amount), n(b.notes)]
  );
  if (!r.rowCount) return res.status(404).json({ error: 'not found' });
  res.json({ id });
});

// POST /api/appointments/:id/reschedule {date,time}
router.post('/:id/reschedule', async (req, res) => {
  const { id } = req.params;
  const b = req.body || {};
  if (!b.date || !b.time) return res.status(400).json({ error: 'date and time are required' });

  const starts_at = toStartsAt(b.date, b.time);
  const r = await pool.query(
    `UPDATE appointments SET starts_at=$2, updated_at=NOW() WHERE id=$1 RETURNING id`,
    [id, starts_at]
  );
  if (!r.rowCount) return res.status(404).json({ error: 'not found' });
  res.json({ id });
});

// DELETE /api/appointments/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const r = await pool.query(`DELETE FROM appointments WHERE id=$1`, [id]);
  if (!r.rowCount) return res.status(404).json({ error: 'not found' });
  res.status(204).end();
});

export default router;
