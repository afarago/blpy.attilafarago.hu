export const isNetlifyEnvironment = import.meta.env.VITE_NETLIFY?.toString() === 'true';

export const isElectronEnvironment =
    typeof window !== 'undefined' &&
    (!!(window as any).electronAPI ||
        navigator.userAgent.toLowerCase().indexOf('electron') > -1);

