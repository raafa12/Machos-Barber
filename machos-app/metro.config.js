const { getDefaultConfig } = require('metro-config');

module.exports = (async () => {
  const defaultConfig = await getDefaultConfig();
  return {
    ...defaultConfig,
    resolver: {
      ...defaultConfig.resolver,
      // Agrega aquí cualquier personalización de resolución si es necesario
    },
  };
})();


