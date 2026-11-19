// Local replacement for the Sanity client.
// Content lives in src/content/content.json and images in public/media/
// (both created by `node scripts/snapshot.mjs`). The pages keep calling
// client.fetch(...) and urlFor(...) exactly as before, so the site is 1:1.
import content from '../content/content.json'

const base = import.meta.env.BASE_URL

function pick(query, params = {}) {
  if (query.includes('"photoSeries"') && query.includes('$slug')) {
    return content.series?.[params.slug] ?? null
  }
  if (query.includes('"photoSeries"')) return content.works ?? []
  if (query.includes('"exhibition"')) return content.exhibitions ?? []
  if (query.includes('"press"')) return content.press ?? []
  if (query.includes('"biography"')) return content.biography ?? null
  console.warn('Unknown query, no local content for it:', query)
  return null
}

export const client = {
  fetch: async (query, params) => pick(query, params),
}

// image-<id>-<w>x<h>-<ext>  ->  /media/<id>.<ext>
function localPath(source) {
  const ref = source?.asset?._ref || source?._ref || ''
  const [, id, , ext] = ref.split('-')
  return id ? `${base}media/${id}.${ext}` : ''
}

export function urlFor(source) {
  const path = localPath(source)
  const builder = new Proxy(
    {},
    { get: (_, prop) => (prop === 'url' ? () => path : () => builder) }
  )
  return builder
}
