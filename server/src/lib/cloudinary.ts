import { v2 as cloudinary, UploadApiResponse, UploadApiOptions } from "cloudinary";
import { env } from "../config/env.js";

// Configure Cloudinary
const cloudName = env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME || "zynit5sq";
const apiKey = env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY || "237512432861286";
const apiSecret = env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_API_SECRET || "u_LaxE9HHvYMGcy2KgLbXRaUbzs";
const cloudinaryUrl = env.CLOUDINARY_URL || process.env.CLOUDINARY_URL;

if (cloudinaryUrl) {
  cloudinary.config({
    cloudinary_url: cloudinaryUrl,
  });
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

export function isCloudinaryConfigured(): boolean {
  const config = cloudinary.config();
  return Boolean((config.cloud_name && config.api_key && config.api_secret) || config.cloudinary_url);
}

/**
 * Uploads a file buffer directly to Cloudinary using a readable stream.
 */
export async function uploadToCloudinary(
  fileBuffer: Buffer,
  options: UploadApiOptions = {}
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const defaultOptions: UploadApiOptions = {
      folder: "memory_app/uploads",
      resource_type: "auto",
      ...options,
    };

    const uploadStream = cloudinary.uploader.upload_stream(defaultOptions, (error, result) => {
      if (error || !result) {
        reject(error || new Error("Failed to upload image to Cloudinary"));
      } else {
        resolve(result);
      }
    });

    uploadStream.end(fileBuffer);
  });
}

/**
 * Deletes an asset by publicId.
 */
export async function deleteFromCloudinary(publicId: string): Promise<any> {
  return cloudinary.uploader.destroy(publicId);
}

export { cloudinary };
