// import { supportedExtensions, supportsExtension } from 'blocklypy';

// export { supportsExtension };

// handle this locally to avoid static dependency on load
export function supportedExtensions() {
    return ['.llsp3', '.llsp', '.lms', '.lmsp', '.ev3', '.ev3m', '.rbf', '.zip', '.py'];
}
export function supportsExtension(filename: string) {
    return supportedExtensions().some((ext) => filename.endsWith(ext));
}

export const ACCEPTED_EXTENSIONS = supportedExtensions().join(',');
