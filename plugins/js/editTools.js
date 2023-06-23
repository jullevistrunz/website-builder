new EditTool(['deselectBtn'], 'Deselect Tools', function () {
  document
    .querySelector('.content .editPage .toolsMenu .deselectBtn')
    .classList.remove('selected')
}).load(function () {
  JSON.parse(localStorage.getItem('settings')).editPage.deselectToolsButton ==
  'true'
    ? document
        .querySelector('.content .editPage .toolsMenu .deselectBtn')
        .classList.remove('hidden')
    : document
        .querySelector('.content .editPage .toolsMenu .deselectBtn')
        .classList.add('hidden')
})

new EditTool(['addElBtn'], 'Add Element', function () {
  document.querySelector('.content .editPage .toolsMenu .deselectBtn').click()
  if (document.querySelector('.popUpOverlay .addElOverlay')) {
    document.querySelector('.popUpOverlay .addElOverlay').remove()
  }
  const overlay = document.createElement('div')
  overlay.classList.add('addElOverlay')
  document.querySelector('.popUpOverlay').classList.toggle('use')
  document.querySelector('.popUpOverlay').classList.toggle('blur')

  document.querySelector('.popUpOverlay').appendChild(overlay)

  const addElementList = [
    {
      name: 'Add HTML Source Code',
      click: () => {
        openAddHTMLPopUp()
      },
    },
  ]

  addElementList.forEach((el) => {
    addElementToList(el)
  })
})

new EditTool(['rmElBtn'], 'Remove Element', function () {
  document
    .querySelectorAll(
      '.content .editPage .viewContent .frame *:not(._editPlaceHolder)'
    )
    .forEach((el) => {
      el.classList.add('_edit_highLightOnHover')
      el.addEventListener('click', function () {
        popUpQuestion('Are you sure you want to delete this element?', () => {
          this.remove()
          checkSaveEdit()

          //save new view to temp
          saveEditViewToTemp(
            localStorage.getItem('pageToEdit'),
            localStorage.getItem('viewToEdit').slice(0, -1 * '.html'.length)
          )
        })
      })
    })
})

function addElementToList(el) {
  const btn = document.createElement('button')
  btn.innerHTML = el.name
  btn.addEventListener('click', () => {
    document.querySelector('.popUpOverlay').click()
    el.click()
  })
  document.querySelector('.popUpOverlay .addElOverlay').appendChild(btn)
}

function openAddHTMLPopUp() {
  if (document.querySelector('.popUpOverlay .addHTMLPopUp')) {
    document.querySelector('.popUpOverlay .addHTMLPopUp').remove()
  }
  const overlay = document.createElement('div')
  overlay.classList.add('addHTMLPopUp')
  document.querySelector('.popUpOverlay').classList.toggle('use')
  document.querySelector('.popUpOverlay').classList.toggle('blur')
  const input = document.createElement('textarea')
  input.placeholder = 'Enter HTML Code Here'

  const btn = document.createElement('button')
  btn.innerHTML = 'Add To Page'
  btn.addEventListener('click', () => {
    document.querySelector('.popUpOverlay').click()
    const cleanValue = input.value.replace(/\r?\n|\r/g, '')
    addHTMLToFrame(cleanValue)
  })

  const cancelBtn = document.createElement('button')
  cancelBtn.innerHTML = 'Cancel'
  cancelBtn.addEventListener('click', () => {
    document.querySelector('.popUpOverlay').click()
  })

  overlay.appendChild(input)
  overlay.appendChild(btn)
  overlay.appendChild(cancelBtn)

  document.querySelector('.popUpOverlay').appendChild(overlay)
}

function addHTMLToFrame(code) {
  document.querySelector('.content .editPage .viewContent .frame').innerHTML +=
    code

  checkSaveEdit()
  //save new view to temp
  saveEditViewToTemp(
    localStorage.getItem('pageToEdit'),
    localStorage.getItem('viewToEdit').slice(0, -1 * '.html'.length)
  )
}
