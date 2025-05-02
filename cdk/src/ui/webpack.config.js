const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = (env) => {
    const isProduction = env.NODE_ENV === 'production';
    const dotenvFilename = isProduction ? '.env.production' : '.env.development';

    return {
        entry: './src/index.tsx',
        output: {
            filename: 'bundle.js',
            path: path.resolve(__dirname, 'dist')
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
        },
        module: {
            rules: [
                {
                    test: /\.(ts|tsx)$/,
                    exclude: /node_modules/,
                    use: 'babel-loader'
                }
            ]
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: './src/index.html'
            }),
            new Dotenv({
                path: dotenvFilename,
            }),
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV),
            }),
            new CopyPlugin({
                patterns: [
                    { from: "appSettings.json", to: "appSettings.json" }
                ],
            })
        ]
    }
};