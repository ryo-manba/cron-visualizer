module.exports = function override(config) {
  // Enable WebAssembly support
  config.experiments = {
    ...config.experiments,
    asyncWebAssembly: true,
  };

  // Add rule for .wasm files
  config.module.rules.push({
    test: /\.wasm$/,
    type: 'webassembly/async',
  });

  return config;
};