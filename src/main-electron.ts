import dotenv from 'dotenv';
import axios from 'axios';
import { app, BrowserWindow, ipcMain, shell } from 'electron';
import { join } from 'path';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { APP_PROTOCOL } from './consts';

// will use .env.electron file, but renderer will use .env.production or .env.development
dotenv.config();

let mainWindow: BrowserWindow | null;

const isDev = import.meta.env.MODE === 'development';

// Register custom protocol handler
if (!app.isDefaultProtocolClient(APP_PROTOCOL)) {
    app.setAsDefaultProtocolClient(APP_PROTOCOL);
}

// Listen for protocol callback - built-in
app.on('open-url', (event, url) => {
    console.debug('open-url event:', url);
    event.preventDefault();
    // Send the URL to the renderer process
    if (mainWindow) {
        mainWindow.webContents.send('oauth-callback', url);
    }
});

// ipcMain.on('oauth-code', (event, code) => {
//     // Handle the OAuth code here
//     console.log('Received OAuth code:', code);
//     // You can now exchange the code for a token, etc.
//     if (mainWindow) {
//         mainWindow.webContents.send('oauth-code', code);
//     }
// });

// Handle requests to open external URLs
ipcMain.on('open-external', (_event, url) => {
    shell.openExternal(url);
});

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            additionalArguments: [`--api-base-url=https://blpy.attilafarago.hu`],
            preload: join(__dirname, '../preload/preload.cjs'),
        },
    });

    // Proxy /api requests to https://blpy.attilafarago.hu/api
    // will not work with CORS
    // mainWindow.webContents.session.webRequest.onBeforeRequest(
    //     { urls: ['http://localhost:5173/api/*'] },
    //     (details, callback) => {
    //         const url = details.url;
    //         // Only proxy requests that start with /api
    //         const apiPrefix = '/api/';
    //         const urlObj = new URL(url);
    //         if (urlObj.pathname.startsWith(apiPrefix)) {
    //             const newUrl = `https://blpy.attilafarago.hu${urlObj.pathname}${urlObj.search}`;
    //             callback({ redirectURL: newUrl });
    //         } else {
    //             callback({});
    //         }
    //     },
    // );

    // electrin-vite dev
    if (isDev) {
        const url = process.env['ELECTRON_RENDERER_URL'];
        if (!url) {
            throw new Error(
                'ELECTRON_RENDERER_URL is not set in the environment variables',
            );
        }
        mainWindow.loadURL(url);
        // production, preview
    } else {
        mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

//

// GET handler - proxy handing CORS issues
ipcMain.handle(
    'proxy-request-get',
    async (_event, { url, config }: { url: string; config?: AxiosRequestConfig }) => {
        const response: AxiosResponse = await axios.get(url, config);
        return response.data;
    },
);

// POST handler - proxy handing CORS issues
ipcMain.handle(
    'proxy-request-post',
    async (
        _event,
        { url, data, config }: { url: string; data?: any; config?: AxiosRequestConfig },
    ) => {
        const response: AxiosResponse = await axios.post(url, data, config);
        return response.data;
    },
);
