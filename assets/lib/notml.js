const { document, DocumentFragment, HTMLElement } = window
const isOOMInstance = Symbol('isOOMInstance')
const magic = (target, tagName) => tagName === 'element' ? target[tagName] : false
const oomHandler = Object.create(null, {
  get: {
    value: (target, tagName, proxy) => {
      return magic(target, tagName) || (((typeof tagName === 'string' && !(tagName in target.cache))
        ? (target.cache[tagName] = (...args) => target.append(new OOMElement(tagName, ...args)) && proxy)
        : (target.cache[tagName] || target[tagName])
      ))
    }
  },
  set: {
    value: () => false
  }
})
const oomOrigin = Object.create(null, {
  [Symbol.hasInstance]: {
    value: instance => instance[isOOMInstance] || false
  }
})
const oom = new Proxy(() => { }, Object.create(null, {
  apply: {
    value: (_, __, args) => typeof args[0] === 'string'
      ? new Proxy(new OOMElement(...args), oomHandler)
      : new Proxy(new OOMFragment(...args), oomHandler)
  },
  get: {
    value: (_, tagName) => (typeof tagName === 'string' && !(tagName in oomOrigin))
      ? (oomOrigin[tagName] = (...args) => new Proxy(new OOMFragment(new OOMElement(tagName, ...args)), oomHandler))
      : oomOrigin[tagName]
  },
  set: {
    value: () => false
  }
}))


/**
 * Произвольный набор элементов дочерних узлов, иди единственный узел.
 * Поддерживаемые типы:
 *  - OOMElement
 *  - DocumentFragment
 *  - HTMLElement
 *
 * @typedef {any} OOMAbstractChilds
 */
class OOMAbstract {

  /**
   * Конструктор абстрактных элементов oom
   */
  constructor() {
    this.cache = Object.create(null)
    this[isOOMInstance] = true
  }

  /**
   * Добавление вложенных элементов в текущий
   *
   * @param {OOMAbstractChilds} [childs]
   * @returns {OOMAbstract}
   */
  append(childs) {
    if (childs) {
      if (childs instanceof OOMAbstract) {
        this.element.append(childs.element)
      } else {
        this.element.append(childs)
      }
    }

    return this
  }

}

class OOMFragment extends OOMAbstract {

  /**
   * Создание фрагмента DOM
   *
   * @param  {OOMAbstractChilds} childs
   */
  constructor(childs) {
    super()
    /** @type {DocumentFragment} */
    this.element = document.createDocumentFragment()
    this.append(childs)
  }

}


class OOMElement extends OOMAbstract {

  /**
   * @param  {Object<string, string>} attributes
   * @param  {OOMAbstractChilds} childs
   * @returns {boolean}
   */
  static rotateArgs(attributes, childs) {
    if (attributes) {
      if (
        typeof attributes === 'string' ||
        attributes instanceof oom ||
        attributes instanceof DocumentFragment ||
        attributes instanceof HTMLElement
      ) {
        return true
      }
    }

    return false
  }

  /**
   * @param  {string} tagName
   * @param  {Object<string, string>} attributes
   * @param  {OOMAbstractChilds} childs
   */
  constructor(tagName, attributes, childs) {
    super()
    if (OOMElement.rotateArgs(attributes, childs)) {
      [attributes, childs] = [childs, attributes]
    }
    if (tagName[0] === tagName[0].toUpperCase()) {
      tagName = tagName
        .replace((/^[A-Z]/), str => str.toLowerCase())
        .replace((/[A-Z]/g), str => `-${str.toLowerCase()}`)
    }
    this.element = document.createElement(tagName)
    this.setAttributes(attributes)
    this.append(childs)
  }

  /**
   *
   * @param {Object<string, string>} [attributes]
   */
  setAttributes(attributes = {}) {
    for (const [attrName, attrValue] of Object.entries(attributes)) {
      this.element.setAttribute(attrName, attrValue)
    }
  }

}


class NotMLElement extends HTMLElement {

  /**
   * Вынимает содежимое компонента для последующей вставки вместе с шаблоном
   *
   * @returns {DocumentFragment}
   */
  pullOutContent() {
    const content = document.createDocumentFragment()

    content.append(...this.childNodes)

    return content
  }

  /** Обновляет содержимое компонента из свойства "content".
   * При этом данные в поле очищаются, т.к. узлы переносятся в реальный DOM
   */
  applyContent() {
    const content = Object.getOwnPropertyDescriptor(this, 'content')

    if (content && content.value) {
      const { value } = content

      this.innerHTML = ''
      if (value instanceof DocumentFragment) {
        this.appendChild(value)
      } else if (value instanceof oom) {
        this.appendChild(value.element)
      }

      Object.defineProperty(this, 'content', { value: undefined })
    }
  }

  /**
   * Обновляет содержимое компонента из свойства "content" при вставке компонента в DOM
   */
  connectedCallback() {
    this.applyContent()
  }

}


export { oom, NotMLElement }
