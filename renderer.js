const websiteName = 'Website Builder'
let openPage = ''

if (localStorage.getItem('goTo')) {
  goTo(localStorage.getItem('goTo'))
}

//clear temp folder on load
preload.clearTemp()

//set editViewHistoryIndex on load
localStorage.setItem('editViewHistoryIndex', 0)

document
  .querySelector('.sidebar .create')
  .addEventListener('click', selectSidebarItem)

document
  .querySelector('.sidebar .collection')
  .addEventListener('click', selectSidebarItem)

document
  .querySelector('.sidebar .servers')
  .addEventListener('click', selectSidebarItem)

document
  .querySelector('.sidebar .edit')
  .addEventListener('click', selectSidebarItem)

function selectSidebarItem() {
  const lambdaFunc = () => {
    openPage = this.classList[0]
    localStorage.removeItem('goTo')
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
    } else if (this.classList.contains('edit')) {
      document.querySelector('.content .editPage').classList.remove('hidden')
      loadEditPage()
    } else {
      location.reload()
    }
  }
  // warn before exit on editPage
  if (openPage == 'edit') {
    popUpQuestion(
      'Are you sure you want to exit? All changes will be removed!',
      () => {
        lambdaFunc()
        localStorage.removeItem('pageToEdit')
        localStorage.removeItem('viewToEdit')
        preload.clearTemp()
      }
    )
    return
  }
  lambdaFunc()
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
  this.classList.remove('blur')
})

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
    description.innerHTML = preload.getPageInfo(page).description
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
  localStorage.setItem('goTo', 'servers')
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
      // making sure collection page isn't loaded before the server stopped
      await new Promise((resolve) => {
        const interval = setInterval(async () => {
          preload.getRunningServers()
          await sleep(10)
          if (
            !JSON.parse(localStorage.getItem('runningServers')).includes(page)
          ) {
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

function popUpQuestion(question, cb) {
  document.querySelector('.questionPopUp > div:first-child').innerHTML =
    question
  document.querySelector('.questionPopUp').classList.toggle('hidden')
  document.querySelector('.popUpOverlay').classList.toggle('use')
  document.querySelector('.popUpOverlay').classList.toggle('blur')
  //remove all old eventListener
  const oldEl = document.querySelector('.questionPopUp .answerYes')
  const newEl = oldEl.cloneNode(true)
  oldEl.parentNode.replaceChild(newEl, oldEl)
  document
    .querySelector('.questionPopUp .answerYes')
    .addEventListener('click', () => {
      cb()
      document.querySelector('.popUpOverlay').click()
    })
}

function loadEditPage() {
  if (!localStorage.getItem('pageToEdit')) return goTo('collection')
  const page = localStorage.getItem('pageToEdit')
  localStorage.setItem('goTo', 'edit')
  updateTitle(`Editing ${preload.getPageInfo(page).name}`)
  //load viewsMenu
  const views = preload.getViews(page)
  document
    .querySelectorAll('.content .editPage .viewsMenu button')
    .forEach((el) => el.remove())
  for (let i = 0; i < views.length; i++) {
    const btn = document.createElement('button')
    btn.innerHTML = views[i].slice(0, -1 * '.html'.length)
    btn.id = `viewBtn:${views[i]}`
    btn.addEventListener('click', function () {
      const lambdaFunc = () => {
        localStorage.setItem('viewToEdit', views[i])
        document
          .querySelectorAll('.content .editPage .viewsMenu button')
          .forEach((el) => el.classList.remove('selected'))
        this.classList.add('selected')
        document
          .querySelectorAll('.content .editPage .toolsMenu button')
          .forEach((el) => el.classList.remove('selected'))

        const frame = document.querySelector('.editPage .viewContent .frame')
        frame.innerHTML = preload.getView(page, views[i])
        document.querySelector(
          '.content .editPage .specialToolsMenu .savePageBtn'
        ).disabled = !document.querySelector(
          '.content .editPage .viewContent .frame'
        ).innerHTML

        //save loaded view to temp
        preload.clearTempSpecific(
          `${page}-${views[i].slice(0, -1 * '.html'.length)}`
        )
        localStorage.setItem('editViewHistoryIndex', 0)
        saveEditViewToTemp(page, views[i].slice(0, -1 * '.html'.length))
      }
      try {
        if (
          preload.readDir(
            `temp/${page}-${localStorage
              .getItem('viewToEdit')
              .slice(0, -1 * '.html'.length)}`
          ).length > 1
        ) {
          popUpQuestion(
            'Are you sure you want to switch views? All changes will be removed!',
            () => {
              lambdaFunc()
            }
          )
          return
        }
      } catch {}
      lambdaFunc()
    })
    document.querySelector('.content .editPage .viewsMenu').appendChild(btn)
  }
  if (localStorage.getItem('viewToEdit')) {
    document
      .getElementById(`viewBtn:${localStorage.getItem('viewToEdit')}`)
      .click()
  } else {
    document.querySelector('.content .editPage .viewsMenu button').click()
  }
  document
    .querySelector('.content .editPage .specialToolsMenu .viewSrcCodeBtn')
    .addEventListener('click', function () {
      const historyIndex = parseInt(
        localStorage.getItem('editViewHistoryIndex')
      )
      const id = `${page}-${localStorage
        .getItem('viewToEdit')
        .slice(0, -1 * '.html'.length)}`
      const filePath = `temp/${id}/${
        preload.readDir(`temp/${id}`).length - 1 - historyIndex
      }.html`
      if (
        JSON.parse(localStorage.getItem('settings')).editPage.viewSourceCode
          .prog == 'native'
      ) {
        openViewSourceCode(preload.readFile(filePath))
        return
      }
      preload.createCmdProcess(
        `editToolSourceCode-${id}`,
        `${
          JSON.parse(localStorage.getItem('settings')).editPage.viewSourceCode
            .prog
        } ${preload.getDirname()}/${filePath}`
      )
    })

  document
    .querySelector('.content .editPage .specialToolsMenu .undoBtn')
    .addEventListener('click', function () {
      const page = localStorage.getItem('pageToEdit')
      const view = localStorage
        .getItem('viewToEdit')
        .slice(0, -1 * '.html'.length)
      const historyLength = preload.readDir(`temp/${page}-${view}`).length
      let historyIndex = parseInt(localStorage.getItem('editViewHistoryIndex'))
      document.querySelector(
        '.content .editPage .viewContent .frame'
      ).innerHTML = preload.readFile(
        `temp/${page}-${view}/${historyLength - historyIndex - 2}.html`
      )
      historyIndex++
      localStorage.setItem('editViewHistoryIndex', historyIndex)

      document.querySelector(
        '.content .editPage .specialToolsMenu .undoBtn'
      ).disabled = historyLength - historyIndex <= 1
      document.querySelector(
        '.content .editPage .specialToolsMenu .redoBtn'
      ).disabled = !(historyIndex > 0)

      document.querySelector(
        '.content .editPage .specialToolsMenu .savePageBtn'
      ).disabled = !document.querySelector(
        '.content .editPage .viewContent .frame'
      ).innerHTML
      checkSaveEdit()
      deselectEditTools()
    })

  document
    .querySelector('.content .editPage .specialToolsMenu .redoBtn')
    .addEventListener('click', function () {
      const page = localStorage.getItem('pageToEdit')
      const view = localStorage
        .getItem('viewToEdit')
        .slice(0, -1 * '.html'.length)
      const historyLength = preload.readDir(`temp/${page}-${view}`).length
      let historyIndex = parseInt(localStorage.getItem('editViewHistoryIndex'))
      document.querySelector(
        '.content .editPage .viewContent .frame'
      ).innerHTML = preload.readFile(
        `temp/${page}-${view}/${historyLength - historyIndex}.html`
      )
      historyIndex--
      localStorage.setItem('editViewHistoryIndex', historyIndex)

      document.querySelector(
        '.content .editPage .specialToolsMenu .undoBtn'
      ).disabled = historyLength - historyIndex <= 1
      document.querySelector(
        '.content .editPage .specialToolsMenu .redoBtn'
      ).disabled = !(historyIndex > 0)

      document.querySelector(
        '.content .editPage .specialToolsMenu .savePageBtn'
      ).disabled = !document.querySelector(
        '.content .editPage .viewContent .frame'
      ).innerHTML
      checkSaveEdit()
      deselectEditTools()
    })
  document
    .querySelector('.content .editPage .specialToolsMenu .savePageBtn')
    .addEventListener('click', function () {
      popUpQuestion('Are you sure you want to save and exit?', function () {
        document
          .querySelectorAll('.content .editPage .viewContent .frame *')
          .forEach((el) => {
            for (let i = 0; i < el.classList.length; i++) {
              if (el.classList[i].startsWith('_edit_')) {
                el.classList.remove(el.classList[i])
              }
            }
          })
        const currentFrame = document.querySelector(
          '.content .editPage .viewContent .frame'
        ).innerHTML
        const view = localStorage.getItem('viewToEdit')
        const file = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><meta http-equiv="X-UA-Compatible" content="IE=edge" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Hello World</title></head><style>body{margin:0;}</style><body>${currentFrame}</body></html>`
        preload.writeFile(`pages/${page}/views/${view}`, file)
        localStorage.removeItem('editViewHistoryIndex')
        localStorage.removeItem('pageToEdit')
        localStorage.removeItem('viewToEdit')
        goToAndReload('collection')
      })
    })
}

function saveEditViewToTemp(page, view) {
  const id = `${page}-${view}`
  try {
    preload.readDir(`temp/${id}`)
  } catch {
    preload.makeDir(`temp/${id}`)
  }

  let historyIndex = parseInt(localStorage.getItem('editViewHistoryIndex'))
  const historyLength0 = preload.readDir(`temp/${id}`).length

  if (historyIndex > 0) {
    for (let i = 0; i < historyIndex; i++) {
      preload.removeFileOrDir(`temp/${id}/${historyLength0 - i - 1}.html`)
    }
    historyIndex = 0
    localStorage.setItem('editViewHistoryIndex', historyIndex)
  }

  const filePath = `temp/${id}/${preload.readDir(`temp/${id}`).length}.html`
  preload.writeFile(
    filePath,
    document.querySelector('.content .editPage .viewContent .frame').innerHTML
  )
  const historyLength = preload.readDir(`temp/${id}`).length

  document.querySelector(
    '.content .editPage .specialToolsMenu .undoBtn'
  ).disabled = historyLength - historyIndex <= 1
  document.querySelector(
    '.content .editPage .specialToolsMenu .redoBtn'
  ).disabled = !(historyIndex > 0)
}

function deselectEditTools() {
  document.querySelector('.content .editPage .toolsMenu .deselectBtn').click()
}

function checkSaveEdit() {
  document.querySelector(
    '.content .editPage .specialToolsMenu .savePageBtn'
  ).disabled = !/[A-Za-z0-9]/.test(
    document.querySelector('.content .editPage .viewContent .frame').innerHTML
  )
}

// window controls
document
  .querySelector('.header .windowControls .minimizeWindow')
  .addEventListener('click', function () {
    windowControls.minimize()
  })

document
  .querySelector('.header .windowControls .restoreWindow')
  .addEventListener('click', function () {
    this.title = this.title == 'Maximize' ? 'Restore' : 'Maximize'
    windowControls.restore()
  })

document
  .querySelector('.header .windowControls .closeWindow')
  .addEventListener('click', function () {
    windowControls.close()
  })

function openViewSourceCode(view) {
  //add new line after each element
  const rawText = view
  const arr = rawText.split(/(?=[<>])|(?<=[<>])/)
  if (arr.length < 6) return
  const arr2 = []
  const arr3 = []
  const arr4 = []
  const isClosingTagArr = []
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] == '<') {
      arr2.push(arr[i] + arr[i + 1] + arr[i + 2])
      arr3.push(arr[i] + arr[i + 1] + arr[i + 2])
      arr4.push(arr[i] + arr[i + 1] + arr[i + 2])
      i += 2
    } else {
      arr2.push(arr[i])
      arr3.push(arr[i])
      arr4.push(arr[i])
    }
  }
  for (let i = 0; i < arr2.length; i++) {
    if (arr2[i].startsWith('</')) {
      isClosingTagArr[i] = true
    } else {
      isClosingTagArr[i] = false
    }
  }
  for (let i = 0; i < arr2.length; i++) {
    arr2[i] += '\n'
  }
  for (let i = 0; i < arr2.length; i++) {
    for (let j = i; !isClosingTagArr[j]; j++) {
      if (isClosingTagArr[j + 1]) {
        continue
      }
      arr2[j] += '\t'
    }
  }
  arr3.reverse()
  const isClosingTagArrReverse = isClosingTagArr.reverse()
  for (let i = 0; i < arr3.length; i++) {
    for (let j = i + 1; isClosingTagArrReverse[j - 1]; j++) {
      if (arr4[arr4.length - i - 2].endsWith('>')) {
        if (!isClosingTagArr[j]) {
          continue
        }
        arr2[arr2.length - j - 2] += '\t'
      }
    }
  }
  //syntax highlight
  for (let i = 0; i < arr2.length; i++) {
    if (arr2[i].startsWith('</')) {
      const arr5 = arr2[i].split(/(?=[<>])|(?<=[<>])/)
      for (let j = 0; j < arr5.length; j++) {
        if (arr5[j] == '<' || arr5[j] == '>') {
          arr5[j] = `<div class="symbol">${htmlEntities.encode(arr5[j])}</div>`
        } else {
          if (arr5[j].startsWith('/')) {
            arr5[j] = arr5[j].split('/').join('')
            arr5[j] = `<div class="symbol">${htmlEntities.encode(
              '/'
            )}</div><div class="tag">${htmlEntities.encode(arr5[j])}</div>`
          }
        }
      }
      arr2[i] = arr5.join('')
    } else if (arr2[i].startsWith('<')) {
      const arr5 = arr2[i].split(/(?=[<>])|(?<=[<>])/)
      for (let j = 0; j < arr5.length; j++) {
        if (arr5[j] == '<' || arr5[j] == '>') {
          arr5[j] = `<div class="symbol">${htmlEntities.encode(arr5[j])}</div>`
        } else {
          const arr6 = arr5[j].split(' ')
          arr6[0] = `<div class="tag">${htmlEntities.encode(arr6[0])}</div>`
          const arr7 = []
          for (let k = 1; k < arr6.length; k++) {
            arr7.push(arr6[k])
          }
          for (let k = 0; k < arr7.length; k++) {
            const arr8 = arr7[k].split('=')
            arr8[0] = ` <i class="attribute">${htmlEntities.encode(
              arr8[0]
            )}</i>`
            arr8[1] = arr8[1].split('"').join('')
            arr8[1] = `<div class="symbol">${htmlEntities.encode(
              '"'
            )}</div><div class="value">${
              arr8[1]
            }</div><div class="symbol">${htmlEntities.encode('"')}</div>`
            arr7[k] = arr8.join(
              `<div class="symbol">${htmlEntities.encode('=')}</div>`
            )
          }
          arr5[j] = [arr6[0], ...arr7].join('')
        }
      }
      arr2[i] = arr5.join('')
    } else {
      arr2[i] = `<div class="text">${htmlEntities.encode(arr2[i])}</div>`
    }
  }
  const text = arr2.join('')
  //line numbers
  const lines = arr2.length
  document.querySelector(
    '.popUpOverlay .viewSourceCodePopUp .codeBox pre .lineNumbers'
  ).innerHTML = ''
  for (let i = 0; i < lines; i++) {
    document.querySelector(
      '.popUpOverlay .viewSourceCodePopUp .codeBox pre .lineNumbers'
    ).innerHTML += `${i + 1}\n`
  }

  if (document.getElementById('viewSourceCodePopUpStyles')) {
    document.getElementById('viewSourceCodePopUpStyles').remove()
  }
  const styleEl = document.createElement('style')
  styleEl.id = 'viewSourceCodePopUpStyles'
  styleEl.innerHTML = `.viewSourceCodePopUp code *, .viewSourceCodePopUp pre .lineNumbers {font-family: ${
    JSON.parse(localStorage.getItem('settings')).editPage.viewSourceCode
      .fontFamily
  }; tab-size: ${
    JSON.parse(localStorage.getItem('settings')).editPage.viewSourceCode.tabSize
  }; font-size: ${
    JSON.parse(localStorage.getItem('settings')).editPage.viewSourceCode
      .fontSize
  }; line-height: ${
    JSON.parse(localStorage.getItem('settings')).editPage.viewSourceCode
      .lineHeight
  }}`
  document.body.appendChild(styleEl)

  document.querySelector(
    '.popUpOverlay .viewSourceCodePopUp .codeBox pre code'
  ).innerHTML = text

  document
    .querySelector('.popUpOverlay .viewSourceCodePopUp')
    .classList.toggle('hidden')
  document.querySelector('.popUpOverlay').classList.toggle('use')
  document.querySelector('.popUpOverlay').classList.toggle('blur')
  const oldEl = document.querySelector(
    '.popUpOverlay .viewSourceCodePopUp .closeBtn'
  )
  const newEl = oldEl.cloneNode(true)
  oldEl.parentNode.replaceChild(newEl, oldEl)
  document
    .querySelector('.popUpOverlay .viewSourceCodePopUp .closeBtn')
    .addEventListener('click', function () {
      document.querySelector('.popUpOverlay').click()
    })
}

// encode html entities https://ourcodeworld.com/articles/read/188/encode-and-decode-html-entities-using-pure-javascript
const htmlEntities = {
  encode: function (str) {
    var buf = []
    for (var i = str.length - 1; i >= 0; i--) {
      buf.unshift(['&#', str[i].charCodeAt(), ';'].join(''))
    }
    return buf.join('')
  },
}
