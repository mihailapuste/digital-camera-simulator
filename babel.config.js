module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', {worklets: false}]],
    plugins: [
      [
        'module-resolver',
        {
          root: ['.'],
          extensions: [
            '.ios.js',
            '.android.js',
            '.web.js',
            '.js',
            '.ts',
            '.tsx',
            '.json',
          ],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@hooks': './src/hooks',
            '@navigation': './src/navigation',
            '@screens': './src/screens',
            '@services': './src/services',
            '@stores': './src/stores',
          },
        },
      ],
      // Must stay last. The Expo preset's copy is disabled above.
      'react-native-worklets/plugin',
    ],
  };
};
