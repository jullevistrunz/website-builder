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
