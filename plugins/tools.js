new EditTool(['addElBtn'], 'Add Element', function () {
  //TODO add element list in overlay
  console.log('Add Element')
})

new EditTool(['rmElBtn'], 'Remove Element', function () {
  document
    .querySelectorAll('.content .editPage .viewContent .frame *')
    .forEach((el) => {
      el.classList.add('_edit_highLightOnHover')
      el.addEventListener('click', function () {
        popUpQuestion('Are you sure you want to delete this element?', () => {
          this.remove()
          checkSaveEdit()
          document.querySelector('.popUpOverlay').click()

          //save new view to temp
          saveEditViewToTemp(
            localStorage.getItem('pageToEdit'),
            localStorage.getItem('viewToEdit').slice(0, -1 * '.html'.length)
          )
        })
      })
    })
})
