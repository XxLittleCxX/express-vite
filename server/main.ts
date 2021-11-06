import {createServer} from "vite";
import express from 'express'
import {promises as fs, Stats} from 'fs'
import path from 'path'
import apiRouter from './api'
import vuePlugin from '@vitejs/plugin-vue'

const CLIENT = path.resolve(__dirname, '../client')
export function noop(): any {}

async function createVite(app){
  if(process.env.NODE_ENV === 'production') return;
  let vite = await createServer({
    root: CLIENT,
    base: '/vite/',
    plugins: [vuePlugin()],
    server: {
      middlewareMode: true
    }
  })
  app.all(/vite(\/.+)+/, (req, res) => {
    vite.middlewares(req, res)
  })
  return vite
}

async function create(){
  const app = express()
  app.use('/api', apiRouter)
  let vite = await createVite(app)
  const mode = process.env.NODE_ENV
  const root = mode !== 'production' ? path.resolve(__dirname, '../src/client/') : path.resolve(__dirname, './client/')
  app.get(/\/(.+)*/, async (req, res) => {
    const filename = path.resolve(root, req.originalUrl.replace(/^\/+/, ''))
    if (!filename.startsWith(root) && !filename.includes('node_modules')) {
      return res.status(404).end()
    }
    const stats = await fs.stat(filename).catch<Stats>(noop)
    if (stats?.isFile()) {
      return res.sendFile(filename)
    }
    try {
      let template = await fs.readFile(
        path.resolve(root, 'index.html'),
        'utf-8'
      )

      if(vite) template = await vite.transformIndexHtml(req.originalUrl, template)

      res.status(200).set({ 'Content-Type': 'text/html' }).end(template)
    } catch (e) {
      if(vite) vite.ssrFixStacktrace(e)
      console.error(e)
      res.status(500).end(e.message)
    }
  })
  app.listen(2333)
}

create()