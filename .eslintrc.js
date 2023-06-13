module.exports = {
    env: {
        es2021: true,
        node: true
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended'
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 13,
        sourceType: 'module'
    },
    plugins: [
        '@typescript-eslint'
    ],
    rules: {
        '@typescript-eslint/ban-types': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/indent': ['warn', 4,
            {
                'ignoredNodes': [
                    'FunctionExpression > .params[decorators.length > 0]',
                    'FunctionExpression > .params > :matches(Decorator, :not(:first-child))',
                    'ClassBody.body > PropertyDefinition[decorators.length > 0] > .key'
                ]
            }],
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/comma-dangle': ['error', 'never'],
        '@typescript-eslint/no-this-alias': 'off',
        '@typescript-eslint/no-unused-vars': 'warn',
        '@typescript-eslint/semi': ['error', 'never'],
        '@typescript-eslint/object-curly-spacing': ['error', 'always'],
        '@typescript-eslint/quotes': ['error', 'single'],
        '@typescript-eslint/triple-slash-reference': 'off',
        'constructor-super': 1,
        curly: ['error', 'all'],
        eqeqeq: 1,
        'func-names': 0, // fix anonymous function warning
        'no-console': 0, // fix no console warning,
        'no-const-assign': 1,
        'no-empty': 0, // no empty statement
        'no-extra-semi': 0,
        'no-fallthrough': 0,
        'no-mixed-spaces-and-tabs': 1,
        'no-redeclare': 0, // no redeclare function/const
        'no-this-before-super': 1,
        'no-undef': 0, // fix call function on single browser js without import
        'no-unreachable': 1,
        'no-unused-vars': 1,
        'no-use-before-define': 0,
        'prefer-rest-params': 'off',
        semi: 0,
        'valid-typeof': 1
    },
    overrides: [
        {
            files: ['**/*.ts', '**/*.tsx'],
            rules: {
                '@typescript-eslint/no-explicit-any': 'off'
            }
        }
    ]
}
