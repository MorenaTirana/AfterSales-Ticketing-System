const db = require("../db");

// ============================
// Tutti i ticket
// ============================

exports.getTickets = (req, res) => {

    const sql = `
        SELECT

            t.id,
            t.codice,
            t.titolo,
            t.tipo,
            t.priorita,
            t.stato,
            t.created_at,

            u.nome,
            u.cognome,

            b.modello

        FROM tickets t

        LEFT JOIN users u
            ON t.cliente_id = u.id

        LEFT JOIN boats b
            ON t.boat_id = b.id

        ORDER BY t.created_at DESC
    `;

    db.query(sql,(err,result)=>{

        if(err){
            console.error(err);
            return res.status(500).json(err);
        }

        res.json(result);

    });

};


// ============================
// Get ticket
// ============================
exports.getTicket = (req, res) => {

    db.query(
        "SELECT * FROM tickets WHERE id=?",
        [req.params.id],
        (err, result) => {

            if (err) {
                return res.status(500).json(err);
            }

            if (result.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Ticket non trovato"
                });
            }

            res.json(result[0]);

        }
    );

};


// ============================
// Create ticket
// ============================
exports.createTicket=(req,res)=>{

    const{

        codice,
        titolo,
        descrizione,
        tipo,
        priorita,
        stato,
        cliente_id,
        boat_id,
        dealer_id

    }=req.body;

    const sql=`

        INSERT INTO tickets

        (

            codice,
            titolo,
            descrizione,
            tipo,
            priorita,
            stato,
            cliente_id,
            boat_id,
            dealer_id

        )

        VALUES (?,?,?,?,?,?,?,?,?)

    `;
    if (!codice || !titolo || !descrizione || !tipo || !cliente_id) {

    return res.status(400).json({

        success:false,

        message:"Compilare tutti i campi obbligatori"

    });

}

    db.query(

        sql,

        [

            codice,
            titolo,
            descrizione,
            tipo,
            priorita,
            stato,
            cliente_id,
            boat_id,
            dealer_id

        ],

        (err,result)=>{

            if(err)
                return res.status(500).json(err);

            res.json({

                success:true,
                id:result.insertId

            });

        }

    );

};

// ============================
// Update ticket
// ============================
exports.updateTicket=(req,res)=>{

    const{

        titolo,
        descrizione,
        priorita,
        stato

    }=req.body;

    db.query(

        `

        UPDATE tickets

        SET

            titolo=?,
            descrizione=?,
            priorita=?,
            stato=?

        WHERE id=?

        `,

        [

            titolo,
            descrizione,
            priorita,
            stato,
            req.params.id

        ],

        (err, result) => {

    if (err) {
        return res.status(500).json(err);
    }

    if (result.affectedRows === 0) {
        return res.status(404).json({
            success: false,
            message: "Ticket non trovato"
        });
    }

    res.json({
        success: true,
        message: "Ticket aggiornato"
    });

}

    );

};

// ============================
// Delete ticket
// ============================
exports.deleteTicket=(req,res)=>{

    db.query(

        "DELETE FROM tickets WHERE id=?",

        [req.params.id],

       (err, result) => {

    if (err) {
        return res.status(500).json(err);
    }

    if (result.affectedRows === 0) {
        return res.status(404).json({
            success: false,
            message: "Ticket non trovato"
        });
    }

    res.json({
        success: true,
        message: "Ticket eliminato"
    });

}

    );

};