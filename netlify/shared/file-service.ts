import axios from 'axios';

export interface FileResult {
  fileName: string;
  fileBuffer: ArrayBuffer;
  builtin: boolean;
}

export class FileService {
  async getFileFromSample(sampleFileName: string, baseUrl?: string): Promise<FileResult> {
    const url = `${baseUrl}/samples/${sampleFileName}`;
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
    });

    return {
      fileName: sampleFileName,
      fileBuffer: response.data,
      builtin: true,
    };
  }

  getFileFromBuffer(fileName: string, fileBuffer: ArrayBuffer): FileResult {
    return {
      fileName,
      fileBuffer,
      builtin: false,
    };
  }

  getFileFromBase64(fileName: string, base64Content: string): FileResult {
    const buffer = Buffer.from(base64Content, 'base64');
    return {
      fileName,
      fileBuffer: buffer.buffer,
      builtin: false,
    };
  }
}

export const fileService = new FileService();