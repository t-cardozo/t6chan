const path = require('path');
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const WebpackShellPlugin = require('webpack-shell-plugin');

module.exports = {
    mode: "development",
    entry: {
        app: './src/scripts/index.js'
    },
    devServer: {
        contentBase: './dist',
        hot: false
    },
    optimization: {
        minimizer: [
            new UglifyJSPlugin({
                sourceMap: true,
                uglifyOptions: {
                    compress: {
                        inline: false
                    }
                }
            })
        ],
        runtimeChunk: false,
        splitChunks: {
            cacheGroups: {
                default: false,
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendor_app',
                    chunks: 'all',
                    minChunks: 2
                }
            }
        }
    },
    plugins: [
        new WebpackShellPlugin({
            onBuildEnd: [
                'echo "Transfering files ... "',
                'cp -r dist/app.bundle.js ../halo_web/htdocs/halo/report'
            ]
        })
    ],
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].bundle.js',
    },
    module: {
        rules: [{
            test: /\.css$/,
            use: [
                'style-loader',
                'css-loader'
            ]
        },
        {
            test: /\.(png|svg|jpg|gif)$/,
            loader: 'file-loader'
        }
        ]
    }
};