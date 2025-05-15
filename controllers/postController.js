const Post = require("../models/Post");
const { generateFileUrl, deleteFile } = require("../utils/fileUtils");
const s3 = require("../utils/s3");
const { AWS_BUCKET_NAME } = process.env;

// Create a new post
exports.createPost = async (req, res) => {
  try {
    const { type, caption } = req.body;

    // Check if a file is provided
    if (!req.file) return res.status(400).json({ error: "File is required" });
    const filePath = req.file.location; // S3 file URL

    const post = new Post({
      type,
      url: filePath,
      caption,
    });

    await post.save();
    res.status(201).json({ message: "Post created successfully", post });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Edit an existing post
exports.editPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const { type, caption } = req.body;

    // Handle file update (if new file uploaded)
    if (req.file) {
      // Extract S3 key from URL
      const oldKey = post.url.split("/").pop();

      // Delete old file from S3
      await s3.deleteObject({ Bucket: AWS_BUCKET_NAME, Key: oldKey }).promise();

      post.url = req.file.location; // New S3 file URL
    }

    post.type = type || post.type;
    post.caption = caption || post.caption;

    await post.save();
    res.status(200).json({ message: "Post updated successfully", post });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const key = post.url.split("/").pop();
    await s3.deleteObject({ Bucket: AWS_BUCKET_NAME, Key: key }).promise();

    await post.remove();

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Like a post
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    if (!post.likes.includes(req.user.id)) {
      post.likes.push(req.user.id);
    }

    await post.save();
    res.status(200).json({ message: "Post liked", post });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Unlike a post
exports.unlikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    post.likes = post.likes.filter((id) => id.toString() !== req.user.id);
    await post.save();

    res.status(200).json({ message: "Post unliked", post });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add a comment
exports.addComment = async (req, res) => {
  try {
    const { comment } = req.body;

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    post.comments.push({ user: req.user.id, comment });
    await post.save();

    res.status(201).json({ message: "Comment added", post });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    post.comments = post.comments.filter((c) => c.id !== req.params.commentId);
    await post.save();

    res.status(200).json({ message: "Comment deleted", post });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single post by ID
exports.getSinglePostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    res.status(200).json({ message: "Post retrieved successfully", post });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all posts by type with pagination
exports.getAllPostsByType = async (req, res) => {
  try {
    const { type } = req.query;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const query = type ? { type } : {};
    const posts = await Post.find(query)
      .sort({ createdAt: -1 }) // Sort by creation date (newest first)
      .skip((page - 1) * limit)
      .limit(limit);

    const totalCount = await Post.countDocuments(query);

    res.status(200).json({
      message: "Posts retrieved successfully",
      posts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
