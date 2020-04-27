import { oom } from '@notml/core'
import './qo-menu.css'

const { HTMLElement } = window


class QOMenu extends HTMLElement {

  template = ({ attributes }) => {
    const tmpl = oom()
    const items = attributes.dataItems

    this._items = {}
    for (const item of items) {
      const { text, page } = item

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

    if (this.navigate) {
      this.navigate(newValue)
    }
  }

}


oom.define('qo-menu', QOMenu)


export {
  QOMenu
}