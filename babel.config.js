module.exports = {
    presets: ['module:metro-react-native-babel-preset'],
    plugins: [
        [
            require.resolve('babel-plugin-module-resolver'),
            {
                cwd: 'babelrc',
                extensions: ['.ts', '.tsx', '.js', '.ios.js', '.android.js'],
                alias: {
                    shared: './app/shared/',
                    components: './app/modules/components/',
                    app: './app/',
                },
            },
        ],
        'jest-hoist',
        // 'react-native-reanimated/plugin',
    ],
};
