const path = require('path');

module.exports = {
    mode: 'development',
    entry: "./src/utils.js",
    output: {
        path: path.resolve(__dirname, 'test/build'),
        filename: 'test.js',
        library: {
            name: 'Utils',
            type: 'window',
            export: 'default',
        },
        environment: {
            arrowFunction: false,
        }
    }
};