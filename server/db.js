const mysql = require('mysql2');

// Connessione al database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'sessa_aftersales'
});

// Connessione
connection.connect((err) => {
    if (err) {
        console.error('❌ Errore di connessione al database:', err.message);
        return;
    }

    console.log('✅ Connesso al database MySQL');
});

module.exports = connection;