function loadCreatePage() {
  updateTitle('Create')
  preload.updateDiscordRPC(`Creating a new page`)
  const oldEl = document.querySelector('.content .createPage button')
  const newEl = oldEl.cloneNode(true)
  oldEl.parentNode.replaceChild(newEl, oldEl)
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
