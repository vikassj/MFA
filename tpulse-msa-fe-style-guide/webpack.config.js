const { merge } = require("webpack-merge");
const singleSpaDefaults = require("webpack-config-single-spa");

module.exports = (webpackConfigEnv, argv) => {
  const defaultConfig = singleSpaDefaults({
    orgName: "detect",
    projectName: "style-guide",
    webpackConfigEnv,
    argv,
  });

  return merge(defaultConfig, {
    // modify the webpack config however you'd like to by adding to this object
    module: {
      rules: [
        {
          test: /\.scss$/, // Match .scss files
          use: [
            'style-loader', // Injects styles into DOM
            'css-loader',   // Translates CSS into CommonJS
            'sass-loader'   // Compiles Sass to CSS
          ],
        },
        // Other rules...
      ],
    },
  });
};