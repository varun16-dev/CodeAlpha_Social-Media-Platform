import express from "express";
import { getProfile, followUser } from "../controllers/userController.js";
import { authMiddleware } from "../utils/authMiddleware.js";
import multer from "multer";
import path from "path";
import User from "../models/User.js";

const router = express.Router();

// ✅ Configure multer for uploads
const storage = multer.diskStorage({
  destination: "uploads/profilePics", // Folder to store profile pics
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// ✅ Existing Routes
router.get("/:id", getProfile);
router.put("/:id/follow", authMiddleware, followUser);

// ✅ New Route → Upload Profile Picture
router.put("/:id/profile-pic", authMiddleware, upload.single("profilePic"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.profilePic = `/uploads/profilePics/${req.file.filename}`;
    await user.save();

    res.json({ message: "Profile picture updated", profilePic: user.profilePic });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
