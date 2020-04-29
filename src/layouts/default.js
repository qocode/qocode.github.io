import { oom } from '@notml/core'
import './default.css'
import { QOMenu } from '../components/qo-menu.js'
import { qoHome, qoPartners, qoCreate, qoContacts, qoAbout } from './includes/main-pages.js'

const { HTMLElement, location, history } = window


class DefaultLayout extends HTMLElement {

  _pages = {
    '/': { title: 'Заказы', layout: qoHome },
    '/partners/': { title: 'Партнеры', layout: qoPartners },
    '/create/': { title: 'Создать QR', layout: qoCreate },
    '/contacts/': { title: 'Партнеры', layout: qoContacts },
    '/about/': { title: 'О проекте', layout: qoAbout }
  }

  _menuItems = ['/', '/partners/', '/create/', '/contacts/', '/about/']
    .map(page => ({ page, text: this._pages[page].title }))

  _activePage = location.pathname

  _activeLayout = this._pages[this._activePage].layout

  template = () => oom
    .aside({ class: 'logo' }, oom('div', { class: 'logo_img' }))
    .header({ class: 'header' })
    .aside({ class: 'left' },
      oom(QOMenu,
        {
          dataActiveItem: this._activePage,
          options: {
            navigate: page => this.navigate(page),
            dataItems: this._menuItems
          }
        },
        menu => (this._menu = menu)))
    .section({ class: 'middle' },
      this._activeLayout(),
      middle => (this._middle = middle))
    .aside({ class: 'right' })
    .footer({ class: 'footer' })

  constructor() {
    super()
    this.onpopstate = () => this.navigate(location.pathname, true)
  }

  connectedCallback() {
    window.addEventListener('popstate', this.onpopstate)
  }

  disconnectedCallback() {
    window.removeEventListener('popstate', this.onpopstate)
  }

  navigate(page, back = false) {
    if (this._activePage !== page) {
      this._activePage = page
      this._activeLayout = this._pages[page].layout
      this._menu.dataset.activeItem = page
      this._middle.innerHTML = ''
      this._middle.append(this._activeLayout().dom)
      if (!back) {
        history.pushState(null, '', page)
      }
    }
  }

}


oom.define(DefaultLayout)
