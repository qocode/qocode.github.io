import { oom } from '@notml/core'
import { Dexie } from '../external.js'


const { HTMLElement } = window
const db = new Dexie('qo-list-orders')


class ListOrders extends HTMLElement {

  static tagName = 'qo-list-orders'

}


db.version(1).stores({
  active: '++id, order.api',
  history: 'id, order.api'
})

oom.define(ListOrders)


export {
  ListOrders
}
