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

exports.getRecentActivity=(req,res)=>{

    db.query(`
        SELECT
        id,
        codice,
        titolo,
        tipo,
        stato
        FROM tickets
        ORDER BY id DESC
        LIMIT 10
    `,(err,rows)=>{

        if(err) return res.status(500).json(err);

        res.json({

            recentTickets:rows,
            statusChanges:[]

        });

    });

};