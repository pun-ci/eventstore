module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: [
        '@typescript-eslint',
    ],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'standard-with-typescript',
    ],
    parserOptions: {
        project: './tsconfig.json'
    },

    rules: {
        'padded-blocks': 'off',
        'prefer-regex-literals': 'off',
        'max-len': ['error', { code: 100 }],
        '@typescript-eslint/indent': ['error', 4],
        '@typescript-eslint/space-before-function-paren': 'off',
        '@typescript-eslint/strict-boolean-expressions': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/restrict-template-expressions': 'off',
        '@typescript-eslint/consistent-type-assertions': 'off',
    }
}
