import multer from "multer";
import path from "path";

// Storage settings
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Make sure 'uploads' folder exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// File filter (optional)
function fileFilter(req, file, cb) {
  cb(null, true); // accept all files for now
}

export const upload = multer({ storage, fileFilter });
