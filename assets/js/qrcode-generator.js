import 'https://cdn.jsdelivr.net/npm/qrcode@1.4.4/build/qrcode.js'
import { oom, NotMLElement } from '../lib/notml.js'

const { QRCode } = window


class QRCodeGenerator extends NotMLElement {

  content = oom
    .form({ [oom.onReady]: element => (this.form = element) }, oom
      .label(oom
        .div('URL сервиса:', { class: 'qrcode-generator__label-text' })
        .input({
          name: 'api-url',
          type: 'text',
          class: 'qrcode-generator__label-input',
          placeholder: 'URL сервиса обрабтки заказов',
          oninput: () => this.updateQR()
        }))
    )
    .div(oom.canvas({ [oom.onReady]: element => (this.canvas = element) }))


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
  updateQR(e) {
    const formData = new FormData(this.form)
    const url = new URL('/', location.origin)
    const qrData = {
      u: formData.get('api-url')
    }

    for (const [name, value] of Object.entries(qrData)) {
      if (value && typeof value === 'string') {
        url.searchParams.append(name, value)
      }
    }

    console.log(url.href)


    QRCode.toCanvas(this.canvas, url.href,
      {
        // errorCorrectionLevel: 'low',
        // version: 2,
        // margin: 9,
        // scale: 1,
        // color: {
        //   dark: '#000f',
        //   light: '#fff0'
        // }
      }
      , error => {
        if (error) {
          console.error(error)
        }
      })
  }

}

customElements.define('qrcode-generator', QRCodeGenerator)
