import { oom } from '@notml/core'
import './qo-menu.css'

const { HTMLElement } = window


class QOMenu extends HTMLElement {

  template = ({ attributes }) => {
    const tmpl = oom()
    const items = attributes.dataItems
    const activeItem = attributes.dataActiveItem

    for (const item of items) {
      tmpl.div(item.text, {
        class: 'item' + (item.page === activeItem ? ' active' : ''),
        page: item.page,
        onclick: event => this.activateItem(event)
      })
    }

    return tmpl
  }

  activateItem(event) {
    const item = event.srcElement
    const active = this.querySelector('.active')

    if (active) {
      active.classList.remove('active')
    }
    item.classList.add('active')

    if (this.navigate) {
      this.navigate(item.attributes.page.value)
    }
  }

}


oom.define('qo-menu', QOMenu)


export {
  QOMenu
}
