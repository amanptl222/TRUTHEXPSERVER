const Blog = require("../models/Blog");
const s3 = require("../utils/s3"); // AWS SDK S3 instance
const { AWS_BLOG_BUCKET_NAME } = process.env;

// Create a new blog
exports.createBlog = async (req, res) => {
  try {
    const { title, content } = req.body;

    const files = req.files || [];
    const fileUrls = files.map((file) => file.location);

    const blog = new Blog({
      title,
      content,
      files: fileUrls,
    });

    await blog.save();
    res.status(201).json({ message: "Blog created successfully", blog });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single blog by ID
exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    res.status(200).json(blog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all blogs with pagination
exports.getAllBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const blogs = await Blog.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Blog.countDocuments();

    res.status(200).json({
      blogs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Edit an existing blog
exports.editBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    const { title, content } = req.body;

    if (req.files && req.files.length > 0) {
      // Delete old files from S3
      if (blog.files && blog.files.length > 0) {
        const deleteParams = {
          Bucket: AWS_BLOG_BUCKET_NAME,
          Delete: {
            Objects: blog.files.map((url) => ({
              Key: url.split("/").pop(),
            })),
            Quiet: false,
          },
        };
        await s3.deleteObjects(deleteParams).promise();
      }

      // Update with new uploaded file URLs
      blog.files = req.files.map((file) => file.location);
    }

    blog.title = title || blog.title;
    blog.content = content || blog.content;

    await blog.save();
    res.status(200).json({ message: "Blog updated successfully", blog });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a blog
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    // Delete all associated files from S3
    if (blog.files && blog.files.length > 0) {
      const deleteParams = {
        Bucket: AWS_BLOG_BUCKET_NAME,
        Delete: {
          Objects: blog.files.map((url) => ({
            Key: url.split("/").pop(),
          })),
          Quiet: false,
        },
      };
      await s3.deleteObjects(deleteParams).promise();
    }

    await blog.remove();

    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add a comment to a blog
exports.addCommentToBlog = async (req, res) => {
  try {
    const { comment } = req.body;

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    blog.comments.push({ user: req.user.id, comment });
    await blog.save();

    res.status(201).json({ message: "Comment added", blog });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a comment from a blog
exports.deleteCommentFromBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    blog.comments = blog.comments.filter((c) => c.id !== req.params.commentId);
    await blog.save();

    res.status(200).json({ message: "Comment deleted", blog });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
