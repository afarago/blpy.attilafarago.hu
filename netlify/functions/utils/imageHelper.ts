// import sharp from "sharp";

// export async function convertSvgToPngBase64(svg: string): Promise<string> {
//     const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
//     return pngBuffer.toString('base64');
// }

import { Resvg } from "@resvg/resvg-js";

export async function convertSvgToPngBase64(svg: string): Promise<string> {
    const resvg = new Resvg(svg, {
        fitTo: {
            mode: 'width',
            value: 1024,
        },
        font: {
            fontDirs: [
                './fonts',
                '../fonts',
                '/var/task/fonts',
            ],
            defaultFontFamily: 'sans-serif',
        },
    });

    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    return pngBuffer.toString('base64');
}