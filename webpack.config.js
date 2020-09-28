const path = require('path');
const Dotenv = require('dotenv-webpack');
const NODE_ENV = process.env.NODE_ENV || 'development';
const mode = NODE_ENV === 'production' ? 'production' : 'development';
const HtmlWebPackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const autoprefixer = require('autoprefixer');
const BASE_PATH = JSON.stringify('/');
var JavaScriptObfuscator = require('webpack-obfuscator');

module.exports = {
  entry: ['react-hot-loader/patch', './src'],
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: '[name].[contenthash].js',
  },
  mode,
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          name: 'vendor',
          test: /[\\/]node_modules[\\/]/,
        },
      },
    },
  },
  node: {
    fs: 'empty',
    // buffer: 'empty',
    // http: 'empty',
    path: 'empty',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
            },
          },
        ],
      },
      {
        test: /\.(mov|mp4)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
            },
          },
        ],
      },
      {
        test: /\.(gltf|bin)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
            },
          },
        ],
      },
      // stylesheet for global classes from external dependencies like react-md
      {
        test: path.resolve(__dirname, 'src/index.scss'),
        use: [
          { loader: MiniCssExtractPlugin.loader },
          { loader: 'css-loader' },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: [autoprefixer],
            },
          },
          {
            loader: 'sass-loader',
            options: {
              prependData: `$base-path: ${BASE_PATH};`,
              sassOptions: {
                includePaths: [
                  path.resolve('./node_modules'),
                ],
              },
            },
          },
        ],
      },
      // stylesheets for application-specific stylesheets
      {
        test: /\.(css|scss)$/,
        // exclude: path.resolve(__dirname, 'src/styles/'),
        use: [
          { loader: MiniCssExtractPlugin.loader },
          {
            loader: 'css-loader',
            options: {
              // modules: {
              //   localIdentName,
              // },
              importLoaders: 1,
              // minimize: true
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: [
                autoprefixer,
                // make sure TagThat's stylesheets take precedence over react-md and .dark react-md
                // increaseSpecificity({ repeat: 1, stackableRoot: ':global(.wasmproject)' })
              ],
            },
          },
          {
            loader: 'sass-loader',
            options: {
              prependData: `$base-path: ${BASE_PATH};`,
              sassOptions: {
                includePaths: [
                  path.resolve('./node_modules'),
                ],
              },
            },
          },
        ],
      },
      {
        test: /\.(glsl|vs|fs|vert|frag)$/,
        exclude: /node_modules/,
        use: [
          'raw-loader',
          'glslify-loader',
        ],
      }
    ],
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: path.resolve(__dirname, './src/index.html'),
      filename: path.resolve(__dirname, './public/index.html')
    }),
    new JavaScriptObfuscator(),
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
    new Dotenv(),
  ],
  // devtool: 'eval-source-map',
  devServer: {
    contentBase: path.join(__dirname, 'public'),
    compress: false,
    port: 8080
  },
};
