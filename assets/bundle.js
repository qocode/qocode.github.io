const customTagNames = new Set();
const customElementTagName = new Map();
const customClasses = new Map();
const customOptions = new WeakMap();function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}let _Symbol$hasInstance;
const {
  document,
  customElements,
  DocumentFragment,
  HTMLElement
} = window;
const isOOMAbstractSymbol = Symbol('isOOMAbstract');
_Symbol$hasInstance = Symbol.hasInstance;
class OOMAbstract {
  constructor() {
    _defineProperty(this, isOOMAbstractSymbol, true);
    _defineProperty(this, "dom", void 0);
  }
  static proxyGetter(instance, tagName, proxy) {
    if (tagName in instance) {
      if (typeof instance[tagName] === 'function') {
        return (...args) => {
          const result = instance[tagName](...args);
          return result === instance ? proxy : result;
        };
      } else {
        return instance[tagName];
      }
    } else {
      return (...args) => {
        instance.append(OOMAbstract.create(OOMElement, tagName, ...args));
        return proxy;
      };
    }
  }
  static create(constructor, ...args) {
    const lastArg = args[args.length - 1];
    const isCallback = typeof lastArg === 'function' && !customElementTagName.has(lastArg);
    const callback = isCallback ? args.pop() : null;
    const element = new constructor(...args);
    if (callback) {
      callback(element.dom);
    }
    return element;
  }
  static factory(tagName, ...args) {
    const isTagName = typeof tagName === 'string' || customElementTagName.has(tagName);
    const element = OOMAbstract.create(isTagName ? OOMElement : OOMFragment, tagName, ...args);
    return element;
  }
  static [_Symbol$hasInstance](instance) {
    return instance && instance[isOOMAbstractSymbol];
  }
  append(child) {
    if (child instanceof OOMAbstract) {
      this.dom.append(child.dom);
    } else if (child) {
      this.dom.append(child);
    }
    return this;
  }
  oom(...args) {
    const child = OOMAbstract.factory(...args);
    this.append(child);
    return this;
  }
  clone() {
    const dom = document.importNode(this.dom, true);
    const element = new this.constructor(dom);
    const proxy = new Proxy(element, OOMAbstract.proxyHandler);
    return proxy;
  }
}
_defineProperty(OOMAbstract, "proxyHandler", {
  get: OOMAbstract.proxyGetter,
  set: () => false
});
class OOMFragment extends OOMAbstract {
  get html() {
    let html = '';
    for (const item of this.dom.children) {
      html += item.outerHTML;
    }
    return html;
  }
  constructor(child) {
    super();
    if (child instanceof DocumentFragment) {
      this.dom = child;
    } else {
      this.dom = document.createDocumentFragment();
      this.append(child);
    }
  }
}
class OOMElement extends OOMAbstract {
  static resolveTagName(tagName) {
    let result;
    if (typeof tagName === 'string' && tagName[0] === tagName[0].toUpperCase()) {
      result = tagName.replace(/^[A-Z]/, str => str.toLowerCase()).replace(/[A-Z]/g, str => `-${str.toLowerCase()}`);
    } else {
      result = tagName;
    }
    return result;
  }
  static setAttribute(instance, attrName, attrValue) {
    if (attrName === 'options' && customClasses.has(instance.constructor)) {
      customOptions.set(instance, attrValue);
    } else {
      const attrType = typeof attrValue;
      if (attrType === 'function') {
        instance[attrName] = attrValue;
      } else {
        if (/[A-Z]/.test(attrName)) {
          attrName = attrName.replace(/[A-Z]/g, str => `-${str.toLowerCase()}`);
        }
        if (attrType === 'object') {
          instance.setAttribute(attrName, `json::${JSON.stringify(attrValue)}`);
        } else {
          instance.setAttribute(attrName, attrValue);
        }
      }
    }
    return attrValue;
  }
  static getAttribute(instance, attrName) {
    let attrValue;
    if (attrName === 'options' && customClasses.has(instance.constructor)) {
      attrValue = customOptions.get(instance, attrValue);
    } else {
      const ownValue = instance[attrName];
      if (typeof ownValue === 'function') {
        attrValue = ownValue;
      } else {
        if (/[A-Z]/.test(attrName)) {
          attrName = attrName.replace(/[A-Z]/g, str => `-${str.toLowerCase()}`);
        }
        attrValue = instance.getAttribute(attrName);
        if (attrValue.startsWith('json::')) {
          attrValue = JSON.parse(attrValue.replace('json::', ''));
        }
      }
    }
    return attrValue;
  }
  static setAttributes(instance, attributes = {}, attrValue) {
    if (typeof attributes === 'string') {
      OOMElement.setAttribute(instance, attributes, attrValue);
    } else {
      for (const [attrName, attrValue] of Object.entries(attributes)) {
        OOMElement.setAttribute(instance, attrName, attrValue);
      }
    }
  }
  static resolveArgs(attributes, child) {
    if (typeof attributes === 'string' || attributes instanceof OOMAbstract || attributes instanceof DocumentFragment || attributes instanceof HTMLElement) {
      return [child, attributes];
    } else {
      return [attributes, child];
    }
  }
  get html() {
    return this.dom.outerHTML;
  }
  constructor(tagName, attributes, child) {
    [attributes, child] = OOMElement.resolveArgs(attributes, child);
    super();
    if (tagName instanceof HTMLElement) {
      this.dom = tagName;
    } else {
      if (customElementTagName.has(tagName)) {
        tagName = customElementTagName.get(tagName);
        customElements.get(tagName).options = attributes ? attributes.options : undefined;
      } else {
        tagName = OOMElement.resolveTagName(tagName);
        if (customTagNames.has(tagName)) {
          customElements.get(tagName).options = attributes ? attributes.options : undefined;
        }
      }
      this.dom = document.createElement(tagName);
    }
    this.setAttributes(attributes);
    this.append(child);
  }
  setAttributes(attributes) {
    OOMElement.setAttributes(this.dom, attributes);
    return this;
  }
}const {
  HTMLElement: HTMLElement$1,
  customElements: customElements$1
} = window;
const observedAttributesSymbol = Symbol('observedAttributes');
const attributeChangedCacheSymbol = Symbol('attributeChangedCache');
const attributesHandler = {
  get: OOMElement.getAttribute,
  set: OOMElement.setAttribute
};
function getObservedAttributes(proto, setters) {
  const properties = Object.getOwnPropertyNames(proto);
  const nestedProto = Reflect.getPrototypeOf(proto);
  if (Object.isPrototypeOf.call(HTMLElement$1, nestedProto.constructor)) {
    getObservedAttributes(nestedProto, setters);
  }
  for (const name of properties) {
    const {
      value
    } = Reflect.getOwnPropertyDescriptor(proto, name);
    const isFunction = typeof value === 'function';
    const isChanged = name.endsWith('Changed');
    const isValidName = /^[a-z][\w]+$/.test(name);
    if (isFunction && isChanged && isValidName) {
      const attributeName = name.replace(/Changed$/, '').replace(/[A-Z]/g, str => `-${str.toLowerCase()}`);
      setters.set(attributeName, name);
    }
  }
  return setters.size > 0 ? setters : null;
}
function applyAttributeChangedCallback(instance, name, oldValue, newValue) {
  const observed = instance.constructor[observedAttributesSymbol];
  if (observed && observed.has(name)) {
    if (newValue && newValue.startsWith('json::')) {
      newValue = JSON.parse(newValue.replace('json::', ''));
    }
    if (instance.isConnected) {
      instance[observed.get(name)](oldValue, newValue);
    } else {
      if (!(attributeChangedCacheSymbol in instance)) {
        instance[attributeChangedCacheSymbol] = new Set();
      }
      instance[attributeChangedCacheSymbol].add({
        name: observed.get(name),
        args: [oldValue, newValue]
      });
    }
  }
}
function applyOOMTemplate(instance) {
  const attributeChanged = instance[attributeChangedCacheSymbol];
  let staticTemplate = instance.constructor.template;
  let {
    template
  } = instance;
  let templateOptions = typeof staticTemplate === 'function' && staticTemplate.length > 0 || typeof template === 'function' && template.length > 0 || null;
  if (templateOptions) {
    templateOptions = Object.assign({}, customOptions.get(instance), {
      element: instance,
      attributes: new Proxy(instance, attributesHandler)
    });
  }
  if (template instanceof OOMAbstract) {
    template = template.clone();
  } else if (typeof template !== 'string') {
    if (staticTemplate instanceof OOMAbstract) {
      staticTemplate = staticTemplate.clone();
    } else if (typeof staticTemplate === 'function') {
      staticTemplate = instance.constructor.template(templateOptions);
    }
    if (typeof template === 'function') {
      if (templateOptions) {
        templateOptions.template = staticTemplate;
      }
      template = instance.template(templateOptions) || staticTemplate;
    } else {
      template = staticTemplate;
    }
  }
  if (template instanceof OOMAbstract) {
    instance.innerHTML = '';
    instance.append(template.dom);
  } else if (typeof template === 'string') {
    instance.innerHTML = template;
  }
  if (attributeChanged instanceof Set) {
    for (const changed of attributeChanged) {
      instance[changed.name](...changed.args);
      attributeChanged.delete(changed);
    }
    delete instance[attributeChangedCacheSymbol];
  }
}
function customClassFactory(constructor) {
  class OOMCustomElement extends constructor {
    static get observedAttributes() {
      return this[observedAttributesSymbol] ? [...this[observedAttributesSymbol].keys(), ...(super.observedAttributes || [])] : super.observedAttributes;
    }
    constructor() {
      super(OOMCustomElement.options || {});
      delete OOMCustomElement.options;
    }
    attributeChangedCallback(name, oldValue, newValue) {
      applyAttributeChangedCallback(this, name, oldValue, newValue);
      if (super.attributeChangedCallback) {
        super.attributeChangedCallback(name, oldValue, newValue);
      }
    }
    connectedCallback() {
      applyOOMTemplate(this);
      if (super.connectedCallback) {
        super.connectedCallback();
      }
    }
  }
  _defineProperty(OOMCustomElement, observedAttributesSymbol, getObservedAttributes(constructor.prototype, new Map()));
  return OOMCustomElement;
}
function defineCustomElement(name, constructor, options) {
  if (Object.isPrototypeOf.call(HTMLElement$1, name)) {
    [constructor, options] = [name, constructor];
    name = OOMElement.resolveTagName(constructor.name);
  }
  const customClass = customClasses.get(constructor) || customClassFactory(constructor);
  customElements$1.define(name, customClass, options);
  customClasses.set(customClass, constructor);
  customElementTagName.set(constructor, name);
  customTagNames.add(name);
}const {
  customElements: customElements$2
} = window;
const oomOrigin = Object.assign(Object.create(null), {
  append: (...args) => {
    return oom().append(...args);
  },
  setAttributes: (...args) => {
    OOMElement.setAttributes(...args);
    return oom;
  },
  define: (...args) => {
    defineCustomElement(...args);
    return oom;
  },
  getDefined: tagName => {
    return customClasses.get(customElements$2.get(tagName));
  },
  oom: (...args) => {
    return oom(...args);
  }
});
const oom = new Proxy(OOMAbstract, {
  apply: (_, __, args) => {
    const element = OOMAbstract.factory(...args);
    const proxy = new Proxy(element, OOMAbstract.proxyHandler);
    return proxy;
  },
  get: (_, tagName) => {
    return oomOrigin[tagName] || ((...args) => {
      const element = OOMAbstract.create(OOMElement, tagName, ...args);
      const fragment = new OOMFragment(element);
      const proxy = new Proxy(fragment, OOMAbstract.proxyHandler);
      return proxy;
    });
  },
  set: () => false
});

