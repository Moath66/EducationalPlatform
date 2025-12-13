const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    // General
    platformName: { type: String, default: "المنصة التعليمية" },
    platformDescription: { type: String, default: "" },
    logoUrl: { type: String, default: "" },
    faviconUrl: { type: String, default: "" },

    // Contact
    contactEmail: { type: String, default: "contact@example.com" },
    phoneOrWhatsapp: { type: String, default: "" },

    // Appearance
    primaryColor: { type: String, default: "#2563eb" }, // hex
    darkMode: { type: Boolean, default: false },

    // Language
    language: { type: String, enum: ["ar", "en"], default: "ar" },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Setting", settingSchema);
