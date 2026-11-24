import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],

    },
  },
  {
    // Platform-owned bootstrap files intentionally export route helpers and
    // hydrate persisted browser state in effects. Keep their known framework
    // noise out of the generated-source advisory baseline; all other ESLint
    // correctness findings remain visible to the structured lint check.
    files: [
      'src/App.jsx',
      'src/components/JoorchinBuiltBy.jsx',
      'src/components/ThemeToggle.jsx',
      'src/pwa/PwaInstallBanner.jsx',
      'src/hooks/useCart.jsx',
      'src/miniapp/shell/**',
    ],
    rules: {
      'react-refresh/only-export-components': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/use-memo': 'off',
      'react-hooks/exhaustive-deps': 'off',
    },
  },
])
