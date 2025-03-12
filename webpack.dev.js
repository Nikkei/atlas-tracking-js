const path = require('path');

module.exports = {
    mode: 'development',
    entry: "./test/index.test.js",
    output: {
        path: path.resolve(__dirname, 'test/build'),
        filename: 'test.js',
        environment: {
            arrowFunction: false,
        }
    }
};