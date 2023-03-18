const websiteName = 'Website Builder'

if (localStorage.getItem('goTo')) {
  goTo(localStorage.getItem('goTo'))
  localStorage.removeItem('goTo')
}

document
  .querySelector('.sidebar .create')
  .addEventListener('click', selectSidebarItem)

document
  .querySelector('.sidebar .collection')
  .addEventListener('click', selectSidebarItem)

document
  .querySelector('.sidebar .servers')
  .addEventListener('click', selectSidebarItem)

function selectSidebarItem() {
  document.querySelectorAll('.sidebar .selected').forEach((el) => {
    el.classList.remove('selected')
  })
  this.classList.add('selected')
  document
    .querySelectorAll('.content > div')
    .forEach((el) => el.classList.add('hidden'))
  if (this.classList.contains('create')) {
    document.querySelector('.content .createPage').classList.remove('hidden')
    loadCreatePage()
  } else if (this.classList.contains('collection')) {
    document
      .querySelector('.content .collectionPage')
      .classList.remove('hidden')
    loadCollectionPage()
  } else if (this.classList.contains('servers')) {
    document.querySelector('.content .serversPage').classList.remove('hidden')
    loadServersPage()
  } else {
    location.reload()
  }
}

document
  .querySelector('.sidebar .settings')
  .addEventListener('click', function () {
    document.querySelector('.settingsPopUp').classList.toggle('hidden')
    document.querySelector('.popUpOverlay').classList.toggle('use')
  })

document.querySelector('.popUpOverlay').addEventListener('click', function (e) {
  if (e.target != this) return
  document
    .querySelectorAll('.popUpOverlay > div:not(.hidden)')
    .forEach((el) => el.classList.add('hidden'))
  this.classList.remove('use')
})

async function loadCollectionPage() {
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
    description.innerHTML = preload.getPageInfo(page).description
    card.appendChild(title)
    card.appendChild(description)
    const editBtn = document.createElement('button')
    editBtn.classList.add('editBtn')
    editBtn.innerHTML = 'Edit'
    const startBtn = document.createElement('button')
    startBtn.classList.add('startBtn')
    startBtn.innerHTML = 'Start Server'
    if (JSON.parse(localStorage.getItem('runningServers')).includes(page)) {
      startBtn.disabled = true
    }
    startBtn.addEventListener('click', async () => {
      preload.startServerBat(page)
      startBtn.innerHTML = 'Starting...'
      // making sure servers page isn't loaded before the server started (sort of)
      await sleep(2000)
      goTo('servers')
    })
    card.appendChild(editBtn)
    card.appendChild(startBtn)
    document.querySelector('.content .collectionPage').appendChild(card)
  })
}

function loadCreatePage() {
  updateTitle('Create')
  document
    .querySelector('.content .createPage button')
    .addEventListener('click', () => {
      const name = document.querySelector(
        '.content .createPage #createNameInput'
      ).value
      const description = document.querySelector(
        '.content .createPage #createDescriptionInput'
      ).value
      if (!name || !description) return
      preload.createPage(name, description)
      goToAndReload('collection')
    })
}

async function loadServersPage() {
  preload.getRunningServers()
  // wait for preload to set localStorage
  await sleep(10)
  updateTitle('Running Servers')
  const servers = JSON.parse(localStorage.getItem('runningServers'))
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
      // making sure collection page isn't loaded before the server stopped (sort of)
      await sleep(2000)
      goToAndReload('collection')
    })
    card.appendChild(stopBtn)
    document.querySelector('.content .serversPage').appendChild(card)
  })
}

function updateTitle(text) {
  const titleText = `${text} - ${websiteName}`
  document.querySelector('.header .title').innerHTML = titleText
  document.title = titleText
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function goTo(sidebarChild) {
  if (!document.querySelector(`.sidebar .${sidebarChild}`)) return
  //? somehow doesn't work without sleep on page reload
  await sleep()
  document.querySelector(`.sidebar .${sidebarChild}`).click()
}

function goToAndReload(sidebarChild) {
  localStorage.setItem('goTo', sidebarChild)
  location.reload()
}
