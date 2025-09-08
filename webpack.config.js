const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    target: 'node',
    mode: 'production',
    entry: './src/index.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js',
        clean: true,
    },
    resolve: {
        extensions: ['.ts', '.js'],
        modules: ['node_modules'],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: 'src/task.json',
                    to: 'task.json',
                },
            ],
        }),
    ],
    optimization: {
        minimize: false, // Keep readable for debugging
    },
    node: {
        __dirname: false,
        __filename: false,
    },
    ignoreWarnings: [
        {
            module: /node_modules\/azure-pipelines-task-lib/,
        },
    ],
};
