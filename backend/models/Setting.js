const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    platformName: { type: String, default: "المنصة التعليمية" },
    contactEmail: { type: String, default: "contact@example.com" },
    logoUrl: { type: String, default: "" },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Setting", settingSchema);
