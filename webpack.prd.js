const path = require('path');

module.exports = {
    mode: "production",
    entry: "./src/index.dist.js",
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'atj.min.js',
        environment: {
            arrowFunction: false,
        }
    }
};