import { oom } from '@notml/core';
import { ZXing, QOData, QRCode } from '@qocode/core';

const { HTMLElement, Event, FileReader } = window;
class QOScanner extends HTMLElement {
  static tagName = 'qo-scanner'
  static emitToggle() {
    const event = new Event('qo-scanner::Toggle');
    window.dispatchEvent(event);
  }
  static template = ({ element }) => oom
    .aside({ class: 'qo-scanner__logo' }, oom(QOScanButton))
    .header({ class: 'qo-scanner__header' })
    .section({ class: 'qo-scanner__content' }, content => { element._content = content; })
    .footer({ class: 'qo-scanner__footer' }, oom
      .div({
        class: 'qo-scanner__back-button-block',
        onclick: () => this.emitToggle()
      }, oom
        .div({ class: 'qo-scanner__back-button' })))
  static tmplNotMedia = ({ element }) => oom('div', { class: 'qo-scanner__not-media' })
    .div(oom
      .p('К сожалению на Вашем устройстве не доступен захват видео с камеры.')
      .p({ class: 'theme__additional-text' },
        'Для оформления заказа, Вы можете воспользоваться' +
        ' стандартными приложениями камеры или сканера QR-кодов,' +
        ' и перейти на страницу заказа по ссылке в коде.')
      .p({ class: 'theme__additional-text' },
        'Или выбрать фотографию с QR кодом из галереи.')
      .input({
        type: 'file',
        accept: 'image/*',
        onchange: event => element.loadFromFile(event.srcElement.files[0])
      }, input => { element._imgInput = input; }))
    .div({ class: 'qo-scanner__img-from-file-preview' }, div => { element._imgPreview = div; })
  isOpened = false
  _isAllowedMediaDevices = null
  _codeReader = new ZXing.BrowserMultiFormatReader()
  constructor() {
    super();
    this._eventToggle = () => this.toggle();
  }
  connectedCallback() {
    window.addEventListener('qo-scanner::Toggle', this._eventToggle);
  }
  disconnectedCallback() {
    window.removeEventListener('qo-scanner::Toggle', this._eventToggle);
  }
  async resolveMediaDevices() {
    if (this._isAllowedMediaDevices === null) {
      this._isAllowedMediaDevices = false;
      const devices = await this._codeReader.getVideoInputDevices()
        .catch(error => { console.error(error.message); });
      if (devices && devices.length > 0) {
        console.log(devices);
        this._isAllowedMediaDevices = true;
        this._content.innerHTML = JSON.stringify(devices);
      } else {
        this._content.append(QOScanner.tmplNotMedia({ element: this }).dom);
      }
    }
  }
  toggle() {
    if (this.isOpened) {
      this.close();
    } else {
      this.open();
    }
  }
  open() {
    this.resolveMediaDevices().then(() => this._open());
  }
  _open() {
    if (!this.isOpened) {
      this.isOpened = true;
      this.classList.add('qo-scanner_opened');
    }
  }
  close() {
    if (this.isOpened) {
      this.isOpened = false;
      this.classList.remove('qo-scanner_opened');
      if (this._imgInput) {
        this._imgInput.value = '';
        this._imgPreview.style.backgroundImage = '';
      }
    }
  }
  loadFromFile(file) {
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = event => {
        this._imgPreview.style.backgroundImage = `url('${event.srcElement.result}')`;
      };
    }
  }
}
class QOScanButton extends HTMLElement {
  static tagName = 'qo-scan-button'
  static template = oom.div({ class: 'qo-scan-button__image' })
  constructor() {
    super();
    this.onclick = event => this.openScanner(event);
  }
  openScanner(event) {
    event.stopPropagation();
    QOScanner.emitToggle();
  }
}
oom.define(QOScanner);
oom.define(QOScanButton);

