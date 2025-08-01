process.env.FONTCONFIG_PATH = `${__dirname}/fonts`;
process.env.FC_LANG = 'en_US.UTF-8';

import sharp from "sharp";

export async function convertSvgToPngBase64(svg: string): Promise<string> {
    const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
    return pngBuffer.toString('base64');
}
