import * as path from 'path';

import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
// import https from 'vite-plugin-https'; // local PWA testing, yarn add -D vite-plugin-https
import { nodeResolve } from '@rollup/plugin-node-resolve';
import react from '@vitejs/plugin-react';
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
            // https: isDebug,
        },
        plugins: [
            react(),
            // isDebug && https(), // debug only
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
            //isProd && // only include in production
            VitePWA({
                registerType: 'autoUpdate',
                injectRegister: 'auto',
                // injectManifest: {
                //     swSrc: './service-worker.ts', // Path to your service worker
                // },
                workbox: {
                    globPatterns: [
                        '**/*.{js,css,html,ico,png,svg,llsp,llsp3,lms,lmsp,ev3,ev3m,rbf,py,zip}',
                    ],
                    disableDevLogs: isDebug,

                    // This tells VitePWA to use your service-worker.ts file.
                    // Even if empty, it's necessary.

                    // runtimeCaching: [
                    //     // Example of runtime caching configuration
                    //     {
                    //         // urlPattern: ({ url }) => {
                    //         //     return url.pathname.startsWith('/api'); // Example: Cache API requests
                    //         // },
                    //         // handler: 'NetworkFirst',
                    //         options: {
                    //             // cacheName: 'api-cache',
                    //             // expiration: {
                    //             //     maxEntries: 30,
                    //             //     maxAgeSeconds: 3600, // 1 hour
                    //             // },

                    //             // Suppress specific Workbox logs within a cache entry
                    //             // The following example will suppress 'cache-hit' logs
                    //             debug: {
                    //                 // The following will suppress cache-hit logs
                    //                 'cache-hit': false,
                    //                 'cache-miss': true,
                    //                 'cache-put': true,
                    //             },
                    //         },
                    //     },
                    // ],
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
                    name: 'BlocklyPy',
                    short_name: 'BlocklyPy',
                    description:
                        'BlocklyPy: SPIKE to Pybricks - A web-app for converting LEGO blockly programs to Python code',
                    theme_color: '#ffffff',
                    background_color: '#ffffff',
                    start_url: '/',
                    // lang: 'en',
                    display: 'standalone',
                    // shortcuts: [
                    //     {
                    //         name: 'Convert LEGO Blockly to Python',
                    //         short_name: 'Convert',
                    //         url: '/',
                    //         icons: [
                    //             {
                    //                 src: '/favicon/android-chrome-192x192.png',
                    //                 sizes: '192x192',
                    //                 type: 'image/png',
                    //             },
                    //         ],
                    //     },
                    // ],
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
                            purpose: 'any maskable',
                        },
                        {
                            src: '/favicon/safari-pinned-tab.svg',
                            sizes: '768x768',
                            type: 'image/svg+xml',
                            purpose: 'any maskable',
                        },
                        {
                            src: '/favicon/favicon-44x44.png',
                            sizes: '44x44',
                            type: 'image/png',
                            purpose: 'any',
                        }, // Windows
                        {
                            src: '/favicon/favicon-48x48.png',
                            sizes: '48x48',
                            type: 'image/png',
                            purpose: 'any',
                        },
                        {
                            src: '/favicon/favicon-71x71.png',
                            sizes: '71x71',
                            type: 'image/png',
                            purpose: 'any',
                        }, // Windows
                        {
                            src: '/favicon/favicon-72x72.png',
                            sizes: '72x72',
                            type: 'image/png',
                            purpose: 'any',
                        },
                        {
                            src: '/favicon/favicon-96x96.png',
                            sizes: '96x96',
                            type: 'image/png',
                            purpose: 'any',
                        },
                        {
                            src: '/favicon/favicon-144x144.png',
                            sizes: '144x144',
                            type: 'image/png',
                            purpose: 'any',
                        },
                        {
                            src: '/favicon/favicon-150x150.png',
                            sizes: '150x150',
                            type: 'image/png',
                            purpose: 'any',
                        }, // Windows
                        {
                            src: '/favicon/favicon-192x192.png',
                            sizes: '192x192',
                            type: 'image/png',
                            purpose: 'any maskable',
                        }, // Maskable
                        {
                            src: '/favicon/favicon-310x310.png',
                            sizes: '310x310',
                            type: 'image/png',
                            purpose: 'any',
                        }, // Windows
                        {
                            src: '/favicon/favicon-512x512.png',
                            sizes: '512x512',
                            type: 'image/png',
                            purpose: 'any maskable',
                        }, // Maskable
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
                    file_handlers: [
                        {
                            action: '/',
                            accept: {
                                'application/vnd.lego.spike': ['.llsp3', '.llsp'],
                                'application/vnd.lego.robotinventor': ['.lms'],
                                'application/vnd.lego.ev3classroom': ['.lmsp'],
                                'application/vnd.lego.ev3lab': ['.ev3'],
                                'application/vnd.lego.ev3labmobile': ['.ev3m'],
                                'application/vnd.lego.compiled': ['.rbf'],
                                'application/zip': ['.zip'],
                                'text/x-python': ['.py'],
                            },
                        },
                    ],
                    launch_handler: {
                        client_mode: 'focus-existing',
                    },
                    // https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/share_target
                    // share_target: {
                    //     action: '/share',
                    //     method: 'POST',
                    //     params: {
                    //         title: 'title',
                    //         text: 'text',
                    //         url: 'url',
                    //     },
                    // },
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
                        if (isDebug) return id;

                        // TODO: defer load of these chunks
                        if (id.includes('blocklypy')) {
                            return 'vendor-2'; // will only be imported in conversionworker
                        } else if (id.includes('viz')) {
                            return 'vendor-1';
                        } else if (id.includes('node_modules')) {
                            return 'vendor-0';
                        } else return 'index';
                    },
                    // preserveModules: true,
                },
                // preserveEntrySignatures: "strict",
            },
            chunkSizeWarningLimit: 800, // ignore graphviz 739kb limit // TODO: selective ignore only for this chunk
            minify: isProd ? 'esbuild' : false,
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
