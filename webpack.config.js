/* global module, __dirname */
module.exports = {
  mode: 'production',
  entry: {
    'qocode/external-module': './src/qocode/external-module.js'
  },
  output: {
    filename: '[name].min.js',
    path: `${__dirname}/assets/dist`
  },
  performance: {
    hints: false
  }
}
