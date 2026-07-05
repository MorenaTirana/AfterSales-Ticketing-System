const express = require("express");
const cors = require("cors");
const path = require("path");

const db = require("./db");

const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const customerRoutes = require("./routes/customerRoutes");
const ticketRoutes = require("./routes/ticketRoutes");

const app = express();
const PORT = 3001;

// ===========================
// Middleware
// ===========================

app.use(cors());
app.use(express.json());

// ===========================
// Frontend
// ===========================

app.use(express.static(path.join(__dirname, "../client")));

// ===========================
// API
// ===========================

app.use("/api", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/customers", customerRoutes);

app.use("/api/tickets", ticketRoutes);

// ===========================
// Home
// ===========================

app.get("/", (req, res) => {
    res.redirect("/login.html");
});

// ===========================
// Start
// ===========================

app.listen(PORT, () => {
    console.log(`Server avviato su http://localhost:${PORT}`);
});