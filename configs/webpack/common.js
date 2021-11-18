/* Copyright 2019 Google LLC. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
==============================================================================*/

const { resolve } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const AutoDllPlugin = require('autodll-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const packageJSON = require('../../package.json');
const vendorDependencies = Object.keys(packageJSON.dependencies);

let dllFilename = '[name].dll.js';
if (process.env.NODE_ENV === 'dev') {
  vendorDependencies.push('react-hot-loader');
  // Add a random id to prevent issues where DLL isn't being served by
  // dev-server
  const id = Math.random()
    .toString()
    .split('.')[1];
  dllFilename = `[name].${id}.dll.js`;
}

module.exports = {
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  entry: './index.tsx',
  context: resolve(__dirname, '../../src'),
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          { loader: 'cache-loader' },
          // {
          //   loader: 'thread-loader',
          //   options: {
          //     // there should be 1 cpu for the fork-ts-checker-webpack-plugin
          //     workers: require('os').cpus().length - 1,
          //     poolTimeout: Infinity, // set this to Infinity in watch mode - see https://github.com/webpack-contrib/thread-loader
          //   },
          // },
          {
            loader: 'ts-loader',
            options: {
              happyPackMode: true, // IMPORTANT! use happyPackMode mode to speed-up compilation and reduce errors reported to webpack
              transpileOnly: true,
            },
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          { loader: 'css-loader', options: { importLoaders: 1 } },
        ],
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loaders: [
          'file-loader?hash=sha512&digest=hex&name=img/[hash].[ext]',
          'image-webpack-loader?bypassOnDebug&optipng.optimizationLevel=7&gifsicle.interlaced=false',
        ],
      },
    ],
  },
  plugins: [
    // new ForkTsCheckerWebpackPlugin({
    //   checkSyntacticErrors: true,
    //   tsconfig: resolve(__dirname, '../../tsconfig.json'),
    //   exclude: '',
    // }),
    new Dotenv(),
    new HtmlWebpackPlugin({ inject: true, template: 'index.html.ejs' }),
    // new AutoDllPlugin({
    //   inject: true, // will inject the DLL bundles to index.html
    //   filename: dllFilename,
    //   entry: {
    //     vendor: vendorDependencies,
    //   },
    //   context: resolve(__dirname, '../../src'),
    // }),
  ],
  performance: {
    hints: false,
  },
};
