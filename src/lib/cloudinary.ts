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
        access_mode: 'public',
        type: 'upload',
    };

    if (isPdf) {
        options.resource_type = 'raw';
        options.public_id = `pdf_${Date.now()}`;
    }

    const result = await cloudinary.uploader.upload(fileUri, options);

    let url = result.secure_url;

    if (url.includes('?')) {
        const urlObj = new URL(url);
        urlObj.searchParams.delete('_a');
        url = urlObj.toString();
    }

    return url;
}

export async function uploadBufferToCloudinary(buffer: Buffer, folder: string, resourceType: 'auto' | 'video' | 'raw' = 'auto'): Promise<string> {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folder,
                resource_type: resourceType,
                access_mode: 'public',
                type: 'upload',
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else if (result) {
                    let url = result.secure_url;
                    if (url.includes('?')) {
                        const urlObj = new URL(url);
                        urlObj.searchParams.delete('_a');
                        url = urlObj.toString();
                    }
                    resolve(url);
                } else {
                    reject(new Error('Upload failed with no result'));
                }
            }
        );

        const { Readable } = require('stream');
        const readableStream = new Readable();
        readableStream.push(buffer);
        readableStream.push(null);
        readableStream.pipe(uploadStream);
    });
}

export default cloudinary;
