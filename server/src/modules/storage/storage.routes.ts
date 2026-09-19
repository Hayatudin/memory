import { Router } from "express";
import multer from "multer";
import { StorageController } from "./storage.controller.js";
import { requireAuth } from "../../middleware/auth.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB max
  },
});

const router = Router();

// Storage routes
router.get("/status", StorageController.getStatus);
router.post(
  "/upload",
  upload.single("file") as any,
  StorageController.upload
);
router.post(
  "/presigned-url",
  requireAuth,
  StorageController.getPresignedUrl
);

export const storageRouter = router;
