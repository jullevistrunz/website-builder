/**  Create a button in the 'Tools' menu editPage*/

class EditTool {
  /**
   *
   * @param {String[]} classes - The classList of the button
   * @param {String} text - The text the button displays
   * @param {Function} cb - The function run when the button is clicked
   */
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
        .querySelectorAll(
          '.content .editPage .viewContent .frame .frameSection'
        )
        .forEach((el) => {
          for (let i = 0; i < el.classList.length; i++) {
            if (el.classList[i].startsWith('_edit_')) {
              el.classList.remove(el.classList[i])
            }
          }
        })
      document
        .querySelectorAll(
          '.content .editPage .frame .frameSection ._placeholder_'
        )
        .forEach((el) => {
          el.remove()
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
  /**
   * Run when the button is loaded
   * @param {Function} cb - The function run
   */
  load(cb) {
    cb()
  }
}
