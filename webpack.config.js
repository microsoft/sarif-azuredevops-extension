// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const { DefinePlugin } = require('webpack')

module.exports = env => ({
	mode: 'production',
	entry: {
		build: path.join(__dirname, 'src', 'build.tsx'),
		workItem: path.join(__dirname, 'src', 'workItem.tsx'),
	},
	output: {
		clean: true,
		filename: '[name].js',
		path: path.resolve(__dirname, 'dist'),
	},
	resolve: {
		// LHS must match webpack `externals` of sarif-web-component.
		extensions: ['.js', '.ts', '.tsx'],
		alias: {
			'React': path.resolve('node_modules/react'),
			'ReactDOM': path.resolve('node_modules/react-dom'),
		},
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/
			},
			{
				test: /\.s?css$/,
				use: ['style-loader', 'css-loader', 'sass-loader']
			},
			{ test: /\.png$/, use: 'url-loader' },
			{ test: /\.woff$/, use: 'url-loader' },
		]
	},
	devServer : {
		host: '0.0.0.0', // Necessary to server outside localhost
		port: 8080,
		https: true,
	},
	plugins: [
		new DefinePlugin({
			CONNECTION_STRING: JSON.stringify(env?.CONNECTION_STRING ?? ''),
		}),
		new CopyWebpackPlugin({
			patterns: [{ from: "**/*.html", context: "src" }],
		}),
	],
})
