const express=require("express");
const cors=require("cors");
const path=require("path");

const app=express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname,"../client")));

const authRoutes=require("./routes/authRoutes");
const userRoutes=require("./routes/userRoutes");
const customerRoutes=require("./routes/customerRoutes");
const ticketRoutes=require("./routes/ticketRoutes");
const dashboardRoutes=require("./routes/dashboard");

app.use("/api",authRoutes);
app.use("/api/users",userRoutes);
app.use("/api/customers",customerRoutes);
app.use("/api/tickets",ticketRoutes);
app.use("/api/dashboard",dashboardRoutes);

app.get("/",(req,res)=>{
    res.sendFile(path.join(__dirname,"../client/login.html"));
});

app.listen(3001,()=>{
    console.log("SERVER OK");
});