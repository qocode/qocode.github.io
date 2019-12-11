import 'https://cdn.jsdelivr.net/npm/pako@1.0.10/dist/pako.min.js'

const { pako, HTMLElement, FormData, URL, URLSearchParams } = window
const x64alphabet = '0123456789' +
  'abcdefghijklmnopqrstuvwxyz' +
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
  '-_'
const partDelimiter = '.'
const x64len = x64alphabet.length
const keysMap = {
  a: 'api', // URL сервиса для работы с заказами (Api url)
  s: 'seller', // Название продавца (Seller name)
  n: 'name', // Название товара (product Name)
  p: 'price' // Цена товара (product Price)
}
const keys = Object.values(keysMap)
const shortKeys = Object.keys(keysMap)
const allKeys = keys.concat(shortKeys)
const shortKeysMap = Object.entries(keysMap)
  .reduce((short, [key, value]) => (short[value] = key) && short, {})


/**
 * @param {number} value
 * @returns {string}
 */
function intToX16Pos2(value) {
  return ('0' + value.toString(16)).slice(-2)
}


/**
 * @param {number} value
 * @returns {string}
 */
function intToX16Pos3(value) {
  return ('00' + value.toString(16)).slice(-3)
}


/**
 * @param {number} value
 * @returns {string}
 */
function intToX64(value) {
  let result = ''

  do {
    result = x64alphabet[value % x64len] + result
    value = value / x64len ^ 0
  } while (value > 0)

  return result
}


/**
 * @param {string} value
 * @returns {number}
 */
function x64ToInt(value) {
  let result = 0

  while (value) {
    result += x64alphabet.indexOf(value[0]) * x64len ** (value.length - 1)
    value = value.slice(1)
  }

  return result
}


/**
 * @param {number} value
 * @returns {string}
 */
function intToX64Pos2(value) {
  return ('0' + intToX64(value)).slice(-2)
}


class QOSource {

  /**
   * @param {Array<string, string>} data
   * @returns {object}
   */
  static parseEntries(data) {
    const result = {}

    for (const [key, value] of data) {
      if (allKeys.includes(key) && value) {
        result[keysMap[key] || key] = value
      }
    }

    return result
  }

  /**
   * @param {FormData} data
   * @returns {object}
   */
  static parseFormData(data) {
    return this.parseEntries(data.entries())
  }

  /**
   * @param {URLSearchParams} data
   * @returns {object}
   */
  static parseURLSearchParams(data) {
    return this.parseEntries(data.entries())
  }

  /**
   * @param {URL} data
   * @returns {object}
   */
  static parseURL(data) {
    return this.parseURLSearchParams(data.searchParams)
  }

  /**
   * @param {string} data
   * @returns {string}
   */
  static deflate(data) {
    const result = pako.deflateRaw(data)
      .reduce((data, item) => (data += intToX16Pos2(item)), '')
      .match(/.{1,3}/g)
    const last = result[result.length - 1].length < 3 ? result.pop().replace(/^0+/, '') : ''

    return result.reduce((data, item) => (data += intToX64Pos2(parseInt(item, 16))), '') +
      (last ? partDelimiter + last : '')
  }

  /**
   * @param {string} data
   * @returns {string}
   */
  static inflate(data) {
    const [result, last] = data.split(partDelimiter)
    const result16x = result
      .match(/.{1,2}/g)
      .reduce((data, item) => (data += intToX16Pos3(x64ToInt(item))), '') +
      last || ''

    return pako.inflateRaw(
      new Uint8Array(result16x
        .match(/.{1,2}/g)
        .map(item => parseInt(item, 16))),
      { to: 'string' })
  }

  /**
   * @param {any} data
   * @param {object} options
   */
  constructor(data, options = {}) {
    this.options = options
    if (data instanceof HTMLElement && data.tagName === 'FORM') {
      data = new FormData(data)
    }
    if (data instanceof FormData) {
      this.data = this.constructor.parseFormData(data)
    }
  }

  /**
   * @param {object} [options]
   * @returns {string}
   */
  stringify(options) {
    const { url, host, short, json, encode, deflate } = Object.assign({}, this.options, options)
    const resultURL = new URL('', url || location.origin)
    const urlData = this.constructor.parseURL(resultURL)
    let result = this.data

    if (host) {
      resultURL.hash = host
    }

    if (short) {
      result = {}
      for (const [key, value] of Object.entries(urlData)) {
        result[shortKeysMap[key]] = value
      }
      for (const [key, value] of Object.entries(this.data)) {
        result[shortKeysMap[key]] = value
      }
    } else {
      result = Object.assign({}, urlData, result)
    }

    if (json) {
      result = JSON.stringify(result)
      if (encode) {
        result = encodeURIComponent(result)
      }
    } else {
      for (const [key, value] of Object.entries(result)) {
        resultURL.searchParams.set(key, value)
      }
      result = resultURL.searchParams.toString()
    }


    if (result && deflate) {
      result = this.constructor.deflate(result)
    }

    if (json || deflate) {
      result = `${resultURL.origin}${resultURL.pathname}?d=${result}`
    } else {
      result = resultURL.href
    }

    return result
  }

}


export { intToX64, QOSource }
