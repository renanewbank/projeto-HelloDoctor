import { Router } from 'express';
import { pool } from '../db.js';
import dayjs from 'dayjs';

const router = Router();

/** CRIAR (data e hora locais — coluna TIMESTAMP local) */
router.post('/', async (req, res) => {
  const { patient_id, appointment_type, date, time, insurance_id } = req.body;
  const starts_local = `${date} ${time}`; // "YYYY-MM-DD HH:mm"
  await pool.query(
    `INSERT INTO appointments (patient_id, appointment_type, status, starts_at, insurance_id)
     VALUES ($1,$2,'MARCADO',$3,$4)`,
    [patient_id, appointment_type, starts_local, insurance_id || null]
  );
  res.redirect('/appointments/day?date=' + date);
});

/** REMARCAR */
router.post('/:id/reschedule', async (req, res) => {
  const { id } = req.params;
  const { date, time } = req.body;
  await pool.query(
    `UPDATE appointments SET starts_at=$2 WHERE id=$1`,
    [id, `${date} ${time}`]
  );
  res.redirect('/appointments/day?date=' + date);
});

/** AGENDA DO DIA */
router.get('/day', async (req, res) => {
  const d = (req.query.date || dayjs().format('YYYY-MM-DD'));
  const r = await pool.query(
    `SELECT a.id, a.patient_id, p.full_name, a.appointment_type, a.status,
            to_char(a.starts_at, 'HH24:MI') as hhmm,
            to_char(a.starts_at, 'YYYY-MM-DD') as ymd
     FROM appointments a
     JOIN patients p ON p.id = a.patient_id
     WHERE DATE(a.starts_at) = $1
     ORDER BY a.starts_at`,
     [d]
  );
  // também carregamos pacientes para o form rápido
  const ps = await pool.query(`SELECT id, full_name FROM patients ORDER BY full_name LIMIT 200`);
  const ins = await pool.query(`SELECT id, name FROM insurances ORDER BY name`);
  res.render('agenda/day', { items: r.rows, date: d, patients: ps.rows, insurances: ins.rows });
});

/** AGENDA SEMANAL */
router.get('/week', async (req, res) => {
  const base = dayjs(req.query.start || dayjs().format('YYYY-MM-DD'));
  const monday = base.startOf('week').add(1, 'day'); // dayjs semana começa no domingo
  const sunday = monday.add(6, 'day');
  const start = monday.format('YYYY-MM-DD') + ' 00:00';
  const end = sunday.add(1, 'day').format('YYYY-MM-DD') + ' 00:00';

  const r = await pool.query(
    `SELECT a.id, p.full_name, a.appointment_type, a.status, a.starts_at
     FROM appointments a
     JOIN patients p ON p.id = a.patient_id
     WHERE a.starts_at >= $1 AND a.starts_at < $2
     ORDER BY a.starts_at`,
     [start, end]
  );
  res.render('agenda/week', {
    items: r.rows,
    monday: monday.format('YYYY-MM-DD'),
    sunday: sunday.format('YYYY-MM-DD')
  });
});

export default router;
