// api/upload.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

// <backend>/uploads  (created automatically if it doesn't exist)
const UPLOAD_DIR = path.join(__dirname, "..", "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Allowed image types -> the file extension we save them with.
// The extension comes from the type, never from the user's filename.
const ALLOWED_TYPES = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp"
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}`;
    cb(null, `${unique}${ALLOWED_TYPES[file.mimetype]}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES[file.mimetype]) return cb(null, true);
  cb(new Error("Only JPG, PNG, GIF or WEBP images are allowed."));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE, files: 1 }
});

// Middleware: accepts ONE file in the form field "image".
// Upload problems become a clean 400 JSON error instead of a crash.
function uploadSingleImage(req, res, next) {
  upload.single("image")(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      const message =
        err.code === "LIMIT_FILE_SIZE"
          ? "Image is too large (max 5 MB)."
          : err.code === "LIMIT_UNEXPECTED_FILE"
          ? "Unexpected file field. Use the field name 'image'."
          : err.message;
      return res.status(400).json({ error: message });
    }

    return res.status(400).json({ error: err.message || "Upload failed." });
  });
}

module.exports = { uploadSingleImage, UPLOAD_DIR };