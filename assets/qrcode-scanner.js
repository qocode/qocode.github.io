import 'https://cdn.jsdelivr.net/npm/@zxing/library@0.15.2/umd/index.min.js'

const { document, ZXing } = window


class QRCodeScanner extends HTMLElement {

  /** Первичная загрузка */
  constructor() {
    super()
    this.innerHTML = `
      <p>
        <button class="start-button">start</button>
        <button class="reset-button">reset</button>
      </p>
      <video class="video" width="300" height="200" style="border: solid 1px #ccc;"></video>
      <div class="logs"></div>
    `
    this.codeReader = new ZXing.BrowserMultiFormatReader()
    this.video = this.querySelector('.video')
    this.usedDevice = null
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

    [this.usedDevice] = devices
    for (const device in devices) {
      this.log(JSON.stringify(device))
    }

    this.codeReader.reset()

    this.codeReader.decodeFromVideoDevice(
      this.usedDevice.deviceId, this.video,
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
