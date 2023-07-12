const welcomePageCursor = document.querySelector('.welcomeMessage .cursor')
document.addEventListener('mousemove', (e) => {
  welcomePageCursor.style.left = `${e.pageX}px`
  welcomePageCursor.style.top = `${e.pageY}px`
})

document
  .querySelector('.welcomeMessage .headline .text')
  .addEventListener('click', function () {
    this.parentElement.remove()
  })
