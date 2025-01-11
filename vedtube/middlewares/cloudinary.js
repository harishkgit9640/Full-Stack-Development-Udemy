import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import dotenv from 'dotenv'

dotenv.config();

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY // Click 'View API Keys' above to copy your API secret
});

// Upload an image
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        const response = await cloudinary.uploader.upload(localFilePath, { resource_type: 'auto' })
        fs.unlinkSync(localFilePath)
        return response;
    } catch (error) {
        console.log(" cloudinary error " + error)
        fs.unlinkSync(localFilePath)
        return null;
    }

}

const deleteFromCloudinary = async (avatarId) => {
    try {
        const deletedFile = await cloudinary.uploader.destroy(avatarId)
        console.log("deleted file: " + avatarId);
    } catch (error) {
        console.log("error while deleting the file from cloudinary: " + error)
        return null;
    }

}

export { uploadOnCloudinary, deleteFromCloudinary }