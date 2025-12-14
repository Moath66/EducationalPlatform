// backend/models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: {
      type: String,
      required: true,
      unique: true, // يبقى موجود
      lowercase: true,
      trim: true,
    },

    phone: { type: String },
    grade: { type: String },

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
        return this.role === "admin" ? true : false;
      },
    },
  },
  { timestamps: true }
);

// ✅ تأكيد Unique Index على الإيميل (الأهم لضمان عدم التكرار في DB)
userSchema.index({ email: 1 }, { unique: true });

// ✅ اختياري: ضمان lowercase حتى لو جاء من controller بحروف كبيرة
userSchema.pre("save", function (next) {
  if (this.email) this.email = this.email.toLowerCase().trim();
  next();
});

module.exports = mongoose.model("User", userSchema);
