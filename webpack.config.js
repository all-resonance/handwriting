const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
  mode: 'none',
  entry: './__tests__/a.js',
  context: process.cwd(),
  output: {
    filename: 'main.js',
  },
//   plugins: [new CleanWebpackPlugin()],
}
