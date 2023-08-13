import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import multer from 'multer'
import dotenv from 'dotenv'

dotenv.config()

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});



const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "i-Teach",
    allowedFormats: ["jpeg", "png", "jpg", "pdf"],
  },
});

const fileFilter = (req, file, cb) => {
  if (!["image/png", "image/jpg", "image/jpeg", "application/pdf"].includes(file.mimetype)) {
    return cb(new Error("File format is not supported"));
  }
  return cb(null, true);
};


const upload = multer({ storage, fileFilter });
export const uploadFiles = (req, res, next) => {
  upload.any()(req, res, (err) => {
    if (err) {
      console.error(err);
      if (err.message === "File format is not supported") {
        return res.status(400).json({ error: 'Selected file format is not supported' });
      }
      return res.status(500).json({ error: 'An error occurred during file upload' });
    } else {
      console.log("Files uploaded to cloudinary");
      return next();
    }
  });
};

export const deleteFiles = async (publicIds) => {
  const results = [];

  for (const publicId of publicIds) {
    try {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(publicId, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        });
      });
      results.push({ publicId, success: true, result });
      console.log(`Deleted successfully: ${publicId}`);
    } catch (error) {
      results.push({ publicId, success: false, error });
      console.error(`Failed to delete: ${publicId}`, error);
    }
  }

  return results; // Contains information about each deletion, success or failure
};
