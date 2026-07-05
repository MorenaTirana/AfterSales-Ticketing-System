const db=require("../db");

exports.login=(req,res)=>{

    const {email,password}=req.body;

    const sql=`
    SELECT
        id,
        nome,
        cognome,
        email,
        role
    FROM users
    WHERE email=?
    AND password_hash=?
    LIMIT 1
    `;

    db.query(sql,[email,password],(err,rows)=>{

        if(err){

            console.log(err);

            return res.status(500).json({
                success:false,
                message:"Errore database"
            });

        }

        if(rows.length===0){

            return res.status(401).json({

                success:false,
                message:"Email o password errati"

            });

        }

        res.json({

            success:true,
            user:rows[0]

        });

    });

};