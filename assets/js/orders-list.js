import { oom, NotMLElement } from './lib/notml.js'
import { QOSource } from './lib/qocode/qosource.js'
import { QOList } from './lib/qocode/qolist.js'

const { location } = window


class OrdersList extends NotMLElement {

  /** Первичная загрузка */
  constructor() {
    super()
    this.captureURLOrder()
    this.renderList()
  }

  /** Перехват заказа из URL при переходе со сканера */
  captureURLOrder() {
    if (location.search) {
      const qos = new QOSource(location.href)

      if (qos.valid) {
        // TODO: Добавление заказа
        alert(JSON.stringify(qos))
        history.pushState(null, null, location.origin)
      }
    }
  }

  /** Отрисовка списка заказов */
  renderList() {
    const list = oom.span('test')

    this.innerHTML = ''
    this.append(list.element)
  }

}

customElements.define('orders-list', OrdersList)
