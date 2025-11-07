import { Router } from 'express';
import { pool } from '../../db.js';

const router = Router();

// GET /api/insurances
router.get('/', async (req, res) => {
  const r = await pool.query(
    `SELECT id, name, ans_code, pay_day, phone, email
       FROM insurances
       ORDER BY id DESC
       LIMIT 200`
  );
  res.json(r.rows);
});

// POST /api/insurances
router.post('/', async (req, res) => {
  const { name, ans_code, phone, email } = req.body || {};
  if (!name?.trim()) return res.status(400).json({ error: 'name is required' });

  const q = await pool.query(
    `INSERT INTO insurances (name, ans_code, phone, email)
     VALUES ($1,$2,$3,$4)
     RETURNING id, name, ans_code, phone, email`,
    [name.trim(), ans_code || null, phone || null, email || null]
  );
  res.status(201).json(q.rows[0]);
});

// GET /api/insurances/:id  (opcional, útil se quiser buscar individualmente)
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const r = await pool.query(
    `SELECT id, name, ans_code, pay_day, phone, email, notes
       FROM insurances WHERE id=$1`,
    [id]
  );
  if (!r.rowCount) return res.status(404).json({ error: 'not found' });
  res.json(r.rows[0]);
});

// PUT /api/insurances/:id  (editar)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  let { name, ans_code, phone, email, pay_day, notes } = req.body || {};
  if (!name || !name.trim()) return res.status(400).json({ error: 'name is required' });

  if (pay_day !== null && pay_day !== undefined && pay_day !== '') {
    const n = Number(pay_day);
    if (!Number.isInteger(n) || n < 1 || n > 31) {
      return res.status(400).json({ error: 'pay_day must be between 1 and 31' });
    }
    pay_day = n;
  } else {
    pay_day = null;
  }

  const q = await pool.query(
    `UPDATE insurances
        SET name=$2, ans_code=$3, phone=$4, email=$5, pay_day=$6, notes=$7, updated_at=NOW()
      WHERE id=$1
   RETURNING id, name, ans_code, pay_day, phone, email, notes`,
    [id, name.trim(), ans_code || null, phone || null, email || null, pay_day, notes || null]
  );
  if (!q.rowCount) return res.status(404).json({ error: 'not found' });
  res.json(q.rows[0]);
});

export default router;
