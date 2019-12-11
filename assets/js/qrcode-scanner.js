import { ZXing } from './external.js'

const { document } = window


class QRCodeScanner extends HTMLElement {

  /** Первичная загрузка */
  constructor() {
    super()
    this.innerHTML = `
      <p>
        <button class="start-button">start</button>
        <button class="reset-button">reset</button>
      </p>
      <video class="video" width="200" height="300" style="border: solid 1px #ccc;"></video>
      <div class="logs"></div>
    `
    this.codeReader = new ZXing.BrowserMultiFormatReader()
    this.video = this.querySelector('.video')
    this.querySelector('.start-button').onclick = () => this.start().catch(console.error)
    this.querySelector('.reset-button').onclick = () => this.codeReader.reset()
    this.logs = this.querySelector('.logs')
  }

  /** Временные логи сканирования */
  log(msg) {
    const row = document.createElement('div')

    row.innerHTML = `${new Date().toLocaleString()}: ${msg}`
    this.logs.prepend(row)
  }

  /** Запуск сканирования */
  async start() {
    const devices = await this.codeReader.listVideoInputDevices()

    if (!devices.length) {
      this.log('ERROR: video input devices not found')

      return
    }

    this.codeReader.reset()

    this.codeReader.decodeFromVideoDevice(null, this.video,
      (result, err) => {
        if (result) {
          this.log(result.text)
        }
        if (err && !(err instanceof ZXing.NotFoundException)) {
          console.error(err)
        }
      }
    )
  }

}


customElements.define('qrcode-scanner', QRCodeScanner)