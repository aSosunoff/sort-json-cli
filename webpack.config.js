require("dotenv").config();

const path = require("path");

const { CleanWebpackPlugin } = require("clean-webpack-plugin");

const fileName = (ext) => `[name].${ext}`;

const isDeploy = process.env.GP_DEPLOY === "true";

const pathDemo = process.env.DEMO_PATH;

const CONFIGS = {
  dist: {
    mode: "production",
    context: path.resolve(__dirname, "./src"),
    entry: {
      index: ["./index.ts"],
    },
    output: {
      filename: fileName("js"),
      path: path.resolve(__dirname, "./dist"),
      library: {
        type: "umd",
      },
    },
    // externals: {
    //   /* react: "umd react", */
    //   /* "react-dom": "amd react-dom", */
    // },
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
      fallback: {
        /* fs: false, */
        "spdx-license-ids": false,
        "spdx-exceptions": false,
      },
    },
    target: "node",
    optimization: {
      minimize: false,
    },
    plugins: [new CleanWebpackPlugin() /* , new NodePolyfillPlugin() */],
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: [
            {
              loader: "babel-loader",
              options: {
                presets: ["@babel/preset-env"],
              },
            },
            {
              loader: "ts-loader",
            },
          ],
        },
      ],
    },
  },
  /* production: {
    mode: "production",
    context: path.resolve(__dirname, "./src"),
    entry: {
      index: ["./index.ts"],
    },
    output: {
      filename: fileName("js"),
      path: path.resolve(__dirname, "./dist"),
      library: {
        type: "umd",
      },
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
    },
    plugins: [new CleanWebpackPlugin()],
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: ["babel-loader"],
        },

        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: [
            "babel-loader",
            {
              loader: "ts-loader",
              options: {
                configFile: "tsconfig.production.json",
              },
            },
          ],
        },

        {
          test: /\.(s[ac]|c)ss$/i,
          use: [
            "style-loader",
            {
              loader: "css-loader",
              options: {
                modules: {
                  auto: true,
                  localIdentName: "[name]__[local]",
                },
              },
            },
            "sass-loader",
          ],
        },

        {
          test: /\.(ttf|woff|woff2|eot|png|jpe?g|gif)$/i,
          type: "asset/resource",
        },
      ],
    },
  }, */
  /* default: {
    mode: "development",
    context: path.resolve(__dirname, `./${pathDemo}`),
    devtool: "eval-source-map",
    entry: {
      index: ["./index.tsx"],
    },
    output: {
      filename: fileName("js"),
      path: path.resolve(__dirname, "./distServer"),
    },
    devServer: {
      port: 9000,
      hot: true,
      compress: true,
      publicPath: "/",
      contentBase: path.join(__dirname, "./distServer"),
      historyApiFallback: true,
      writeToDisk: false,
      stats: "minimal",
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js", ".scss"],
    },
    plugins: [new ReactRefreshWebpackPlugin()],
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: [babelLoader],
        },

        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: [
            babelLoader,
            {
              loader: "ts-loader",
              options: {
                configFile: "tsconfig.json",
              },
            },
          ],
        },

        {
          test: /\.(s[ac]|c)ss$/i,
          use: [
            "style-loader",
            {
              loader: "css-loader",
              options: {
                modules: {
                  auto: true,
                  localIdentName: "[name]__[local]",
                },
              },
            },
            "sass-loader",
          ],
        },

        {
          test: /\.(ttf|woff|woff2|eot|png|jpe?g|gif)$/i,
          type: "asset/resource",
        },
      ],
    },
  }, */
};

const config = CONFIGS[process.env.CONFIG] || CONFIGS.default;

module.exports = {
  ...config,
};
