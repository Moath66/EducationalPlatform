// backend/models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: { type: String, default: "" },
    grade: { type: String, default: "" },

    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["student", "teacher", "admin"],
      default: "student",
      index: true,
    },

    isApproved: {
      type: Boolean,
      default: function () {
        return this.role === "admin";
      },
    },
  },
  { timestamps: true }
);

// ✅ Hook بدون next (أكثر أمانًا ويمنع next is not a function)
userSchema.pre("save", function () {
  if (this.email) this.email = String(this.email).toLowerCase().trim();
});

module.exports = mongoose.model("User", userSchema);
