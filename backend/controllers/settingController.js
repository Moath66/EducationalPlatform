const Setting = require("../models/Setting");

// GET /api/settings
const getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();

    // Singleton: وثيقة واحدة فقط
    if (!settings) {
      settings = await Setting.create({});
    }

    return res.json(settings);
  } catch (err) {
    console.error("❌ getSettings error:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

// PUT /api/settings
const updateSettings = async (req, res) => {
  try {
    const {
      platformName,
      platformDescription,
      contactEmail,
      logoUrl,
      faviconUrl,
      phoneOrWhatsapp,
      primaryColor,
      darkMode,
    } = req.body;

    let settings = await Setting.findOne();
    if (!settings) settings = await Setting.create({});

    if (typeof platformName === "string")
      settings.platformName = platformName.trim();
    if (typeof platformDescription === "string")
      settings.platformDescription = platformDescription.trim();
    if (typeof contactEmail === "string")
      settings.contactEmail = contactEmail.trim();
    if (typeof phoneOrWhatsapp === "string")
      settings.phoneOrWhatsapp = phoneOrWhatsapp.trim();
    if (typeof logoUrl === "string") settings.logoUrl = logoUrl.trim();
    if (typeof faviconUrl === "string") settings.faviconUrl = faviconUrl.trim();

    if (typeof primaryColor === "string")
      settings.primaryColor = primaryColor.trim();

    if (typeof darkMode === "boolean") settings.darkMode = darkMode;

    if (req.user && req.user._id) settings.updatedBy = req.user._id;

    await settings.save();
    return res.json(settings);
  } catch (err) {
    console.error("❌ updateSettings error:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

module.exports = { getSettings, updateSettings };
