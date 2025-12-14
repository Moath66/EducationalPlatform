// backend/models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: {
      type: String,
      required: true,
      unique: true, // ✅ يكفي هذا لوحده
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

// ✅ ضمان lowercase حتى لو جاء بحروف كبيرة
userSchema.pre("save", function (next) {
  if (this.email) this.email = this.email.toLowerCase().trim();
  next();
});

module.exports = mongoose.model("User", userSchema);
