const websiteName = 'Website Builder'
let openPage = ''

if (localStorage.getItem('goTo')) {
  goTo(localStorage.getItem('goTo'))
}

//clear temp folder on load
preload.clearTemp()

//set editViewHistoryIndex on load
localStorage.setItem('editViewHistoryIndex', 0)

function updateTitle(text) {
  const titleText = `${text} - ${websiteName}`
  document.querySelector('.header .title').innerHTML = titleText
  document.title = titleText
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function goTo(sidebarChild) {
  if (!document.querySelector(`.sidebar .${sidebarChild}`)) return
  //? somehow doesn't work without sleep on page reload
  await sleep()
  document.querySelector(`.sidebar .${sidebarChild}`).click()
}

function goToAndReload(sidebarChild) {
  localStorage.setItem('goTo', sidebarChild)
  location.reload()
}

// window controls
document
  .querySelector('.header .windowControls .minimizeWindow')
  .addEventListener('click', function () {
    windowControls.minimize()
  })

document
  .querySelector('.header .windowControls .restoreWindow')
  .addEventListener('click', function () {
    this.title = this.title == 'Maximize' ? 'Restore' : 'Maximize'
    windowControls.restore()
  })

document
  .querySelector('.header .windowControls .closeWindow')
  .addEventListener('click', function () {
    windowControls.close()
  })

// encode html entities https://ourcodeworld.com/articles/read/188/encode-and-decode-html-entities-using-pure-javascript
const htmlEntities = {
  encode: function (str) {
    var buf = []
    for (var i = str.length - 1; i >= 0; i--) {
      buf.unshift(['&#', str[i].charCodeAt(), ';'].join(''))
    }
    return buf.join('')
  },
}

//camelCase to Title Case https://stackoverflow.com/questions/7225407/convert-camelcasetext-to-title-case-text/7225450
function camelCaseToTitleCase(text) {
  return text.charAt(0).toUpperCase() + text.replace(/([A-Z])/g, ' $1').slice(1)
}
