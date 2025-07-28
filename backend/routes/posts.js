import express from "express";
import multer from "multer";
import path from "path";
import { createPost, getPosts, likePost, addComment, getComments } from "../controllers/postController.js";
import { authMiddleware } from "../utils/authMiddleware.js";

const router = express.Router();

// ✅ Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"), // files saved to /uploads folder
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "video/mp4"];
  if (allowedTypes.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Invalid file type"), false);
};

const upload = multer({ storage, fileFilter });

// ✅ Routes
router.post("/", authMiddleware, upload.single("media"), createPost); // <-- Now supports media
router.get("/", getPosts);
router.put("/:id/like", authMiddleware, likePost);
router.post("/:id/comment", authMiddleware, addComment);
router.get("/:id/comments", getComments);

export default router;
