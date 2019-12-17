const { screen, document } = window
let touchStartX = 0
let touchEndX = 0
const qrscanner = document.querySelector('qrcode-scanner')
const mainmenu = document.querySelector('main-menu')


document.body.addEventListener('touchstart', function touchstart(e) {
  touchEndX = touchStartX = e.targetTouches[0].clientX
}, false)

document.body.addEventListener('touchmove', function touchmove(e) {
  if (touchStartX !== 0) {
    if (e.targetTouches[0].clientX - touchStartX > screen.width / 10) {
      if (qrscanner.hasAttribute('opened')) {
        qrscanner.toggleScan()
      } else {
        if (touchStartX < screen.width / 10) {
          mainmenu.setAttribute('opened', '')
        }
      }
      touchStartX = 0
    } else if (touchStartX - e.targetTouches[0].clientX > screen.width / 10) {
      if (mainmenu.hasAttribute('opened')) {
        mainmenu.removeAttribute('opened')
      } else {
        if (!qrscanner.hasAttribute('opened') && touchStartX > (screen.width - screen.width / 10)) {
          qrscanner.toggleScan()
        }
      }
      touchStartX = 0
    }
  }
  touchEndX = e.targetTouches[0].clientX
}, false)

document.body.addEventListener('touchend', function touchend(e) {
  if (touchStartX > 0 && Math.abs(touchStartX - touchEndX) < screen.width / 10 &&
    qrscanner.hasAttribute('opened')) {
    qrscanner.append()
  }
  touchStartX = 0
}, false)
