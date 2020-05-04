import { oom } from '@notml/core'
import './default.css'
import { QOMenu } from '../components/qo-menu.js'
import { qoMyOrders, qoPartners, qoCreate, qoContacts, qoAbout } from './includes/main-pages.js'

const { HTMLElement, document, location, history } = window
const basicTitle = 'QO-Code'

class DefaultLayout extends HTMLElement {

  _homePage = '/'

  _pages = {
    '/': { title: 'Заказы', layout: qoMyOrders },
    '/get-qr/': { title: 'QR', layout: qoCreate },
    '/partners/': { title: 'Партнеры', layout: qoPartners },
    '/contacts/': { title: 'Контакты', layout: qoContacts },
    '/about/': { title: 'О проекте', layout: qoAbout }
  }

  _menuItemsTop = ['/', '/get-qr/']
    .map(page => ({ page, text: this._pages[page].title }))

  _menuItemsBottom = ['/partners/', '/contacts/', '/about/']
    .map(page => ({ page, text: this._pages[page].title }))

  _activePage = location.pathname

  _activeLayout = this._pages[this._activePage].layout

  template = () => oom
    .aside({ class: 'logo' }, oom('div', { class: 'logo__img' }))
    .header({ class: 'header' }, oom()
      .oom(QOMenu,
        {
          class: 'header__menu',
          dataActiveItem: this._activePage,
          options: {
            navigate: page => this.navigate(page),
            dataItems: this._menuItemsTop
          }
        },
        menu => (this._menuTop = menu)))
    .div({ class: 'middle' }, oom
      .section({ class: 'content' },
        this._activeLayout(),
        content => (this._content = content))
      .footer({ class: 'footer' }, oom()
        .div('QO-Code', { class: 'footer__item' })
        .oom(QOMenu,
          {
            class: 'footer__menu',
            dataActiveItem: this._activePage,
            options: {
              navigate: page => this.navigate(page),
              dataItems: this._menuItemsBottom
            }
          },
          menu => (this._menuBottom = menu))))

  constructor() {
    super()
    this.onpopstate = () => this.navigate(location.pathname, true)
  }

  connectedCallback() {
    document.title = `${this._pages[this._activePage].title} – ${basicTitle}`
    window.addEventListener('popstate', this.onpopstate)
  }

  disconnectedCallback() {
    document.title = basicTitle
    window.removeEventListener('popstate', this.onpopstate)
  }

  navigate(page, back = false) {
    if (this._activePage !== page) {
      document.title = `${this._pages[page].title} – ${basicTitle}`
      this._activePage = page
      this._activeLayout = this._pages[page].layout
      this._menuTop.dataset.activeItem = page
      this._menuBottom.dataset.activeItem = page
      this._content.innerHTML = ''
      this._content.append(this._activeLayout().dom)
      if (!back) {
        history.pushState(null, '', page)
      }
    }
  }

}


oom.define(DefaultLayout)
