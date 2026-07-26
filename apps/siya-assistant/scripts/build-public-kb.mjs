#!/usr/bin/env node
/**
 * Builds apps/siya-assistant/data/public-kb.json from public Siya Health indexes only.
 * Never include internal docs, investor materials, or private systems.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SITE = path.resolve(__dirname, '../../siya-health')
const OUT = path.resolve(__dirname, '../data/public-kb.json')

const text = fs.readFileSync(path.join(SITE, 'llms-full.txt'), 'utf8')
const chunks = []
const seen = new Set()
const re = /^- (.+)\n  URL: (https:\/\/siya\.health[^\n]+)\n  Summary: (.+)(?:\n  Topics: (.+))?/gm
let m
while ((m = re.exec(text))) {
  const title = m[1].replace(/&amp;/g, '&').trim()
  let url = m[2].trim().replace(/\/$/, '')
  url = url === 'https://siya.health' ? 'https://www.siya.health/' : url.replace('https://siya.health', 'https://www.siya.health')
  const summary = m[3].replace(/&amp;/g, '&').trim()
  const topics = (m[4] || '').split(',').map((t) => t.trim()).filter(Boolean)
  const pth = url.replace('https://www.siya.health', '') || '/'
  if (/\/legal|\/intake|preview|\/redirect/i.test(url)) continue
  const id = pth.replace(/^\/+|\/+$/g, '').replace(/\//g, '_') || 'homepage'
  if (seen.has(id)) continue
  seen.add(id)
  const keywords = Array.from(
    new Set(`${title} ${summary} ${topics.join(' ')}`.toLowerCase().match(/[a-z0-9$]+/g) || []),
  )
  chunks.push({ id, title, url, path: pth || '/', summary, topics, keywords })
}

const curated = JSON.parse(fs.readFileSync(OUT, 'utf8')).chunks.filter((c) => c.id.startsWith('fact_'))
const all = [...curated, ...chunks.filter((c) => !curated.some((x) => x.id === c.id))]
const payload = {
  version: 1,
  source: 'siya-health public indexes (llms-full + curated public facts)',
  generated: new Date().toISOString().slice(0, 10),
  chunkCount: all.length,
  chunks: all,
}
fs.mkdirSync(path.dirname(OUT), { recursive: true })
fs.writeFileSync(OUT, JSON.stringify(payload, null, 2))
console.log(`Wrote ${OUT} (${all.length} chunks)`)
