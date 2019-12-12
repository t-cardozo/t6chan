const path = require("path");
const webpack = require("webpack");

module.exports = {
  mode: "development",
  entry: {
    app: "./src/t6chan.js"
  },
  devServer: {
    contentBase: "./dist",
    hot: true
  },
  optimization: {
    minimizer: [],
    runtimeChunk: false,
    splitChunks: {
      cacheGroups: {
        default: false,
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendor_app",
          chunks: "all",
          minChunks: 2
        }
      }
    }
  },
  plugins: [],
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "t6chan.js"
  }
};
