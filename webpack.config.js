module.exports = {
  entry: './app.js',
  output: {
    filename: 'app.es5.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel',
        query: {
          presets: ['es2015', 'stage-3'],
          plugins: ["transform-object-rest-spread"]
        }
      }
    ]
  }
}
