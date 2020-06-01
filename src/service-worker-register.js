const { navigator } = window


if ('serviceWorker' in navigator) {
  (async () => {
    const { buildNumber } = window.$qoConfig
    const { serviceWorker } = navigator
    const regSW = await serviceWorker.getRegistration()


    if (regSW && regSW.active && !regSW.active.scriptURL.endsWith(buildNumber)) {
      await regSW.unregister('/')
    }
    await serviceWorker.register(`/offline.js?v=${buildNumber}`, { scope: '/' })

    console.log(`serviceWorker succeeded: v=${buildNumber}`)
  })().catch(console.error)
}
