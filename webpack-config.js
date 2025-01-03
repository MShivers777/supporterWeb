const path = require('path');

module.exports = {
  entry: './public/firebase-config.js', // Your main JavaScript file
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'public'), // Output to the correct public directory
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  mode: 'development'
};