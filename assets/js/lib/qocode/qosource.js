import 'https://cdn.jsdelivr.net/npm/pako@1.0.10/dist/pako.min.js'

const { pako } = window
const x64alphabet = '0123456789' +
  'abcdefghijklmnopqrstuvwxyz' +
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
  '.-'
const x64len = x64alphabet.length


/**
 * @param {number} value
 */
function intToX64(value) {
  let result = ''

  do {
    result = x64alphabet[value % x64len] + result
    value = value / x64len ^ 0
  } while (value > 0)

  return result
}


class QOSource {

  /**
   * @param {object} data
   * @param {object} options
   */
  static stringify(data, options) {
    console.time('QOSource.stringify')

    const text = JSON.stringify(data)
    const result = pako
      .deflateRaw(text)
      .reduce((data, item) => {
        return (data += ('0' + item.toString(16)).slice(-2))
      }, '')
      .match(/.{1,3}/g)
      .reduce((data, item) => {
        return (data += ('0' + intToX64(parseInt(item, 16))).slice(-2))
      }, '')

    console.timeEnd('QOSource.stringify')
    console.log('::', text)
    console.log('::', result)

    return result
  }

  /**
   * @param {string} data
   * @param {object} options
   */
  static parse(data, options) {

  }

}


export { intToX64, QOSource }