const { HTMLElement: HTMLElement$1 } = window;
class QOMenu extends HTMLElement$1 {
  static tagName = 'qo-menu'
  _items = {}
  constructor({ navigate }) {
    super();
    this._navigate = navigate || (() => console.error('Not implemented'));
  }
  template({ dataItems, attributes }) {
    const tmpl = oom();
    for (const { text, page } of dataItems) {
      tmpl.div(oom.div(text, { class: 'qo-menu__text' }), {
        class: 'qo-menu__item',
        onclick: () => (attributes.dataActiveItem = page)
      }, div => (this._items[page] = div));
    }
    return tmpl
  }
  dataActiveItemChanged(oldValue, newValue) {
    if (oldValue !== newValue) {
      if (newValue in this._items) {
        this._items[newValue].classList.add('qo-menu__item_active');
        this._navigate(newValue);
      }
      if (oldValue in this._items) {
        this._items[oldValue].classList.remove('qo-menu__item_active');
      }
    }
  }
}
oom.define(QOMenu);

const { HTMLElement: HTMLElement$2 } = window;
class QOGenerator extends HTMLElement$2 {
  static tagName = 'qo-generator'
  template = ({ attributes }) => oom
    .form({ class: 'qo-generator__form' }, (oom
      .label({ class: 'qo-generator__form_api' }, oom
        .div('URL сервиса', { class: 'theme__label' })
        .input({
          name: 'api',
          value: '',
          type: 'text',
          placeholder: 'URL сервиса обрабтки заказов',
          title: 'URL сервиса обрабтки заказов',
          oninput: () => this.updateQR()
        }))
      .label({ class: 'qo-generator__form_seller' }, oom
        .div('Продавец', { class: 'theme__label' })
        .input({
          name: 'seller',
          value: '',
          type: 'text',
          placeholder: 'Название продавца',
          title: 'Название продавца',
          oninput: () => this.updateQR()
        }))
      .label({ class: 'qo-generator__form_name' }, oom
        .div('Товар или услуга', { class: 'theme__label' })
        .input({
          name: 'name',
          value: '',
          type: 'text',
          placeholder: 'Название товара или услуги',
          title: 'Название товара или услуги',
          oninput: () => this.updateQR()
        }))
      .label({ class: 'qo-generator__form_price' }, oom
        .div('Стоимость, ₽', { class: 'theme__label' })
        .input({
          name: 'price',
          value: '',
          type: 'text',
          placeholder: 'Стоимость товара',
          title: 'Стоимость товара',
          oninput: () => this.updateQR()
        }))
    ), form => (this._form = form))
    .label({ class: 'qo-generator__url-field' }, oom
      .div('URL и QR код заказа:', { class: 'theme__label' })
      .input({
        readonly: true,
        onclick: 'this.select()'
      }, input => (this._urlText = input)))
    .div({ class: 'qo-generator__qr-canvas-block' }, oom
      .canvas({
        class: 'qo-generator__qr-canvas',
        style: 'height: 0; width: 0;'
      }, canvas => (this._canvas = canvas)))
    .div({ class: 'qo-generator__qr-canvas-options' }, oom
      .label(oom
        .div('Размер точек', { class: 'theme__label' })
        .input({
          type: 'range',
          value: this._options.scale,
          min: 1,
          max: 7,
          oninput: event => { attributes.qrScale = event.srcElement.value; }
        }, qrScale => (this._qrScale = qrScale))
      )
      .label(oom
        .div('Устойчивость к ошибкам', { class: 'theme__label' })
        .select({
          onchange: event => { attributes.qrCorrectionLevel = event.srcElement.value; }
        }, oom
          .option('Низкая', { value: 'low' })
          .option('Средняя', { value: 'medium', selected: true })
          .option('Хорошая', { value: 'quartile' })
          .option('Наилучшая', { value: 'high' }))
      )
      .div(oom
        .div('Цвет точек, прозрачность', { class: 'theme__label' })
        .div({ class: 'qo-generator__qr-canvas-color' }, oom
          .input({
            class: 'qo-generator__input-color',
            type: 'color',
            value: this._colorOptions.dark,
            oninput: event => { attributes.qrColorDark = event.srcElement.value; }
          }, qrColorDark => (this._qrColorDark = qrColorDark))
          .input({
            type: 'range',
            min: 0,
            max: 255,
            value: this._colorOptions.opacity.dark,
            oninput: event => { attributes.qrColorDarkOpacity = event.srcElement.value; }
          }, qrColorDarkOpacity => (this._qrColorDarkOpacity = qrColorDarkOpacity))
          .span(this._options.color.dark, {
            class: 'qo-generator__color-label theme__text-mono theme__label'
          }, qrColorDarkFull => (this._qrColorDarkFull = qrColorDarkFull)))
      )
      .div(oom
        .div('Цвет фона, прозрачность', { class: 'theme__label' })
        .div({ class: 'qo-generator__qr-canvas-color' }, oom
          .input({
            class: 'qo-generator__input-color',
            type: 'color',
            value: this._colorOptions.light,
            oninput: event => { attributes.qrColorLight = event.srcElement.value; }
          }, qrColorLight => (this._qrColorLight = qrColorLight))
          .input({
            type: 'range',
            min: 0,
            max: 255,
            value: this._colorOptions.opacity.light,
            oninput: event => { attributes.qrColorLightOpacity = event.srcElement.value; }
          }, qrColorLightOpacity => (this._qrColorLightOpacity = qrColorLightOpacity))
          .span(this._options.color.light, {
            class: 'qo-generator__color-label theme__text-mono theme__label'
          }, qrColorLightFull => (this._qrColorLightFull = qrColorLightFull)))
      )
    )
  constructor() {
    super();
    this._options = {
      scale: 7,
      margin: 2,
      errorCorrectionLevel: 'medium',
      color: {
        dark: '#000000ff',
        light: '#ffffff00'
      }
    };
    this._colorOptions = {
      dark: '#000000',
      light: '#ffffff',
      opacity: {
        dark: 255,
        light: 0
      }
    };
  }
  set qrScale(value) {
    this.setAttribute('qr-scale', value);
    return value
  }
  qrScaleChanged(oldValue, newValue) {
    if (oldValue !== newValue) {
      const value = parseInt(newValue);
      if (value < 8 && value > 0) {
        this._qrScale.value = value;
        if (this._options.scale !== value) {
          this._options.scale = value;
          this.updateQR(false);
        }
      }
    }
  }
  qrCorrectionLevelChanged(oldValue, newValue) {
    if (oldValue !== newValue) {
      this._options.errorCorrectionLevel = newValue;
      this.updateQR(false);
    }
  }
  qrColorDarkChanged(oldValue, newValue) {
    if (oldValue !== newValue) {
      this._colorOptions.dark = newValue;
      this._options.color.dark = this._colorOptions.dark +
        ('0' + this._colorOptions.opacity.dark.toString(16)).slice(-2);
      this._qrColorDarkFull.textContent = this._options.color.dark;
      this.updateQR(false);
    }
  }
  qrColorDarkOpacityChanged(oldValue, newValue) {
    if (oldValue !== newValue) {
      this._colorOptions.opacity.dark = Number(newValue);
      this._options.color.dark = this._colorOptions.dark +
        ('0' + this._colorOptions.opacity.dark.toString(16)).slice(-2);
      this._qrColorDarkFull.textContent = this._options.color.dark;
      this.updateQR(false);
    }
  }
  qrColorLightChanged(oldValue, newValue) {
    if (oldValue !== newValue) {
      this._colorOptions.light = newValue;
      this._options.color.light = this._colorOptions.light +
        ('0' + this._colorOptions.opacity.light.toString(16)).slice(-2);
      this._qrColorLightFull.textContent = this._options.color.light;
      this.updateQR(false);
    }
  }
  qrColorLightOpacityChanged(oldValue, newValue) {
    if (oldValue !== newValue) {
      this._colorOptions.opacity.light = Number(newValue);
      this._options.color.light = this._colorOptions.light +
        ('0' + this._colorOptions.opacity.light.toString(16)).slice(-2);
      this._qrColorLightFull.textContent = this._options.color.light;
      this.updateQR(false);
    }
  }
  connectedCallback() {
    setTimeout(() => this.drawQR(), 1);
  }
  updateQR(adapt) {
    if (this._drawTimer) {
      clearTimeout(this._drawTimer);
    }
    this._drawTimer = setTimeout(() => this.drawQR(adapt), 300);
  }
  drawQR(adapt = true) {
    const qoData = new QOData(this._form);
    const url = qoData.stringify();
    this._drawTimer = null;
    this._urlText.value = url;
    QRCode.toCanvas(this._canvas, url, this._options, error => {
      if (error) {
        console.error(error);
      }
      if (this._canvas.width > this._canvas.parentNode.clientWidth &&
        this._options.scale > 1) {
        --this._options.scale;
        this.drawQR(adapt = false);
        this.qrScale = this._options.scale;
      }
      if (adapt) {
        if (this._canvas.width < (this._canvas.parentNode.parentNode.clientWidth / 1.5) &&
          this._options.scale < 7
        ) {
          ++this._options.scale;
          this.drawQR();
          this.qrScale = this._options.scale;
        }
      }
    });
  }
}
oom.define(QOGenerator);

