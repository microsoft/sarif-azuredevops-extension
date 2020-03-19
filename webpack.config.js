const path = require("path")

module.exports = {
    entry: "./index.tsx",
	output: { path: __dirname, filename: "bundle.js" },
	mode: 'production',
    resolve: {
        extensions: [".js", ".ts", ".tsx"],
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
                use: ["style-loader", "css-loader", "sass-loader"]
			},
			{ test: /\.png$/, use: 'url-loader' },
			{ test: /\.woff$/, use: 'url-loader' },
        ]
    },
    devServer : { port: 8080, https: true, stats: 'none' }
}
