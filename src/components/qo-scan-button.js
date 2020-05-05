import { oom } from '@notml/core'
import { QOScanner } from './qo-scanner.js'
import './qo-scan-button.css'

const { HTMLElement } = window


class QOScanButton extends HTMLElement {

  static tagName = 'qo-scan-button'

  static template = oom.div({ class: 'qo-scan-button__image' })

  constructor() {
    super()
    this.onclick = event => this.openScanner(event)
  }

  openScanner(event) {
    event.stopPropagation()
    QOScanner.emitOpen()
  }

}


oom.define(QOScanButton)

export {
  QOScanButton
}
