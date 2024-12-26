export default {
    preset: 'ts-jest',
    testEnvironment: 'jest-environment-jsdom',
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
        // process `*.tsx` files with `ts-jest`
    },
    moduleNameMapper: {
        '\\.(gif|ttf|eot|svg|png)(?:\\?.*)?$': '<rootDir>/src/test/mocks/fileMock.js',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    },
};
