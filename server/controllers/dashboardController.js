const db = require("../db");

console.log("DASHBOARD CONTROLLER CARICATO");

exports.getStats = (req,res)=>{

    db.query(`
        SELECT
        SUM(CASE WHEN stato<>'chiuso' THEN 1 ELSE 0 END) aperti,
        SUM(CASE WHEN stato='chiuso' THEN 1 ELSE 0 END) chiusi
        FROM tickets
    `,(err,rows)=>{

        if(err) return res.status(500).json(err);

        res.json({

            openClosed:rows[0],
            byStatus:[],
            byPriority:[],
            byTechnician:[],
            avgClosureTime:{tempo_medio_giorni:"-"},
            urgentUnassigned:0,
            damagedParts:[],
            responsibilities:[],
            byDealer:[],
            byMonth:[]

        });

    });

};

exports.getRecentActivity = (req, res) => {

    const sql = `
        SELECT

            t.id,
            t.codice,
            t.titolo,
            t.tipo,
            t.stato,
            t.created_at,

            COALESCE(u.nome, 'Cliente') AS cliente_nome,
COALESCE(u.cognome, '') AS cliente_cognome

        FROM tickets t

        LEFT JOIN users u
            ON u.id = t.cliente_id

        ORDER BY t.created_at DESC

        LIMIT 10
    `;

    db.query(sql, (err, rows) => {

        if (err) {
            console.error(err);
            return res.status(500).json(err);
        }

        res.json({

            recentTickets: rows,
            statusChanges: []

        });

    });

};