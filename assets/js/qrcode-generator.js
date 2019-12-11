import { QRCode } from './external.js'
import { oom, NotMLElement } from './lib/notml.js'
import { QOSource } from './lib/qocode/qosource.js'


class QRCodeGenerator extends NotMLElement {

  urlParams = new URL(location.href).searchParams

  urlSearchNames = [
    'u', // API URL
    's', // Название продавца (Seller)
    'n', // Название товара (Product name)
    'p' // Цена товара (Price)
  ]

  content = oom
    .form({ [oom.onReady]: element => (this.form = element) }, oom
      .label(oom
        .div('URL сервиса:', { class: 'qrcode-generator__label-text' })
        .input({
          name: 'u',
          value: this.urlParams.get('u') || '',
          type: 'text',
          class: 'qrcode-generator__label-input',
          placeholder: 'URL сервиса обрабтки заказов',
          oninput: () => this.updateQR()
        }))
      .label(oom
        .div('Название продавца:', { class: 'qrcode-generator__label-text' })
        .input({
          name: 's',
          value: this.urlParams.get('s') || '',
          type: 'text',
          class: 'qrcode-generator__label-input',
          placeholder: 'Название продавца',
          oninput: () => this.updateQR()
        }))
    )
    .div({ class: 'qrcode-generator__qr-block' }, oom
      .canvas({
        class: 'qrcode-generator__qr-canvas',
        [oom.onReady]: element => (this.canvas = element)
      }))


  /** Первичная загрузка */
  constructor() {
    super()
    this.options = {
      scale: 6,
      errorCorrectionLevel: 'low'
      // version: 2,
      // margin: 9,
      // color: {
      //   dark: '#000f',
      //   light: '#fff0'
      // }
    }
    this.applyContent()
    this.canvas = this.querySelector('canvas')
    this.updateQR()
  }

  /**
   * Обновление QR кода
   */
  updateQR(e) {
    const formData = new FormData(this.form)
    const srcData = {}

    for (const name of this.urlSearchNames) {
      const value = formData.get(name)

      if (value && typeof value === 'string') {
        srcData[name] = value
      }
    }

    const data = QOSource.stringify(srcData)
    const url = new URL('/', location.origin)

    url.searchParams.append('d', data)

    const qrData = url.host + url.pathname + url.search


    QRCode.toCanvas(this.canvas, qrData, this.options, error => {
      if (error) {
        console.error(error)
      }
      if (this.canvas.width > this.canvas.parentNode.clientWidth &&
        this.options.scale > 1) {
        --this.options.scale
        this.updateQR()
      }
      if (this.canvas.width < (this.canvas.parentNode.clientWidth / 1.5) &&
        this.options.scale < 7
      ) {
        ++this.options.scale
        this.updateQR()
      }
    })
  }

}

customElements.define('qrcode-generator', QRCodeGenerator)
