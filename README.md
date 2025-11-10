# HelloDoctor

Protótipo funcional (MVP) de um sistema de consultório médico focado em **Agenda**, **Prontuários** e **Convênios**.
Stack simples: **Node.js + Express + HTML/CSS/JS + PostgreSQL** .

## Funcionalidades (MVP)

* **Prontuários**

  * Criar paciente (prontuário) e listar/buscar por **nome / telefone / CPF**
  * Editar dados básicos: **nome**, **profissão** e **convênio**
* **Convênios**

  * Cadastrar novo convênio e listar todos
* **Agenda**

  * Visualização **diária** e **semanal**
  * Criar **consulta** (Primeira vez/Retorno)
  * **Remarcar** (alterar data/horário)
  * Filtrar por dia/semana

### Critérios de teste (checklist)

**Primeiro teste**

* [X] 1.1 Registrar novo prontuário
* [X] 1.2 Acessar o prontuário criado
* [X] 1.3 Alterar **nome** e **profissão**

**Segundo teste**

* [X] 2.1 Cadastrar convênio fictício
* [X] 2.2 Atualizar prontuário para usar esse convênio

**Terceiro teste**

* [X] 3.1 Criar agendamento para um paciente
* [X] 3.2 Remarcar para o mês seguinte (data/hora)
* [X] 3.3 Encontrar o agendamento no calendário

---

## Tecnologias

* **Backend:** Node.js, Express, `pg`
* **Frontend:** HTML, CSS, JavaScript
* **Banco:** PostgreSQL

---

## Estrutura do projeto

```
hellodoctor/
  public/
    styles.css
    insurances.html
    patients.html
    agenda.html
  src/
    app.js
    db.js
    routes/
      api/
        patients.js
        insurances.js
        appointments.js
  .env.example
  package.json
```
---

## Rotas principais

* **Prontuários**

  * `GET /patients` — lista e busca (`?q=...`)
  * `POST /patients` — cria (nome, profissão, cpf, telefone, convênio)
  * `GET /patients/:id` — detalhe
  * `POST /patients/:id` — atualiza (nome, profissão, convênio)

* **Convênios**

  * `GET /insurances` — lista
  * `POST /insurances` — cria

* **Agenda**

  * `GET /appointments/day?date=YYYY-MM-DD` — agenda do dia
  * `GET /appointments/week?start=YYYY-MM-DD` — agenda semanal
  * `POST /appointments` — cria consulta (date, time, patient_id, appointment_type, insurance_id?)
  * `POST /appointments/:id/reschedule` — remarcar (date, time)

---

## Uso rápido (GUI)

1. **Convênios:** `Convênios` → preencha o formulário “Criar convênio”.
2. **Prontuários:** `Prontuários` → “Novo prontuário” → clique no nome para editar (nome/profissão/convênio).
3. **Agenda (Dia):** `Agenda` → escolha a data → “Nova consulta” → lista do dia → **Remarcar** pelo formulário inline.
4. **Agenda (Semana):** `Agenda (Semana)` para conferir o agendamento remarcado.

---

## Scripts npm

* `npm run dev` — inicia com reload automático
* `npm start` — inicia em modo normal

---

## Roadmap (próximos incrementos)
 
* Validações e máscaras (CPF/telefone)
* Paginação nas listas
* Cancelar/Concluir consulta
* Exportar/Imprimir agenda do dia
* Autenticação e perfis (Secretária / Médico)

---

## Grupo

* Flavia Silva
* Pamella Lopes
* Renan Ewbank
* Renan Ewbakn
