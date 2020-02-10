'use strict';

process.env.NODE_ENV = 'production';

const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const safePostCssParser = require('postcss-safe-parser');
const getCSSModuleLocalIdent = require('react-dev-utils/getCSSModuleLocalIdent');
const paths = require('./paths');

const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;
const sassRegex = /\.(scss|sass)$/;
const sassModuleRegex = /\.module\.(scss|sass)$/;

const shouldUseSourceMap = false;
const isEnvProduction = true;
const bundleName = 'table-sortable';

const getStyleLoaders = (cssOptions, preProcessor) => {
    const loaders = [
        {
            loader: MiniCssExtractPlugin.loader,
        },
        {
            loader: require.resolve('css-loader'),
            options: cssOptions,
        },
        {
            loader: require.resolve('postcss-loader'),
            options: {
                ident: 'postcss',
                plugins: () => [
                    require('postcss-flexbugs-fixes'),
                    require('postcss-preset-env')({
                        autoprefixer: {
                            flexbox: 'no-2009',
                        },
                        stage: 3,
                    }),
                ],
                sourceMap: isEnvProduction && shouldUseSourceMap,
            },
        },
    ].filter(Boolean);
    if (preProcessor) {
        loaders.push({
            loader: require.resolve(preProcessor),
            options: {
                sourceMap: isEnvProduction && shouldUseSourceMap,
            },
        });
    }
    return loaders;
};

module.exports = {
    target: 'web',
    mode: 'production',
    entry: {
        app: ['./src/TableSortable/index.js']
    },
    output: {
        path: path.resolve(__dirname, '../dist'),
        filename: `${bundleName}.js`,
    },
    externals: {
        jquery: 'jQuery'
    },
    optimization: {
        minimize: isEnvProduction,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    parse: {
                        ecma: 8,
                    },
                    compress: {
                        ecma: 5,
                        warnings: false,
                        comparisons: false,
                        inline: 2,
                    },
                    mangle: {
                        safari10: true,
                    },
                    output: {
                        ecma: 5,
                        comments: false,
                        ascii_only: true,
                    },
                },
                parallel: true,
                cache: true,
                sourceMap: shouldUseSourceMap,
            }),
            new OptimizeCSSAssetsPlugin({
                cssProcessorOptions: {
                    parser: safePostCssParser,
                    map: shouldUseSourceMap
                        ? {
                            inline: false,
                            annotation: true,
                        }
                        : false,
                },
            }),
        ],
    },
    module: {
        strictExportPresence: true,
        rules: [
            { parser: { requireEnsure: false } },
            {
                test: /\.(js|mjs|jsx)$/,
                enforce: 'pre',
                use: [
                    {
                        options: {
                            formatter: require.resolve('react-dev-utils/eslintFormatter'),
                            eslintPath: require.resolve('eslint'),

                        },
                        loader: require.resolve('eslint-loader'),
                    },
                ],
                include: paths.appSrc,
            },
            {
                oneOf: [
                    {
                        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                        loader: require.resolve('url-loader'),
                        options: {
                            limit: 10000,
                            name: 'static/media/[name].[hash:8].[ext]',
                        },
                    },
                    {
                        test: /\.(js|mjs|jsx|ts|tsx)$/,
                        include: paths.appSrc,
                        loader: require.resolve('babel-loader'),
                        options: {
                            customize: require.resolve(
                                'babel-preset-react-app/webpack-overrides'
                            ),

                            plugins: [
                                [
                                    require.resolve('babel-plugin-named-asset-import'),
                                    {
                                        loaderMap: {
                                            svg: {
                                                ReactComponent: '@svgr/webpack?-svgo,+ref![path]',
                                            },
                                        },
                                    },
                                ],
                            ],
                            cacheDirectory: true,
                            cacheCompression: isEnvProduction,
                            compact: isEnvProduction,
                        },
                    },
                    {
                        test: /\.(js|mjs)$/,
                        exclude: /@babel(?:\/|\\{1,2})runtime/,
                        loader: require.resolve('babel-loader'),
                        options: {
                            babelrc: false,
                            configFile: false,
                            compact: false,
                            presets: [
                                [
                                    require.resolve('babel-preset-react-app/dependencies'),
                                    { helpers: true },
                                ],
                            ],
                            cacheDirectory: true,
                            cacheCompression: isEnvProduction,
                            sourceMaps: false,
                        },
                    },
                    {
                        test: cssRegex,
                        exclude: cssModuleRegex,
                        use: getStyleLoaders({
                            importLoaders: 1,
                            url: false,
                            sourceMap: isEnvProduction && shouldUseSourceMap,
                        }),
                        sideEffects: true,
                    },
                    {
                        test: cssModuleRegex,
                        use: getStyleLoaders({
                            importLoaders: 1,
                            sourceMap: isEnvProduction && shouldUseSourceMap,
                            modules: true,
                            url: false,
                            getLocalIdent: getCSSModuleLocalIdent,
                        }),
                    },
                    {
                        test: sassRegex,
                        exclude: sassModuleRegex,
                        use: getStyleLoaders(
                            {
                                importLoaders: 2,
                                url: false,
                                sourceMap: isEnvProduction && shouldUseSourceMap,
                            },
                            'sass-loader'
                        ),
                        sideEffects: true,
                    },
                    {
                        test: sassModuleRegex,
                        use: getStyleLoaders(
                            {
                                importLoaders: 2,
                                sourceMap: isEnvProduction && shouldUseSourceMap,
                                modules: true,
                                url: false,
                                getLocalIdent: getCSSModuleLocalIdent,
                            },
                            'sass-loader'
                        ),
                    },
                    {
                        loader: require.resolve('file-loader'),
                        exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
                        options: {
                            name: 'static/media/[name].[hash:8].[ext]',
                        },
                    },
                ],
            },
        ],
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: `${bundleName}.css`,
        }),
    ],
    node: {
        node: 'empty',
        module: 'empty',
        dgram: 'empty',
        dns: 'mock',
        fs: 'empty',
        net: 'empty',
        tls: 'empty',
        child_process: 'empty',
    },
    performance: false,
}
