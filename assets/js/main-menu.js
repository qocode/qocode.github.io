import { oom, NotMLElement } from './lib/notml.js'

const { screen, document, HTMLElement } = window


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

let touchStartX = 0

document.body.addEventListener('touchstart', function touchstart(e) {
  touchStartX = e.targetTouches[0].clientX
}, false)

document.body.addEventListener('touchmove', function touchmove(e) {
  if (e.targetTouches[0].clientX - touchStartX > screen.width / 10) {
    document.querySelector('main-menu').setAttribute('opened', '')
  } else if (touchStartX - e.targetTouches[0].clientX > screen.width / 10) {
    document.querySelector('main-menu').removeAttribute('opened')
  }
}, false)

document.body.addEventListener('touchend', function touchend(e) {
  touchStartX = 0
}, false)


customElements.define('main-menu', MainMenu)

customElements.define('main-menu-action', MainMenuAction)
