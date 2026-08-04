const { merge } = require('webpack-merge');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const common = require('./webpack.common');

/** @type {import('webpack').Configuration} */
module.exports = merge(common, {
  mode: 'development',
  devtool: 'eval-cheap-module-source-map',

  output: {
    filename: '[name].js',
    assetModuleFilename: 'assets/[name][ext]',
  },

  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
    ],
  },

  plugins: [new ReactRefreshWebpackPlugin()],

  devServer: {
    port: 3000,
    hot: true,
    open: true,
    historyApiFallback: true,
    client: { overlay: { errors: true, warnings: false } },
  },
});