import js from '@eslint/js'
import globals from 'globals';
import esParser from '@babel/eslint-parser'
export default [
    js.configs.recommended,
    {
        files: ['src/*.js'],
        languageOptions: {
            sourceType: 'module',
            parser: esParser,
            parserOptions: {
                ecmaVersion: 6
            },
            globals: {
                ...globals.browser,
                ...globals.process,
                ...globals.node,
            },
        },
        rules: {
            'no-console': 'off',
            'no-var': 'error',
        },
    },
]