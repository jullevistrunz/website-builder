const files = preload.getPlugins()
for (let i = 0; i < files.length; i++) {
  const el = document.createElement('script')
  el.src = 'plugins/' + files[i]
  document.body.appendChild(el)
}

class EditTool {
  constructor(classes, text, cb) {
    const btn = document.createElement('button')
    btn.innerHTML = text
    classes.forEach((el) => {
      btn.classList.add(el)
    })
    btn.addEventListener('click', function () {
      const oldEl = document.querySelector(
        '.content .editPage .viewContent .frame'
      )
      document
        .querySelectorAll('.content .editPage .viewContent .frame *')
        .forEach((el) => {
          el.classList.remove('highlightOnHover')
        })
      const newEl = oldEl.cloneNode(true)
      oldEl.parentNode.replaceChild(newEl, oldEl)
      document
        .querySelectorAll('.content .editPage .toolsMenu .otherTools button')
        .forEach((el) => el.classList.remove('selected'))
      btn.classList.add('selected')
      cb()
    })
    document
      .querySelector('.content .editPage .toolsMenu .otherTools')
      .appendChild(btn)
  }
}
