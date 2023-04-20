const { contextBridge } = require('electron')
const childProcess = require('child_process')
const fs = require('fs')
const net = require('net')

window.addEventListener('DOMContentLoaded', () => {
  localStorage.setItem('settings', fs.readFileSync('settings.json'))
  localStorage.setItem('pages', JSON.stringify(fs.readdirSync('pages')))
})

contextBridge.exposeInMainWorld('preload', {
  test: () => console.info('test'),
  getPageInfo: (page) => {
    return JSON.parse(fs.readFileSync(`pages/${page}/info.json`))
  },
  getViews: (page) => {
    return fs.readdirSync(`pages/${page}/views`)
  },
  getDirname: () => {
    return __dirname
  },
  getView: (page, view) => {
    let file = fs
      .readFileSync(`${__dirname}/pages/${page}/views/${view}`)
      .toString()
    file = file.slice(0, file.search('</body>'))
    return file.slice(file.search('<body>') + '<body>'.length)
  },
  createPage: (name, description) => {
    const id = ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
      (
        c ^
        (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
      ).toString(16)
    )
    const password = ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(
      /[018]/g,
      (c) =>
        (
          c ^
          (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
        ).toString(16)
    )
    const port = Math.floor(Math.random() * 9000) + 1000
    fs.mkdirSync(`pages/${id}`)
    fs.mkdirSync(`pages/${id}/views`)
    fs.writeFileSync(
      `pages/${id}/views/main.html`,
      '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><meta http-equiv="X-UA-Compatible" content="IE=edge" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Hello World</title></head><body><h1>Hello World</h1></body></html>'
    )
    fs.writeFileSync(
      `pages/${id}/info.json`,
      JSON.stringify({
        id: id,
        name: name,
        description: description,
        password: password,
        port: port,
      })
    )
    fs.writeFileSync(
      `pages/${id}/start.bat`,
      `start "" "http://localhost:${port}/" 
      node "${__dirname}\\pages\\${id}\\index.js"`
    )
    fs.writeFileSync(
      `pages/${id}/views/404.html`,
      '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><meta http-equiv="X-UA-Compatible" content="IE=edge" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>404 - Page Not Found</title></head><body><div>404 - Page Not Found</div></body></html>'
    )
    fs.writeFileSync(
      `pages/${id}/index.js`,
      `const port=${port},password="${password}",http=require("http"),fs=require("fs"),url=require("url"),server=http.createServer((function(req,res){const path=url.parse(req.url,!0).pathname;let query=url.parse(req.url,!0).query;if("/"==path)res.writeHead(200,{"Content-Type":"text/html"}),res.write(fs.readFileSync(__dirname+"/views/main.html")),res.end();else if("/exit"==path){if(query.p!=password)return res.writeHead(403,{"Content-Type":"text/html"}),res.write("403 - Forbidden"),void res.end();res.writeHead(200,{"Content-Type":"text/html"}),res.write("Good Bye"),res.end(),server.close()}else try{res.writeHead(200,{"Content-Type":"text/html"}),res.write(fs.readFileSync(__dirname+\`/views/\${path.substring("/".length)}.html\`)),res.end()}catch{res.writeHead(301,{Location:"/404"}),res.end()}}));server.listen(port,(function(error){error?console.log("Something went wrong"+error):console.log("Listening on port "+port)}));`
    )
  },
  startServerBat: (page) => {
    const ls = childProcess.spawn('cmd.exe', [
      '/c',
      `pages\\${page}\\start.bat`,
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
  getRunningServers: () => {
    localStorage.setItem('runningServers', '[]')
    fs.readdirSync('pages').forEach((page) => {
      const server = net.createServer()
      server.once('error', function (err) {
        if (err.code === 'EADDRINUSE') {
          localStorage.setItem(
            'runningServers',
            JSON.stringify([
              ...JSON.parse(localStorage.getItem('runningServers')),
              page,
            ])
          )
        }
      })
      server.once('listening', function () {
        server.close()
      })
      server.listen(JSON.parse(fs.readFileSync(`pages/${page}/info.json`)).port)
    })
  },
  deletePage: (page) => {
    fs.rmSync(`pages/${page}`, { recursive: true, force: true })
  },
  getPlugins: () => {
    return fs.readdirSync('plugins')
  },
  writeFile: (fileName, content) => {
    fs.writeFileSync(fileName, content)
  },
  clearTemp: () => {
    fs.readdirSync('temp').forEach((file) => {
      fs.rmSync(`temp/${file}`)
    })
  },
})
