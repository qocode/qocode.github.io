(() => {
  const { location } = window

  // Перенаправление с http на https
  if (location.protocol !== 'https:' &&
    location.hostname !== 'localhost' &&
    Number.isNaN(Number(location.hostname.split('.').join('')))) {
    location.protocol = 'https:'
  }
})()
