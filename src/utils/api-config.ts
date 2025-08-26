// TODO: buildApiUrl is not a good approach, as we need a proxy instead for CORS
// This file handles API configuration for different environments (Electron, Netlify, local dev)

export const PROD_URL = 'https://blpy.attilafarago.hu';

import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

export const isNetlifyEnvironment = () => {
    return import.meta.env.VITE_NETLIFY?.toString() === 'true';
};

export const isElectronEnvironment = () => {
    return (
        typeof window !== 'undefined' &&
        (window.location?.protocol === 'file:' ||
            !!window.electronAPI ||
            navigator.userAgent.toLowerCase().indexOf('electron') > -1)
    );
};

// get base API URL depending on environment - Electron will resolve the CORS issue

function shouldUseApiProxy(url: string): boolean {
    return url.startsWith('/api') && isElectronEnvironment();
}

function buildFullApiUrl(url: string): string {
    return `${PROD_URL}${url}`;
}

export async function getData<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    config?: AxiosRequestConfig<D>,
): Promise<R> {
    return shouldUseApiProxy(url)
        ? window.electronAPI.api.getDataWithProxy(buildFullApiUrl(url), config)
        : (await axios.get(url, config)).data;
}

export async function postData<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>,
): Promise<R> {
    return shouldUseApiProxy(url)
        ? window.electronAPI.api.postDataWithProxy(buildFullApiUrl(url), data, config)
        : (await axios.post(url, data, config)).data;
}
