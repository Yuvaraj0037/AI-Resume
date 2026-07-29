const multer = require("multer");

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },

  fileFilter(req, file, callback) {
    const isPdfMime =
      file.mimetype === "application/pdf";

    const hasPdfExtension =
      file.originalname
        .toLowerCase()
        .endsWith(".pdf");

    if (!isPdfMime || !hasPdfExtension) {
      const error = new Error(
        "Only valid PDF files are allowed"
      );

      error.status = 400;
      return callback(error);
    }

    return callback(null, true);
  },
});

module.exports = upload;