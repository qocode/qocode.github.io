import { oom, NotMLElement } from './lib/notml.js'

const { document, HTMLElement } = window


class MainMenu extends NotMLElement {

  content = oom
    .MainMenuAction(oom
      .div({ class: 'main-menu__background' })
    )
    .div({ class: 'main-menu__content' }, this.pullOutContent())

}


class MainMenuAction extends HTMLElement {

  /** Элемент управления основным меню */
  constructor() {
    super()
    this.onclick = () => this.toggleMainMenu()
  }

  /** Показ и скрытие основного меню */
  toggleMainMenu() {
    document.querySelector('main-menu').toggleAttribute('opened')
  }

}


customElements.define('main-menu', MainMenu)

customElements.define('main-menu-action', MainMenuAction)
