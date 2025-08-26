import { defineConfig } from 'electron-vite';
import { fileURLToPath } from 'url';
import path from 'path';
import react from '@vitejs/plugin-react-swc';
import svgr from 'vite-plugin-svgr';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
    main: {
        build: {
            lib: {
                entry: 'src/main-electron.ts',
            },
        },
    },
    preload: {
        build: {
            lib: {
                entry: 'src/preload.ts',
                formats: ['cjs'],
                fileName: () => 'preload.js',
            },
            outDir: 'out/preload',
        },
    },
    renderer: {
        root: __dirname,
        base: './',
        publicDir: 'public1',
        server: {
            port: 3000,
            strictPort: true,
        },
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
        plugins: [
            react(),
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
        ],
        build: {
            rollupOptions: {
                input: 'index.html',
            },
        },
    },
    css: {
        preprocessorOptions: {
            scss: {
                silenceDeprecations: [
                    'mixed-decls',
                    'color-functions',
                    'global-builtin',
                    'import',
                ],
                quietDeps: true,
            },
        },
    },
});
