import * as path from 'path';

import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// https://vite.dev/config/
export default defineConfig({
    root: path.resolve(__dirname, '.'),
    resolve: {
        alias: {
            '~bootstrap': path.resolve(__dirname, 'node_modules/bootstrap'),
        },
    },
    assetsInclude: [
        '**/*.llsp3',
        '**/*.lms',
        '**/*.ev3',
        '**/*.rbf',
        '**/*.lmsp',
        '**/*.py',
        '**/*.zip',
    ],
    server: {
        //   port: 8080,
        hot: true,
    },
    plugins: [
        react(),
        nodeResolve(),
        svgr({
            svgrOptions: {
                plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx'],
                // esbuild options, to transform jsx to js
                esbuildOptions: {
                    // ...
                },
                svgoConfig: {
                    floatPrecision: 2,
                },
                // A minimatch pattern, or array of patterns, which specifies the files in the build the plugin should include.
                include: '**/*.svg?react',

                //  A minimatch pattern, or array of patterns, which specifies the files in the build the plugin should ignore. By default no files are ignored.
                exclude: '',
            },
            // ...
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
});
