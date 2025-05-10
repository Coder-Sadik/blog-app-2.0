import multer from "multer";
import path from "path";

// Set storage engine and file naming conventions
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Folder to save images
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `${Date.now()}_${file.fieldname}${path.extname(file.originalname)}`
    ); // Generate unique filenames
  },
});

// Initialize Multer with file size limit and file filter
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Max file size: 10MB
  },
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/; // Allowed file types
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Only image files are allowed."));
  },
});

export const uploadImage = upload; // Export the upload middleware to use in routes
