import { Request, Response } from "express";
import { uploadToCloudinary, isCloudinaryConfigured } from "../../lib/cloudinary.js";

export class StorageController {
  /**
   * Direct multipart file upload to Cloudinary
   */
  static async upload(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "No file uploaded. Send file under 'file' or 'image' field.",
          },
        });
        return;
      }

      const folder = (req.body.folder as string) || "memory_app/uploads";
      const result = await uploadToCloudinary(req.file.buffer, {
        folder,
        resource_type: "auto",
      });

      res.status(201).json({
        success: true,
        data: {
          url: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
          resourceType: result.resource_type,
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
        },
      });
    } catch (error: any) {
      console.error("Cloudinary upload error:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "UPLOAD_FAILED",
          message: error.message || "Failed to upload file to Cloudinary",
        },
      });
    }
  }

  /**
   * Presigned upload endpoint for client upload compatibility
   */
  static async getPresignedUrl(req: Request, res: Response): Promise<void> {
    const { fileName, mimeType, fileSizeBytes } = req.body;

    res.json({
      success: true,
      data: {
        uploadUrl: "/api/v1/storage/upload",
        storageKey: `cloudinary_${Date.now()}_${fileName || "asset"}`,
        fileUrl: "",
        expiresInSeconds: 3600,
      },
    });
  }

  /**
   * Health/Config status of Cloudinary storage
   */
  static async getStatus(_req: Request, res: Response): Promise<void> {
    res.json({
      success: true,
      provider: "cloudinary",
      configured: isCloudinaryConfigured(),
    });
  }
}
