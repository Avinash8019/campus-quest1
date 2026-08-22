/**
 * Production Web Server for CampusQuest (Node.js Built-in HTTP)
 * Serves the compiled Vite production bundle from `dist/` with SPA fallback.
 * Works seamlessly on Render Web Service, Render Static Site, Heroku, Railway, and local preview.
 */

import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import zlib from 'node:zlib'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PORT = Number(process.env.PORT) || 10000
const HOST = '0.0.0.0'
const DIST_DIR = path.resolve(__dirname, 'dist')

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.mjs': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml; charset=UTF-8',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=UTF-8',
}

const server = http.createServer((req, res) => {
  // Normalize request path
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`)
  let reqPath = decodeURIComponent(parsedUrl.pathname)

  // Disallow path traversal
  const safeSuffix = path.normalize(reqPath).replace(/^(\.\.[/\\])+/, '')
  let filePath = path.join(DIST_DIR, safeSuffix)

  // If path is a directory, look for index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html')
  }

  // SPA fallback: If requested file does not exist or has no extension, serve index.html
  if (!fs.existsSync(filePath) || !path.extname(filePath)) {
    filePath = path.join(DIST_DIR, 'index.html')
  }

  // Check if index.html exists in dist
  if (!fs.existsSync(filePath)) {
    res.writeHead(503, { 'Content-Type': 'text/plain' })
    res.end('Application is building or dist/ not found. Please run: npm run build')
    return
  }

  const ext = path.extname(filePath).toLowerCase()
  const contentType = MIME_TYPES[ext] || 'application/octet-stream'

  // Read file stats
  const stat = fs.statSync(filePath)
  const isHtml = ext === '.html'

  // Security & Caching Headers
  const headers = {
    'Content-Type': contentType,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-XSS-Protection': '1; mode=block',
  }

  // Long-term cache for hashed static assets, short-term for HTML
  if (isHtml) {
    headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
  } else {
    headers['Cache-Control'] = 'public, max-age=31536000, immutable'
  }

  // Compression support (Gzip)
  const acceptEncoding = req.headers['accept-encoding'] || ''
  if (acceptEncoding.includes('gzip') && (isHtml || ext === '.js' || ext === '.css' || ext === '.svg' || ext === '.json')) {
    headers['Content-Encoding'] = 'gzip'
    res.writeHead(200, headers)
    const raw = fs.createReadStream(filePath)
    const gzip = zlib.createGzip()
    raw.pipe(gzip).pipe(res)
  } else {
    headers['Content-Length'] = stat.size
    res.writeHead(200, headers)
    fs.createReadStream(filePath).pipe(res)
  }
})

server.listen(PORT, HOST, () => {
  console.log(`🚀 CampusQuest Production Server running at http://${HOST}:${PORT}`)
  console.log(`📁 Serving static assets from: ${DIST_DIR}`)
})
