const express = require("express");

const router = express.Router();

const controller = require("../controllers/dashboardController");

router.get("/stats", controller.getStats);
router.get("/recent-activity", controller.getRecentActivity);

module.exports = router;