# 🚤 SESSA After Sales Management System

Sistema di gestione dell'assistenza post-vendita sviluppato come progetto universitario, ispirato ad un caso reale del settore nautico.

Il progetto implementa un sistema di ticketing per la gestione delle richieste di assistenza in garanzia (Warranty Request - WIR) e delle richieste di ricambi (Spare Parts Request - SPR), con gestione di utenti, ruoli e workflow operativo.

---

# Obiettivi del Progetto

L'applicazione permette di:

- gestire richieste di assistenza post-vendita;
- aprire e monitorare ticket;
- distinguere ticket di garanzia e ricambi;
- gestire utenti e ruoli;
- monitorare lo stato di avanzamento dei ticket;
- visualizzare una dashboard riepilogativa.

---

# Tipologie di Ticket

## Warranty Request (WIR)

Richiesta di intervento in garanzia.

Informazioni gestite:

- Parte danneggiata
- Tipologia del danno
- Causa
- Responsabilità
- Soluzione proposta

---

## Spare Parts Request (SPR)

Richiesta di ricambi.

Informazioni gestite:

- Codice articolo
- Descrizione
- Quantità
- Costo
- Tempi di consegna

---

# Ruoli del Sistema

| Ruolo | Permessi principali |
|--------|---------------------|
| Cliente / Dealer | Apertura e consultazione ticket |
| After Sales | Gestione ticket e aggiornamento stati |
| Tecnico | Consultazione ticket assegnati e inserimento note |
| Amministratore | Gestione completa del sistema |

---

# Funzionalità

## Gestione Ticket

- Creazione ticket
- Visualizzazione ticket
- Modifica ticket
- Chiusura ticket

## Gestione Utenti

- Login
- Autenticazione
- Gestione ruoli

## Dashboard

- Stato generale dei ticket
- Visualizzazione riepilogativa
- Statistiche principali

---

# Tecnologie Utilizzate

| Componente | Tecnologia |
|------------|------------|
| Frontend | HTML5, CSS3, JavaScript |
| Backend | Node.js + Express.js |
| Database | MySQL |
| API | REST |

---

# Struttura del Progetto

```text
AfterSales-Ticketing-System
│
├── client/
│   ├── css/
│   ├── js/
│   └── *.html
│
├── server/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── app.js
│   └── db.js
│
├── database/
│   ├── schema.sql
│   └── seed.sql
│
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

---

# Installazione

## Prerequisiti

- Node.js 18+
- MySQL 8+

## Installazione

```bash
npm install
```

## Configurazione Database

Creare un database MySQL ed eseguire:

```text
database/schema.sql
database/seed.sql
```

## Configurazione del file .env

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=sessa_aftersales
PORT=3001
```

---

# Avvio del Progetto

```bash
npm start
```

oppure

```bash
node server/app.js
```

Il server sarà disponibile su:

```text
http://localhost:3001
```

---

# Database

Il database comprende le principali entità del sistema:

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

Lo schema completo è disponibile nel file:

```text
database/schema.sql
```
---
# Autore

**Morena Tirana**
Progetto universitario sviluppato per il corso di Tecnologie Web.