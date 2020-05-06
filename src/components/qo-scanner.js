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
    .section({ class: 'qo-scanner__result qo-scanner_hide-block' },
      oom
        .div({ class: 'qo-scanner__result-content' }, result => { element._result = result }),
      resultBlock => { element._resultBlock = resultBlock })
    .footer({ class: 'qo-scanner__footer' }, oom
      .div({
        class: 'qo-scanner__back-button-block',
        onclick: () => element.back()
      }, oom
        .div({ class: 'qo-scanner__back-button' })))

  static tmplNotMedia = ({ element }) => oom('div', { class: 'qo-scanner__not-media' })
    .div(oom
      .p('К сожалению на Вашем устройстве не доступен захват видео с камеры.')
      .p({ class: 'theme__additional-text' },
        'Для оформления заказа, Вы можете воспользоваться' +
        ' стандартными приложениями камеры или сканера QR-кодов,' +
        ' и перейти на страницу заказа по ссылке в коде.')
      .p({ class: 'theme__additional-text' },
        'Или выбрать фотографию с QR кодом из галереи.')
      .input({
        type: 'file',
        accept: 'image/*',
        onchange: event => element.loadFromFile(event.srcElement.files[0])
      }, input => { element._imgInput = input }))
    .div({ class: 'qo-scanner__img-from-file-preview' }, div => { element._imgPreview = div })
    .img({ class: 'qo-scanner__img-from-file' }, img => { element._imgFile = img })

  isOpened = false

  isResultOpened = false

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

  back() {
    if (this.isResultOpened) {
      this.closeResultBlock()
    } else {
      this.toggle()
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
        this._imgPreview.classList.remove('qo-scanner__img-from-file-preview_selected')
        this._imgPreview.style.backgroundImage = ''
        this._imgFile.src = ''
      }
      this.closeResultBlock()
    }
  }

  loadFromFile(file) {
    if (file) {
      this.showMessage({ message: 'Выполняем загрузку файла...' })
      setTimeout(() => {
        if (this.isResultOpened) {
          const reader = new FileReader()

          reader.readAsDataURL(file)
          reader.onload = event => {
            this._imgPreview.classList.add('qo-scanner__img-from-file-preview_selected')
            this._imgPreview.style.backgroundImage = `url('${event.srcElement.result}')`
            this._imgFile.src = event.srcElement.result
            this.decodeFromImage(this._imgFile)
          }
        }
      }, 10)
    }
  }

  decodeFromImage(img) {
    this.showMessage({ message: 'Выполняем распознавание кода...' })
    setTimeout(() => {
      if (this.isResultOpened) {
        this._codeReader.decodeFromImage(img).then((result) => {
          const qoData = new QOData(result.text)

          if (qoData.valid) {
            this.showResult(qoData)
          } else {
            this.showMessage({
              message: 'В коде не найдены параметры заказа.',
              details: result.text
            })
          }
        }).catch((error) => {
          this.showMessage({ error, message: 'Не удалось распознать QR код.' })
        }).then(() => {
          this._codeReader.reset()
        })
      }
    }, 10)
  }

  showResult(result) {
    this._result.innerHTML = JSON.stringify(result, null, '  ')

    this.openResultBlock()
    console.log(result)
  }

  showMessage({ error, message, details }) {
    const tmpl = oom('div')

    if (message) {
      tmpl.p(message)
    }
    if (error) {
      tmpl.p({ class: 'theme__additional-text' }, error.message || error)
      console.error(error)
    }
    if (details) {
      tmpl.p({ class: 'theme__additional-text' }, details)
    }
    this._result.innerHTML = ''
    this._result.append(tmpl.dom)
    this.openResultBlock()
  }

  openResultBlock() {
    this.isResultOpened = true
    this._resultBlock.classList.remove('qo-scanner_hide-block')
    this._content.classList.add('qo-scanner_hide-block')
  }

  closeResultBlock() {
    this.isResultOpened = false
    this._content.classList.remove('qo-scanner_hide-block')
    this._resultBlock.classList.add('qo-scanner_hide-block')
    this._result.innerHTML = ''
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
