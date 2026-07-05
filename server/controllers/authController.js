const db = require("../db");

exports.login = async (req, res) => {

    try {

        const { email, password } = req.body;

        console.log("LOGIN:", email);

        const sql = `
            SELECT id,
                   nome,
                   cognome,
                   email,
                   role
            FROM users
            WHERE email = ?
            AND password_hash = ?
            LIMIT 1
        `;

        const [rows] = await db.query(sql, [email, password]);

        console.log(rows);

        if (rows.length === 0) {

            return res.status(401).json({
                success: false,
                message: "Email o password errati"
            });

        }

        return res.json({
            success: true,
            user: rows[0]
        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            success: false,
            message: err.message
        });

    }

};