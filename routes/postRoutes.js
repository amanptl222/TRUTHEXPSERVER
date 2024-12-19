const express = require('express');
const {
  createPost,
  editPost,
  deletePost,
  likePost,
  unlikePost,
  addComment,
  deleteComment,
  getSinglePostById,
  getAllPostsByType,
} = require('../controllers/postController');
const {authenticate, restrictToAdmin} = require('../middlewares/auth');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

// Define routes for posts
router.post('/', authenticate,restrictToAdmin, upload.single('file'), createPost);
router.put('/:id', authenticate,restrictToAdmin, upload.single('file'), editPost);
router.delete('/:id', authenticate,restrictToAdmin, deletePost);
router.post('/:id/like', authenticate, likePost);
router.post('/:id/unlike', authenticate, unlikePost);
router.post('/:id/comment', authenticate, addComment);
router.delete('/:id/comment/:commentId', authenticate, deleteComment);

// Get a single post by ID
router.get('/:id', authenticate,restrictToAdmin, getSinglePostById);

// Get all posts by type
router.get('/', getAllPostsByType);

module.exports = router;
