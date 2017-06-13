const CopyPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const failPlugin = require('webpack-fail-plugin');
const path = require('path');
const webpack = require('webpack');

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
        loaders: [{
            test: /\.(tsx?)$/,
            include: [
                path.resolve(__dirname, 'src', 'client'),
                path.resolve(__dirname, 'src', 'shared')
            ],
            loader: 'ts',
            query: {
                configFileName: 'tsconfig.client.json',
                silent: true
            }
        }, {
	    test: /\.(less|css)$/,
	    include: [
		path.resolve(__dirname, 'src', 'client'),
		path.resolve(__dirname, 'node_modules')
	    ],
	    loader: ExtractTextPlugin.extract('style', 'css?sourceMap!less')
	}, {
	    test: /\.html$/,
	    include: [path.resolve(__dirname, 'src', 'client', 'static')],
	    loader: 'file?name=[name].[ext]'
	}, {
	    test: /favicon.ico$/,
	    include: [path.resolve(__dirname, 'src', 'client', 'static')],
	    loader: 'file?name=[name].[ext]'
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
        failPlugin,
	new CopyPlugin([
	    {from: './src/shared/static/index.html'},
	    {from: './src/shared/static/favicon.ico'}
	]),
	new ExtractTextPlugin('client.css')
    ],
    resolve: {
        extensions: ['', '.js', '.ts', '.tsx', '.css', '.less'],
        root: [
            path.resolve(__dirname, 'src', 'client'),
            path.resolve(__dirname, 'src', 'shared'),
            path.resolve(__dirname, 'node_modules')
        ]
    },
    devtool: 'source-map'
};
