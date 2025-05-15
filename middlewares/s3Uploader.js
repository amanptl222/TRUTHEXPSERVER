// middlewares/s3Uploader.js
const multer = require("multer");
const multerS3 = require("multer-s3");
const s3 = require("../utils/s3");

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype.startsWith("video/")
  ) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type, only image and video allowed"), false);
  }
};

const createS3Uploader = (bucketName) => {
  return multer({
    fileFilter,
    storage: multerS3({
      s3: s3,
      bucket: bucketName,

      contentType: multerS3.AUTO_CONTENT_TYPE,

      contentDisposition: (req, file, cb) => {
        if (file.mimetype.startsWith("video/")) {
          cb(null, "inline");
        } else {
          cb(null, null);
        }
      },

      metadata: (req, file, cb) => {
        cb(null, {
          fieldName: file.fieldname,
        });
      },

      key: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
      },
    }),
  });
};

module.exports = createS3Uploader;
