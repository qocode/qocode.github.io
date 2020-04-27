import { oom } from '@notml/core'
import './default.css'
import { QOMenu } from '../components/qo-menu.js'

const { HTMLElement, location, history } = window


class DefaultLayout extends HTMLElement {

  template = () => oom
    .aside({ class: 'logo' }, oom('div', { class: 'logo_img' }))
    .header({ class: 'header' })
    .aside({ class: 'left' }, oom(QOMenu, {
      navigate: page => history.pushState(null, '', page),
      dataActiveItem: this._activePage,
      dataItems: [
        {
          text: 'Заказы',
          page: '/'
        }, {
          text: 'Партнеры',
          page: '/partners/'
        }, {
          text: 'Создать QR',
          page: '/create/'
        }, {
          text: 'Контакты',
          page: '/contacts/'
        }, {
          text: 'О проекте',
          page: '/about/'
        }
      ]
    }))
    .section({ class: 'middle' })
    .aside({ class: 'right' })
    .footer({ class: 'footer' })

  constructor() {
    super()
    this._activePage = location.pathname
  }

}


oom.define(DefaultLayout)
