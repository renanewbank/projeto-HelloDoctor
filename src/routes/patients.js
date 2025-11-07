import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

/** LISTA + BUSCA (nome/telefone/cpf) */
router.get('/', async (req, res) => {
  const q = (req.query.q || '').trim();
  let rows = [];
  if (q) {
    const like = `%${q}%`;
    const r = await pool.query(
      `SELECT id, full_name, phone_mobile, cpf
       FROM patients
       WHERE full_name ILIKE $1 OR phone_mobile ILIKE $1 OR cpf ILIKE $1
       ORDER BY id DESC LIMIT 100`, [like]
    );
    rows = r.rows;
  } else {
    const r = await pool.query(
      `SELECT id, full_name, phone_mobile, cpf
       FROM patients
       ORDER BY id DESC LIMIT 100`
    );
    rows = r.rows;
  }
  res.render('patients/index', { patients: rows, q });
});

/** CRIAR */
router.post('/', async (req, res) => {
  const { full_name, cpf, phone_mobile, profession, insurance_id } = req.body;
  const r = await pool.query(
    `INSERT INTO patients (full_name, cpf, phone_mobile, profession, insurance_id)
     VALUES ($1,$2,$3,$4,$5) RETURNING id`,
    [full_name || 'Sem nome', cpf || null, phone_mobile || null, profession || null, insurance_id || null]
  );
  res.redirect(`/patients/${r.rows[0].id}`);
});

/** DETALHE */
router.get('/:id', async (req, res) => {
  const id = req.params.id;
  const p = await pool.query(`SELECT * FROM patients WHERE id=$1`, [id]);
  if (!p.rowCount) return res.status(404).send('Paciente não encontrado');

  const ins = await pool.query(`SELECT id, name FROM insurances ORDER BY name`);
  res.render('patients/show', { patient: p.rows[0], insurances: ins.rows });
});

/** EDITAR (nome, profissão, convênio) */
router.post('/:id', async (req, res) => {
  const id = req.params.id;
  const { full_name, profession, insurance_id } = req.body;
  await pool.query(
    `UPDATE patients SET full_name=$2, profession=$3, insurance_id=$4 WHERE id=$1`,
    [id, full_name, profession || null, insurance_id || null]
  );
  res.redirect(`/patients/${id}`);
});

export default router;
