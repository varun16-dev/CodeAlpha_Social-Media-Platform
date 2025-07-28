import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },

  // ✅ Added fields for media uploads
  mediaUrl: { type: String }, // stores the file path or URL
  mediaType: { type: String, enum: ["image", "video"] }, // identifies type

  image: { type: String }, // ✅ kept your original field (no removal)

  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Post", postSchema);
