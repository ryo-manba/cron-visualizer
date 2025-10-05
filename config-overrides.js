module.exports = function override(config) {
  // Enable WebAssembly support
  config.experiments = {
    ...config.experiments,
    asyncWebAssembly: true,
  };

  return config;
};