import { oom } from '@notml/core'
import './qo-menu.css'

const { HTMLElement } = window


class QOMenu extends HTMLElement {

  _items = {}

  set options({ navigate }) {
    this._navigate = navigate || (() => console.error('Not implemented'))
  }

  template({ dataItems, attributes }) {
    const tmpl = oom()

    for (const { text, page } of dataItems) {
      tmpl.div(text, {
        class: 'item',
        onclick: () => (attributes.dataActiveItem = page)
      }, div => (this._items[page] = div))
    }

    return tmpl
  }

  dataActiveItemChanged(oldValue, newValue) {
    this._items[newValue].classList.add('active')
    if (oldValue) {
      this._items[oldValue].classList.remove('active')
    }
    this._navigate(newValue)
  }

}


oom.define('qo-menu', QOMenu)


export {
  QOMenu
}
