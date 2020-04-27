function _defineProperty(obj, key, value) {
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
const customElementsCache = new WeakMap();
const observedAttributesSymbol = Symbol('observedAttributes');
const attributeChangedCacheSymbol = Symbol('attributeChangedCache');
const isOOMInstanceSymbol = Symbol('isOOMInstance');
const {
  document,
  DocumentFragment,
  HTMLElement,
  customElements
} = window;
_Symbol$hasInstance = Symbol.hasInstance;
class OOMAbstract {
  constructor() {
    _defineProperty(this, isOOMInstanceSymbol, true);
  }
  static [_Symbol$hasInstance](instance) {
    return instance && instance[isOOMInstanceSymbol];
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
    const child = oom(...args);
    this.append(child);
    return this;
  }
  clone() {
    const dom = document.importNode(this.dom, true);
    const element = new this.constructor(dom);
    const proxy = new Proxy(element, elementHandler);
    return proxy;
  }
}
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
    super();
    if (tagName instanceof HTMLElement) {
      this.dom = tagName;
    } else {
      if (customElementsCache.has(tagName)) {
        tagName = customElementsCache.get(tagName);
      } else {
        tagName = resolveTagName(tagName);
      }
      this.dom = document.createElement(tagName);
    }
    [attributes, child] = OOMElement.resolveArgs(attributes, child);
    this.setAttributes(attributes);
    this.append(child);
  }
  setAttributes(attributes) {
    setAttributes(this.dom, attributes);
    return this;
  }
}
function resolveTagName(tagName) {
  let result;
  if (typeof tagName === 'string' && tagName[0] === tagName[0].toUpperCase()) {
    result = tagName.replace(/^[A-Z]/, str => str.toLowerCase()).replace(/[A-Z]/g, str => `-${str.toLowerCase()}`);
  } else {
    result = tagName;
  }
  return result;
}
function getObservedAttributes(proto, setters) {
  const properties = Object.getOwnPropertyNames(proto);
  const nestedProto = Reflect.getPrototypeOf(proto);
  if (Object.isPrototypeOf.call(HTMLElement, nestedProto.constructor)) {
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
  return setters;
}
function applyAttributeChangedCallback(instance, name, oldValue, newValue) {
  const observed = instance.constructor[observedAttributesSymbol];
  if (observed.has(name)) {
    if (newValue.startsWith('json::')) {
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
function setAttribute(instance, attrName, attrValue) {
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
  return attrValue;
}
function getAttribute(instance, attrName) {
  const ownValue = instance[attrName];
  let attrValue;
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
  return attrValue;
}
function setAttributes(instance, attributes = {}, attrValue) {
  if (typeof attributes === 'string') {
    setAttribute(instance, attributes, attrValue);
  } else {
    for (const [attrName, attrValue] of Object.entries(attributes)) {
      setAttribute(instance, attrName, attrValue);
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
    templateOptions = {
      element: instance,
      attributes: new Proxy(instance, attributesHandler)
    };
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
function defineOOMCustomElements(name, constructor, options) {
  if (Object.isPrototypeOf.call(HTMLElement, name)) {
    [constructor, options] = [name, constructor];
    name = resolveTagName(constructor.name);
  }
  const observedAttributes = getObservedAttributes(constructor.prototype, new Map());
  if (observedAttributes.size > 0) {
    constructor[observedAttributesSymbol] = observedAttributes;
    Object.defineProperty(constructor, 'observedAttributes', {
      value: [...observedAttributes.keys(), ...(constructor.observedAttributes || [])]
    });
    constructor.prototype.attributeChangedCallback = (attributeChangedCallback => function __attributeChangedCallback(name, oldValue, newValue) {
      applyAttributeChangedCallback(this, name, oldValue, newValue);
      if (attributeChangedCallback) attributeChangedCallback.call(this, name, oldValue, newValue);
    })(constructor.prototype.attributeChangedCallback);
  }
  constructor.prototype.connectedCallback = (connectedCallback => function __connectedCallback() {
    applyOOMTemplate(this);
    if (connectedCallback) connectedCallback.apply(this);
  })(constructor.prototype.connectedCallback);
  customElements.define(name, constructor, options);
  customElementsCache.set(constructor, name);
  return oom;
}
const attributesHandler = {
  get: getAttribute,
  set: setAttribute
};
const elementHandler = {
  get: (target, tagName, proxy) => {
    if (tagName in target) {
      if (typeof target[tagName] === 'function') {
        return (...args) => {
          let result = target[tagName](...args);
          result = result === target ? proxy : result;
          return result;
        };
      } else {
        return target[tagName];
      }
    } else {
      return (...args) => {
        const callback = typeof args[args.length - 1] === 'function' ? args.pop() : null;
        const element = new OOMElement(tagName, ...args);
        target.append(element);
        if (callback) {
          callback(element.dom);
        }
        return proxy;
      };
    }
  },
  set: () => false
};
const oomOrigin = Object.assign(Object.create(null), {
  append: (...args) => {
    return oom().append(...args);
  },
  setAttributes: (...args) => {
    setAttributes(...args);
    return oom;
  },
  define: defineOOMCustomElements,
  oom: (...args) => {
    return oom(...args);
  }
});
const oomHandler = {
  apply: (_, __, args) => {
    const isTagName = typeof args[0] === 'string' || customElementsCache.has(args[0]);
    const callback = args.length > 1 && typeof args[args.length - 1] === 'function' ? args.pop() : null;
    const element = new (isTagName ? OOMElement : OOMFragment)(...args);
    const proxy = new Proxy(element, elementHandler);
    if (callback) {
      callback(element.dom);
    }
    return proxy;
  },
  get: (_, tagName) => {
    return oomOrigin[tagName] || ((...args) => {
      const callback = typeof args[args.length - 1] === 'function' ? args.pop() : null;
      const element = new OOMElement(tagName, ...args);
      const fragment = new OOMFragment(element);
      const proxy = new Proxy(fragment, elementHandler);
      if (callback) {
        callback(element.dom);
      }
      return proxy;
    });
  },
  set: () => false
};
const oom = new Proxy(OOMAbstract, oomHandler);

const { HTMLElement: HTMLElement$1 } = window;
class QOMenu extends HTMLElement$1 {
  template = ({ attributes }) => {
    const tmpl = oom();
    const items = attributes.dataItems;
    this._items = {};
    for (const item of items) {
      const { text, page } = item;
      tmpl.div(text, {
        class: 'item',
        onclick: () => (attributes.dataActiveItem = page)
      }, div => (this._items[page] = div));
    }
    return tmpl
  }
  dataActiveItemChanged(oldValue, newValue) {
    if (oldValue) {
      this._items[oldValue].classList.remove('active');
    }
    this._items[newValue].classList.add('active');
    if (this.navigate) {
      this.navigate(newValue);
    }
  }
}
oom.define('qo-menu', QOMenu);

const { HTMLElement: HTMLElement$1$1, location, history } = window;
class DefaultLayout extends HTMLElement$1$1 {
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
    super();
    this._activePage = location.pathname;
  }
}
oom.define(DefaultLayout);
