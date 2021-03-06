import { QOData, ZXing } from '@qocode/core'
import { oom } from '@notml/core'
import './qo-scanner.css'

const { HTMLElement, FileReader, location, $qoConfig } = window


class QOScanner extends HTMLElement {

  static tagName = 'qo-scanner'

  static template = ({ element, navigate }) => oom
    .section({ class: 'qo-scanner__content' }, content => { element._content = content })
    .section({ class: 'qo-scanner__result qo-scanner__hide-block' },
      oom
        .div({ class: 'qo-scanner__result-content' }, result => { element._result = result }),
      resultBlock => { element._resultBlock = resultBlock })
    .div({ class: 'qo-scanner__header-container' },
      oom
        .aside({ class: 'qo-scanner__logo' }, oom(QOScanButton, { options: { navigate } }))
        .header({ class: 'qo-scanner__header' }),
      headerContainer => { element._headerContainer = headerContainer })
    .footer({ class: 'qo-scanner__footer' },
      oom
        .div({
          class: 'qo-scanner__back-button-block',
          onclick: () => element.back()
        }, oom
          .div({ class: 'qo-scanner__back-button' })),
      footer => { element._footer = footer })

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

  static tmplMedia = ({ element }) => oom('div', { class: 'qo-scanner__media' })
    .video({
      class: 'qo-scanner__video'
    }, video => { element._video = video })

  resizeScannerTimeout = null
  isScannerOpened = false
  isResultOpened = false

  _isAllowedMediaDevices = $qoConfig.isAllowedMediaDevices

  _codeReader = new ZXing.BrowserMultiFormatReader()

  constructor({ navigate }) {
    super()
    this._navigate = navigate || (() => console.error('Not implemented'))
    this._resizeScanner = () => this.resizeScanner()
  }

  connectedCallback() {
    if (typeof this._isAllowedMediaDevices === 'boolean') {
      this.loadContent()
    } else {
      this.resolveMediaDevices()
        .catch(error => { console.error(error.message) })
    }
    window.addEventListener('resize', this._resizeScanner)
  }

  disconnectedCallback() {
    this._codeReader.reset()
    window.removeEventListener('resize', this._resizeScanner)
  }

  async resolveMediaDevices() {
    const devices = await this._codeReader.getVideoInputDevices()
      .catch(error => { console.error(error.message) })

    $qoConfig.isAllowedMediaDevices = this._isAllowedMediaDevices = (devices && devices.length > 0) || false

    this.loadContent()
  }

  loadContent() {
    if (this._isAllowedMediaDevices) {
      this._content.classList.add('qo-scanner__content--video')
      this._content.append(QOScanner.tmplMedia({ element: this }).dom)
      this.startScanner()
    } else {
      this._content.append(QOScanner.tmplNotMedia({ element: this }).dom)
    }
  }

  setTransparent(value) {
    if (value) {
      this._headerContainer.classList.add('qo-scanner__transparent-block')
      this._footer.classList.add('qo-scanner__transparent-block')
    } else {
      this._headerContainer.classList.remove('qo-scanner__transparent-block')
      this._footer.classList.remove('qo-scanner__transparent-block')
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
          this.decodeCodeString(result.text)
        }).catch((error) => {
          this.showMessage({ error, message: 'Не удалось распознать QR код.' })
        }).then(() => {
          this._codeReader.reset()
        })
      }
    }, 10)
  }

  resizeScanner() {
    if (this.isScannerOpened && !this.resizeScannerTimeout) {
      this.resizeScannerTimeout = true
      setTimeout(() => {
        if (this.isScannerOpened) {
          this.startScanner()
        }
        this.resizeScannerTimeout = null
      }, 100)
    }
  }

  startScanner() {
    this.setTransparent(true)
    this._codeReader.reset()
    this.isScannerOpened = false
    this._codeReader.decodeFromConstraints({
      video: {
        facingMode: 'environment'
      }
    }, this._video,
      (result, error) => {
        if (result) {
          this.isScannerOpened = false
          this.decodeCodeString(result.text)
          this._codeReader.reset()
          this.setTransparent(false)
        } if (error && !(error instanceof ZXing.NotFoundException)) {
          this.isScannerOpened = false
          this.showMessage(error)
          this._codeReader.reset()
          this.setTransparent(false)
        } else {
          this.isScannerOpened = true
        }
      }
    )
  }

  decodeCodeString(text) {
    const qoData = new QOData(text)

    if (qoData.valid) {
      this.showResult(qoData)

      return true
    } else {
      this.showMessage({
        message: 'В коде не найдены параметры заказа.',
        details: text
      })

      return false
    }
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
    this._resultBlock.classList.remove('qo-scanner__hide-block')
    this._content.classList.add('qo-scanner__hide-block')
  }

  closeResultBlock() {
    this.isResultOpened = false
    this._content.classList.remove('qo-scanner__hide-block')
    this._resultBlock.classList.add('qo-scanner__hide-block')
    this._result.innerHTML = ''
  }

  back() {
    if (this.isResultOpened) {
      this.closeResultBlock()
      if (this._isAllowedMediaDevices) {
        this.startScanner()
      }
    } else {
      this._navigate('/')
    }
  }

}


class QOScanButton extends HTMLElement {

  static tagName = 'qo-scan-button'

  static template = ({ attributes }) => oom.div({ class: 'qo-scan-button__image' })

  constructor({ navigate }) {
    super()
    this._navigate = navigate || (() => console.error('Not implemented'))
    this.onclick = event => this.openScanner(event)
  }

  openScanner(event) {
    event.stopPropagation()
    if (location.pathname === '/scanner/') {
      this._navigate('/')
    } else {
      this._navigate('/scanner/')
    }
  }

}


oom.define(QOScanner)
oom.define(QOScanButton)


export {
  QOScanner,
  QOScanButton
}
