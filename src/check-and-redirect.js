import '@notml/core/check-compatible'

(() => {
  /* eslint-disable no-var, prefer-destructuring */
  var location = window.location
  var compatible = window.$notml.compatible()

  if (!compatible.success) {
    location.href = '/not-supported/'
  }

  // Перенаправление с http на https
  if (location.protocol !== 'https:' &&
    location.hostname !== 'localhost' &&
    Number.isNaN(Number(location.hostname.split('.').join('')))) {
    location.protocol = 'https:'
  }
})()
