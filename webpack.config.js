const CopyPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const failPlugin = require('webpack-fail-plugin');
const path = require('path');
const webpack = require('webpack');

const commonConfig = {
    devtool: 'source-map'
};

const serverConfig = Object.assign({}, commonConfig, {
    target: 'node',
    entry: {
	app: './src/server/index.ts',
	tests: './tests/index.ts',
    },
    output: {
        path: path.resolve(__dirname, 'out', 'server'),
        filename: '[name].js'
    },
    module: {
        loaders: [{
            test: /\.ts$/,
            include: [
                path.resolve(__dirname, 'src', 'server'),
                path.resolve(__dirname, 'tests')
            ],
            loader: 'ts',
            query: {
                configFileName: 'tsconfig.json',
                silent: true
            }
        }, {
	    test: /\.(json)$/,
	    include: [
		path.resolve(__dirname, 'src', 'server'),
		path.resolve(__dirname, 'node_modules')
	    ],
	    loader: 'json'
	}],
    },
    plugins: [
        failPlugin,
    ],
    resolve: {
        extensions: ['', '.js', '.ts'],
        root: [
            path.resolve(__dirname, 'src', 'server'),
            path.resolve(__dirname, 'tests')
        ]
    }
});

const clientConfig = Object.assign({}, commonConfig, {
    target: 'web',
    entry: {
	app: './src/client/index.ts'
    },
    output: {
        path: path.resolve(__dirname, 'out', 'client'),
	publicPath: '/out/client/',
        filename: '[name].js'
    },
    module: {
        loaders: [{
            test: /\.ts$/,
            include: [
                path.resolve(__dirname, 'src', 'client')
            ],
            loader: 'ts',
            query: {
                configFileName: 'tsconfig.json',
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
	new ExtractTextPlugin('app.css')
    ],
    resolve: {
        extensions: ['', '.js', '.ts', '.css', '.less'],
        root: [
            path.resolve(__dirname, 'src', 'client')
        ]
    }
});

module.exports = [serverConfig, clientConfig];
