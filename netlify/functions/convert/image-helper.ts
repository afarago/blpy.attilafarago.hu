import sharp from "sharp";

export async function convertSvgToPngBase64(svg: string): Promise<string> {
    const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
    return pngBuffer.toString('base64');
}

// import { renderAsync, Resvg, ResvgRenderOptions } from '@resvg/resvg-js';
// import path from 'path';

// const fontsDir = path.join(__dirname, 'fonts');
// const fontFiles = [
//     'Arial.ttf',
//     'ChaletLondonNineteenSixty.ttf',
//     'ChaletNewYorkNineteenSixty.ttf',
//     'Helvetica.ttf',
//     'LiberationSans-Regular.ttf',
// ].map((file) => path.join(fontsDir, file));

// export async function convertSvgToPngBase64(svg: string): Promise<string> {
//     const opts: ResvgRenderOptions = {
//         fitTo: {
//             mode: 'width',
//             value: 1024,
//         },
//         font: {
//             fontFiles,
//             // fontDirs: ['./fonts', '../fonts', '/var/task/fonts'],
//             defaultFontFamily: 'sans-serif',
//             sansSerifFamily: 'Helvetica',
//         },
//     };
//     // const resvg = new Resvg(svg, opts);
//     // const pngData = resvg.render();
//     const pngData = await renderAsync(svg, opts);
//     const pngBuffer = pngData.asPng();

//     return pngBuffer.toString('base64');
// }
