const { contextBridge, ipcRenderer, shell } = require('electron')
const childProcess = require('child_process')
const fs = require('fs')
const net = require('net')
const discordRPC = require('discord-rpc')

const settings = JSON.parse(fs.readFileSync('settings.json'))
const pagePath = settings.collectionPage.pagesDirectoryPath
localStorage.setItem('settings', JSON.stringify(settings))
localStorage.setItem('pages', JSON.stringify(fs.readdirSync(pagePath)))

try {
  fs.readdirSync('temp')
} catch {
  fs.mkdirSync('temp')
}

try {
  fs.readdirSync('plugins')
} catch {
  fs.mkdirSync('plugins')
}

try {
  fs.readdirSync('plugins/js')
} catch {
  fs.mkdirSync('plugins/js')
}

try {
  fs.readdirSync('plugins/css')
} catch {
  fs.mkdirSync('plugins/css')
}

try {
  fs.readdirSync('pages')
} catch {
  fs.mkdirSync('pages')
}

//discord rpc
const discordRPCClient = new discordRPC.Client({ transport: 'ipc' })
const timeForDiscordRPC = Date.now()
const defaultDiscordRPCActivity = {
  assets: {
    large_image: 'image_1',
    large_text: 'Website Builder',
  },
  buttons: [
    {
      label: 'GitHub Repo',
      url: 'https://github.com/jullevistrunz/website-builder',
    },
  ],
  timestamps: { start: timeForDiscordRPC },
  instance: true,
}

discordRPCClient.on('ready', () => {
  discordRPCClient.request('SET_ACTIVITY', {
    pid: process.pid,
    activity: defaultDiscordRPCActivity,
  })
})
discordRPCClient.login({ clientId: '1129374022304534549' })

