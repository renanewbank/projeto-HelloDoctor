// carregue .env antes de qualquer uso de process.env
import 'dotenv/config';

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import expressEjsLayouts from 'express-ejs-layouts';

// importe o pool só depois do dotenv
import { pool } from './db.js';

import patientsRoutes from './routes/patients.js';
import insurancesRoutes from './routes/insurances.js';
import appointmentsRoutes from './routes/appointments.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('view engine', 'ejs');
app.use(expressEjsLayouts);
app.set('layout', 'layout');                 // usa views/layout.ejs
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());                     // opcional, útil pra APIs/JS
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  next();
});


app.get('/', (req, res) => res.redirect('/agenda/day'));

app.use('/patients', patientsRoutes);
app.use('/insurances', insurancesRoutes);
app.use('/appointments', appointmentsRoutes);

// atalhos para agenda
app.get('/agenda/day', (req, res) => res.redirect('/appointments/day'));
app.get('/agenda/week', (req, res) => res.redirect('/appointments/week'));



const PORT = process.env.PORT || 3000;

// teste rápido da conexão (mostra erro detalhado no boot)
pool.query('SELECT 1')
  .then(() => console.log('DB ok'))
  .catch(err => {
    console.error('DB fail', err);
    // opcional: process.exit(1);
  });

app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
