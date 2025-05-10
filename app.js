require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path"); // Import path module
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const blogRoutes = require("./routes/blogRoutes");
const uploadRoutes = require("./routes/uploadRoutes"); // Import the upload routes
const contactRoutes = require("./routes/contactRoutes"); // Import contact routes

const app = express();

// Enable CORS
app.use(cors());

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

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Route for authentication, posts, and blogs
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/upload", uploadRoutes); // Use the upload routes

// Route for contact form submission
app.use("/api/contact", contactRoutes); // Contact form route

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
