//README.md

# 🚤 SESSA After Sales Management System

Sistema di gestione dell'assistenza post-vendita sviluppato come progetto universitario per il corso di **Tecnologie Informatiche per il Web**.

Il progetto prende ispirazione da un caso reale del settore nautico e implementa una piattaforma di Ticketing / Helpdesk dedicata alla gestione dell'assistenza post-vendita.

---

# 📖 Descrizione

L'applicazione consente di gestire:

- Warranty Request (WIR)
- Spare Parts Request (SPR)
- Clienti
- Dealer
- Imbarcazioni
- Ticket
- Assegnazione tecnici
- Storico stati
- Documenti
- Dashboard statistiche

Il sistema è sviluppato utilizzando un'architettura Client/Server con database MySQL.

---

# 👥 Ruoli del sistema

| Ruolo | Funzioni |
|--------|----------|
| Cliente / Dealer | Apertura ticket, consultazione ticket, commenti |
| After Sales | Gestione ticket, assegnazione tecnici, modifica stati |
| Tecnico | Visualizzazione ticket assegnati, inserimento note |
| Amministratore | Gestione completa del sistema |

---

# 📌 Funzionalità implementate

## Gestione Ticket

- Creazione ticket
- Modifica ticket
- Chiusura ticket
- Visualizzazione dettaglio
- Storico stati

## Warranty Request (WIR)

- Parte danneggiata
- Causa
- Responsabilità
- Soluzione

## Spare Parts Request (SPR)

- Codice articolo
- Descrizione
- Quantità
- Costo
- Tempi di consegna

## Gestione Anagrafiche

- Clienti
- Dealer
- Imbarcazioni

## Dashboard

- Ticket aperti
- Ticket chiusi
- Ticket in lavorazione
- Statistiche principali

---

# 🛠 Tecnologie utilizzate

| Componente | Tecnologia |
|------------|------------|
| Frontend | HTML5 |
| Stile | CSS3 |
| Client | JavaScript |
| Backend | Node.js |
| Framework | Express.js |
| Database | MySQL |
| API | REST |

---

# 📂 Struttura del progetto

```text
SESSA MARINE SYSTEM
│
├── client/
│   ├── css/
│   ├── images/
│   ├── js/
│   ├── login.html
│   ├── dashboard.html
│   ├── tickets.html
│   ├── ticket-detail.html
│   ├── new-ticket.html
│   ├── clienti.html
│   ├── dealer.html
│   ├── barche.html
│   ├── wir.html
│   ├── spr.html
│   ├── statistiche.html
│   ├── documenti.html
│   ├── trasferte.html
│   └── impostazioni.html
│
├── server/
│   ├── controllers/
│   ├── routes/
│   ├── app.js
│   └── db.js
│
├── database/
│   ├── schema.sql
│   └── seed.sql
│
├── docs/
│
├── package.json
├── package-lock.json
├── .gitignore
├── .env.example
└── README.md
```

---

# ⚙ Installazione

## Requisiti

- Node.js 18+
- MySQL 8+

---

## Installazione dipendenze

```bash
npm install
```

---

## Configurazione Database

Creare un database MySQL.

Successivamente eseguire:

```text
database/schema.sql
database/seed.sql
```

---

## Configurazione ambiente

Creare un file `.env` partendo da `.env.example`

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=sessa_aftersales
PORT=3001
```

---

# ▶ Avvio del progetto

```bash
npm start
```

oppure

```bash
node server/app.js
```

Server:

```
http://localhost:3001
```

---

# 🗄 Database

Il database comprende:

- Users
- Dealers
- Boats
- Tickets
- Warranty Details
- Spare Parts Details
- Assignments
- Ticket Comments
- Attachments
- Status History
- Documents
- Transfers

Schema disponibile in:

```
database/schema.sql
```

---

# 🔑 Credenziali di test

## Admin

```
email: admin@sessamarine.com
password: admin123
```

## After Sales

```
email: francesco@sessamarine.com
password: password
```

## Tecnico

```
email: maria@sessamarine.com
password: password
```

## Cliente

```
email: mario@email.com
password: password
```

---

# 📷 Screenshot

Nella cartella **docs/** sono disponibili alcuni screenshot dell'applicazione.

- Login
- Dashboard
- Lista Ticket
- Database

---

# 🎓 Livello del progetto

Il progetto implementa i requisiti del:

✅ Livello 1

✅ Livello 2

Estensioni realizzate:

- adattamento al settore nautico
- Warranty Request
- Spare Parts Request
- gestione Dealer
- gestione Imbarcazioni
- dashboard statistiche
- storico ticket
- documenti
- trasferte

---

# 👩‍💻 Autore

**Morena Tirana**

Corso di Tecnologie Informatiche per il Web