contextBridge.exposeInMainWorld('preload', {
  test: () => console.info('test'),
  getPageInfo: (page) => {
    return JSON.parse(fs.readFileSync(`${pagePath}/${page}/info.json`))
  },
  getViews: (page) => {
    return fs.readdirSync(`${pagePath}/${page}/views`)
  },
  getDirname: () => {
    return __dirname
  },
  getView: (page, view) => {
    let file = fs.readFileSync(`${pagePath}/${page}/views/${view}`).toString()
    file = file.slice(0, file.search('</body>'))
    return file.slice(file.search('<body>') + '<body>'.length)
  },
  createPage: (name, description) => {
    const id = Math.random().toString(16).slice(2)
    const password = ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(
      /[018]/g,
      (c) =>
        (
          c ^
          (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
        ).toString(16)
    )
    const port = Math.floor(Math.random() * 9000) + 1000
    fs.mkdirSync(`${pagePath}/${id}`)
    fs.mkdirSync(`${pagePath}/${id}/views`)
    fs.writeFileSync(
      `${pagePath}/${id}/views/main.html`,
      '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><meta http-equiv="X-UA-Compatible" content="IE=edge" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Hello World</title></head><style>body{margin:0;}</style><body><div class="frameSection"><h1>Hello World</h1></div></body></html>'
    )
    fs.writeFileSync(
      `${pagePath}/${id}/info.json`,
      JSON.stringify({
        id: id,
        name: name,
        description: description,
        password: password,
        port: port,
      })
    )
    fs.writeFileSync(
      `${pagePath}/${id}/start.bat`,
      `start "" "http://localhost:${port}/" 
      node "${__dirname}\\pages\\${id}\\index.js"`
    )
    fs.writeFileSync(
      `${pagePath}/${id}/views/404.html`,
      '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><meta http-equiv="X-UA-Compatible" content="IE=edge" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>404 - Page Not Found</title></head><style>body{margin:0;}</style><body><div class="frameSection"><h1>404 - Page Not Found</h1></div></body></html>'
    )
    fs.writeFileSync(
      `${pagePath}/${id}/index.js`,
      `const port=${port},password="${password}",http=require("http"),fs=require("fs"),url=require("url"),server=http.createServer((function(req,res){const path=url.parse(req.url,!0).pathname;let query=url.parse(req.url,!0).query;if("/"==path)res.writeHead(200,{"Content-Type":"text/html"}),res.write(fs.readFileSync(__dirname+"/views/main.html")),res.end();else if("/exit"==path){if(query.p!=password)return res.writeHead(403,{"Content-Type":"text/html"}),res.write("403 - Forbidden"),void res.end();res.writeHead(200,{"Content-Type":"text/html"}),res.write("Good Bye"),res.end(),server.close()}else try{res.writeHead(200,{"Content-Type":"text/html"}),res.write(fs.readFileSync(__dirname+\`/views/\${path.substring("/".length)}.html\`)),res.end()}catch{res.writeHead(301,{Location:"/404"}),res.end()}}));server.listen(port,(function(error){error?console.log("Something went wrong"+error):console.log("Listening on port "+port)}));`
    )
  },
  startServerBat: (page) => {
    const ls = childProcess.spawn('cmd.exe', [
      '/c',
      `${pagePath}\\${page}\\start.bat`,
    ])
    ls.stdout.on('data', function (data) {
      console.info(page + ': stdout: ' + data)
    })
    ls.stderr.on('data', function (data) {
      console.error(page + ': stderr: ' + data)
    })
    ls.on('exit', function (code) {
      console.info(page + ': child process exited with code ' + code)
    })
  },
  createCmdProcess: (origin, cmd) => {
    const ls = childProcess.spawn('cmd.exe', ['/c', cmd])
    ls.stdout.on('data', function (data) {
      console.info(origin + ': stdout: ' + data)
    })
    ls.stderr.on('data', function (data) {
      console.error(origin + ': stderr: ' + data)
    })
    ls.on('exit', function (code) {
      console.info(origin + ': child process exited with code ' + code)
    })
  },
  getRunningServers: async () => {
    const arr = []
    for (const page of fs.readdirSync(pagePath)) {
      await new Promise((r) => {
        const server = net.createServer()
        server.once('error', function (err) {
          if (err.code === 'EADDRINUSE') {
            arr.push(page)
          }
          r()
        })
        server.once('listening', function () {
          server.close()
          r()
        })
        server.listen(
          JSON.parse(fs.readFileSync(`${pagePath}/${page}/info.json`)).port
        )
      })
    }

    return arr
  },
  deletePage: (page) => {
    fs.rmSync(`${pagePath}/${page}`, { recursive: true, force: true })
  },
  getPluginsJS: () => {
    return fs.readdirSync('plugins/js')
  },
  getPluginsCSS: () => {
    return fs.readdirSync('plugins/css')
  },
  writeFile: (relativeFileName, content) => {
    fs.writeFileSync(__dirname + '/' + relativeFileName, content)
  },
  makeDir: (relativeDirName) => {
    fs.mkdirSync(__dirname + '/' + relativeDirName)
  },
  readDir: (relativeDirName) => {
    return fs.readdirSync(__dirname + '/' + relativeDirName)
  },
  readFile: (relativeFileName) => {
    return fs.readFileSync(__dirname + '/' + relativeFileName, 'utf-8')
  },
  removeFileOrDir: (relativeFileName) => {
    fs.rmSync(__dirname + '/' + relativeFileName)
  },
  clearTemp: () => {
    fs.readdirSync('temp').forEach((file) => {
      fs.rmSync(`temp/${file}`, { recursive: true, force: true })
    })
  },
  clearTempSpecific: (file) => {
    fs.rmSync(`temp/${file}`, { recursive: true, force: true })
  },
  getSettings: () => {
    localStorage.setItem('settings', fs.readFileSync('settings.json'))
    return JSON.parse(fs.readFileSync('settings.json'))
  },
  writeSettings: async (settings) => {
    await fs.promises.writeFile('settings.json', settings)
  },
  getFileSize: (file) => {
    return fs.statSync(file).size
  },
  openLinkInBrowser: (link) => {
    shell.openExternal(link)
  },
  updateDiscordRPC: (details) => {
    if (
      JSON.parse(fs.readFileSync('settings.json')).other
        .allowDiscordRpcUpdates == 'false'
    ) {
      return
    }
    discordRPCClient.request('SET_ACTIVITY', {
      pid: process.pid,
      activity: {
        details: details,
        assets: {
          large_image: 'image_1',
          large_text: 'Website Builder',
        },
        buttons: [
          {
            label: 'GitHub Repo',
            url: 'https://github.com/jullevistrunz/website-builder',
          },
        ],
        timestamps: { start: timeForDiscordRPC },
        instance: true,
      },
    })
  },
  addPageView: (page, viewName) => {
    try {
      if (fs.readFileSync(`${pagePath}/${page}/views/${viewName}.html`)) return
      fs.writeFileSync(
        `${pagePath}/${page}/views/${viewName}.html`,
        `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><meta http-equiv="X-UA-Compatible" content="IE=edge" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Hello World</title></head><style>body{margin:0;}</style><body><div class="frameSection"><h1>Hello World from ${viewName}</h1></div></body></html>`
      )
    } catch {
      return
    }
  },
  removePageView: (page, view) => {
    if (view == 'main.html' || view == '404.html') return
    try {
      fs.rmSync(`${pagePath}/${page}/views/${view}`)
    } catch {
      return
    }
  },
})

contextBridge.exposeInMainWorld('windowControls', {
  close: () => {
    ipcRenderer.send('closeWindow')
  },
  minimize: () => {
    ipcRenderer.send('minimizeWindow')
  },
  restore: () => {
    ipcRenderer.send('restoreWindow')
  },
})
