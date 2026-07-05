//server/controllers/authController.js

const db = require('../db');

exports.login = (req, res) => {

    const { email, password } = req.body;

    const sql = `
        SELECT id, nome, cognome, email, role
        FROM users
        WHERE email = ?
        AND password_hash = ?
        LIMIT 1
    `;

    db.query(sql, [email, password], (err, results) => {

        if (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: "Errore del server"
            });
        }

        if (results.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Email o password non corretti"
            });
        }

        res.json({
            success: true,
            user: results[0]
        });

    });

};