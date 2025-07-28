import Post from "../models/Post.js";
import Comment from "../models/Comment.js";

// ✅ Create a new post (Supports Text + Image/Video)
export const createPost = async (req, res) => {
  try {
    const { content, image } = req.body;

    const newPost = new Post({
      user: req.user.id,
      content,
      image // ✅ Kept your old image field
    });

    // ✅ If a file is uploaded, save it as mediaUrl/mediaType
    if (req.file) {
      newPost.mediaUrl = `/uploads/${req.file.filename}`;
      newPost.mediaType = req.file.mimetype.startsWith("image") ? "image" : "video";
    }

    await newPost.save();
    res.json(newPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get all posts
export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user")
      .populate("likes");
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Like or Unlike a post
export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    if (post.likes.includes(req.user.id)) {
      post.likes.pull(req.user.id);
    } else {
      post.likes.push(req.user.id);
    }

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Add a comment
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const comment = new Comment({
      post: req.params.id,
      user: req.user.id,
      text
    });

    await comment.save();
    const populated = await comment.populate("user");
    res.json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get comments for a post
export const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .populate("user")
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
