const {getDefaultConfig} = require('expo/metro-config');
const fs = require('fs');
const path = require('path');

const config = getDefaultConfig(__dirname);

const localConfigPath = path.join(__dirname, 'src/config/local.ts');

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const origin = context.originModulePath
    ? context.originModulePath.split(path.sep).join('/')
    : '';
  if (
    (moduleName === './override' || moduleName === './override.ts') &&
    origin.endsWith('/src/config/index.ts') &&
    fs.existsSync(localConfigPath)
  ) {
    return context.resolveRequest(context, localConfigPath, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
