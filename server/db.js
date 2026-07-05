//server/db.js
const mysql = require("mysql2");
require("dotenv").config();

// Connessione al database
const connection = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "sessa_aftersales"
});

// Connessione
connection.connect((err) => {
    if (err) {
        console.error("❌ Errore di connessione al database:", err.message);
        return;
    }

    console.log("✅ Connesso al database MySQL");
});

module.exports = connection;