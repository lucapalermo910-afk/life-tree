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
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Todo módulo faz leitura/escrita de localStorage com catch vazio intencional
      // (dado corrompido ou quota excedida não deve derrubar a tela) — padrão consistente
      // em App.jsx e nos 6 *Module.jsx, não um descuido. Sem isso, cada catch{} vazio
      // desses precisaria de um corpo artificial só pra passar no lint.
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
])
