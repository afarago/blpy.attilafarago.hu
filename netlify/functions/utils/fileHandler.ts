import { HandlerEvent } from '@netlify/functions';
import axios from 'axios';
import Busboy from 'busboy';

export const handleFileUpload = async (event: HandlerEvent) => {
    return new Promise<{ fileName: string | null; fileBuffer: ArrayBuffer | null }>(
        (resolve, reject) => {
            let fileName: string | null = null;
            let fileBuffer: ArrayBuffer | null = null;

            if (event.headers['content-type']?.includes('multipart/form-data')) {
                const busboy = Busboy({ headers: event.headers });

                busboy.on('file', (name, file, info) => {
                    const { filename } = info;
                    fileName = filename;
                    const buffers: Buffer[] = [];
                    file.on('data', (data) => buffers.push(data));
                    file.on('end', () => {
                        fileBuffer = Buffer.concat(buffers);
                    });
                });

                busboy.on('finish', () => {
                    resolve({ fileName, fileBuffer });
                });

                busboy.on('error', reject);
                busboy.end(event.body, 'base64');
            } else {
                resolve({ fileName: null, fileBuffer: null });
            }
        },
    );
};

export const fetchSampleFileFromUrl = async (url: string) => {
    const response = await axios.get(url, {
        responseType: 'arraybuffer',
    });

    const fileName = url.split('/').pop() || '';
    const fileBuffer = response.data;
    return { fileName, fileBuffer };
};
