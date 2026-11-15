import "server-only";
import { v2 as cloudinary } from "cloudinary";

let configured = false;

export function isCloudinaryConfigured() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  return Boolean(CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET);
}

export function getCloudinary() {
  if (!configured) {
    if (!isCloudinaryConfigured()) throw new Error("Cloudinary is not configured");
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    configured = true;
  }
  return cloudinary;
}

export const cloudinaryFolder = () => process.env.CLOUDINARY_FOLDER || "mellow-mug";

/** Signature for a direct browser → Cloudinary signed upload (the secret never leaves the server). */
export function createUploadSignature() {
  const cld = getCloudinary();
  const timestamp = Math.round(Date.now() / 1000);
  const params = { folder: cloudinaryFolder(), timestamp };
  const signature = cld.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET!);
  return {
    ...params,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
  };
}

/** Only assets inside our folder may be registered/deleted — protects other projects on the same account. */
export function isOwnPublicId(publicId: string) {
  return publicId.startsWith(`${cloudinaryFolder()}/`) && !publicId.includes("..");
}
