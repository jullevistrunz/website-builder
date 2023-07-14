document.querySelectorAll('.sidebar .sidebarItem').forEach((item) => {
  item.addEventListener('click', selectSidebarItem)
})

function selectSidebarItem() {
  const lambdaFunc = () => {
    preload.updateDiscordRPC()
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
    } else if (this.classList.contains('plugins')) {
      document.querySelector('.content .pluginsPage').classList.remove('hidden')
      loadPluginsPage()
    } else {
      location.reload()
    }
  }
  // warn before exit on editPage
  if (openPage == 'edit') {
    popUpQuestion(
      'Are you sure you want to exit? All unsaved changes will be removed!',
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
