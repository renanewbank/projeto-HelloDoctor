import { Router } from 'express';
import { pool } from '../../db.js';

const router = Router();

// map helper para evitar undefined => null
const n = v => (v === '' || v === undefined ? null : v);

// LISTA / BUSCA
router.get('/', async (req, res) => {
  const q = (req.query.q || '').trim();
  const SQL_BASE = `
    SELECT id, full_name, profession, cpf, phone_mobile, insurance_id
      FROM patients
  `;
  if (q) {
    const like = `%${q}%`;
    const r = await pool.query(
      SQL_BASE + ` WHERE full_name ILIKE $1 OR phone_mobile ILIKE $1 OR cpf ILIKE $1
                   ORDER BY id DESC LIMIT 200`,
      [like]
    );
    return res.json(r.rows);
  }
  const r = await pool.query(SQL_BASE + ` ORDER BY id DESC LIMIT 200`);
  res.json(r.rows);
});

// DETALHE (para preencher modal de edição)
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const r = await pool.query(
    `SELECT
       id, full_name, social_name, gender, birth_date, profession, marital_status, nationality,
       cpf, insurance_id, insurance_card,
       cep, address_street, address_number, address_comp, address_district, address_city, address_state, address_country,
       email, phone_mobile, phone_landline,
       notes, created_at, updated_at
     FROM patients WHERE id=$1`,
    [id]
  );
  if (!r.rowCount) return res.status(404).json({ error: 'not found' });
  res.json(r.rows[0]);
});

// CRIAR
router.post('/', async (req, res) => {
  const b = req.body || {};
  if (!b.full_name || !b.full_name.trim()) return res.status(400).json({ error: 'full_name is required' });

  const sql = `
    INSERT INTO patients (
      full_name, social_name, gender, birth_date, profession, marital_status, nationality,
      cpf, insurance_id, insurance_card,
      cep, address_street, address_number, address_comp, address_district, address_city, address_state, address_country,
      email, phone_mobile, phone_landline,
      notes
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,
      $8,$9,$10,
      $11,$12,$13,$14,$15,$16,$17,$18,
      $19,$20, $21, 
      $22
    )
    RETURNING id, full_name, profession, cpf, phone_mobile, insurance_id
  `;

  const params = [
    b.full_name.trim(), n(b.social_name), n(b.gender), n(b.birth_date), n(b.profession), n(b.marital_status), n(b.nationality),
    n(b.cpf), n(b.insurance_id), n(b.insurance_card),
    n(b.cep), n(b.address_street), n(b.address_number), n(b.address_comp), n(b.address_district), n(b.address_city), n(b.address_state), n(b.address_country),
    n(b.email), n(b.phone_mobile), n(b.phone_landline),
    n(b.notes),
  ];

  const r = await pool.query(sql, params);
  res.status(201).json(r.rows[0]);
});

// ATUALIZAR (edição no modal)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const b = req.body || {};
  if (!b.full_name || !b.full_name.trim()) return res.status(400).json({ error: 'full_name is required' });

  const sql = `
    UPDATE patients SET
      full_name=$2, social_name=$3, gender=$4, birth_date=$5, profession=$6, marital_status=$7, nationality=$8,
      cpf=$9, insurance_id=$10, insurance_card=$11,
      cep=$12, address_street=$13, address_number=$14, address_comp=$15, address_district=$16, address_city=$17, address_state=$18, address_country=$19,
      email=$20, phone_mobile=$21, phone_landline=$22,
      notes=$23, updated_at=NOW()
    WHERE id=$1
    RETURNING id, full_name, profession, cpf, phone_mobile, insurance_id
  `;

  const params = [
    id,
    b.full_name.trim(), n(b.social_name), n(b.gender), n(b.birth_date), n(b.profession), n(b.marital_status), n(b.nationality),
    n(b.cpf), n(b.insurance_id), n(b.insurance_card),
    n(b.cep), n(b.address_street), n(b.address_number), n(b.address_comp), n(b.address_district), n(b.address_city), n(b.address_state), n(b.address_country),
    n(b.email), n(b.phone_mobile), n(b.phone_landline),
    n(b.notes),
  ];

  const r = await pool.query(sql, params);
  if (!r.rowCount) return res.status(404).json({ error: 'not found' });
  res.json(r.rows[0]);
});

// DELETE /api/patients/:id
router.delete('/:id', async (req,res)=>{
  const { id } = req.params;
  const r = await pool.query('DELETE FROM patients WHERE id=$1', [id]);
  if(!r.rowCount) return res.status(404).json({ error:'not found' });
  res.json({ ok:true });
});


export default router;
