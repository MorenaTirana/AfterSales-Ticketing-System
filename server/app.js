const express = require("express");
const cors =require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname,"../client")));

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const customerRoutes = require("./routes/customerRoutes");
const ticketRoutes = require("./routes/ticketRoutes");

app.use("/api",authRoutes);
app.use("/api/users",userRoutes);
app.use("/api/customers",customerRoutes);
app.use("/api/tickets",ticketRoutes);

app.get("/",(req,res)=>{
    res.sendFile(path.join(__dirname,"../client/login.html"));
});

const PORT=3001;

app.listen(PORT,()=>{
    console.log("Server avviato su http://localhost:"+PORT);
});