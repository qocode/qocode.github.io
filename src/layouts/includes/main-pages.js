import { oom } from '@notml/core'
import { ListOrders } from '../../components/qo-list-orders.js'
import { QOScanner, QOScanButton } from '../../components/qo-scanner.js'
import { QOGenerator } from '../../components/qo-generator.js'
import './main-pages.css'


export const qoMyOrders = ({ navigate }) => oom('div', { class: 'qo-my-orders__layouts' })
  .div({ class: 'qo-my-orders__content' }, oom(ListOrders))
  .div({
    class: 'qo-my-orders__scan-button-block',
    onclick: () => navigate('/scanner/')
  }, oom
    .div('Открыть', { class: 'theme__additional-text' })
    .oom(QOScanButton, {
      class: 'qo-scan-button_middle qo-my-orders__scan-button',
      options: { navigate }
    })
    .div('сканнер ', { class: 'theme__additional-text' }))
export const qoScanner = ({ navigate }) => oom(QOScanner, { options: { navigate } })
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
