// One-off migration: old `blog/public/article/<title>/{meta.toml,page.md,*.png}`
// → SQL inserts for D1 + an image manifest for R2.
//
// Usage:
//   node scripts/migrate-from-blog.mjs [sourceArticleDir]
// Outputs:
//   /tmp/migrate.sql            -- DELETE + INSERT statements for the posts table
//   /tmp/migrate-images.tsv     -- "<r2-key>\t<source-file>\t<content-type>" per image
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { join, extname } from 'node:path'
import { randomUUID } from 'node:crypto'

const SOURCE =
  process.argv[2] || '/Users/ms/dev/_blog/blog/public/article'

function slugify(input) {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}-]+/gu, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function parseMeta(toml) {
  const title = toml.match(/title\s*=\s*"([^"]*)"/)?.[1] ?? ''
  const date = toml.match(/date\s*=\s*"([^"]*)"/)?.[1]?.trim() ?? ''
  const tagBlock = toml.match(/tag\s*=\s*\[([^\]]*)\]/)?.[1] ?? ''
  const tags = [...tagBlock.matchAll(/"([^"]*)"/g)].map((m) => m[1])
  return { title, date, tags }
}

const contentType = (ext) =>
  ({ '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml' })[
    ext.toLowerCase()
  ] || 'application/octet-stream'

const sqlStr = (s) => `'${String(s).replace(/'/g, "''")}'`
const excerptOf = (md) =>
  md
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/[#>*`_\-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120)

const folders = readdirSync(SOURCE, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)

const images = [] // { key, src, type }
const inserts = []

for (const folder of folders) {
  const dir = join(SOURCE, folder)
  const mdPath = join(dir, 'page.md')
  const metaPath = join(dir, 'meta.toml')
  if (!existsSync(mdPath)) continue

  let content = readFileSync(mdPath, 'utf8')
  const meta = existsSync(metaPath)
    ? parseMeta(readFileSync(metaPath, 'utf8'))
    : { title: folder, date: '', tags: [] }

  const title = meta.title || folder
  const slug = slugify(folder)
  const ts = meta.date ? new Date(meta.date).getTime() : Date.now()

  // Rewrite local image references → uploaded R2 key served at /api/media/<key>
  content = content.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    (whole, alt, ref) => {
      if (/^https?:\/\//.test(ref)) return whole
      const src = join(dir, decodeURIComponent(ref))
      if (!existsSync(src)) return whole
      const ext = extname(src) || '.bin'
      const key = `${randomUUID()}${ext}`
      images.push({ key, src, type: contentType(ext) })
      return `![${alt}](/api/media/${key})`
    },
  )

  const id = randomUUID()
  inserts.push(
    `INSERT INTO posts (id, slug, title, excerpt, content, tags, status, created_at, updated_at, published_at) VALUES (` +
      `${sqlStr(id)}, ${sqlStr(slug)}, ${sqlStr(title)}, ${sqlStr(excerptOf(content))}, ${sqlStr(content)}, ` +
      `${sqlStr(JSON.stringify(meta.tags))}, 'published', ${ts}, ${ts}, ${ts});`,
  )
}

const sql = `DELETE FROM posts;\n${inserts.join('\n')}\n`
writeFileSync('/tmp/migrate.sql', sql)
writeFileSync(
  '/tmp/migrate-images.tsv',
  images.map((i) => `${i.key}\t${i.src}\t${i.type}`).join('\n') + '\n',
)

console.log(`posts: ${inserts.length}, images: ${images.length}`)
console.log('→ /tmp/migrate.sql, /tmp/migrate-images.tsv')
