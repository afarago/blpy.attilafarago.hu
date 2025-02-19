import * as path from 'path';

import { nodeResolve } from '@rollup/plugin-node-resolve';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import https from 'vite-plugin-https';
import { VitePWA } from 'vite-plugin-pwa';
import svgr from 'vite-plugin-svgr';

// import { visualizer } from 'rollup-plugin-visualizer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig(({ command }) => {
    const isDebug = command === 'serve'; // vite dev
    const isProd = command === 'build';
    // const isNetlify = process.env.NETLIFY === 'true';
    return {
        // define: {
        //     'import.meta.env.NETLIFY': JSON.stringify(isNetlify),
        // },
        root: path.resolve(__dirname, '.'),
        resolve: {
            alias: {
                '@': path.resolve(__dirname, 'src/'),
                '@components': path.resolve(__dirname, 'src/components'),
                '~bootstrap': path.resolve(__dirname, 'node_modules/bootstrap'),
            },
        },
        assetsInclude: [
            '**/*.llsp',
            '**/*.llsp3',
            '**/*.lms',
            '**/*.lmsp',
            '**/*.ev3',
            '**/*.ev3m',
            '**/*.rbf',
            '**/*.py',
            '**/*.zip',
            '**/*.png',
            '**/*.svg',
            '**/*.ico',
        ],
        server: {
            hot: true,
            https: true,
        },
        plugins: [
            react(),
            https(), // debug only
            // visualizer(),
            nodeResolve(),
            svgr({
                svgrOptions: {
                    plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx'],
                    svgoConfig: {
                        floatPrecision: 2,
                    },
                    include: '**/*.svg?react',
                    exclude: '',
                },
            }),
            // isProd &&
            VitePWA({
                registerType: 'autoUpdate',
                injectRegister: 'script',
                workbox: {
                    globPatterns: [
                        '**/*.{js,css,html,ico,png,svg,llsp,llsp3,lms,lmsp,ev3,ev3m,rbf,py,zip}',
                    ],
                },
                devOptions: {
                    enabled: true,
                },
                includeAssets: [
                    'favicon.ico',
                    'robots.txt',
                    'apple-touch-icon.png',
                    '*.png',
                    '*.svg',
                    '*.ico',
                ],
                manifest: {
                    name: 'BlocklyPy web-app',
                    short_name: 'BlocklyPy web-app',
                    description:
                        'BlocklyPy: SPIKE to Pybricks - A web-app for converting LEGO blockly programs to Python code',
                    theme_color: '#ffffff',
                    background_color: '#ffffff',
                    start_url: '/',
                    display: 'standalone',
                    icons: [
                        {
                            src: '/favicon/android-chrome-192x192.png',
                            sizes: '192x192',
                            type: 'image/png',
                        },
                        {
                            src: '/favicon/android-chrome-512x512.png',
                            sizes: '512x512',
                            type: 'image/png',
                        },

                        {
                            src: '/favicon/apple-touch-icon.png',
                            sizes: '180x180',
                            type: 'image/png',
                            // purpose: 'any maskable',
                        },
                        {
                            src: '/favicon/safari-pinned-tab.svg',
                            sizes: '768x768',
                            type: 'image/svg+xml',
                            // purpose: 'any maskable',
                        },
                    ],
                    screenshots: [
                        {
                            src: '/screenshots/screenshot-1024x768.png',
                            sizes: '1024x768',
                            type: 'image/png',
                        },
                        {
                            src: '/screenshots/screenshot-1280x720.png',
                            sizes: '1280x720',
                            type: 'image/png',
                            form_factor: 'wide',
                        },
                        {
                            src: '/screenshots/screenshot-1920x1080.png',
                            sizes: '1920x1080',
                            type: 'image/png',
                            form_factor: 'wide',
                        },
                        {
                            src: '/screenshots/screenshot-mobile-375x812.png',
                            sizes: '375x812',
                            type: 'image/png',
                            form_factor: 'narrow',
                            label: 'mobile',
                        },
                    ],
                    // https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/How_to/Associate_files_with_your_PWA
                    // file_handlers: [
                    //     {
                    //         action: '/',
                    //         accept: {
                    //             'image/jpeg': ['.jpg', '.jpeg'],
                    //             'image/png': ['.png'],
                    //         },
                    //     },
                    // ],
                    // protocol_handlers: [
                    //     {
                    //         protocol: 'web+tea',
                    //         url: '/tea?type=%s',
                    //     },
                    //     {
                    //         protocol: 'web+coffee',
                    //         url: '/coffee?type=%s',
                    //     },
                    // ],
                },
            }),
        ],
        build: {
            outDir: './dist',
            emptyOutDir: true,
            rollupOptions: {
                output: {
                    assetFileNames: (assetInfo) => {
                        let extType = assetInfo.name.split('.').at(1);
                        if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
                            extType = 'img';
                        } else if (/css|woff|woff2/.test(extType)) {
                            extType = 'css';
                        } else if (/llsp3?|lsm|lms|lmsp|ev3|rbf/.test(extType)) {
                            extType = 'lego';
                        }
                        return `assets/${extType}/[name]-[hash][extname]`;
                    },
                    chunkFileNames: 'assets/js/[name]-[hash].js',
                    entryFileNames: 'assets/js/[name]-[hash].js',
                    manualChunks: (id) => {
                        if (id.includes('blocklypy')) {
                            return 'vendor-1';
                        } else if (id.includes('viz')) {
                            return 'vendor-2';
                        } else if (id.includes('node_modules')) {
                            return 'vendor-0';
                        }
                    },
                    // preserveModules: true,
                },
                // preserveEntrySignatures: "strict",
            },
            chunkSizeWarningLimit: 800, // ignore graphviz 739kb limit // TODO: selective ignore only for this chunk
            minify: 'esbuild',
            esbuild: { legalComments: 'none', minify: true },
            // minify: 'terser', // Use Terser for minification
            // terserOptions: {
            //   format: {
            //     comments: false, // This option removes all comments
            //   },
            // },
        },
        css: {
            preprocessorOptions: {
                scss: {
                    // silenceDeprecations: [
                    //   "mixed-decls",
                    //   "color-functions",
                    //   "global-builtin",
                    //   "import",
                    // ],
                    quietDeps: true,
                },
            },
        },
    };
});