const { HTMLElement: HTMLElement$2 } = window;
class QOMenu extends HTMLElement$2 {
  _items = {}
  constructor({ navigate }) {
    super();
    this._navigate = navigate || (() => console.error('Not implemented'));
  }
  template({ dataItems, attributes }) {
    const tmpl = oom();
    for (const { text, page } of dataItems) {
      tmpl.div(oom.span(text, { class: 'text' }), {
        class: 'item',
        onclick: () => (attributes.dataActiveItem = page)
      }, div => (this._items[page] = div));
    }
    return tmpl
  }
  dataActiveItemChanged(oldValue, newValue) {
    if (oldValue !== newValue) {
      if (newValue in this._items) {
        this._items[newValue].classList.add('active');
        this._navigate(newValue);
      }
      if (oldValue in this._items) {
        this._items[oldValue].classList.remove('active');
      }
    }
  }
}
oom.define('qo-menu', QOMenu);

const qoMyOrders = () => oom
  .div('qoMyOrders');
const qoPartners = () => oom
  .div('qoPartners');
const qoCreate = () => oom
  .div('qoCreate');
const qoContacts = () => oom
  .div('qoContacts');
const qoAbout = () => oom
  .div('qoAbout');

const { HTMLElement: HTMLElement$1$1, document: document$1, location, history } = window;
const basicTitle = 'QO-Code';
class DefaultLayout extends HTMLElement$1$1 {
  _homePage = '/'
  _pages = {
    '/': { title: 'Мои заказы', layout: qoMyOrders },
    '/create/': { title: 'Создать QR', layout: qoCreate },
    '/partners/': { title: 'Партнеры', layout: qoPartners },
    '/contacts/': { title: 'Контакты', layout: qoContacts },
    '/about/': { title: 'О проекте', layout: qoAbout }
  }
  _menuItemsTop = ['/', '/create/']
    .map(page => ({ page, text: this._pages[page].title }))
  _menuItemsBottom = ['/partners/', '/contacts/', '/about/']
    .map(page => ({ page, text: this._pages[page].title }))
  _activePage = location.pathname
  _activeLayout = this._pages[this._activePage].layout
  template = () => oom
    .aside({ class: 'logo' }, oom('div', { class: 'logo_img' }))
    .header({ class: 'header' }, oom()
      .oom(QOMenu,
        {
          class: 'header-menu',
          dataActiveItem: this._activePage,
          options: {
            navigate: page => this.navigate(page),
            dataItems: this._menuItemsTop
          }
        },
        menu => (this._menuTop = menu)))
    .aside({ class: 'left' })
    .section({ class: 'middle' },
      this._activeLayout(),
      middle => (this._middle = middle))
    .aside({ class: 'right' })
    .footer({ class: 'footer' }, oom()
      .oom(QOMenu,
        {
          class: 'footer-menu',
          dataActiveItem: this._activePage,
          options: {
            navigate: page => this.navigate(page),
            dataItems: this._menuItemsBottom
          }
        },
        menu => (this._menuBottom = menu)))
  constructor() {
    super();
    this.onpopstate = () => this.navigate(location.pathname, true);
  }
  connectedCallback() {
    document$1.title = `${this._pages[this._activePage].title} – ${basicTitle}`;
    window.addEventListener('popstate', this.onpopstate);
  }
  disconnectedCallback() {
    document$1.title = basicTitle;
    window.removeEventListener('popstate', this.onpopstate);
  }
  navigate(page, back = false) {
    if (this._activePage !== page) {
      document$1.title = `${this._pages[page].title} – ${basicTitle}`;
      this._activePage = page;
      this._activeLayout = this._pages[page].layout;
      this._menuTop.dataset.activeItem = page;
      this._menuBottom.dataset.activeItem = page;
      this._middle.innerHTML = '';
      this._middle.append(this._activeLayout().dom);
      if (!back) {
        history.pushState(null, '', page);
      }
    }
  }
}
oom.define(DefaultLayout);
