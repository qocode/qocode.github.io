import { QOData, QRCode } from '@qocode/core'
import { oom } from '@notml/core'
import './qrcode-generator.css'

const { HTMLElement } = window


class QOGenerator extends HTMLElement {

  static tagName = 'qo-generator'

  template = ({ attributes }) => oom
    .form({ class: 'qo-generator__form' }, (oom
      .label(oom
        .div('URL сервиса', { class: 'theme__label' })
        .input({
          name: 'api',
          value: '',
          type: 'text',
          placeholder: 'URL сервиса обрабтки заказов',
          title: 'URL сервиса обрабтки заказов',
          oninput: () => this.updateQR()
        }))
      .label(oom
        .div('Продавец', { class: 'theme__label' })
        .input({
          name: 'seller',
          value: '',
          type: 'text',
          placeholder: 'Название продавца',
          title: 'Название продавца',
          oninput: () => this.updateQR()
        }))
      .label(oom
        .div('Товар или услуга', { class: 'theme__label' })
        .input({
          name: 'name',
          value: '',
          type: 'text',
          placeholder: 'Название товара или услуги',
          title: 'Название товара или услуги',
          oninput: () => this.updateQR()
        }))
      .label(oom
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
      .div('URL заказа:', { class: 'theme__label' })
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
          oninput: event => { attributes.qrScale = event.srcElement.value }
        }, qrScale => (this._qrScale = qrScale))
      )
      .label(oom
        .div('Устойчивость к ошибкам', { class: 'theme__label' })
        .select({
          onchange: event => { attributes.qrCorrectionLevel = event.srcElement.value }
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
            oninput: event => { attributes.qrColorDark = event.srcElement.value }
          }, qrColorDark => (this._qrColorDark = qrColorDark))
          .input({
            type: 'range',
            min: 0,
            max: 255,
            value: this._colorOptions.opacity.dark,
            oninput: event => { attributes.qrColorDarkOpacity = event.srcElement.value }
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
            oninput: event => { attributes.qrColorLight = event.srcElement.value }
          }, qrColorLight => (this._qrColorLight = qrColorLight))
          .input({
            type: 'range',
            min: 0,
            max: 255,
            value: this._colorOptions.opacity.light,
            oninput: event => { attributes.qrColorLightOpacity = event.srcElement.value }
          }, qrColorLightOpacity => (this._qrColorLightOpacity = qrColorLightOpacity))
          .span(this._options.color.light, {
            class: 'qo-generator__color-label theme__text-mono theme__label'
          }, qrColorLightFull => (this._qrColorLightFull = qrColorLightFull)))
      )
    )

  /** Первичная загрузка */
  constructor() {
    super()
    this._options = {
      scale: 7,
      margin: 2,
      errorCorrectionLevel: 'medium',
      color: {
        dark: '#000000ff',
        light: '#ffffff00'
      }
    }
    this._colorOptions = {
      dark: '#000000',
      light: '#ffffff',
      opacity: {
        dark: 255,
        light: 0
      }
    }
  }

  set qrScale(value) {
    this.setAttribute('qr-scale', value)

    return value
  }

  qrScaleChanged(oldValue, newValue) {
    if (oldValue !== newValue) {
      const value = parseInt(newValue)

      if (value < 8 && value > 0) {
        this._qrScale.value = value
        if (this._options.scale !== value) {
          this._options.scale = value
          this.updateQR(false)
        }
      }
    }
  }

  qrCorrectionLevelChanged(oldValue, newValue) {
    if (oldValue !== newValue) {
      this._options.errorCorrectionLevel = newValue
      this.updateQR(false)
    }
  }

  qrColorDarkChanged(oldValue, newValue) {
    if (oldValue !== newValue) {
      this._colorOptions.dark = newValue
      this._options.color.dark = this._colorOptions.dark +
        ('0' + this._colorOptions.opacity.dark.toString(16)).slice(-2)
      this._qrColorDarkFull.textContent = this._options.color.dark
      this.updateQR(false)
    }
  }

  qrColorDarkOpacityChanged(oldValue, newValue) {
    if (oldValue !== newValue) {
      this._colorOptions.opacity.dark = Number(newValue)
      this._options.color.dark = this._colorOptions.dark +
        ('0' + this._colorOptions.opacity.dark.toString(16)).slice(-2)
      this._qrColorDarkFull.textContent = this._options.color.dark
      this.updateQR(false)
    }
  }

  qrColorLightChanged(oldValue, newValue) {
    if (oldValue !== newValue) {
      this._colorOptions.light = newValue
      this._options.color.light = this._colorOptions.light +
        ('0' + this._colorOptions.opacity.light.toString(16)).slice(-2)
      this._qrColorLightFull.textContent = this._options.color.light
      this.updateQR(false)
    }
  }

  qrColorLightOpacityChanged(oldValue, newValue) {
    if (oldValue !== newValue) {
      this._colorOptions.opacity.light = Number(newValue)
      this._options.color.light = this._colorOptions.light +
        ('0' + this._colorOptions.opacity.light.toString(16)).slice(-2)
      this._qrColorLightFull.textContent = this._options.color.light
      this.updateQR(false)
    }
  }

  connectedCallback() {
    setTimeout(() => this.drawQR(), 1)
  }

  /** Обновление QR кода, с задержкой на ввод текста */
  updateQR(adapt) {
    if (this._drawTimer) {
      clearTimeout(this._drawTimer)
    }
    this._drawTimer = setTimeout(() => this.drawQR(adapt), 300)
  }

  /** Отрисовка QR кода по данным формы */
  drawQR(adapt = true) {
    const qoData = new QOData(this._form)
    const url = qoData.stringify()

    this._drawTimer = null
    this._urlText.value = url
    QRCode.toCanvas(this._canvas, url, this._options, error => {
      if (error) {
        console.error(error)
      }
      if (this._canvas.width > this._canvas.parentNode.clientWidth &&
        this._options.scale > 1) {
        --this._options.scale
        this.drawQR(adapt = false)
        this.qrScale = this._options.scale
      }
      if (adapt) {
        if (this._canvas.width < (this._canvas.parentNode.parentNode.clientWidth / 1.5) &&
          this._options.scale < 7
        ) {
          ++this._options.scale
          this.drawQR()
          this.qrScale = this._options.scale
        }
      }
    })
  }

}


oom.define(QOGenerator)

export {
  QOGenerator
}
