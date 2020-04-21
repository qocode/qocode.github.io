import { oom } from '@notml/core'
import './default.css'

const { HTMLElement } = window


class DefaultLayout extends HTMLElement {

  template = oom
    .aside({ class: 'logo' })
    .header()
    .aside({ class: 'left' })
    .section({ class: 'middle' })
    .aside({ class: 'right' })
    .footer()

}


oom.define(DefaultLayout)
