const path = require("path")
const webpack = require('webpack')

module.exports = {
    entry: "./index.tsx",
    output: { path: __dirname, filename: "bundle.js" },
    resolve: {
        extensions: [".js", ".jsx", "ts", "tsx"],
        alias: {
            'react': path.resolve('node_modules/react'),
            'react-dom': path.resolve('node_modules/react-dom'),
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
                exclude: /node_modules/,
                use: ["style-loader", "css-loader", "sass-loader"]
            },
        ]
    },
}
