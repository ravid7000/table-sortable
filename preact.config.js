import { resolve } from "path";
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

export default {
  /**
   * Function that mutates the original webpack config.
   * Supports asynchronous changes when a promise is returned (or it's an async function).
   *
   * @param {object} config - original webpack config.
   * @param {object} env - options passed to the CLI.
   * @param {WebpackConfigHelpers} helpers - object with useful helpers for working with the webpack config.
   * @param {object} options - this is mainly relevant for plugins (will always be empty in the config), default to an empty object
   **/
  webpack(config, env, helpers, options) {
      delete config.entry.polyfills;
      config.output.filename = "[name].js";

      config.plugins = config.plugins.filter(plugin => !(plugin instanceof MiniCssExtractPlugin));
      config.module.rules = config.module.rules.map(rule => {
        if (rule.loader === 'babel-loader') {
          const use = [
            {
              loader: 'babel-loader',
              options: rule.options
            },
            {
              loader: 'ts-loader'
            }
          ];
          return {
            ...rule,
            loader: undefined,
            options: undefined,
            use
          };
        }
        if (rule.use) {
          return {
            ...rule,
            use: rule.use.reduce((acc, loader) => {
              loader !== MiniCssExtractPlugin.loader ? acc.push(loader) : acc.push(
                'style-loader');
    
              return acc;
            }, []),
          };
        }
    
        return rule;
      });

      // Use any `index` file, not just index.js
      config.resolve.alias["preact-cli-entrypoint"] = resolve(
          process.cwd(),
          "src",
          "index"
      );

      if (env.production) {
        config.output.libraryTarget = 'umd';
      }
  }
};
