// routes/uploadRoutes.js
const express = require("express");
const { authenticate, restrictToAdmin } = require("../middlewares/auth");
const createS3Uploader = require("../middlewares/s3Uploader");

const router = express.Router();
const upload = createS3Uploader(process.env.AWS_BLOG_BUCKET_NAME);

router.post(
  "/upload-image",
  authenticate,
  restrictToAdmin,
  upload.single("file"),
  (req, res) => {
    if (!req.file) return res.status(400).send("No file uploaded");
    res.json({ url: req.file.location });
  }
);

module.exports = router;
