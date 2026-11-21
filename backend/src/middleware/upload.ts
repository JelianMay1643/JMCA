import type { RequestHandler } from "express";
import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024, files: 1 }, // 2MB
});

// Usa ka picture lang, ang field name kay "image"
export const uploadSingleImage: RequestHandler = (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      const tooBig =
        err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE";
      return res.status(400).json({
        message: tooBig ? "Image must be 2MB or smaller" : "Invalid upload",
      });
    }
    next();
  });
};