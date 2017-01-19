const failPlugin = require('webpack-fail-plugin');
const path = require('path');
const webpack = require('webpack');

const commonConfig = {
    plugins: [
        failPlugin,
    ],
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
    resolve: {
        extensions: ['', '.js', '.ts'],
        root: [
            path.resolve(__dirname, 'src', 'server'),
            path.resolve(__dirname, 'tests')
        ]
    },
});

const clientConfig = Object.assign({}, commonConfig, {
    target: 'web',
    entry: {
	app: './src/client/index.ts'
    },
    output: {
        path: path.resolve(__dirname, 'out', 'client'),
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
	    test: /\.(json)$/,
	    include: [
		path.resolve(__dirname, 'src', 'client'),
		path.resolve(__dirname, 'node_modules')
	    ],
	    loader: 'json'
	}],
    },
    resolve: {
        extensions: ['', '.js', '.ts'],
        root: [
            path.resolve(__dirname, 'src', 'client')
        ]
    },
    plugins: [
        failPlugin,
    ],
    devtool: 'source-map'
});

module.exports = [serverConfig, clientConfig];
