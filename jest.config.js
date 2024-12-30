export default {
    preset: 'ts-jest',
    testEnvironment: 'jest-environment-jsdom',
    transform: {
        '^.+\\.tsx?$': 'ts-jest', // Use ts-jest for TypeScript files
        '^.+\\.jsx?$': 'babel-jest', // Use babel-jest for JavaScript files
        '^.+/node_modules/@hpcc-js/wasm-graphviz/.+\\.js$': 'babel-jest', // Use babel-jest for @hpcc-js/wasm-graphviz
    },
    // transformIgnorePatterns: [
    //     '/node_modules/(?!@hpcc-js/wasm-graphviz)', // Ignore all node_modules except @hpcc-js/wasm-graphviz
    // ],
    moduleNameMapper: {
        '\\.(gif|ttf|eot|svg|png)(?:\\?.*)?$': '<rootDir>/src/test/mocks/fileMock.js',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    },
};
