const settings = JSON.parse(localStorage.getItem('settings'))

for (let i = 0; i < Object.keys(settings).length; i++) {
  const options = []
  for (
    let j = 0;
    j < Object.keys(settings[Object.keys(settings)[i]]).length;
    j++
  ) {
    options.push(Object.keys(settings[Object.keys(settings)[i]])[j])
  }
  createSection(Object.keys(settings)[i], options)
}

function createSection(title, options) {
  const sectionEl = document.createElement('div')
  sectionEl.classList.add('section')
  const titleEl = document.createElement('div')
  titleEl.classList.add('title')
  titleEl.innerHTML = camelCaseToTitleCase(title)
  sectionEl.appendChild(titleEl)
  document.querySelector('.settingsPopUp').appendChild(sectionEl)
  for (let i = 0; i < options.length; i++) {
    const optionBtn = document.createElement('button')
    optionBtn.innerHTML = camelCaseToTitleCase(options[i])
    optionBtn.id = title + '_' + options[i]
    sectionEl.appendChild(optionBtn)
  }
}

//create openSettingsFile
const openSettingsFileSection = document.createElement('div')
openSettingsFileSection.classList.add('section')
const openSettingsFileBtn = document.createElement('button')
openSettingsFileBtn.innerHTML = 'Open Settings File (JSON)'
openSettingsFileBtn.classList.add('openJSON')
openSettingsFileSection.appendChild(openSettingsFileBtn)
document.querySelector('.settingsPopUp').appendChild(openSettingsFileSection)

//add eventListeners
document
  .querySelector('.settingsPopUp .openJSON')
  .addEventListener('click', () => {
    preload.createCmdProcess(
      'settingsPopUpOpenJSON',
      `start ${preload.getDirname()}/settings.json`
    )
  })

for (let i = 0; i < Object.keys(settings).length; i++) {
  const section = Object.keys(settings)[i]
  for (let j = 0; j < Object.keys(settings[section]).length; j++) {
    const option = Object.keys(settings[section])[j]
    const value = settings[section][option]
    if (typeof value === 'object') {
      document
        .querySelector(`.settingsPopUp #${section}_${option}`)
        .classList.add('moreOptions')
      document
        .querySelector(`.settingsPopUp #${section}_${option}`)
        .addEventListener('click', createValueSelectionPopUp)
    } else {
      document
        .querySelector(`.settingsPopUp #${section}_${option}`)
        .addEventListener('click', () => {
          createValueEditPopUp([section, option])
        })
    }
  }
}
function createValueSelectionPopUp(event) {
  if (
    !settings[event.target.id.split('_')[0]] ||
    !settings[event.target.id.split('_')[0]][event.target.id.split('_')[1]]
  ) {
    return
  }
  const value =
    settings[event.target.id.split('_')[0]][event.target.id.split('_')[1]]
  document.querySelector('.popUpOverlay .settingsValuePopUp').innerHTML = ''
  for (let i = 0; i < Object.keys(value).length; i++) {
    const btn = document.createElement('button')
    btn.innerHTML = camelCaseToTitleCase(Object.keys(value)[i])
    document.querySelector('.popUpOverlay .settingsValuePopUp').appendChild(btn)
    const valuePath = [...event.target.id.split('_'), Object.keys(value)[i]]
    btn.addEventListener('click', function () {
      createValueEditPopUp(valuePath)
    })
  }
  document
    .querySelector('.popUpOverlay .settingsValuePopUp')
    .classList.toggle('hidden')
  const newCoords = {
    x:
      event.target.getBoundingClientRect().x +
      event.target.getBoundingClientRect().width +
      5,
    y:
      event.target.getBoundingClientRect().y -
      document
        .querySelector('.popUpOverlay .settingsValuePopUp')
        .getBoundingClientRect().height +
      event.target.getBoundingClientRect().height,
  }
  document.querySelector(
    '.popUpOverlay .settingsValuePopUp'
  ).style.top = `${newCoords.y}px`
  document.querySelector(
    '.popUpOverlay .settingsValuePopUp'
  ).style.left = `${newCoords.x}px`
}

function createValueEditPopUp(valuePath) {
  document.querySelector('.popUpOverlay').click()
  //remove all old eventListener
  const oldEl = document.querySelector('.settingsValueEditPopUp .changeBtn')
  const newEl = oldEl.cloneNode(true)
  oldEl.parentNode.replaceChild(newEl, oldEl)
  let oldValue = settings
  document.querySelectorAll('.content * button').forEach((btn) => {
    btn.setAttribute('tabindex', -1)
  })
  for (let i = 0; i < valuePath.length; i++) {
    if (!oldValue[valuePath[i]]) {
      break
    }
    oldValue = oldValue[valuePath[i]]
  }
  document.querySelector('.settingsValueEditPopUp').classList.toggle('hidden')
  document.querySelector(
    '.settingsValueEditPopUp > div:first-child'
  ).innerHTML = camelCaseToTitleCase(valuePath[valuePath.length - 1])
  document.querySelector('.popUpOverlay').classList.toggle('use')
  document.querySelector('.popUpOverlay').classList.toggle('blur')
  if (oldValue == 'true' || oldValue == 'false') {
    document.querySelector('.settingsValueEditPopUp .inputWrapper').innerHTML =
      ''
    const span = document.createElement('span')
    span.classList.add('slider')
    const label = document.createElement('label')
    label.classList.add('switch')
    const input = document.createElement('input')
    input.type = 'checkbox'
    label.appendChild(input)
    label.appendChild(span)
    document
      .querySelector('.settingsValueEditPopUp .inputWrapper')
      .appendChild(label)
    document.querySelector('.settingsValueEditPopUp input').checked =
      oldValue == 'true'
  } else {
    document.querySelector('.settingsValueEditPopUp .inputWrapper').innerHTML =
      '<input />'
    document.querySelector('.settingsValueEditPopUp input').value = oldValue
  }

  document
    .querySelector('.settingsValueEditPopUp .changeBtn')
    .addEventListener('click', async function () {
      const newValue =
        oldValue == 'true' || oldValue == 'false'
          ? document.querySelector('.settingsValueEditPopUp input').checked
            ? 'true'
            : 'false'
          : document.querySelector('.settingsValueEditPopUp input').value
      // https://stackoverflow.com/a/22562804/15255405
      const newObj = {}
      const newValuePath = [...valuePath, newValue]
      let newLength = 0
      newValuePath.reduce(function (o, s) {
        newLength++
        return newLength == newValuePath.length - 1
          ? (o[s] = newValuePath[newValuePath.length - 1])
          : (o[s] = {})
      }, newObj)
      // https://stackoverflow.com/a/20591261/15255405
      function extend(target) {
        for (var i = 1; i < arguments.length; ++i) {
          var from = arguments[i]
          if (typeof from !== 'object') continue
          for (var j in from) {
            if (from.hasOwnProperty(j)) {
              target[j] =
                typeof from[j] === 'object'
                  ? extend({}, target[j], from[j])
                  : from[j]
            }
          }
        }
        return target
      }
      const newSettings = extend({}, settings, newObj)
      await preload.writeSettings(JSON.stringify(newSettings, null, 2))
      location.reload()
    })
}
