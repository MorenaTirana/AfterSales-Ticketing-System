//server/controllers/customerController.js

const db = require("../db");

// Tutti i clienti
exports.getCustomers = (req, res) => {

    const sql = `
        SELECT
            id,
            nome,
            cognome,
            email,
            telefono
        FROM users
        WHERE role='customer'
        ORDER BY cognome,nome
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.error(err);
            return res.status(500).json(err);
        }

        res.json(results);

    });

};