const ordersCache = {}
const ordersListCache = JSON.parse(localStorage.getItem('QOList::orders') || '[]')


class QOList {

  /** Восстанавливаем заказы из localStorage */
  static getListFromLS(api) {
    let list = ordersCache[api] || localStorage.getItem(`QOList_${api}`)

    if (list && typeof list === 'string') {
      list = ordersCache[api] = JSON.parse(list)
    }

    if (!list) {
      list = ordersCache[api] = { api, seller: null, items: [] }
      this.setListToLS(api)
    }

    return list
  }

  /** Сохраняем заказы в localStorage */
  static setListToLS(api) {
    localStorage.setItem(`QOList_${api}`, JSON.stringify(ordersCache[api]))
  }

  /** фиксация добавление нового заказа */
  static pushOrder(orderID) {
    if (!ordersListCache.includes(orderID)) {
      ordersListCache.unshift(orderID)
      localStorage.setItem('QOList::orders', JSON.stringify(ordersListCache))
    }
  }

  /** Получаем текущий активный заказ */
  static getActiveOrder({ api, seller }) {
    const sellerData = this.getListFromLS(api)
    const list = sellerData.items
    const listIdx = list.length - 1
    const order = (list[listIdx] && !list[listIdx].closed && list[listIdx]) ||
      (list.push({
        data: new Date(),
        closed: false,
        items: []
      }) && list[listIdx + 1])
    const orderID = `${list.indexOf(order)}:${api}`

    sellerData.seller = seller

    this.pushOrder(orderID)

    return order
  }

  /** Добавление позиции в заказ */
  static pushProduct(order, { name, price }) {
    if (name || price) {
      order.items.push({ name, price })
    }
  }

  /** Получение заказа по его порядковому номеру */
  getOrderByID({ api, id }) {
    const list = QOList.getListFromLS(api)
    const order = list.items[id]

    return {
      api,
      seller: list.seller,
      orderID: id,
      data: order.data,
      closed: order.closed,
      items: order.items
    }
  }

  /** Закрытие заказа по его порядковому номеру */
  closeById({ api, id }) {
    const list = QOList.getListFromLS(api)

    list.items[id].closed = true
    QOList.setListToLS(api)
  }

  /** Добавление заказа и данных в заказ из внешнего источника */
  push(qoSource) {
    const order = QOList.getActiveOrder(qoSource.data)

    QOList.pushProduct(order, qoSource.data)
    QOList.setListToLS(qoSource.data.api)
  }

  /** Список заказов */
  list({ len } = {}) {
    const list = []

    len = typeof len === 'number' ? len : 10
    while (list.length < len && ordersListCache.length > list.length) {
      const ido = ordersListCache[list.length].split(':')
      const order = this.getOrderByID({
        id: Number(ido.shift()),
        api: ido.join(':')
      })

      list.push(order)
    }

    return list
  }

}

export { QOList }
