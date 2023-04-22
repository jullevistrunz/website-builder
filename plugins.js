const files = preload.getPlugins()
for (let i = 0; i < files.length; i++) {
  const el = document.createElement('script')
  el.src = 'plugins/' + files[i]
  el.defer = true
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
          for (let i = 0; i < el.classList.length; i++) {
            if (el.classList[i].startsWith('_edit_')) {
              el.classList.remove(el.classList[i])
            }
          }
        })
      const newEl = oldEl.cloneNode(true)
      oldEl.parentNode.replaceChild(newEl, oldEl)
      document
        .querySelectorAll('.content .editPage .toolsMenu button')
        .forEach((el) => el.classList.remove('selected'))
      btn.classList.add('selected')
      cb()
    })
    document.querySelector('.content .editPage .toolsMenu').appendChild(btn)
  }

  load(cb) {
    cb()
  }
}
