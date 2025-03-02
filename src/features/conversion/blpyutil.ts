// import { supportedExtensions, supportsExtension } from 'blocklypy';

// handle this locally to avoid static dependency on load

let _supportedExtensions: string[] = [
    '.llsp3',
    '.llsp',
    '.lms',
    '.lmsp',
    '.ev3',
    '.ev3m',
    '.rbf',
    '.py',
    '.zip',
    '.proj',
    '.jpg', // wedo2 supporter
];

export function supportedExtensions() {
    // (async () => {
    //     try {
    //         const { supportedExtensions } = await import('blocklypy');
    //         _supportedExtensions = supportedExtensions();
    //     } catch (error) {
    //         console.error('Failed to load supported extensions from blocklypy:', error);
    //     }
    // })();
    return _supportedExtensions;
}
export function supportsExtension(filename: string) {
    return supportedExtensions().some((ext) => filename.endsWith(ext));
}

export const ACCEPTED_EXTENSIONS = supportedExtensions().join(',');
