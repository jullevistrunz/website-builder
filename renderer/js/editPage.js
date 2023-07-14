function loadEditPage() {
  if (!localStorage.getItem('pageToEdit')) return goTo('collection')
  //remove old eventListeners
  const oldEl = document.querySelector('.content .editPage .specialToolsMenu')
  const newEl = oldEl.cloneNode(true)
  oldEl.parentNode.replaceChild(newEl, oldEl)

  const page = localStorage.getItem('pageToEdit')
  localStorage.setItem('goTo', 'edit')
  updateTitle(`Editing ${preload.getPageInfo(page).name}`)
  preload.updateDiscordRPC(`Editing ${preload.getPageInfo(page).name}`)
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
            'Are you sure you want to switch views? All unsaved changes will be removed!',
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
      deselectEditTools()
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
      goToAndReload('edit')
    })
  document
    .querySelector('.content .editPage .specialToolsMenu .exitPageBtn')
    .addEventListener('click', function () {
      popUpQuestion(
        'Are you sure you want to exit? All unsaved changes will be removed!',
        function () {
          localStorage.removeItem('pageToEdit')
          localStorage.removeItem('viewToEdit')
          goToAndReload('collection')
        }
      )
    })
}

function saveEditViewToTemp(page, view) {
  deselectEditTools()
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
  document
    .querySelectorAll('.content .editPage .viewContent .frame .frameSection')
    .forEach((el) => {
      for (let i = 0; i < el.classList.length; i++) {
        if (el.classList[i].startsWith('_edit_')) {
          el.classList.remove(el.classList[i])
        }
      }
    })
  document
    .querySelectorAll('.content .editPage .frame .frameSection ._placeholder_')
    .forEach((el) => {
      el.remove()
    })
  document
    .querySelectorAll('.content .editPage .toolsMenu button')
    .forEach((el) => el.classList.remove('selected'))
}

function checkSaveEdit() {
  document.querySelector(
    '.content .editPage .specialToolsMenu .savePageBtn'
  ).disabled = !/[A-Za-z0-9]/.test(
    document.querySelector('.content .editPage .viewContent .frame').innerHTML
  )
  document.querySelector(
    '.content .editPage .specialToolsMenu .viewSrcCodeBtn'
  ).disabled = !/[A-Za-z0-9]/.test(
    document.querySelector('.content .editPage .viewContent .frame').innerHTML
  )
}
