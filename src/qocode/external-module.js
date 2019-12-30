/* global require */
const QRCode = require('qrcode')
const ZXing = require('@zxing/library')
const pako = require('pako')

window['@qocode/external'] = { QRCode, ZXing, pako }
