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
        access_mode: 'public', // Ensure files are publicly accessible
        type: 'upload', // Use 'upload' type (not 'authenticated' or 'private')
    };

    if (isPdf) {
        // Use 'raw' resource_type for PDFs to ensure proper document storage and serving
        // This allows PDFs to be viewed correctly without conversion issues
        options.resource_type = 'raw';
        options.public_id = `pdf_${Date.now()}`;
    }

    const result = await cloudinary.uploader.upload(fileUri, options);

    // Return the secure URL directly - Cloudinary handles PDFs correctly with 'raw' type
    // Remove any authentication parameters from the URL
    let url = result.secure_url;

    // Clean URL by removing signature parameters if present
    if (url.includes('?')) {
        const urlObj = new URL(url);
        // Remove authentication parameters
        urlObj.searchParams.delete('_a');
        url = urlObj.toString();
    }

    return url;
}

export default cloudinary;
