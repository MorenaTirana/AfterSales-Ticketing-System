//server/controllers/userController.js

const db = require('../db');

exports.getUsers = (req, res) => {

    db.query('SELECT * FROM users', (err, results) => {

        if (err) {
            console.error(err);
            return res.status(500).json(err);
        }

        res.json(results);

    });

};