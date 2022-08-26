const path = require('path');

module.exports = {
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules | docs)/,
                use: [
                    {
                        loader: "babel-loader",
                        options: {
                            presets: [
                                "@babel/preset-env",
                            ]
                        }
                    }
                ]
            }
        ]
    },
    target: ["web", "es5"]
};