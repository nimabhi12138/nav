import express from 'express'
import bodyParser from 'body-parser'
import compression from 'compression'
import history from 'connect-history-api-fallback'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'

const config = yaml.load(fs.readFileSync('nav.config.yaml', 'utf8')) as any
const app = express()

app.use(cors())
app.use(bodyParser.json({ limit: '5mb' }))
app.use(compression())

const password = config.password || ''

app.get('/api/users/verify', (req, res) => {
  const auth = req.headers.authorization || ''
  const token = auth.split(' ').pop() || ''
  if (password && token === password) {
    res.json({ username: 'admin' })
  } else {
    res.status(401).json({ error: '未授权' })
  }
})

function readJSON(file: string) {
  try {
    return JSON.parse(fs.readFileSync(path.join('data', file), 'utf8'))
  } catch {
    return {}
  }
}

app.post('/api/contents/get', (_req, res) => {
  res.json({
    webs: readJSON('db.json'),
    tags: readJSON('tag.json'),
    settings: readJSON('settings.json'),
    internal: readJSON('internal.json'),
    search: readJSON('search.json'),
    component: readJSON('component.json'),
  })
})

app.post('/api/contents/update', (req, res) => {
  const { path: filePath, content } = req.body || {}
  if (!filePath) {
    res.status(400).json({ error: '缺少路径参数' })
    return
  }
  try {
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2))
    res.json({ success: true })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

const port = config.port || 7777
app.use(history())
app.use(express.static(path.join('dist', 'browser')))

app.listen(port, () => {
  console.log(`\u670D\u52A1\u542F\u52A8\uFF0C\u7AEF\u53E3 ${port}`)
})
