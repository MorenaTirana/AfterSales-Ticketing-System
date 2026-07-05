//server/routes/ticketRoutes.js

const express = require("express");

const router = express.Router();

const controller = require("../controllers/ticketController");

// Lista ticket
router.get("/", controller.getTickets);

// Barche
router.get("/boats", controller.getUserBoats);

// Storico
router.get("/:id/history", controller.getTicketHistory);

// Dettaglio ticket
router.get("/:id", controller.getTicketById);

// Creazione
router.post("/", controller.createTicket);

// Aggiornamento
router.put("/:id", controller.updateTicket);

// Cambio stato
router.patch("/:id/status", controller.updateTicketStatus);

// Eliminazione
router.delete("/:id", controller.deleteTicket);

module.exports = router;