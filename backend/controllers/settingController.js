import Setting from "../models/Setting.js";

// GET /api/settings
export const getSettings = async (req, res) => {
  try {
    // Singleton: وثيقة واحدة فقط
    let settings = await Setting.findOne();

    // لو ما فيه وثيقة، نسوي واحدة تلقائيًا
    if (!settings) {
      settings = await Setting.create({});
    }

    return res.json(settings);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

// PUT /api/settings
export const updateSettings = async (req, res) => {
  try {
    const { platformName, contactEmail, logoUrl } = req.body;

    let settings = await Setting.findOne();
    if (!settings) settings = await Setting.create({});

    if (typeof platformName === "string")
      settings.platformName = platformName.trim();
    if (typeof contactEmail === "string")
      settings.contactEmail = contactEmail.trim();
    if (typeof logoUrl === "string") settings.logoUrl = logoUrl.trim();

    // لو عندك protect middleware يرجع user في req.user
    if (req.user?._id) settings.updatedBy = req.user._id;

    await settings.save();
    return res.json(settings);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};
