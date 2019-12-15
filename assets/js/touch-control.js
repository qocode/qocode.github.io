const { screen, document } = window
let touchStartX = 0
const qrscanner = document.querySelector('qrcode-scanner')
const mainmenu = document.querySelector('main-menu')


document.body.addEventListener('touchstart', function touchstart(e) {
  touchStartX = e.targetTouches[0].clientX
}, false)

document.body.addEventListener('touchmove', function touchmove(e) {
  if (touchStartX !== 0) {
    if (e.targetTouches[0].clientX - touchStartX > screen.width / 10) {
      if (qrscanner.hasAttribute('opened')) {
        qrscanner.toggleScan()
      } else {
        mainmenu.setAttribute('opened', '')
      }
      touchStartX = 0
    } else if (touchStartX - e.targetTouches[0].clientX > screen.width / 10) {
      if (mainmenu.hasAttribute('opened')) {
        mainmenu.removeAttribute('opened')
      } else {
        if (!qrscanner.hasAttribute('opened')) {
          qrscanner.toggleScan()
        } else {
          // TODO: переделать на клик
          qrscanner.append()
        }
      }
      touchStartX = 0
    }
  }
}, false)

document.body.addEventListener('touchend', function touchend(e) {
  touchStartX = 0
}, false)
