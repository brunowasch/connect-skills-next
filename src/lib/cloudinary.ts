import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(fileUri: string, folder: string) {
    const isPdf = fileUri.match(/^data:application\/pdf;base64,/i);

    const options: any = {
        folder,
        resource_type: 'auto',
    };

    if (isPdf) {
        // Enforce 'image' resource_type for PDFs to ensure they are served with correct headers for viewing
        // and support the .pdf extension in the URL.
        options.resource_type = 'image';
        options.format = 'pdf';
        options.public_id = `pdf_${Date.now()}`;
    }

    const result = await cloudinary.uploader.upload(fileUri, options);

    let url = result.secure_url;

    // For PDF uploaded as image, ensure clean URL with .pdf extension
    if (isPdf && result.resource_type === 'image') {
        url = url.split('?')[0];
        if (!url.toLowerCase().endsWith('.pdf')) {
            url += '.pdf';
        }
    }

    return url;
}

export default cloudinary;
