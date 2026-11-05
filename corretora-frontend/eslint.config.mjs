import parser from '@typescript-eslint/parser';
export default [{
  files: ['src/**/*.ts'],
  languageOptions: { parser, ecmaVersion: 2022, sourceType: 'module' },
  rules: {
    'no-unreachable': 'error', 'no-duplicate-case': 'error',
    'no-constant-condition': 'error', 'no-fallthrough': 'error',
    'no-unexpected-multiline': 'error', eqeqeq: ['error', 'always'],
  },
}];
