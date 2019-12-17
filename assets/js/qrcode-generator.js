import { QRCode } from './external.js'
import { oom, NotMLElement } from './lib/notml.js'
import { QOSource } from './lib/qocode/qosource.js'


class QRCodeGenerator extends NotMLElement {

  urlParams = new URL(location.href).searchParams

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
        .div('Продавец:', { class: 'qrcode-generator__label-text' })
        .input({
          name: 'seller',
          value: this.urlParams.get('s') || '',
          type: 'text',
          class: 'qrcode-generator__label-input',
          placeholder: 'Название продавца',
          oninput: () => this.updateQR()
        }))
      .label(oom
        .div('Товар:', { class: 'qrcode-generator__label-text' })
        .input({
          name: 'name',
          value: this.urlParams.get('s') || '',
          type: 'text',
          class: 'qrcode-generator__label-input',
          placeholder: 'Название товара',
          oninput: () => this.updateQR()
        }))
      .label(oom
        .div('Стоимость:', { class: 'qrcode-generator__label-text' })
        .input({
          name: 'price',
          value: this.urlParams.get('s') || '',
          type: 'text',
          class: 'qrcode-generator__label-input',
          placeholder: 'Стоимость товара',
          oninput: () => this.updateQR()
        }))
    )
    .div({ class: 'qrcode-generator__qr-block' }, oom
      .canvas({
        class: 'qrcode-generator__qr-canvas',
        [oom.onReady]: element => (this.canvas = element)
      })
      .input({
        class: 'qrcode-generator__label-input',
        readonly: true,
        onclick: 'this.select()',
        [oom.onReady]: element => (this.urlText = element)
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
    const qosource = new QOSource(this.form)
    const data = qosource.stringify()

    this.urlText.value = data
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
  }

}

customElements.define('qrcode-generator', QRCodeGenerator)
