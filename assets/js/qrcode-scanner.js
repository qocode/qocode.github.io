import { ZXing } from './external.js'
import { oom, NotMLElement } from './lib/notml.js'


class QRCodeScanner extends NotMLElement {

  content = oom
    .video({
      class: 'qrcode-scanner-video',
      [oom.onReady]: element => (this.video = element)
    })
    .div({
      class: 'qrcode-scanner-result',
      [oom.onReady]: element => (this.result = element)
    }, 'Наведите камеру на код')
    .AddButton('+')
    .ScanButton('-')

  /** Первичная загрузка */
  constructor() {
    super()
    this.inProcess = false
    this.codeReader = new ZXing.BrowserMultiFormatReader()
  }

  /** Логи ошибки сканирования */
  error(msg) {
    this.result.innerHTML = `${new Date().toLocaleString()}: ${msg}`
  }

  /** Установка итогов сканирования */
  setResult(msg) {
    this.result.innerHTML = msg
  }

  /** Запуск сканирования */
  async start() {
    this.reset()
    this.inProcess = true
    this.setAttribute('opened', '')

    const devices = await this.codeReader.listVideoInputDevices()

    if (!devices.length) {
      this.error('ERROR: video input devices not found')

      return
    }

    this.codeReader.decodeFromVideoDevice(null, this.video,
      (result, err) => {
        if (result) {
          this.setResult(result.text)
        }
        if (err && !(err instanceof ZXing.NotFoundException)) {
          this.error(err)
        }
      }
    )
  }

  /** Остановка сканирования */
  reset() {
    this.codeReader.reset()
    this.removeAttribute('opened')
    this.setResult('Наведите камеру на код')
    this.inProcess = false
  }

  /** Включение и выключение сканера */
  toggleScan() {
    if (this.inProcess) {
      this.reset()
    } else {
      this.start().catch(err => this.error(err))
    }
  }

}


customElements.define('qrcode-scanner', QRCodeScanner)
