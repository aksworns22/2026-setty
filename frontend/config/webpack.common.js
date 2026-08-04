const path = require('node:path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const root = path.resolve(__dirname, '..');

/** @type {import('webpack').Configuration} */
module.exports = {
  entry: path.join(root, 'src/index.tsx'),

  output: {
    path: path.join(root, 'dist'),
    publicPath: '/',
    clean: true,
  },

  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
    alias: { '@': path.join(root, 'src') },
  },

  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: { cacheDirectory: true },
        },
      },
      {
        test: /\.(png|jpe?g|gif|webp|avif)$/i,
        type: 'asset',
        parser: { dataUrlCondition: { maxSize: 8 * 1024 } },
      },
      {
        test: /\.svg$/i,
        type: 'asset/resource',
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(root, 'public/index.html'),
    }),
    new ForkTsCheckerWebpackPlugin(),
    new Dotenv({
      systemvars: true,  
      silent: true, 
    }),
  ],

  cache: { type: 'filesystem' },
};