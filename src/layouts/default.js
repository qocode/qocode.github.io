import { oom } from '@notml/core'
import './default.css'
import { QOScanButton } from '../components/qo-scanner.js'
import { QOMenu } from '../components/qo-menu.js'
import { qoMyOrders, qoScanner, qoPartners, qoGetQR, qoContacts, qoAbout } from './includes/main-pages.js'

const { HTMLElement, document, location, history } = window
const basicTitle = 'Quick Order'

class DefaultLayout extends HTMLElement {

  _homePage = '/'

  _pages = {
    '/': { title: 'Мои заказы', layout: qoMyOrders },
    '/scanner/': { title: 'Сканер', layout: qoScanner },
    '/get-qr/': { title: 'Создать QR', layout: qoGetQR },
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
    .aside({ class: 'default-layout__logo' }, oom(QOScanButton, {
      options: {
        navigate: page => this.navigate(page)
      }
    }))
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
        this._activeLayout({
          navigate: page => this.navigate(page)
        }),
        content => (this._content = content))
      .footer({ class: 'footer' }, oom()
        .div({ class: 'footer__block' }, oom
          .span({ class: 'footer__item' }, oom
            .span('«')
            .a('QO-Code', {
              class: 'footer__text',
              href: 'https://github.com/qocode/qocode',
              target: '_blank'
            })
            .span('»')
          )
        )
        // .oom(QOMenu,
        //   {
        //     class: 'footer__menu',
        //     dataActiveItem: this._activePage,
        //     options: {
        //       navigate: page => this.navigate(page),
        //       dataItems: this._menuItemsBottom
        //     }
        //   },
        //   menu => (this._menuBottom = menu))
        .div({ class: 'footer__block' }, oom
          .a('Сообщить о проблеме', {
            class: 'footer__item',
            href: 'https://github.com/qocode/qocode/issues',
            target: '_blank'
          })
        )
      ))

  constructor() {
    super()
    this.onpopstate = () => this.navigate(location.pathname, true)
  }

  connectedCallback() {
    if (location.pathname === '/') {
      document.title = basicTitle
    } else {
      document.title = `${this._pages[location.pathname].title} – ${basicTitle}`
    }
    window.addEventListener('popstate', this.onpopstate)
  }

  disconnectedCallback() {
    document.title = basicTitle
    window.removeEventListener('popstate', this.onpopstate)
  }

  navigate(page, back = false) {
    if (this._activePage !== page) {
      if (page === '/') {
        document.title = basicTitle
      } else {
        document.title = `${this._pages[page].title} – ${basicTitle}`
      }
      this._activePage = page
      this._activeLayout = this._pages[page].layout
      this._menuTop.dataset.activeItem = page
      // this._menuBottom.dataset.activeItem = page
      this._content.innerHTML = ''
      this._content.append(this._activeLayout({
        navigate: page => this.navigate(page)
      }).dom)
      if (!back) {
        history.pushState(null, '', page)
      }
    }
  }

}


oom.define(DefaultLayout)
