import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(fileUri: string, folder: string) {
    try {
        const result = await cloudinary.uploader.upload(fileUri, {
            folder,
            resource_type: 'auto',
        });
        return result.secure_url;
    } catch (error) {
        console.error('Erro ao fazer upload para Cloudinary:', error);
        throw error;
    }
}

export default cloudinary;
