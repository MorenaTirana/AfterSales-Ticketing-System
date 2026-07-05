// server/db.js

const mysql = require("mysql2/promise");
require("dotenv").config();

console.log("ENV letto:", process.env.DB_NAME);
console.log("Directory:", process.cwd());

const pool = mysql.createPool({

    host: process.env.DB_HOST || "localhost",

    user: process.env.DB_USER || "root",

    password: process.env.DB_PASSWORD || "",

    database: process.env.DB_NAME || "sessa_aftersales",

    port: process.env.DB_PORT || 3306,

    waitForConnections: true,

    connectionLimit: 10,

    queueLimit: 0,

    multipleStatements: false

});

// Test connessione
(async () => {

    try {

        const connection = await pool.getConnection();

        console.log("==================================");
        console.log("✅ MySQL connesso correttamente");
        console.log("Database:", process.env.DB_NAME || "sessa_after_sales");
        console.log("==================================");

        connection.release();

    } catch (err) {

        console.error("==================================");
        console.error("❌ Errore connessione MySQL");
        console.error(err.message);
        console.error("==================================");

    }

})();

module.exports = pool;