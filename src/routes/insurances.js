import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

/** LISTA */
router.get('/', async (req, res) => {
  const r = await pool.query(`SELECT id, name, ans_code FROM insurances ORDER BY id DESC LIMIT 100`);
  res.render('insurances/index', { insurances: r.rows });
});

/** CRIAR */
router.post('/', async (req, res) => {
  const { name, ans_code, phone, email } = req.body;
  await pool.query(
    `INSERT INTO insurances (name, ans_code, phone, email) VALUES ($1,$2,$3,$4)`,
    [name, ans_code || null, phone || null, email || null]
  );
  res.redirect('/insurances');
});

export default router;
