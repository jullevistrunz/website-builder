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
  //TODO add element list in overlay
  console.log('Add Element')
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
