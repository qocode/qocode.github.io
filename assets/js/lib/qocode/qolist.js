const ordersCache = {}
const ordersListCache = JSON.parse(localStorage.getItem('QOList::orders') || '[]')


class QOList {

  /** Восстанавливаем заказы из localStorage */
  static getListFromLS(api) {
    const list = localStorage.getItem(`QOList_${api}`)

    return list ? JSON.parse(list) : null
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
    const sellerData = ordersCache[api] ||
      this.getListFromLS(api) ||
      { api, seller, items: [] }
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
    ordersCache[api] = sellerData

    this.pushOrder(orderID)

    return order
  }

  /** Добавление позиции в заказ */
  static pushProduct(order, { name, price }) {
    if (name || price) {
      order.items.push({ name, price })
    }
  }

  /** Добавление заказа и данных в заказ из внешнего источника */
  push(qoSource) {
    const order = QOList.getActiveOrder(qoSource.data)

    QOList.pushProduct(order, qoSource.data)
    QOList.setListToLS(qoSource.data.api)
  }

}

export { QOList }
