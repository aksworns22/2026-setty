import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';

const blockFlowImport = (blockedFlow, message) => [
  'error',
  {
    patterns: [
      {
        regex: `^(?:@/flows/|(?:\\.\\.?/)+)(?:[^/]+/)*${blockedFlow}(?:/|$)`,
        message,
      },
    ],
  },
];

export default tseslint.config(
  { ignores: ['dist/', 'coverage/', 'config/', '*.config.js'] },

  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: { ...globals.node },
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser },
    },
    plugins: { react, 'react-hooks': reactHooks },
    settings: { react: { version: 'detect' } },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['src/flows/estimate/**/*.{js,jsx,ts,tsx}'],
    rules: {
      'no-restricted-imports': blockFlowImport(
        'dispatch',
        'estimate flow에서 dispatch flow를 직접 import하지 마세요. 실제 공통 코드만 shared로 이동하세요.',
      ),
    },
  },
  {
    files: ['src/flows/dispatch/**/*.{js,jsx,ts,tsx}'],
    rules: {
      'no-restricted-imports': blockFlowImport(
        'estimate',
        'dispatch flow에서 estimate flow를 직접 import하지 마세요. 실제 공통 코드만 shared로 이동하세요.',
      ),
    },
  },
  prettier,
);
