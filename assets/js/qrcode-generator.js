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
          name: 'api',
          value: this.urlParams.get('u') || '',
          type: 'text',
          class: 'qrcode-generator__label-input',
          placeholder: 'URL сервиса обрабтки заказов',
          oninput: () => this.updateQR()
        }))
      .label(oom
        .div('Название продавца:', { class: 'qrcode-generator__label-text' })
        .input({
          name: 'seller',
          value: this.urlParams.get('s') || '',
          type: 'text',
          class: 'qrcode-generator__label-input',
          placeholder: 'Название продавца',
          oninput: () => this.updateQR()
        }))
    )
    .div({ class: 'qrcode-generator__qr-block' }, oom
      .span({ [oom.onReady]: element => (this.span = element) })
      .canvas({
        class: 'qrcode-generator__qr-canvas',
        [oom.onReady]: element => (this.canvas = element)
      })
      .span({ [oom.onReady]: element => (this.span0 = element) })
      .canvas({
        class: 'qrcode-generator__qr-canvas',
        [oom.onReady]: element => (this.canvas0 = element)
      })
      .span({ [oom.onReady]: element => (this.span1 = element) })
      .canvas({
        class: 'qrcode-generator__qr-canvas',
        [oom.onReady]: element => (this.canvas1 = element)
      })
      .span({ [oom.onReady]: element => (this.span2 = element) })
      .canvas({
        class: 'qrcode-generator__qr-canvas',
        [oom.onReady]: element => (this.canvas2 = element)
      })
      .span({ [oom.onReady]: element => (this.span3 = element) })
      .canvas({
        class: 'qrcode-generator__qr-canvas',
        [oom.onReady]: element => (this.canvas3 = element)
      })
      .span({ [oom.onReady]: element => (this.span4 = element) })
      .canvas({
        class: 'qrcode-generator__qr-canvas',
        [oom.onReady]: element => (this.canvas4 = element)
      })
    )


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
    const qosource = new QOSource(this.form, { url: 'https://qocode.github.io/' })
    const data = qosource.stringify({ short: 1, json: 1, deflate: 1 })

    this.span.textContent = data
    QRCode.toCanvas(this.canvas, data, this.options, error => {
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
    this.span0.textContent = qosource.stringify()
    QRCode.toCanvas(this.canvas0, this.span0.textContent, this.options)
    this.span1.textContent = qosource.stringify({ short: 1 })
    QRCode.toCanvas(this.canvas1, this.span1.textContent, this.options)
    this.span2.textContent = qosource.stringify({ short: 1, deflate: 1 })
    QRCode.toCanvas(this.canvas2, this.span2.textContent, this.options)
    this.span3.textContent = qosource.stringify({ short: 1, json: 1 })
    QRCode.toCanvas(this.canvas3, this.span3.textContent, this.options)
    this.span4.textContent = qosource.stringify({ short: 1, json: 1, encode: 1 })
    QRCode.toCanvas(this.canvas4, this.span4.textContent, this.options)
  }

}

customElements.define('qrcode-generator', QRCodeGenerator)
