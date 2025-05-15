require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const blogRoutes = require("./routes/blogRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const contactRoutes = require("./routes/contactRoutes");

// Import multer for file uploads
const multer = require("multer");
// Set up multer storage (you can customize the file storage as needed)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const app = express();

// Enable CORS
app.use(cors());

// CORS configuration
app.use(
  cors({
    origin: "*", // Replace with your frontend's domain
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Connect to the database
connectDB();

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files for uploads (optional for local storage, you can remove this if using AWS S3)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Route for authentication, posts, blogs, and file uploads
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/contact", contactRoutes);

// Add file upload middleware if necessary
// Example usage: POST /api/upload (using multer)
app.post("/api/upload", upload.single("file"), (req, res) => {
  // Handle the file upload logic here (store in AWS S3 or local storage)
  console.log(req.file); // File information
  res.send("File uploaded successfully!");
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
