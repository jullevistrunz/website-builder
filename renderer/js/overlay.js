document.querySelector('.popUpOverlay').addEventListener('click', function (e) {
  if (e.target != this) return
  document
    .querySelectorAll('.popUpOverlay > div:not(.hidden)')
    .forEach((el) => el.classList.add('hidden'))
  this.classList.remove('use')
  this.classList.remove('blur')
  document.querySelectorAll('.content * button').forEach((btn) => {
    btn.removeAttribute('tabindex')
  })
})

function popUpQuestion(question, cb) {
  document.querySelector('.questionPopUp > div:first-child').innerHTML =
    question
  document.querySelector('.questionPopUp').classList.toggle('hidden')
  document.querySelector('.popUpOverlay').classList.toggle('use')
  document.querySelector('.popUpOverlay').classList.toggle('blur')
  //remove all old eventListener
  const oldEl = document.querySelector('.questionPopUp .answerYes')
  const newEl = oldEl.cloneNode(true)
  oldEl.parentNode.replaceChild(newEl, oldEl)
  document.querySelectorAll('.content * button').forEach((btn) => {
    btn.setAttribute('tabindex', -1)
  })
  document
    .querySelector('.questionPopUp .answerYes')
    .addEventListener('click', () => {
      cb()
      document.querySelector('.popUpOverlay').click()
    })
}

