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
      '.content .editPage .viewContent .frame .frameSection:not(._editPlaceHolder)'
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
    addHTMLToFrame(cleanValue, 'customHTML')
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

function addHTMLToFrame(code, type) {
  const newSection = document.createElement('div')
  newSection.id = `${type}-${createID()}`
  newSection.classList.add('frameSection')
  newSection.innerHTML = code
  document
    .querySelector('.content .editPage .viewContent .frame')
    .appendChild(newSection)

  checkSaveEdit()
  //save new view to temp
  saveEditViewToTemp(
    localStorage.getItem('pageToEdit'),
    localStorage.getItem('viewToEdit').slice(0, -1 * '.html'.length)
  )
}

new EditTool(['moveElementBtn'], 'Move Elements', function () {
  document
    .querySelectorAll('.content .editPage .frame .frameSection')
    .forEach((el) => {
      el.classList.add('_edit_showOutline')
      const btnWrapper = document.createElement('div')
      const upBtn = document.createElement('button')
      upBtn.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 30.021 30.021" xml:space="preserve"  style="transform: rotate(180deg);"><g><path d="M28.611,13.385l-11.011,9.352c-0.745,0.633-1.667,0.949-2.589,0.949c-0.921,0-1.842-0.316-2.589-0.949L1.411,13.385 c-1.684-1.43-1.89-3.954-0.46-5.638c1.431-1.684,3.955-1.89,5.639-0.459l8.421,7.151l8.42-7.151 c1.686-1.43,4.209-1.224,5.639,0.459C30.5,9.431,30.294,11.955,28.611,13.385z" /></g></svg>'
      const downBtn = document.createElement('button')
      downBtn.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 30.021 30.021" xml:space="preserve" ><g><path d="M28.611,13.385l-11.011,9.352c-0.745,0.633-1.667,0.949-2.589,0.949c-0.921,0-1.842-0.316-2.589-0.949L1.411,13.385 c-1.684-1.43-1.89-3.954-0.46-5.638c1.431-1.684,3.955-1.89,5.639-0.459l8.421,7.151l8.42-7.151 c1.686-1.43,4.209-1.224,5.639,0.459C30.5,9.431,30.294,11.955,28.611,13.385z" /></g></svg>'
      upBtn.classList.add('_placeholder_')
      upBtn.classList.add('upBtn')
      downBtn.classList.add('_placeholder_')
      downBtn.classList.add('downBtn')
      btnWrapper.classList.add('_placeholder_')
      btnWrapper.classList.add('btnWrapper')
      function moveElement(element, direction) {
        const span = element
        const td = span.parentNode
        if (direction === -1 && span.previousElementSibling) {
          td.insertBefore(span, span.previousElementSibling)
        } else if (direction === 1 && span.nextElementSibling) {
          td.insertBefore(span, span.nextElementSibling.nextElementSibling)
        }
      }

      upBtn.addEventListener('click', function () {
        moveElement(el, -1)
        checkSaveEdit()
        //save new view to temp
        saveEditViewToTemp(
          localStorage.getItem('pageToEdit'),
          localStorage.getItem('viewToEdit').slice(0, -1 * '.html'.length)
        )
      })
      downBtn.addEventListener('click', function () {
        moveElement(el, 1)
        checkSaveEdit()
        //save new view to temp
        saveEditViewToTemp(
          localStorage.getItem('pageToEdit'),
          localStorage.getItem('viewToEdit').slice(0, -1 * '.html'.length)
        )
      })

      btnWrapper.appendChild(upBtn)
      btnWrapper.appendChild(downBtn)
      el.appendChild(btnWrapper)
    })
})
