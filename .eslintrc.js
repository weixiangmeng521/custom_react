const path = require('path')
const resolve = _path => path.resolve(__dirname, _path)

module.exports = {
    env: {
        browser: true,
        es6: true
    },
    parser: '@typescript-eslint/parser',

    parserOptions: {
        project: resolve('./tsconfig.json'),
        tsconfigRootDir: __dirname,
        sourceType: 'module',
    },
    // plugins: ['prettier'],
    rules: {
        // 'indent': ['warning', 2],
        // 'no-unused-vars': 'error',
        'no-console': 'off',
    }
};