//server/routes/customerRoutes.js
const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.json([
        {
            id: 1,
            nome: "Mario"
        }
    ]);
});

module.exports = router;