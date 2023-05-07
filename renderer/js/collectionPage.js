async function loadCollectionPage() {
  localStorage.setItem('goTo', 'collection')
  preload.getRunningServers()
  // wait for preload to set localStorage
  await sleep(10)
  updateTitle('Collection')
  if (localStorage.getItem('pages') == '[]') return
  document
    .querySelectorAll('.content .collectionPage div')
    .forEach((el) => el.remove())
  JSON.parse(localStorage.getItem('pages')).forEach((page) => {
    const card = document.createElement('div')
    card.classList.add('card')
    card.id = `card-${page}`
    const title = document.createElement('div')
    title.classList.add('title')
    title.innerHTML = preload.getPageInfo(page).name
    const description = document.createElement('div')
    description.classList.add('description')
    description.innerHTML =
      JSON.parse(localStorage.getItem('settings')).collectionPage.showPageId ==
      'true'
        ? `ID: <a style="color: var(--dark-text);">${page}</a><br>` +
          preload.getPageInfo(page).description
        : preload.getPageInfo(page).description
    card.appendChild(title)
    card.appendChild(description)
    const editBtn = document.createElement('button')
    editBtn.classList.add('editBtn')
    editBtn.innerHTML = 'Edit'
    editBtn.addEventListener('click', () => {
      localStorage.setItem('pageToEdit', page)
      goTo('edit')
    })
    const startBtn = document.createElement('button')
    startBtn.classList.add('startBtn')
    startBtn.innerHTML = 'Start Server'
    startBtn.addEventListener('click', async () => {
      preload.startServerBat(page)
      startBtn.innerHTML = 'Starting...'
      // making sure servers page isn't loaded before the server started
      await new Promise((resolve) => {
        const interval = setInterval(async () => {
          preload.getRunningServers()
          await sleep(10)
          if (
            JSON.parse(localStorage.getItem('runningServers')).includes(page)
          ) {
            resolve()
            clearInterval(interval)
          }
        }, 1000)
      })
      goTo('servers')
    })
    const deleteBtn = document.createElement('button')
    deleteBtn.classList.add('deleteBtn')
    deleteBtn.innerHTML = 'Delete'
    if (JSON.parse(localStorage.getItem('runningServers')).includes(page)) {
      startBtn.disabled = true
      deleteBtn.disabled = true
    }
    deleteBtn.addEventListener('click', () => {
      popUpQuestion(
        `Are you sure you want to delete ${preload.getPageInfo(page).name}?`,
        () => {
          preload.deletePage(page)
          goToAndReload('collection')
        }
      )
    })
    card.appendChild(editBtn)
    card.appendChild(startBtn)
    card.appendChild(deleteBtn)
    document.querySelector('.content .collectionPage').appendChild(card)
  })
}
