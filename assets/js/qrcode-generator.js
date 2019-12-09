import 'https://cdn.jsdelivr.net/npm/qrcode@1.4.4/build/qrcode.js'
import { oom, NotMLElement } from '../lib/notml.js'

const { QRCode } = window


class QRCodeGenerator extends NotMLElement {

  content = oom
    .canvas()

  /** Первичная загрузка */
  constructor() {
    super()
    this.applyContent()
    this.canvas = this.querySelector('canvas')
    this.updateQR()
  }

  /**
   * Обновление QR кода
   */
  updateQR() {
    // const form = new FormData(this.form)
    // const url = new URL('/', location.origin)
    // const type = form.get('qrcode::type')

    // if (type) {
    //   url.searchParams.append(type[0], 1)
    // }

    QRCode.toCanvas(this.canvas, 'qocode.github.io',
      {
        errorCorrectionLevel: 'low',
        version: 2,
        margin: 9,
        scale: 1,
        color: {
          dark: '#000f',
          light: '#fff0'
        }
      }
      , error => {
        if (error) {
          console.error(error)
        }
      })
  }

}

customElements.define('qrcode-generator', QRCodeGenerator)
