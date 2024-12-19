const express = require('express');
const {
  createBlog,
  editBlog,
  deleteBlog,
  addCommentToBlog,
  deleteCommentFromBlog,
  getBlogById,
  getAllBlogs
} = require('../controllers/blogController');
const {authenticate, restrictToAdmin} = require('../middlewares/auth');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

// Define routes for blogs
router.post('/', authenticate,restrictToAdmin, createBlog);
router.put('/:id', authenticate,restrictToAdmin, upload.array('files', 5), editBlog);
router.delete('/:id', authenticate,restrictToAdmin, deleteBlog);
router.post('/:id/comment', authenticate, addCommentToBlog);
router.delete('/:id/comment/:commentId', authenticate, deleteCommentFromBlog);
router.get('/:id', getBlogById); // Get single blog by ID
router.get('/', getAllBlogs); // Get all blogs with pagination

module.exports = router;
