// const HtmlWebpackPlugin = require("html-webpack-plugin");
// const webpack = require("webpack");
// const path = require("path");
// const { spawn } = require("child_process");

// module.exports = {
//   module: {
//     rules: [
//       {
//         test: /\.css$/,
//         use: [{ loader: "style-loader" }, { loader: "css-loader" }],
//       },
//       {
//         test: /\.jsx?$/,
//         use: [{ loader: "babel-loader", options: { compact: false } }],
//       },
//       {
//         test: /\.(jpe?g|png|gif)$/,
//         use: [{ loader: "file-loader?name=img/[name]__[hash:base64:5].[ext]" }],
//       },
//       {
//         test: /\.(eot|svg|ttf|woff|woff2)$/,
//         use: [
//           { loader: "file-loader?name=font/[name]__[hash:base64:5].[ext]" },
//         ],
//       },
//     ],
//   },
//   target: "react-electron",
//   plugins: [
//     new HtmlWebpackPlugin({ title: "Electron App" }),
//     new webpack.DefinePlugin({
//       "process.env.NODE_ENV": JSON.stringify("development"),
//     }),
//   ],
//   devtool: "cheap-source-map",
//   devServer: {
//     static: {
//       directory: path.resolve(__dirname, "dist"),
//     },
//     client: {
//       logging: "none",
//     },
//     stats: {
//       colors: true,
//       chunks: false,
//       children: false,
//     },
//     setup(app) {
//       spawn("electron", ["."], {
//         shell: true,
//         env: process.env,
//         stdio: "inherit",
//       })
//         .on("close", (code) => process.exit(0))
//         .on("error", (spawnError) => console.log(spawnError));
//     },
//   },
// };

const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { spawn } = require("child_process");

module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [{ loader: "style-loader" }, { loader: "css-loader" }],
      },
      {
        test: /\.jsx?$/,
        use: [{ loader: "babel-loader", query: { compact: false } }],
      },
      {
        test: /\.(jpe?g|png|gif)$/,
        use: [{ loader: "file-loader?name=img/[name]__[hash:base64:5].[ext]" }],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        use: [
          { loader: "file-loader?name=font/[name]__[hash:base64:5].[ext]" },
        ],
      },
    ],
  },
  target: "electron-renderer",
  plugins: [
    new HtmlWebpackPlugin({
      title: "Navyug Laboratory",

      meta: {
        "http-equiv": {
          "http-equiv": "Content-Security-Policy",
          content:
            "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data:;",
        },
      },
    }),
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("development"),
    }),
  ],
  devtool: "cheap-source-map",
  devServer: {
    contentBase: path.resolve(__dirname, "dist"),
    stats: {
      colors: true,
      chunks: false,
      children: false,
    },
    before() {
      spawn("electron", ["."], {
        shell: true,
        env: process.env,
        stdio: "inherit",
      })
        .on("close", (code) => process.exit(0))
        .on("error", (spawnError) => console.error(spawnError));
    },
  },
};

// "webpack": "^4.43.0",
// "webpack-cli": "^3.3.11",
// "webpack-dev-server": "^3.10.3"
// "html-webpack-plugin": "^4.3.0",

// "webpack": "^5.96.1",
// "webpack-cli": "^5.1.4",
// "webpack-dev-server": "^4.15.2"
// "html-webpack-plugin": "^5.6.3",
