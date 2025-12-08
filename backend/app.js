const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middlewares
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.options("/*", cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug (مهم جداً لتتبع المشكلة في Render)
app.use((req, res, next) => {
  console.log("📩 NEW REQUEST:", req.method, req.url);
  const ct = req.headers["content-type"] || "";
  if (!ct.includes("multipart/form-data")) {
    console.log("📦 BODY:", req.body);
  } else {
    console.log("📦 BODY: multipart/form-data (skipped logging)");
  }
  next();
});

// Routes
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

const attendanceRoutes = require("./routes/attendanceRoutes");
app.use("/api/attendance", attendanceRoutes);

const studyFileRoutes = require("./routes/studyFileRoutes");
app.use("/api/study-files", studyFileRoutes);

// Static Files

app.use("/uploads", express.static("uploads"));

// Test
app.get("/", (req, res) => {
  res.send("API Working ✔");
});

module.exports = app;
