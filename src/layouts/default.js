import { oom } from '@notml/core'
import './default.css'

const { HTMLElement } = window


class DefaultLayout extends HTMLElement {

  template = oom
    .aside({ class: 'logo' }, oom('div', { class: 'logo_img' }))
    .header({ class: 'header' })
    .aside({ class: 'left' })
    .section({ class: 'middle' })
    .aside({ class: 'right' })
    .footer({ class: 'footer' })

  connectedCallback() {

  }

}


oom.define(DefaultLayout)
