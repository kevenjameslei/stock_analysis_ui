module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier', // 如果你用 Prettier，可以加这个避免冲突
  ],
  plugins: ['vue', '@typescript-eslint'],
  rules: {
    // 变量未使用但以 "_" 开头的例外
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    // vue 组件名需多词（可关）
    'vue/multi-word-component-names': 'off',

    // 样式推荐规则
    indent: ['error', 2],
    quotes: ['error', 'single'],
    semi: ['error', 'never'],

    // 禁止 console
    'no-console': 'warn',
    'no-debugger': 'warn',
  },
  overrides: [
    {
      files: ['*.vue'],
      rules: {
        // 在 <script setup> 中允许 defineProps 等未使用
        '@typescript-eslint/no-unused-vars': [
          'warn',
          {
            varsIgnorePattern: 'defineProps|defineEmits|defineExpose|withDefaults',
          },
        ],
      },
    },
  ],
}
