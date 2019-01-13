const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack')


module.exports = {
  mode: 'development',
  entry: [
    path.join(__dirname, 'src', 'app')
  ],
  output: {
    filename: 'bundle.js',
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
    }]
  },
  resolve: {
    extensions: ['.json', '.js', '.ts', '.tsx', '.css']
  },
  plugins: [
    new HtmlWebpackPlugin(),
    new webpack.ProvidePlugin({
      // https://godbasin.github.io/2017/09/03/cyclejs-notes-3-use-typescript/
      'SnabbdomCreateElement': ['snabbdom-pragma', 'createElement']
    })
  ],
  devtool: 'source-map',
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    publicPath: '/',
  }
};