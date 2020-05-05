import { QOData, ZXing } from '@qocode/core'
import { oom } from '@notml/core'
import './qo-scanner.css'

const { HTMLElement, Event, FileReader } = window


class QOScanner extends HTMLElement {

  static tagName = 'qo-scanner'

  static emitToggle() {
    const event = new Event('qo-scanner::Toggle')

    window.dispatchEvent(event)
  }

  static template = ({ element }) => oom
    .aside({ class: 'qo-scanner__logo' }, oom(QOScanButton))
    .header({ class: 'qo-scanner__header' })
    .section({ class: 'qo-scanner__content' }, content => { element._content = content })
    .footer({ class: 'qo-scanner__footer' }, oom
      .div({
        class: 'qo-scanner__back-button-block',
        onclick: () => this.emitToggle()
      }, oom
        .div({ class: 'qo-scanner__back-button' })))

  static tmplNotMedia = ({ element }) => oom('div', { class: 'qo-scanner__not-media' })
    .div(oom
      .p('К сожалению на Вашем устройстве не доступен захват видео с камеры.')
      .p({ class: 'theme__additional-text' },
        'Для оформления заказа, Вы можете воспользоваться' +
        ' стандартнымb приложениями камеры или сканера QR-кодов,' +
        ' и перейти на страницу заказа по ссылке в коде.')
      .p({ class: 'theme__additional-text' },
        'Или выбрать фотографию с QR кодом из галереи.')
      .input({
        type: 'file',
        accept: 'image/*',
        onchange: event => element.loadFromFile(event.srcElement.files[0])
      }, input => { element._imgInput = input }))
    .div({ class: 'qo-scanner__img-from-file-preview' }, div => { element._imgPreview = div })

  isOpened = false

  _isAllowedMediaDevices = null

  _codeReader = new ZXing.BrowserMultiFormatReader()

  constructor() {
    super()
    this._eventToggle = () => this.toggle()
  }

  connectedCallback() {
    window.addEventListener('qo-scanner::Toggle', this._eventToggle)
  }

  disconnectedCallback() {
    window.removeEventListener('qo-scanner::Toggle', this._eventToggle)
  }

  async resolveMediaDevices() {
    if (this._isAllowedMediaDevices === null) {
      this._isAllowedMediaDevices = false

      const devices = await this._codeReader.getVideoInputDevices()
        .catch(error => { console.error(error.message) })

      if (devices && devices.length > 0) {
        console.log(devices)
        this._isAllowedMediaDevices = true
        this._content.innerHTML = JSON.stringify(devices)
      } else {
        this._content.append(QOScanner.tmplNotMedia({ element: this }).dom)
      }
    }
  }

  toggle() {
    if (this.isOpened) {
      this.close()
    } else {
      this.open()
    }
  }

  open() {
    this.resolveMediaDevices().then(() => this._open())
  }

  _open() {
    if (!this.isOpened) {
      this.isOpened = true
      this.classList.add('qo-scanner_opened')
    }
  }

  close() {
    if (this.isOpened) {
      this.isOpened = false
      this.classList.remove('qo-scanner_opened')
      if (this._imgInput) {
        this._imgInput.value = ''
        this._imgPreview.style.backgroundImage = ''
      }
    }
  }

  loadFromFile(file) {
    if (file) {
      const reader = new FileReader()

      reader.readAsDataURL(file)
      reader.onload = event => {
        this._imgPreview.style.backgroundImage = `url('${event.srcElement.result}')`
      }
    }
  }

}


class QOScanButton extends HTMLElement {

  static tagName = 'qo-scan-button'

  static template = oom.div({ class: 'qo-scan-button__image' })

  constructor() {
    super()
    this.onclick = event => this.openScanner(event)
  }

  openScanner(event) {
    event.stopPropagation()
    QOScanner.emitToggle()
  }

}


oom.define(QOScanner)
oom.define(QOScanButton)

export {
  QOScanner,
  QOScanButton
}
