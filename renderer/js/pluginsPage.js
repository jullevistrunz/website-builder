if (!localStorage.getItem('activePlugins')) {
  localStorage.setItem('activePlugins', '[]')
}

const files = preload.getPlugins()

//remove redundant active plugins
const ap = JSON.parse(localStorage.getItem('activePlugins'))
for (let i = 0; i < ap.length; i++) {
  if (!files.includes(ap[i])) {
    ap.splice(i, 1)
  }
}
localStorage.setItem('activePlugins', JSON.stringify(ap))

for (let i = 0; i < files.length; i++) {
  if (
    !(
      JSON.parse(localStorage.getItem('settings')).plugins.autoLoadPlugins ==
        'true' ||
      JSON.parse(localStorage.getItem('activePlugins')).includes(files[i])
    )
  )
    continue
  const el = document.createElement('script')
  el.src = 'plugins/' + files[i]
  el.defer = true
  document.body.appendChild(el)
}

function loadPluginsPage() {
  updateTitle('Plugins')
  const activePlugins = JSON.parse(localStorage.getItem('activePlugins'))
  const pluginsList = preload.getPlugins()
  document.querySelectorAll('.content .pluginsPage .card').forEach((el) => {
    el.remove()
  })
  if (
    JSON.parse(localStorage.getItem('settings')).plugins.autoLoadPlugins ==
    'true'
  ) {
    document.querySelector('.content .pluginsPage').innerHTML =
      '<div style="font-size: 24px; font-weight: 700;" class="break">All plugins have been loaded automatically!</div>'
  }
  for (let i = 0; i < pluginsList.length; i++) {
    if (!pluginsList[i].endsWith('.js')) continue
    const active = activePlugins.includes(pluginsList[i])

    const card = document.createElement('div')
    card.classList.add('card')
    const title = document.createElement('div')
    title.classList.add('title')
    title.style.color = active ? 'chartreuse' : 'red'
    title.innerHTML = camelCaseToTitleCase(pluginsList[i].split('.')[0])
    const desc = document.createElement('div')
    desc.classList.add('description')
    desc.innerHTML = `File: <a style="color: var(--dark-text);">${
      pluginsList[i]
    }</a><br>Size: <a style="color: var(--dark-text)">${
      Math.round(
        (preload.getFileSize(`plugins/${pluginsList[i]}`) / 1024) * 100
      ) / 100
    }KB</a>`
    const btn = document.createElement('button')
    btn.innerHTML = active ? 'Disable' : 'Enable'
    btn.disabled =
      JSON.parse(localStorage.getItem('settings')).plugins.autoLoadPlugins ==
      'true'
    btn.addEventListener('click', () => {
      if (!active) {
        localStorage.setItem(
          'activePlugins',
          JSON.stringify([...activePlugins, pluginsList[i]])
        )
      } else {
        activePlugins.splice(activePlugins.indexOf(pluginsList[i]), 1)
        localStorage.setItem('activePlugins', JSON.stringify(activePlugins))
      }
      goToAndReload('plugins')
    })
    card.appendChild(title)
    card.appendChild(desc)
    card.appendChild(btn)
    document.querySelector('.content .pluginsPage').appendChild(card)
  }
}
