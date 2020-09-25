// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const path = require('path')

const common = {
	mode: 'production',
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
}

module.exports = [
	{
		...common,
		entry: path.join(__dirname, 'src', 'build.tsx'),
		output: { path: path.join(__dirname, 'src'), filename: 'build.js' },
		performance: {
			maxAssetSize: 1.3 * 1024 * 1024,
			maxEntrypointSize: 1.3 * 1024 * 1024,
		},
		devServer : {
			host: '0.0.0.0', // Neccesary to server outside localhost
			port: 8080,
			stats: 'none',
			https: true,
		},
	},	
	{
		...common,
		entry: path.join(__dirname, 'src', 'workItem.tsx'),
		output: { path: path.join(__dirname, 'src'), filename: 'workItem.js' },
		performance: {
			maxAssetSize: 1.12 * 1024 * 1024,
			maxEntrypointSize: 1.12 * 1024 * 1024,
		},
	},
]
