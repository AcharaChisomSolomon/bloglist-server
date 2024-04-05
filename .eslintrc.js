module.exports = {
    env: {
        browser: true,
        commonjs: true,
        es2021: true,
    },
    extends: 'airbnb-base',
    overrides: [{
        env: {
            node: true,
        },
        files: [
            '.eslintrc.{js,cjs}',
        ],
        parserOptions: {
            sourceType: 'script',
        },
    },
    ],
    parserOptions: {
        ecmaVersion: 'latest',
    },
    rules: {
        'linebreak-style': 'off',
        indent: [
            'error',
            4,
        ],
        'no-console': 'off',
        'no-underscore-dangle': 'off',
        'consistent-return': 'off',
        'import/no-extraneous-dependencies': 'off',
        'no-param-reassign': 'off',
        'no-restricted-syntax': 'off',
        'no-await-in-loop': 'off',
    },
};
