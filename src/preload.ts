import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { contextBridge, ipcRenderer } from 'electron';

const { shell } = require('electron');

declare global {
    interface Window {
        electronAPI: ElectronAPI;
    }
}

export type ElectronAPI = {
    onAuthCodeUrlReceived: (callback: (url: string) => void) => () => void;
    api: {
        //get: (url: string, config?: { headers?: any; params?: any }) => Promise<any>;
        getDataWithProxy<T = any, R = AxiosResponse<T>, D = any>(
            url: string,
            config?: AxiosRequestConfig<D>,
        ): Promise<T>;
        postDataWithProxy<T = any, R = AxiosResponse<T>, D = any>(
            url: string,
            data?: D,
            config?: AxiosRequestConfig<D>,
        ): Promise<T>;
    };
};

contextBridge.exposeInMainWorld('electronAPI', {
    onAuthCodeUrlReceived: (callback: (url: string) => void) => {
        const listener = (_event: any, url: string) => callback(url);
        ipcRenderer.on('oauth-callback', listener);
        return () => ipcRenderer.removeListener('oauth-callback', listener);
    },
    api: {
        getDataWithProxy: <T = any, R = AxiosResponse<T>, D = any>(
            url: string,
            config?: AxiosRequestConfig<D>,
        ): Promise<T> => {
            return ipcRenderer.invoke('proxy-request-get', {
                url,
                config,
            });
        },
        postDataWithProxy: <T = any, R = AxiosResponse<T>, D = any>(
            url: string,
            data?: D,
            config?: AxiosRequestConfig<D>,
        ): Promise<T> => {
            return ipcRenderer.invoke('proxy-request-post', {
                url,
                data,
                config,
            });
        },
    },
} satisfies ElectronAPI);
