const CopyPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const path = require('path');
const webpack = require('webpack');


const prodPlugins = [
    new webpack.LoaderOptionsPlugin({
        minimize: true,
        debug: false
    }),
    new webpack.optimize.UglifyJsPlugin({
        mangle: true,
        sourceMap: true,
        compress: {
            warnings: false, // Suppress uglification warnings
            conditionals: true,
            unused: true,
            comparisons: true,
            sequences: true,
            dead_code: true,
            evaluate: true,
            if_return: true,
            join_vars: true,
            pure_getters: true,
            unsafe: true,
            unsafe_comps: true,
            screw_ie8: true
        },
        output: {
            comments: false,
        },
        exclude: [/\.min\.js$/gi] // skip pre-minified libs
    }),
    new webpack.optimize.AggressiveMergingPlugin()
];

module.exports = {
    target: 'web',
    entry: {
	      client: './src/client/index.tsx'
    },
    output: {
        path: path.resolve(__dirname, 'out', 'client'),
	      publicPath: '/real/client/',
        filename: '[name].js'
    },
    module: {
        rules: [{
            test: /\.(tsx?)$/,
            include: [
                path.resolve(__dirname, 'src', 'client'),
                path.resolve(__dirname, 'src', 'shared')
            ],
            loader: 'ts-loader',
            options: {
                configFileName: 'tsconfig.client.json',
                silent: true
            }
        }, {
	          test: /\.(less|css)$/,
	          include: [
		            path.resolve(__dirname, 'src', 'client'),
		            path.resolve(__dirname, 'src', 'shared'),
		            path.resolve(__dirname, 'node_modules', 'react-datepicker')
	          ],
            loader: ExtractTextPlugin.extract({
                fallback: 'style-loader',
                use: ['css-loader', 'less-loader'],
                publicPath: '/real/client/'
            })
	      }, {
	          test: /\.svg$/,
	          include: [path.resolve(__dirname, 'src', 'shared', 'static')],
	          loader: 'url-loader',
	          options: {
		            limit: 8192,
		            prefix: 'img'
	          }
	      }, {
	          test: /\.html$/,
	          include: [path.resolve(__dirname, 'src', 'shared', 'static')],
            loader: 'file-loader',
            options: {
                name: '[name].[ext]'
            }
	      }, {
	          test: /favicon.ico$/,
	          include: [path.resolve(__dirname, 'src', 'shared', 'static')],
            loader: 'file-loader',
            options: {
                name: '[name].[ext]'
            }
	      }]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.CONTEXT': '"CLIENT"',
            'process.env.NODE_ENV': process.env.ENV === 'LOCAL' ? '"development"' : '"production"'
        }),
        // As we add more languages, we'll select more locales here.
        new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en|ro/),
        // All imports of the config file are to ./shared/config.ts. When compiling things for the
        // client, we need to replace this with ./client/config.ts. Historically it didn't use
        // to be the case and we had the same config. However this turned out to be problematic
        // with newer versions of typescript.
        new webpack.NormalModuleReplacementPlugin(/^[.][/]config$/, function(result) {
            result.request = '../client/config1';
        }),
        // fs is needed in src/shared/config.ts on the server-side in the LOCAl env
        // to load some value from a secrets.json file. Naturally, fs doesn't exist
        // on the client side, so we need to fake it.
        new webpack.NormalModuleReplacementPlugin(/^fs$/, function(result) {
            result.request = './mock-fs';
        }),
        // Ditto for continuation-local-storage.
        new webpack.NormalModuleReplacementPlugin(/^continuation-local-storage$/, function(result) {
            result.request = './mock-continuation-local-storage';
        }),
	      new CopyPlugin([
	          {from: './src/shared/static/index.html'},
	          {from: './src/shared/static/favicon.ico'},
	          {from: './src/shared/static/humans.txt'},
	          {from: './src/shared/static/robots.txt'},
	          {from: './src/shared/static/sitemap.xml'}
	      ]),
	      new ExtractTextPlugin('client.css'),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            minChunks: function (module) {
                // this assumes your vendor imports exist in the node_modules directory
                return module.context && module.context.indexOf('node_modules') !== -1;
            }
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'manifest'
        })
    ].concat(process.env.ENV !== 'LOCAL' ? prodPlugins : []),
    resolve: {
        extensions: ['.js', '.ts', '.tsx', '.css', '.less'],
        modules: [
            path.resolve(__dirname, 'src', 'client'),
            path.resolve(__dirname, 'src', 'shared'),
            path.resolve(__dirname, 'node_modules')
        ]
    },
    devtool: process.env.ENV !== 'LOCAL' ? 'source-map' : 'eval-cheap-module-source-map'
};
