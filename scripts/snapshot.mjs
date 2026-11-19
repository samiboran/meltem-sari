// One-off (or occasional) snapshot of the site content from the Sanity project.
// Writes src/content/content.json and downloads every image to public/media/.
// After this the site no longer needs Sanity at all.
//
// Usage: node scripts/snapshot.mjs
// Optional env: SANITY_PROJECT_ID, SANITY_DATASET, SANITY_TOKEN (only if the dataset is private)

import { mkdir, writeFile, access } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const projectId = process.env.SANITY_PROJECT_ID || 'jl0heffc'
const dataset = process.env.SANITY_DATASET || 'production'
const token = process.env.SANITY_TOKEN
const api = `https://${projectId}.api.sanity.io/v2024-01-01/data/query/${dataset}`

// Same queries the pages use, so the data shape is identical.
const QUERIES = {
  works: `*[_type == "photoSeries"] | order(order asc, year desc) { _id, title, year, slug, coverImage }`,
  exhibitions: `*[_type == "exhibition"] | order(year desc) { _id, year, title, type, venue, location, description, images }`,
  press: `*[_type == "press"] | order(order asc, date desc) { _id, publication, title, url, date }`,
  biography: `*[_type == "biography"][0] { birthYear, birthPlace, currentLocation, education, content }`,
  series: `*[_type == "photoSeries" && slug.current == $slug][0] { title, year, description, images[] { asset, caption, alt } }`,
}

async function query(groq, params = {}) {
  const url = new URL(api)
  url.searchParams.set('query', groq)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(`$${k}`, JSON.stringify(v))
  const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
  if (!res.ok) throw new Error(`Sanity query failed (${res.status}): ${await res.text()}`)
  return (await res.json()).result
}

function collectRefs(node, out = new Set()) {
  if (Array.isArray(node)) node.forEach((n) => collectRefs(n, out))
  else if (node && typeof node === 'object') {
    if (typeof node._ref === 'string' && node._ref.startsWith('image-')) out.add(node._ref)
    Object.values(node).forEach((v) => collectRefs(v, out))
  }
  return out
}

// image-<id>-<w>x<h>-<ext>  ->  { file: "<id>.<ext>", cdn: "<id>-<w>x<h>.<ext>" }
export function parseRef(ref) {
  const [, id, dims, ext] = ref.split('-')
  return { file: `${id}.${ext}`, cdn: `${id}-${dims}.${ext}` }
}

const exists = (p) => access(p).then(() => true, () => false)

async function main() {
  console.log(`Snapshotting ${projectId}/${dataset} ...`)
  const content = {
    works: await query(QUERIES.works),
    exhibitions: await query(QUERIES.exhibitions),
    press: await query(QUERIES.press),
    biography: await query(QUERIES.biography),
    series: {},
  }
  for (const s of content.works || []) {
    const slug = s?.slug?.current
    if (slug) content.series[slug] = await query(QUERIES.series, { slug })
  }

  const refs = [...collectRefs(content)]
  const mediaDir = join(root, 'public', 'media')
  await mkdir(mediaDir, { recursive: true })
  let downloaded = 0
  for (const ref of refs) {
    const { file, cdn } = parseRef(ref)
    const dest = join(mediaDir, file)
    if (await exists(dest)) continue
    // Max 2400px wide, high quality: sharp on big screens, still reasonable for git.
    const ext = file.split('.').pop()
    const fm = ext === 'png' ? '' : '&q=90'
    const res = await fetch(`https://cdn.sanity.io/images/${projectId}/${dataset}/${cdn}?w=2400&fit=max${fm}`)
    if (!res.ok) throw new Error(`Image download failed (${res.status}): ${cdn}`)
    await writeFile(dest, Buffer.from(await res.arrayBuffer()))
    downloaded++
  }

  const outDir = join(root, 'src', 'content')
  await mkdir(outDir, { recursive: true })
  await writeFile(join(outDir, 'content.json'), JSON.stringify(content, null, 2) + '\n')
  console.log(
    `Done: ${content.works?.length ?? 0} series, ${content.exhibitions?.length ?? 0} exhibitions, ` +
      `${content.press?.length ?? 0} press items, ${refs.length} images (${downloaded} new).`
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
