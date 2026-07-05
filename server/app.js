const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

// Database
require("./db");

// =========================
// Middleware
// =========================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));

// Cartella upload
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Frontend
app.use(express.static(path.join(__dirname, "../client")));

// =========================
// Routes
// =========================

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/customers", require("./routes/customerRoutes"));
app.use("/api/tickets", require("./routes/ticketRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/assignments", require("./routes/assignmentRoutes"));
app.use("/api/comments", require("./routes/commentRoutes"));
app.use("/api/attachments", require("./routes/attachmentRoutes"));

// =========================
// Home
// =========================

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/index.html"));
});

// =========================
// 404
// =========================

app.use((req, res) => {

    res.status(404).json({

        success: false,
        message: "Endpoint non trovato"

    });

});

// =========================
// Server
// =========================

app.listen(PORT, () => {

    console.log("====================================");
    console.log("SESSA After Sales Management System");
    console.log("Server avviato");
    console.log("Porta:", PORT);
    console.log("====================================");

});