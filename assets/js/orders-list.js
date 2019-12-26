import { oom, NotMLElement } from './lib/notml.js'
import { QOSource } from './lib/qocode/qosource.js'
import { QOList } from './lib/qocode/qolist.js'

const { location } = window


class OrdersList extends NotMLElement {

  /** Первичная загрузка */
  constructor() {
    super()
    this.orders = new QOList()
    this.captureURLOrder()
    this.renderList()
  }

  /** Перехват заказа из URL при переходе со сканера */
  captureURLOrder() {
    if (location.search) {
      const qos = new QOSource(location.href)

      if (qos.valid) {
        this.orders.push(qos)
        history.pushState(null, null, location.origin)
      }
    }
  }

  /** Отрисовка списка заказов */
  renderList() {
    const orders = this.orders.list({ len: 10 })
    const list = oom()

    for (const order of orders.values()) {
      const products = oom()

      for (const product of order.items.values()) {
        products.div({ class: 'orders-list__product' }, oom
          .span(product.name)
          .span(product.price))
      }

      if (!order.closed) {
        products.div({ class: 'orders-list__product-buy' }, oom
          .button({
            onclick: () => {
              const origin = order.api.search('://') === -1
                ? `${location.protocol}//${order.api}`
                : order.api
              const url = `${origin}/?${JSON.stringify(order.items)}`

              window.open(url)

              this.orders.closeById({
                id: order.orderID,
                api: order.api
              })
              this.renderList()
            }
          }, 'Заказать'))
      }

      list.div({ class: 'orders-list__order' }, oom
        .span(`${order.seller}, №${order.orderID + 1} от ${new Date(order.data).toLocaleString()}`)
        .div({ class: 'orders-list__products' }, products))
    }

    this.innerHTML = ''
    this.append(oom.div({ class: 'orders-list__container' }, list).element)
  }

}

customElements.define('orders-list', OrdersList)
