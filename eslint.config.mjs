import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['build/**', 'cron-wasm/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
    plugins: { react },
    settings: { react: { version: 'detect' } },
    rules: { ...react.configs.recommended.rules, 'react/react-in-jsx-scope': 'off' },
  },
);
