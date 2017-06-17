const CopyPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const path = require('path');
const webpack = require('webpack');


const prodPlugins = [
    new webpack.optimize.UglifyJsPlugin({
        mangle: true,
        sourceMap: true,
        compress: {
            warnings: false, // Suppress uglification warnings
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
		path.resolve(__dirname, 'node_modules')
	    ],
            loader: ExtractTextPlugin.extract({
                fallback: 'style-loader',
                use: ['css-loader', 'less-loader'],
                publicPath: '/real/client/'
            })
	}, {
	    test: /\.html$/,
	    include: [path.resolve(__dirname, 'src', 'client', 'static')],
            loader: 'file-loader',
            options: {
                name: '[name].[ext]'
            }
	}, {
	    test: /favicon.ico$/,
	    include: [path.resolve(__dirname, 'src', 'client', 'static')],
            loader: 'file-loader',
            options: {
                name: '[name].[ext]'
            }
	}],
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.CONTEXT': '"CLIENT"',
            'process.env.NODE_ENV': process.env.ENV === 'LOCAL' ? '"development"' : '"production"'
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
        new webpack.NoEmitOnErrorsPlugin()
    ].concat(process.env.ENV !== 'LOCAL' ? prodPlugins : []),
    resolve: {
        extensions: ['.js', '.ts', '.tsx', '.css', '.less'],
        modules: [
            path.resolve(__dirname, 'src', 'client'),
            path.resolve(__dirname, 'src', 'shared'),
            path.resolve(__dirname, 'node_modules')
        ]
    },
    devtool: 'source-map'
};
