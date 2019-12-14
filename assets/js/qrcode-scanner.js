import { ZXing } from './external.js'
import { oom, NotMLElement } from './lib/notml.js'

const { document } = window


class QRCodeScanner extends NotMLElement {

  content = oom
    .video({
      class: 'qrcode-scanner-video',
      [oom.onReady]: element => (this.video = element)
    })
    .div({
      class: 'qrcode-scanner-logs',
      [oom.onReady]: element => (this.logs = element)
    })
    .ScanButton('-')

  /** Первичная загрузка */
  constructor() {
    super()
    this.inProcess = false
    this.codeReader = new ZXing.BrowserMultiFormatReader()
  }

  /** Временные логи сканирования */
  log(msg) {
    const row = document.createElement('div')

    row.innerHTML = `${new Date().toLocaleString()}: ${msg}`
    this.logs.prepend(row)
  }

  /** Запуск сканирования */
  async start() {
    this.reset()
    this.inProcess = true
    this.setAttribute('opened', '')

    const devices = await this.codeReader.listVideoInputDevices()

    if (!devices.length) {
      this.log('ERROR: video input devices not found')

      return
    }

    this.codeReader.decodeFromVideoDevice(null, this.video,
      (result, err) => {
        if (result) {
          this.log(result.text)
        }
        if (err && !(err instanceof ZXing.NotFoundException)) {
          this.log(err)
        }
      }
    )
  }

  /** Остановка сканирования */
  reset() {
    this.codeReader.reset()
    this.removeAttribute('opened')
    this.logs.innerHTML = ''
    this.inProcess = false
  }

  /** Включение и выключение сканера */
  toggleScan() {
    if (this.inProcess) {
      this.reset()
    } else {
      this.start().catch(err => this.log(err))
    }
  }

}


customElements.define('qrcode-scanner', QRCodeScanner)