function openViewSourceCode(view) {
  //add new line after each element
  const rawText = view
  const arr = rawText.split(/(?=[<>])|(?<=[<>])/)
  if (arr.length < 6) return
  const arr2 = []
  const arr3 = []
  const arr4 = []
  const isClosingTagArr = []
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] == '<') {
      arr2.push(arr[i] + arr[i + 1] + arr[i + 2])
      arr3.push(arr[i] + arr[i + 1] + arr[i + 2])
      arr4.push(arr[i] + arr[i + 1] + arr[i + 2])
      i += 2
    } else {
      arr2.push(arr[i])
      arr3.push(arr[i])
      arr4.push(arr[i])
    }
  }
  for (let i = 0; i < arr2.length; i++) {
    if (arr2[i].startsWith('</')) {
      isClosingTagArr[i] = true
    } else {
      isClosingTagArr[i] = false
    }
  }
  for (let i = 0; i < arr2.length; i++) {
    arr2[i] += '\n'
  }
  for (let i = 0; i < arr2.length; i++) {
    for (let j = i; !isClosingTagArr[j]; j++) {
      if (isClosingTagArr[j + 1]) {
        continue
      }
      arr2[j] += '\t'
    }
  }
  arr3.reverse()
  const isClosingTagArrReverse = isClosingTagArr.reverse()
  for (let i = 0; i < arr3.length; i++) {
    for (let j = i + 1; isClosingTagArrReverse[j - 1]; j++) {
      if (arr4[arr4.length - i - 2].endsWith('>')) {
        if (!isClosingTagArr[j]) {
          continue
        }
        arr2[arr2.length - j - 2] += '\t'
      }
    }
  }
  //syntax highlight
  for (let i = 0; i < arr2.length; i++) {
    if (arr2[i].startsWith('</')) {
      const arr5 = arr2[i].split(/(?=[<>])|(?<=[<>])/)
      for (let j = 0; j < arr5.length; j++) {
        if (arr5[j] == '<' || arr5[j] == '>') {
          arr5[j] = `<div class="symbol">${htmlEntities.encode(arr5[j])}</div>`
        } else {
          if (arr5[j].startsWith('/')) {
            arr5[j] = arr5[j].split('/').join('')
            arr5[j] = `<div class="symbol">${htmlEntities.encode(
              '/'
            )}</div><div class="tag">${htmlEntities.encode(arr5[j])}</div>`
          }
        }
      }
      arr2[i] = arr5.join('')
    } else if (arr2[i].startsWith('<')) {
      const arr5 = arr2[i].split(/(?=[<>])|(?<=[<>])/)
      for (let j = 0; j < arr5.length; j++) {
        if (arr5[j] == '<' || arr5[j] == '>') {
          arr5[j] = `<div class="symbol">${htmlEntities.encode(arr5[j])}</div>`
        } else {
          if (arr5[j].includes('\n')) {
            continue
          }
          let arr6 = arr5[j].split(/\s(.*)/s)
          if (arr6.length > 1) {
            arr6[arr6.length - 1] = null
            arr6 = arr6.filter((n) => n)
          }

          let arr7 = []
          for (let k = 1; k < arr6.length; k++) {
            arr7.push(arr6[k])
          }
          arr7 = arr7.join('')
          if (!arr7) {
            if (arr6[0].length > 1) {
              arr6[0] = `<div class="tag">${htmlEntities.encode(arr6[0])}</div>`
            }
            arr5[j] = arr6[0]
            continue
          }

          arr6[0] = `<div class="tag">${htmlEntities.encode(arr6[0])}</div>`

          const arr8 = arr7.split('=')

          let arr10 = []
          for (let k = 0; k < arr8.length; k++) {
            const arr9 = arr8[k].split('"')
            if (arr9.length > 1) {
              arr10.push(`"${arr9[1]}"`)
              arr10.push(arr9[2])
            } else {
              arr10.push(arr9[0])
            }
          }
          arr10[arr10.length - 1] = null
          arr10 = arr10.filter((n) => n)

          for (let k = 0; k < arr10.length; k++) {
            if (arr10[k].startsWith('"') && arr10[k].endsWith('"')) {
              arr10[k] = arr10[k].substring(1, arr10[k].length - 1)
              arr10[k] = `<div class="symbol">${htmlEntities.encode(
                '"'
              )}</div><div class="value">${
                arr10[k]
              }</div><div class="symbol">${htmlEntities.encode('"')}</div>`
            } else {
              arr10[k] = `<i class="attribute">${htmlEntities.encode(
                arr10[k]
              )}</i>`
            }
          }

          const arr11 = Array.from(
            { length: arr10.length / 2 },
            (_, k) =>
              arr10[2 * k] +
              `<div class="symbol">${htmlEntities.encode('=')}</div>` +
              arr10[2 * k + 1]
          )

          arr7 = ' ' + arr11.join('')

          arr5[j] = [arr6[0], ...arr7].join('')
        }
      }
      arr2[i] = arr5.join('')
    } else {
      arr2[i] = `<div class="text">${htmlEntities.encode(arr2[i])}</div>`
    }
  }
  const text = arr2.join('')
  //line numbers
  const lines = arr2.length
  document.querySelector(
    '.popUpOverlay .viewSourceCodePopUp .codeBox pre .lineNumbers'
  ).innerHTML = ''
  for (let i = 0; i < lines; i++) {
    document.querySelector(
      '.popUpOverlay .viewSourceCodePopUp .codeBox pre .lineNumbers'
    ).innerHTML += `${i + 1}\n`
  }

  if (document.getElementById('viewSourceCodePopUpStyles')) {
    document.getElementById('viewSourceCodePopUpStyles').remove()
  }
  const styleEl = document.createElement('style')
  styleEl.id = 'viewSourceCodePopUpStyles'
  styleEl.innerHTML = `.viewSourceCodePopUp code *, .viewSourceCodePopUp pre .lineNumbers {font-family: ${
    JSON.parse(localStorage.getItem('settings')).editPage.viewSourceCode
      .fontFamily
  }; tab-size: ${
    JSON.parse(localStorage.getItem('settings')).editPage.viewSourceCode.tabSize
  }; font-size: ${
    JSON.parse(localStorage.getItem('settings')).editPage.viewSourceCode
      .fontSize
  }; line-height: ${
    JSON.parse(localStorage.getItem('settings')).editPage.viewSourceCode
      .lineHeight
  }}`
  document.body.appendChild(styleEl)

  document.querySelector(
    '.popUpOverlay .viewSourceCodePopUp .codeBox pre code'
  ).innerHTML = text

  document
    .querySelector('.popUpOverlay .viewSourceCodePopUp')
    .classList.toggle('hidden')
  document.querySelector('.popUpOverlay').classList.toggle('use')
  document.querySelector('.popUpOverlay').classList.toggle('blur')
  const oldEl = document.querySelector(
    '.popUpOverlay .viewSourceCodePopUp .closeBtn'
  )
  const newEl = oldEl.cloneNode(true)
  oldEl.parentNode.replaceChild(newEl, oldEl)
  document
    .querySelector('.popUpOverlay .viewSourceCodePopUp .closeBtn')
    .addEventListener('click', function () {
      document.querySelector('.popUpOverlay').click()
    })
}
