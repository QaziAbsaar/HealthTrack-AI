const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for TypeScript paths and additional file types
config.resolver.alias = {
  '@': './src',
};

module.exports = config;
