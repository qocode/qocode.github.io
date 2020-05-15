import '@notml/core/check-compatible'

(() => {
  /* eslint-disable no-var, prefer-destructuring */
  var location = window.location
  var compatible = window.$notml.compatible()

  if (!compatible.success && location.pathname !== '/not-supported/') {
    location.href = '/not-supported/'
  } else if (compatible.success &&
    (location.pathname === '/not-supported/' || location.pathname === '/not-supported')) {
    location.href = '/'
  }

  // Перенаправление с http на https
  if (location.protocol !== 'https:' &&
    location.hostname !== 'localhost' &&
    Number.isNaN(Number(location.hostname.split('.').join('')))) {
    location.protocol = 'https:'
  }
})()
