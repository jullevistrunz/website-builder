if (!localStorage.getItem('activePlugins')) {
  localStorage.setItem('activePlugins', '[]')
}

const filesJS = preload.getPluginsJS()
const filesCSS = preload.getPluginsCSS()

//remove redundant active plugins
const ap = JSON.parse(localStorage.getItem('activePlugins'))
for (let i = 0; i < ap.length; i++) {
  if (!filesJS.includes(ap[i]) && !filesCSS.includes(ap[i])) {
    ap.splice(i, 1)
  }
}
localStorage.setItem('activePlugins', JSON.stringify(ap))

for (let i = 0; i < filesJS.length; i++) {
  if (
    !(
      JSON.parse(localStorage.getItem('settings')).plugins.autoLoadPlugins ==
        'true' ||
      JSON.parse(localStorage.getItem('activePlugins')).includes(filesJS[i])
    )
  )
    continue
  const el = document.createElement('script')
  el.src = 'plugins/js/' + filesJS[i]
  el.defer = true
  document.body.appendChild(el)
}

for (let i = 0; i < filesCSS.length; i++) {
  if (
    !(
      JSON.parse(localStorage.getItem('settings')).plugins.autoLoadPlugins ==
        'true' ||
      JSON.parse(localStorage.getItem('activePlugins')).includes(filesCSS[i])
    )
  )
    continue
  const el = document.createElement('link')
  el.rel = 'stylesheet'
  el.href = 'plugins/css/' + filesCSS[i]
  document.head.appendChild(el)
}

function loadPluginsPage() {
  updateTitle('Plugins')
  const activePlugins = JSON.parse(localStorage.getItem('activePlugins'))
  const pluginsListJS = preload.getPluginsJS()
  const pluginsListCSS = preload.getPluginsCSS()
  let autoLoad = false
  document.querySelectorAll('.content .pluginsPage .card').forEach((el) => {
    el.remove()
  })
  if (
    JSON.parse(localStorage.getItem('settings')).plugins.autoLoadPlugins ==
    'true'
  ) {
    document.querySelector('.content .pluginsPage').innerHTML +=
      '<div style="font-size: 24px; font-weight: 700;">All plugins have been loaded automatically!</div>'
    autoLoad = true
  }
  if (pluginsListJS.length < 1) {
    const el = document.createElement('div')
    el.innerHTML = 'No JS Plugins Found!'
    el.classList.add('msg')
    document.querySelector('.content .pluginsPage .jsContainer').appendChild(el)
  }
  for (let i = 0; i < pluginsListJS.length; i++) {
    if (!pluginsListJS[i].endsWith('.js')) continue
    const active = activePlugins.includes(pluginsListJS[i])

    const card = document.createElement('div')
    card.classList.add('card')
    const title = document.createElement('div')
    title.classList.add('title')
    title.style.color = active || autoLoad ? 'chartreuse' : 'red'
    title.innerHTML = camelCaseToTitleCase(pluginsListJS[i].split('.')[0])
    const desc = document.createElement('div')
    desc.classList.add('description')
    desc.innerHTML = `File: <a style="color: var(--dark-text);">${
      pluginsListJS[i]
    }</a><br>Size: <a style="color: var(--dark-text)">${
      Math.round(
        (preload.getFileSize(`plugins/js/${pluginsListJS[i]}`) / 1024) * 100
      ) / 100
    }KB</a>`
    const btn = document.createElement('button')
    btn.innerHTML = active || autoLoad ? 'Disable' : 'Enable'
    btn.disabled =
      JSON.parse(localStorage.getItem('settings')).plugins.autoLoadPlugins ==
      'true'
    btn.addEventListener('click', () => {
      if (!active) {
        localStorage.setItem(
          'activePlugins',
          JSON.stringify([...activePlugins, pluginsListJS[i]])
        )
      } else {
        activePlugins.splice(activePlugins.indexOf(pluginsListJS[i]), 1)
        localStorage.setItem('activePlugins', JSON.stringify(activePlugins))
      }
      goToAndReload('plugins')
    })
    card.appendChild(title)
    card.appendChild(desc)
    card.appendChild(btn)
    document
      .querySelector('.content .pluginsPage .jsContainer')
      .appendChild(card)
  }
  if (pluginsListCSS.length < 1) {
    const el = document.createElement('div')
    el.innerHTML = 'No CSS Plugins Found!'
    el.classList.add('msg')
    document
      .querySelector('.content .pluginsPage .cssContainer')
      .appendChild(el)
  }
  for (let i = 0; i < pluginsListCSS.length; i++) {
    if (!pluginsListCSS[i].endsWith('.css')) continue
    const active = activePlugins.includes(pluginsListCSS[i])

    const card = document.createElement('div')
    card.classList.add('card')
    const title = document.createElement('div')
    title.classList.add('title')
    title.style.color = active || autoLoad ? 'chartreuse' : 'red'
    title.innerHTML = camelCaseToTitleCase(pluginsListCSS[i].split('.')[0])
    const desc = document.createElement('div')
    desc.classList.add('description')
    desc.innerHTML = `File: <a style="color: var(--dark-text);">${
      pluginsListCSS[i]
    }</a><br>Size: <a style="color: var(--dark-text)">${
      Math.round(
        (preload.getFileSize(`plugins/css/${pluginsListCSS[i]}`) / 1024) * 100
      ) / 100
    }KB</a>`
    const btn = document.createElement('button')
    btn.innerHTML = active || autoLoad ? 'Disable' : 'Enable'
    btn.disabled =
      JSON.parse(localStorage.getItem('settings')).plugins.autoLoadPlugins ==
      'true'
    btn.addEventListener('click', () => {
      if (!active) {
        localStorage.setItem(
          'activePlugins',
          JSON.stringify([...activePlugins, pluginsListCSS[i]])
        )
      } else {
        activePlugins.splice(activePlugins.indexOf(pluginsListCSS[i]), 1)
        localStorage.setItem('activePlugins', JSON.stringify(activePlugins))
      }
      goToAndReload('plugins')
    })
    card.appendChild(title)
    card.appendChild(desc)
    card.appendChild(btn)
    document
      .querySelector('.content .pluginsPage .cssContainer')
      .appendChild(card)
  }
}
