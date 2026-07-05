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

- parte danneggiata
- tipologia del danno
- causa
- responsabilità
- soluzione proposta

---

## Spare Parts Request (SPR)

Richiesta di ricambi.

Informazioni gestite:

- codice articolo
- descrizione
- quantità
- costo
- tempi di consegna

---

# Ruoli del Sistema

| Ruolo | Permessi principali |
|--------|---------------------|
| Cliente / Dealer | Apertura e consultazione ticket |
| After Sales | Gestione ticket e aggiornamento stati |
| Tecnico | Consultazione ticket assegnati e note tecniche |
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

- Visualizzazione dati riepilogativi
- Stato generale dei ticket
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
SESSA-MARINE-SYSTEM
│
├── client/
│   ├── css/
│   ├── js/
│   ├── *.html
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
├── README.md
└── .gitignore
```

---

# Installazione

## Prerequisiti

- Node.js 18 o superiore
- MySQL 8 o superiore

## Installazione dipendenze

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

Il server sarà disponibile all'indirizzo:

```text
http://localhost:3001
```

---

# Database

Il database contiene le principali entità del sistema:

- Users
- Customers
- Tickets
- Warranty Requests
- Spare Parts Requests

Lo schema completo è disponibile nel file:

```text
database/schema.sql
```
