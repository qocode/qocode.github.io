import { oom } from '@notml/core'
import './default.css'
import { QOMenu } from '../components/qo-menu.js'

const { HTMLElement, location, history } = window


class DefaultLayout extends HTMLElement {

  _activePage = location.pathname

  template = () => oom
    .aside({ class: 'logo' }, oom('div', { class: 'logo_img' }))
    .header({ class: 'header' })
    .aside({ class: 'left' }, oom(QOMenu, {
      dataActiveItem: this._activePage,
      options: {
        navigate: page => history.pushState(null, '', page),
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
      }
    }))
    .section({ class: 'middle' })
    .aside({ class: 'right' })
    .footer({ class: 'footer' })

}


oom.define(DefaultLayout)
