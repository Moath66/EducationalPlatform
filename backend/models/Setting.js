import mongoose from "mongoose";

const settingSchema = new mongoose.Schema(
  {
    platformName: { type: String, default: "المنصة التعليمية" },
    contactEmail: { type: String, default: "contact@example.com" },

    // للشعار لاحقًا (رابط)
    logoUrl: { type: String, default: "" },

    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

const Setting = mongoose.model("Setting", settingSchema);
export default Setting;
