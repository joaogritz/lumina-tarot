import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

// Lints the React app, the Worker, scripts and Node tests. The 3D table is TypeScript and is
// checked by `npm run typecheck`.
export default [
  { ignores: ['dist', 'node_modules', 'test-results', 'playwright-report', 'mesa-3d', 'public/sw.js'] },
  js.configs.recommended,
  // Empty catch blocks are used on purpose where storage or audio may be unavailable.
  { rules: { 'no-empty': ['error', { allowEmptyCatch: true }] } },
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // React Compiler advisories: kept visible as warnings until those components are refactored.
      'react-hooks/refs': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'no-unused-vars': ['error', { varsIgnorePattern: '^(React|motion|[A-Z_])', argsIgnorePattern: '^_', caughtErrors: 'none' }],
    },
  },
  {
    files: ['cloudflare_worker_code.js'],
    languageOptions: { sourceType: 'module', globals: { ...globals.worker } },
  },
  {
    files: ['tests/**/*.{js,mjs,cjs}', 'scripts/**/*.{js,mjs}', '*.config.js'],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
];
