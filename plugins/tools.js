new EditTool(['addElBtn'], 'Add Element', function () {
  //TODO
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
          document.querySelector(
            '.content .editPage .toolsMenu .savePageBtn'
          ).disabled = !document.querySelector(
            '.content .editPage .viewContent .frame'
          ).innerHTML
          document.querySelector('.popUpOverlay').click()
        })
      })
    })
})
