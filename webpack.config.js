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
            test: /\.(tsx?|text)$/,
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
        failPlugin,
	new CopyPlugin([
	    {from: './src/client/static/index.html'},
	    {from: './src/client/static/favicon.ico'}
	]),
	new ExtractTextPlugin('client.css')
    ],
    resolve: {
        extensions: ['', '.js', '.ts', '.tsx', '.css', '.less'],
        root: [
            path.resolve(__dirname, 'src', 'client'),
            path.resolve(__dirname, 'src', 'shared'),	    
        ]
    },
    devtool: 'source-map'
};