const qoMyOrders = () => oom('div', { class: 'qo-my-orders__layouts' })
  .div({ class: 'qo-my-orders__content' }, '/ - 404 Not Found')
  .div({
    class: 'qo-my-orders__scan-button-block',
    onclick: () => QOScanner.emitToggle()
  }, oom
    .div('Открыть', { class: 'theme__additional-text' })
    .oom(QOScanButton, { class: 'qo-scan-button_middle qo-my-orders__scan-button' })
    .div('сканнер ', { class: 'theme__additional-text' }));
const qoGetQR = () => oom
  .p('Укажите параметры оформления заказа.')
  .p({ class: 'theme__additional-text' },
    'Несколько товаров или услуг будут объединены в один заказ по URL сервиса.'
  )
  .oom(QOGenerator);
const qoPartners = () => oom
  .div('/partners/ - 404 Not Found');
const qoContacts = () => oom
  .div('/contacts/ - 404 Not Found');
const qoAbout = () => oom
  .div('/about/ - 404 Not Found');

const { HTMLElement: HTMLElement$3, document, location, history } = window;
const basicTitle = 'QO-Code';
class DefaultLayout extends HTMLElement$3 {
  _homePage = '/'
  _pages = {
    '/': { title: 'Заказы', layout: qoMyOrders },
    '/get-qr/': { title: 'QR', layout: qoGetQR },
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
    .aside({ class: 'logo' }, oom(QOScanButton))
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
        this._activeLayout(),
        content => (this._content = content))
      .footer({ class: 'footer' }, oom()
        .div('QO-Code', { class: 'footer__item' })
        .oom(QOMenu,
          {
            class: 'footer__menu',
            dataActiveItem: this._activePage,
            options: {
              navigate: page => this.navigate(page),
              dataItems: this._menuItemsBottom
            }
          },
          menu => (this._menuBottom = menu))))
    .oom(QOScanner, scanner => { this._scanner = scanner; })
  constructor() {
    super();
    this.onpopstate = () => this.navigate(location.pathname, true);
  }
  connectedCallback() {
    document.title = `${this._pages[this._activePage].title} – ${basicTitle}`;
    window.addEventListener('popstate', this.onpopstate);
  }
  disconnectedCallback() {
    document.title = basicTitle;
    window.removeEventListener('popstate', this.onpopstate);
  }
  navigate(page, back = false) {
    if (this._activePage !== page) {
      if (this._scanner.isOpened) {
        this._scanner.close();
        history.pushState(null, '', this._activePage);
      } else {
        document.title = `${this._pages[page].title} – ${basicTitle}`;
        this._activePage = page;
        this._activeLayout = this._pages[page].layout;
        this._menuTop.dataset.activeItem = page;
        this._menuBottom.dataset.activeItem = page;
        this._content.innerHTML = '';
        this._content.append(this._activeLayout().dom);
        if (!back) {
          history.pushState(null, '', page);
        }
      }
    }
  }
}
oom.define(DefaultLayout);
