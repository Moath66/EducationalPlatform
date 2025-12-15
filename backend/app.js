// backend/app.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middlewares
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug (خليه مؤقتًا)
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
app.use("/api/courses", require("./routes/courseRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/attendance", require("./routes/attendanceRoutes"));
app.use("/api/study-files", require("./routes/studyFileRoutes"));
app.use("/api/sessions", require("./routes/sessionRoutes"));
app.use("/api/profile", require("./routes/profileRoutes"));
app.use("/api/settings", require("./routes/settingRoutes"));
app.use("/api/lessons", require("./routes/lessonRoutes"));
app.use("/api/assignments", require("./routes/assignmentRoutes"));
app.use("/api/submissions", require("./routes/submissionRoutes"));
app.use("/api/uploads", require("./routes/uploadRoutes"));

app.use("/uploads", express.static("uploads"));

// Test
app.get("/", (req, res) => res.send("API Working ✔"));

// ✅ Not Found
app.use((req, res) => {
  return res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    payload: null,
  });
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 Global error:", err);

  // ✅ Multer errors
  if (err?.name === "MulterError") {
    return res.status(400).json({
      message: err.message || "Multer error",
      payload: null,
    });
  }

  // ✅ fileFilter custom errors
  if (err?.message && String(err.message).includes("نوع الملف غير مدعوم")) {
    return res.status(400).json({ message: err.message, payload: null });
  }

  const status = err.statusCode || 500;
  return res.status(status).json({
    message: err.message || "Internal Server Error",
    payload: null,
  });
});

module.exports = app;
