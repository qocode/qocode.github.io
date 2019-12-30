import '../../../dist/qocode/external-module.min.js'

export const { QRCode, ZXing, pako } = window['@qocode/external']

delete window['@qocode/external']
