import * as path from 'path';
import process from 'process';

import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
// import https from 'vite-plugin-https'; // local PWA testing, yarn add -D vite-plugin-https
import { nodeResolve } from '@rollup/plugin-node-resolve';
import react from '@vitejs/plugin-react-swc';
import svgr from 'vite-plugin-svgr';
import viteCompression from 'vite-plugin-compression';
// import { visualizer } from 'rollup-plugin-visualizer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isNetlifyDev = process.env?.NETLIFY_DEV === 'true';
const isViteDev = process.env?.NODE_ENV === 'development' && !isNetlifyDev;
// console.log('Environment Variables:', process.env);
console.log(`Vite config: isNetlifyDev=${isNetlifyDev}, isViteDev=${isViteDev}`);

// https://vite.dev/config/
export default defineConfig(({ command }) => {
    const isDebug = command === 'serve'; // vite dev
    const isProd = command === 'build';
    // const isNetlify = process.env.NETLIFY === 'true';
    return {
        // define: {
        //     'import.meta.env.NETLIFY': JSON.stringify(isNetlify),
        // },
        root: __dirname,
        base: '/',
        resolve: {
            alias: {
                '@': path.resolve(__dirname, 'src'),
                '@components': path.resolve(__dirname, 'src/components'),
                '~bootstrap': 'bootstrap',
            },
        },
        assetsInclude: [
            '**/*.{ico,png,jpg,svg,llsp,llsp3,lms,lmsp,ev3,ev3m,rbf,proj,py,zip}',
        ],
        server: {
            hot: true,
            // https: isDebug,
            proxy: isViteDev
                ? {
                      '/api': {
                          target: 'https://blpy.attilafarago.hu',
                          changeOrigin: true,
                          secure: false,
                          // Optional: remove /api prefix if needed
                          // rewrite: (path) => path.replace(/^\/api/, '/api'),
                      },
                  }
                : undefined,
        },
        plugins: [
            react(),
            // isDebug && https(), // debug only
            // visualizer({ open: true }), // only in debug mode
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
            viteCompression(),
            //isProd && // only include in production
            VitePWA({
                register: isProd, // only register service worker in production
                registerType: 'autoUpdate',
                injectRegister: 'auto',
                // injectManifest: {
                //     swSrc: './service-worker.ts', // Path to your service worker
                // },
                workbox: {
                    globPatterns: [
                        '**/*.{js,css,html,ico,png,jpg,svg,llsp,llsp3,lms,lmsp,ev3,ev3m,rbf,proj,py,zip}',
                    ],
                    disableDevLogs: isDebug,
                    navigateFallbackDenylist: [
                        /^\/api\/.*$/, // Exclude /api paths
                        /^\/\.netlify\/.*$/, // Exclude /.netlify paths
                        /^\/swagger\.json$/, // Exclude /swagger.json
                    ],
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
                                'application/vnd.lego.ev3compiled': ['.rbf'],
                                'application/vnd.lego.wedo2': ['.proj'],
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
                    compact: true,
                    assetFileNames: (assetInfo) => {
                        let extType = assetInfo.name.split('.').at(1);
                        if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
                            extType = 'img';
                        } else if (/css|html|js|woff|woff2/.test(extType)) {
                            extType = 'css';
                        } else if (
                            /llsp|llsp3|lms|lmsp|ev3|ev3m|rbf|proj/.test(extType)
                        ) {
                            extType = 'lego';
                        }
                        const name = assetInfo.name
                            ? assetInfo.name.toLowerCase()
                            : '[name]';
                        return `assets/${extType}/${name}-[hash][extname]`;
                    },
                    chunkFileNames: (chunkInfo) => {
                        const name = chunkInfo.name
                            ? chunkInfo.name.toLowerCase()
                            : '[name]';
                        return `assets/js/${name}-[hash].js`;
                    },
                    entryFileNames: (chunkInfo) => {
                        const name = chunkInfo.name
                            ? chunkInfo.name.toLowerCase()
                            : '[name]';
                        return `assets/js/${name}-[hash].js`;
                    },
                    // manualChunks: (id, meta) => {
                    //     if (isDebug) return id;

                    //     // TODO: defer load of these chunks
                    //     // console.log('manualChunks', id, meta.getModuleInfo(id).code.length);
                    //     if (id.includes('blocklypy')) {
                    //         return 'vendor-blocklypy'; // will only be imported in conversion-worker
                    //     } else if (id.includes('viz')) {
                    //         return 'vendor-viz';
                    //     } else if (id.includes('swagger') || id.includes('openapi') || id.includes('js-yaml') || id.includes('remarkable') ) {
                    //         return 'vendor-swagger';
                    //     } else if (id.includes('react') || id.includes('redux') || id.includes('immutable')) {
                    //         return 'vendor-react';
                    //     // } else if (id.includes('micromark') || id.includes('openapi')) {
                    //     //     return 'vendor-markdown';
                    //     } else if (id.includes('node_modules')) {
                    //         return 'vendor-0';
                    //     } else return 'index';
                    // },
                    manualChunks: (id) => {
                        if (id.includes('cat')) {
                            console.log('manualChunks', id);
                        }

                        if (id.includes('blocklypy')) {
                            return 'vendor-blocklypy'; // will only be imported in conversion-worker
                        } else if (id.includes('graphviz')) {
                            return 'vendor-graphviz';
                        } else if (id.includes('assets/img/cat')) {
                            return 'icon-cat';
                        }
                        return null;
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
            sourcemap: isProd, // Enable source maps in production
            optimizeDeps: {
                include: ['react', 'react-dom'],
            },
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
