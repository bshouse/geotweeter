'use strict';

var _ = require('lodash');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var LIB_NAME = 'react-simpletabs';
var DIST_NAME = 'react-simpletabs-dist';


var banner = _.template([
  '',
  ' Geotweeter React - <%= pkg.description %>',
  ' @version v<%= pkg.version %>',
  ' @link <%= pkg.homepage %>',
  ' @license <%= pkg.license %>',
  ' @author <%= pkg.author.name %> (<%= pkg.author.url %>)',
  ''
  
].join('\n'), {
  pkg: require('./package.json')
});


module.exports = {
  entry: './lib/' + LIB_NAME + '.jsx',
  output: {
    path: __dirname + '/static',
    filename: DIST_NAME + '.js',
    libraryTarget: 'umd',
    library: 'ReactSimpleTabs'
  },
  externals: {
    react: {
      root: 'React',
      commonjs: 'react',
      commonjs2: 'react',
      amd: 'react'
    }
  },
  module: {
    loaders: [{
      test: /\.(js|jsx)$/,
      loader: 'jsx-loader?harmony'
    }, {
      test: /\.(js|jsx)$/,
      loader: 'jsx-loader?insertPragma=React.DOM'
    }, {
      test: /\.css/,
      loader: ExtractTextPlugin.extract(
        'style-loader',
        '!css-loader'
      )
    }]
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
      }
    }),
    new ExtractTextPlugin(LIB_NAME + '.css', {
      allChunks: true
    }),
    new webpack.BannerPlugin(banner, { entryOnly: true })
  ]
};