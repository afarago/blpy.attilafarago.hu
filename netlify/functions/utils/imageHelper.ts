import sharp from "sharp";

export async function convertSvgToPngBase64(svg: string): Promise<string> {
    const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
    return pngBuffer.toString('base64');
}
