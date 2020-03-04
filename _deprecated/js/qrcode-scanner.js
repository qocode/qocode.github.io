import { oom, NotMLElement } from './lib/notml.js'
import { ZXing } from 'https://cdn.jsdelivr.net/npm/qocode@0.0.1/external.js'
import { QOSource } from './lib/qocode/qosource.js'
import { QOList } from './lib/qocode/qolist.js'


const { document } = window


class QRCodeScanner extends NotMLElement {

  content = oom
    .video({
      class: 'qrcode-scanner-video',
      [oom.onReady]: element => (this.video = element)
    })
    .div({
      class: 'qrcode-scanner-result qrcode-scanner-transparent',
      [oom.onReady]: element => (this.result = element)
    }, 'Наведите камеру на код')
    // .ScannerOrderButton({ class: 'qrcode-scanner-transparent' }, '0₽')
    .AddButton({
      onclick: () => this.append(),
      class: 'qrcode-scanner-transparent'
    }, '+')
    .ScanButton({ class: 'qrcode-scanner-transparent' }, '-')

  /** Первичная загрузка */
  constructor() {
    super()
    this.orders = new QOList()
    this.inProcess = false
    this.codeReader = new ZXing.BrowserMultiFormatReader()
  }

  /** Логи ошибки сканирования */
  error(msg) {
    this.result.innerHTML = msg
    console.error(msg)
  }

  /** Установка итогов сканирования */
  setResult(msg) {
    if (this.data !== msg) {
      const qos = new QOSource(msg)


      if (qos.valid) {
        let text = ''

        for (const name in qos.data) {
          text += `${name}: ${qos.data[name]}<br>`
        }
        this.result.innerHTML = text
        this.data = msg
      } else {
        this.data = null
        this.result.innerHTML = `Не удалось распознать код:<br>${msg}`
      }
    }
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
    this.result.innerHTML = 'Наведите камеру на код'
    this.inProcess = false
    this.data = null
  }

  /** Включение и выключение сканера */
  toggleScan() {
    if (this.inProcess) {
      this.reset()
    } else {
      this.start().catch(err => this.error(err))
    }
  }

  /** Добавление товара в корзину */
  append() {
    if (this.data) {
      const ordersList = document.querySelector('orders-list')

      this.orders.push(new QOSource(this.data))
      if (ordersList) {
        ordersList.renderList()
      }
      this.data = null
      // this.result.innerHTML = 'Товар добавлен в корзину.<br>Наведите камеру на новый код'
      // Закрываем сканер после выбора товара
      // Множественное добавление доделаем позже
      this.toggleScan()
    }
  }

}


customElements.define('qrcode-scanner', QRCodeScanner)