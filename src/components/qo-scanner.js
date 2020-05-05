import { oom } from '@notml/core'
import './qo-scanner.css'

const { HTMLElement, Event, navigator } = window


class QOScanner extends HTMLElement {

  static tagName = 'qo-scanner'

  static isMedia = navigator && navigator.mediaDevices && navigator.mediaDevices.getUserMedia && true

  static emitOpen() {
    const event = new Event('qo-scanner::Open')

    window.dispatchEvent(event)
  }

  static emitClose() {
    const event = new Event('qo-scanner::Close')

    window.dispatchEvent(event)
  }

  isOpened = false

  isAllowedMediaDevices = null

  constructor() {
    super()
    this._eventOpen = () => this.open()
    this._eventClose = () => this.close()
  }

  connectedCallback() {
    window.addEventListener('qo-scanner::Open', this._eventOpen)
    window.addEventListener('qo-scanner::Close', this._eventClose)
  }

  disconnectedCallback() {
    window.removeEventListener('qo-scanner::Open', this._eventOpen)
    window.removeEventListener('qo-scanner::Close', this._eventClose)
  }

  async resolveMediaDevices() {
    if (this.isAllowedMediaDevices === null) {
      this.isAllowedMediaDevices = false
      if (QOScanner.isMedia) {
        const devices = await navigator.mediaDevices
          .getUserMedia({ video: true }).catch(error => {
            console.error(error)
          })

        console.log(devices)
        this.isAllowedMediaDevices = true
      }
    }
  }

  open() {
    this.resolveMediaDevices().then(() => this._open)
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
    }
  }

}


oom.define(QOScanner)

export {
  QOScanner
}
