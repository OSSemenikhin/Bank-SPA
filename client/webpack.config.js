/**
 * npm i -D webpack webpack-cli
 * npm i -D style-loader css-loader sass-loader sass
 * npm i -D html-webpack-plugin
 * npm i -D webpack-dev-server
 * npm i -D mini-css-extract-plugin
 * npm i -D babel-loader @babel/core @babel/preset-env
 * npm i -D babel-polyfill
 */

const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const SpriteLoaderPlugin = require('svg-sprite-loader/plugin');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
//  const path = require('path');

module.exports = (env) => ({
  entry: './src/app.js',
  output: {
    filename: '[contenthash].js',
    // path: path.resolve(__dirname, './dist'),
    publicPath: '/',
  },
  devServer: {
    hot: true,
    historyApiFallback: true,
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [['@babel/preset-env']],
          },
        },
      },
      {
        test: /\.(png|jpg|jpeg|gif|webp|ttf)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.scss$/i,
        use: [env.prod ? MiniCssExtractPlugin.loader : 'style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.css$/i,
        use: [env.prod ? MiniCssExtractPlugin.loader : 'style-loader', 'css-loader'],
      },
      {
        test: /\.svg$/i,
        use: ['svg-sprite-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({ title: 'Coin.' }),
    new MiniCssExtractPlugin({ filename: '[contenthash].css' }),
    new SpriteLoaderPlugin(),
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: {
            plugins: [
              ['gifsicle', { interlaced: true }],
              ['jpegtran', { progressive: true }],
              ['optipng', { optimizationLevel: 5 }],
            ],
          },
        },
      }),
    ],
  },
});
