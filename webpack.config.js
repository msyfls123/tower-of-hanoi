const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack')


module.exports = {
  mode: 'development',
  entry: {
    'app': path.join(__dirname, 'src', 'app')
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [{
      test: /.tsx?$/,
      include: [
        path.resolve(__dirname, 'src')
      ],
      exclude: [
        path.resolve(__dirname, 'node_modules'),
        path.resolve(__dirname, 'bower_components')
      ],
      use: [
        {
          loader: 'babel-loader',
        },
        { loader: 'ts-loader' },
      ]
    }, {
      test: /.styl$/,
      use: [
        { loader: 'style-loader' },
        { loader: 'css-loader' },
        { loader: 'stylus-loader' },
      ]
    }]
  },
  resolve: {
    extensions: ['.json', '.js', '.ts', '.tsx', '.css']
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Cycle.js is awesome!',
      template: path.join(__dirname, './src/tmpl/index.html'),
    }),
    new webpack.ProvidePlugin({
      // https://godbasin.github.io/2017/09/03/cyclejs-notes-3-use-typescript/
      'SnabbdomCreateElement': ['snabbdom-pragma', 'createElement']
    })
  ],
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  },
  devtool: 'source-map',
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    publicPath: '/',
  }
};