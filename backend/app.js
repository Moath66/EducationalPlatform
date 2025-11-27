const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middlewares
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug (مهم جداً لتتبع المشكلة في Render)
app.use((req, res, next) => {
  console.log("📩 NEW REQUEST:", req.method, req.url);
  console.log("📦 BODY:", req.body);
  next();
});

// Routes
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

const attendanceRoutes = require("./routes/attendanceRoutes");
app.use("/api/attendance", attendanceRoutes);

// Test
app.get("/", (req, res) => {
  res.send("API Working ✔");
});

module.exports = app;
