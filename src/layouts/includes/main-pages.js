import { oom } from '@notml/core'
import { QOGenerator } from '../../components/qrcode-generator.js'

export const qoMyOrders = () => oom
  .div('/ - 404 Not Found')
export const qoGetQR = () => oom
  .p('Укажите параметры оформления заказа.')
  .p({ class: 'theme__additional-text' },
    'Несколько товаров или услуг будут объединены в один заказ по URL сервиса.'
  )
  .oom(QOGenerator)
export const qoPartners = () => oom
  .div('/partners/ - 404 Not Found')
export const qoContacts = () => oom
  .div('/contacts/ - 404 Not Found')
export const qoAbout = () => oom
  .div('/about/ - 404 Not Found')
