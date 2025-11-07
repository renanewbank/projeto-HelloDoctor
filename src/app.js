import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import apiInsurances from './routes/api/insurances.js';
import apiPatients from './routes/api/patients.js';
import apiAppointments from './routes/api/appointments.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app = express();

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// estáticos
app.use(express.static(path.join(__dirname, '..', 'public')));

// APIs JSON
app.use('/api/insurances', apiInsurances);
app.use('/api/patients',   apiPatients);
app.use('/api/appointments', apiAppointments);

// páginas (HTML)
app.get('/',            (req,res)=>res.sendFile(path.join(__dirname, '..', 'public', 'patients.html')));
app.get('/insurances',  (req,res)=>res.sendFile(path.join(__dirname, '..', 'public', 'insurances.html')));
app.get('/patients',    (req,res)=>res.sendFile(path.join(__dirname, '..', 'public', 'patients.html')));
app.get('/agenda-day',  (req,res)=>res.sendFile(path.join(__dirname, '..', 'public', 'agenda-day.html')));
app.get('/agenda-week', (req,res)=>res.sendFile(path.join(__dirname, '..', 'public', 'agenda-week.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
