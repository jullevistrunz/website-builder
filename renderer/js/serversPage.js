async function loadServersPage() {
  localStorage.setItem('goTo', 'servers')
  const runningServers = await preload.getRunningServers()
  updateTitle('Running Servers')
  const servers = runningServers
  if (!servers || servers.length <= 0) {
    return
  }
  document
    .querySelectorAll('.content .serversPage div')
    .forEach((el) => el.remove())
  servers.forEach((page) => {
    const card = document.createElement('div')
    card.classList.add('card')
    card.id = `card-${page}`
    const title = document.createElement('div')
    title.classList.add('title')
    title.innerHTML = preload.getPageInfo(page).name
    const description = document.createElement('div')
    description.classList.add('description')
    description.innerHTML = preload.getPageInfo(page).description
    card.appendChild(title)
    card.appendChild(description)
    const stopBtn = document.createElement('button')
    stopBtn.classList.add('stopBtn')
    stopBtn.innerHTML = 'Stop Server'
    stopBtn.addEventListener('click', async () => {
      const iframe = document.createElement('iframe')
      iframe.classList.add('hidden')
      const info = preload.getPageInfo(page)
      iframe.src = `http://localhost:${info.port}/exit?p=${info.password}`
      document.body.appendChild(iframe)
      stopBtn.innerHTML = 'Stopping...'
      // making sure collection page isn't loaded before the server stopped
      await new Promise((resolve) => {
        const interval = setInterval(async () => {
          const rs = await preload.getRunningServers()
          if (!rs.includes(page)) {
            resolve()
            clearInterval(interval)
          }
        }, 1000)
      })
      goToAndReload('collection')
    })
    card.appendChild(stopBtn)
    document.querySelector('.content .serversPage').appendChild(card)
  })
}
