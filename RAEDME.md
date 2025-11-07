# HelloDoctor

Protótipo funcional (MVP) de um sistema de consultório médico focado em **Agenda**, **Prontuários** e **Convênios**.
Stack simples: **Node.js + Express + EJS + PostgreSQL** (HTML/CSS/JS puros).

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

* [x] 1.1 Registrar novo prontuário
* [x] 1.2 Acessar o prontuário criado
* [x] 1.3 Alterar **nome** e **profissão**

**Segundo teste**

* [x] 2.1 Cadastrar convênio fictício
* [x] 2.2 Atualizar prontuário para usar esse convênio

**Terceiro teste**

* [x] 3.1 Criar agendamento para um paciente
* [x] 3.2 Remarcar para o mês seguinte (data/hora)
* [x] 3.3 Encontrar o agendamento no calendário

---

## Tecnologias

* **Backend:** Node.js, Express, `pg`
* **Views:** EJS + `express-ejs-layouts`
* **Banco:** PostgreSQL
* **Estilo:** CSS puro (`public/style.css`)

---

## Estrutura do projeto

```
hellodoctor/
  public/
    style.css
  src/
    app.js
    db.js
    routes/
      patients.js
      insurances.js
      appointments.js
    views/
      layout.ejs
      patients/
        index.ejs
        show.ejs
      insurances/
        index.ejs
      agenda/
        day.ejs
        week.ejs
  .env.example
  package.json
```

---

## Modelagem (mínima)

**patients**

* `id` (BIGSERIAL, PK) — usado como Nº do prontuário
* `full_name`, `profession?`, `cpf?` (UNIQUE), `phone_mobile?`, `insurance_id?` (FK → `insurances.id`)
* campos opcionais de endereço/contato e `notes`
* `created_at`, `updated_at` (TIMESTAMPTZ)

**insurances**

* `id` (BIGSERIAL, PK)
* `name` (NOT NULL), `ans_code?`, `phone?`, `email?`, `site?`, `ch_value?`, `notes?`
* `created_at`, `updated_at`

**appointments**

* `id` (BIGSERIAL, PK)
* `patient_id` (FK), `insurance_id?` (FK)
* `appointment_type` (`PRIMEIRA_VEZ` | `RETORNO`)
* `status` (`MARCADO` | `CANCELADO` | `CONCLUIDO`)
* `starts_at` (**TIMESTAMP sem timezone — horário local como digitado**)
* `value_amount?`, `notes?`
* `created_at`, `updated_at`

> **Importante (horário):** por decisão do MVP, não há fuso/horário de verão.
> Salvamos **exatamente** o que é digitado: `10:00` entra → `10:00` é armazenado/exibido.

---

## Configuração

### 1) Banco de dados

Crie o banco e as tabelas (script de schema já aplicado; se precisar, execute o SQL correspondente na sua instância `hellodoctor`).
Certifique-se de que consegue conectar com seu usuário:

```sql
\c hellodoctor
SELECT 1;
```

### 2) Variáveis de ambiente

Copie o exemplo e edite:

```bash
cp .env.example .env
```

Use **um** dos modos abaixo:

**a) Campos separados (recomendado local):**

```
PGHOST=localhost
PGPORT=5432
PGDATABASE=hellodoctor
PGUSER=seu_usuario
# PGPASSWORD=        # deixe vazio ou remova se não usa senha
PGSSL=false
PORT=3000
```

**b) DATABASE_URL (opcional):**

```
DATABASE_URL=postgres://usuario:senha@localhost:5432/hellodoctor
PGSSL=false
PORT=3000
```

### 3) Instalar e iniciar

```bash
npm install
npm run dev     # com --watch
# ou npm start
# abra http://localhost:3000
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

* Modal de “Nova consulta” e “Novo convênio” (UX 1:1 com Figma)
* Validações e máscaras (CPF/telefone)
* Paginação nas listas
* Cancelar/Concluir consulta
* Exportar/Imprimir agenda do dia
* Autenticação e perfis (Secretária / Médico)

---

## Grupo

* Flavia Silva
* Pamella Lopes
* Renan Ewbakn