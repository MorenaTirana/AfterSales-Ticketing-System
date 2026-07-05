// server/app.js

const express = require("express");
const cors = require("cors");
const path = require("path");

// Carica il file .env se presente
require("dotenv").config();

const db = require("./db");

const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const customerRoutes = require("./routes/customerRoutes");
const ticketRoutes = require("./routes/ticketRoutes");

const app = express();

// Porta del server
const PORT = process.env.PORT || 3001;

// ===================================
// Middleware
// ===================================

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===================================
// Frontend
// ===================================

app.use(express.static(path.join(__dirname, "../client")));

// ===================================
// API
// ===================================

app.use("/api", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/tickets", ticketRoutes);

// ===================================
// Home
// ===================================

app.get("/", (req, res) => {
    res.redirect("/login.html");
});

// ===================================
// Gestione Errori
// ===================================

app.use((err, req, res, next) => {
    console.error(err);

    res.status(500).json({
        success: false,
        message: "Errore interno del server."
    });
});

// ===================================
// Avvio Server
// ===================================

app.listen(PORT, () => {
    console.log("SESSA After Sales Management System");
    console.log(`Server avviato su: http://localhost:${PORT}`);
    console.log(`Ambiente: ${process.env.NODE_ENV || "development"}`);
});

module.exports = app;