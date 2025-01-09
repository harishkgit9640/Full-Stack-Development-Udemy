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
        console.log("files : " + localFilePath);

        if (!localFilePath) return null;
        const response = await cloudinary.uploader.upload(localFilePath, { resource_type: 'auto' })
        console.log("File uploaded successfully " + response.url)
        fs.unlinkSync(localFilePath)
    } catch (error) {
        console.log(" cloudinary error " + error)
        fs.unlinkSync(localFilePath)
        return null;
    }

}
export { uploadOnCloudinary }