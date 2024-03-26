module.exports = {
  settings: {
    react: {
      version: 'detect',
    },
  },
  env: {
    es2021: true,
    node: true,
    'react-native/react-native': true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:jsx-a11y/recommended',
    'prettier',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['react', 'react-native', 'jsx-a11y'],
  rules: {
    // allow .js files to contain JSX code
    'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],

    // prevent eslint to complain about the "styles" variable being used before it was defined
    'no-use-before-define': ['error', { variables: false }],

    'react-native/no-raw-text': 2,
    'react-native/no-unused-styles': 2,
    'react-native/no-single-element-style-arrays': 2,
  },
};
