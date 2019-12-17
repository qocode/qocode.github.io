import { NotMLElement } from './lib/notml.js'


class ScanButton extends NotMLElement {

  /** Первичная загрузка */
  constructor() {
    super()
    this.onclick = () => this.toggleScanner()
  }

  /** Показ и скрытие сканера */
  toggleScanner() {
    document.querySelector('qrcode-scanner').toggleScan()
  }

}

customElements.define('scan-button', ScanButton)
