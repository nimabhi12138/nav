import express from 'express'
import bodyParser from 'body-parser'
import compression from 'compression'
import history from 'connect-history-api-fallback'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'
import getWebInfo from 'info-web'

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

function writeJSON(file: string, data: any) {
  fs.writeFileSync(path.join('data', file), JSON.stringify(data, null, 2))
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

app.post('/api/contents/create', (req, res) => {
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

app.post('/api/file/create', (req, res) => {
  const { path: filePath, content } = req.body || {}
  if (!filePath) {
    res.status(400).json({ error: '缺少路径参数' })
    return
  }
  try {
    fs.writeFileSync(filePath, content)
    res.json({ success: true })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/web/info', async (req, res) => {
  const { url } = req.body || {}
  if (!url) {
    res.status(400).json({ error: '缺少url参数' })
    return
  }
  try {
    const info = await getWebInfo(url)
    res.json(info)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/collect/get', (_req, res) => {
  const list = (readJSON('collect.json') as any[]) || []
  res.json({ list })
})

app.post('/api/collect/save', (req, res) => {
  const { item } = req.body || {}
  if (!item) {
    res.status(400).json({ error: '缺少 item 参数' })
    return
  }
  const list = (readJSON('collect.json') as any[]) || []
  list.push(item)
  writeJSON('collect.json', list)
  res.json({ success: true })
})

app.post('/api/collect/delete', (req, res) => {
  const { id } = req.body || {}
  const list = (readJSON('collect.json') as any[]) || []
  const newList = list.filter((i: any) => i.id !== id)
  writeJSON('collect.json', newList)
  res.json({ success: true })
})

app.post('/api/config/get', (_req, res) => {
  res.json(readJSON('settings.json'))
})

app.post('/api/config/update', (req, res) => {
  const data = req.body || {}
  writeJSON('settings.json', data)
  res.json({ success: true })
})

app.post('/api/translate', (req, res) => {
  const { text } = req.body || {}
  res.json({ text })
})

app.post('/api/news', (_req, res) => {
  res.json({ list: [] })
})

app.post('/api/screenshot', (_req, res) => {
  res.json({ success: true })
})

app.post('/api/spider', (_req, res) => {
  res.json({ success: true })
})

const port = config.port || 7777
app.use(history())
app.use(express.static(path.join('dist', 'browser')))

app.listen(port, () => {
  console.log(`\u670D\u52A1\u542F\u52A8\uFF0C\u7AEF\u53E3 ${port}`)
})
