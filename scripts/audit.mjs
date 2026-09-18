#!/usr/bin/env node
/**
 * audit.mjs — produce a paste-able snapshot of the repo so it can be reviewed
 * against the locked decisions in AGENTS.md.
 *
 *   node scripts/audit.mjs > AUDIT.md
 *
 * SAFETY: prints environment variable NAMES only, never values. Reads nothing
 * outside the repo. Writes nothing. Run it from the repo root.
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { join, relative, extname } from 'node:path'

const ROOT = process.cwd()
const SKIP = new Set(['node_modules', '.next', '.git', 'dist', 'build', '.vercel', 'coverage', '.turbo'])
const out = []
const p = (s = '') => out.push(s)
const read = (f) => { try { return readFileSync(join(ROOT, f), 'utf8') } catch { return null } }
const sh = (c) => { try { return execSync(c, { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim() } catch { return null } }

function walk(dir, depth = 0, acc = []) {
  let entries
  try { entries = readdirSync(dir) } catch { return acc }
  for (const name of entries.sort()) {
    if (SKIP.has(name) || name.startsWith('.DS')) continue
    const full = join(dir, name)
    let st
    try { st = statSync(full) } catch { continue }
    acc.push({ path: relative(ROOT, full), dir: st.isDirectory(), size: st.size, depth })
    if (st.isDirectory() && depth < 5) walk(full, depth + 1, acc)
  }
  return acc
}

const tree = walk(ROOT)
const files = tree.filter((t) => !t.dir)
const code = files.filter((f) => ['.ts', '.tsx', '.js', '.jsx', '.mjs'].includes(extname(f.path)))

p('# AUDIT.md')
p('')
p(`Generated ${new Date().toISOString()}`)
p('')

// ---------------------------------------------------------------- 1. identity
p('## 1. Repo')
p('')
p('```')
p(`branch     ${sh('git rev-parse --abbrev-ref HEAD') ?? '(not a git repo)'}`)
p(`remote     ${sh('git remote get-url origin') ?? '(none)'}`)
p(`commits    ${sh('git rev-list --count HEAD') ?? '0'}`)
p(`last       ${sh('git log -1 --format=%s') ?? '(none)'}`)
const dirty = sh('git status --porcelain')
p(`uncommitted ${dirty ? dirty.split('\n').length + ' file(s)' : 'none'}`)
p(`files      ${files.length} (excluding node_modules/.next/.git)`)
p('```')
p('')

// ------------------------------------------------------------ 2. package.json
p('## 2. package.json')
p('')
const pkgRaw = read('package.json')
if (!pkgRaw) p('> **MISSING** — no package.json at repo root.')
else {
  const pkg = JSON.parse(pkgRaw)
  const deps = { ...pkg.dependencies, ...pkg.devDependencies }
  const want = ['next', 'react', 'react-dom', 'typescript', 'tailwindcss', '@tailwindcss/postcss', '@heroui/react', '@heroui/theme', 'mapbox-gl', '@types/mapbox-gl', '@supabase/supabase-js']
  p('```')
  p(`packageManager  ${pkg.packageManager ?? '(not pinned)'}`)
  p('')
  p('expected:')
  for (const d of want) p(`  ${d.padEnd(24)} ${deps[d] ?? '— not installed'}`)
  const extra = Object.keys(deps).filter((d) => !want.includes(d) && !d.startsWith('@types/') && !d.startsWith('eslint'))
  p('')
  p(`other deps: ${extra.join(', ') || '(none)'}`)
  p('')
  p('scripts:')
  for (const [k, v] of Object.entries(pkg.scripts ?? {})) p(`  ${k.padEnd(12)} ${v}`)
  p('```')
  p('')
  const locks = ['package-lock.json', 'pnpm-lock.yaml', 'yarn.lock', 'bun.lockb'].filter((f) => existsSync(join(ROOT, f)))
  p(`Lockfiles present: **${locks.join(', ') || 'NONE'}**${locks.length > 1 ? ' ⚠️ more than one' : ''}`)
  p('')
}

// ------------------------------------------------------------------ 3. config
p('## 3. Config files')
p('')
const configs = ['next.config.ts', 'next.config.mjs', 'next.config.js', 'tsconfig.json', 'postcss.config.mjs', 'postcss.config.js', 'tailwind.config.ts', 'tailwind.config.js', 'middleware.ts', '.nvmrc', 'vercel.json']
for (const c of configs) {
  const body = read(c)
  if (!body) continue
  p(`### ${c}`)
  p('```')
  p(body.length > 2500 ? body.slice(0, 2500) + '\n… truncated' : body)
  p('```')
  p('')
}
if (existsSync(join(ROOT, 'tailwind.config.ts')) || existsSync(join(ROOT, 'tailwind.config.js'))) {
  p('> ⚠️ A `tailwind.config` file exists. Tailwind v4 configures through CSS; check this is intentional.')
  p('')
}

// -------------------------------------------------------------------- 4. tree
p('## 4. File tree')
p('')
p('```')
for (const t of tree) {
  if (t.depth > 3) continue
  p('  '.repeat(t.depth) + (t.dir ? t.path.split('/').pop() + '/' : t.path.split('/').pop()))
}
p('```')
p('')

// ------------------------------------------------------------------- 5. router
p('## 5. Router and server/client boundary')
p('')
const hasApp = existsSync(join(ROOT, 'app')) || existsSync(join(ROOT, 'src/app'))
const hasPages = existsSync(join(ROOT, 'pages')) || existsSync(join(ROOT, 'src/pages'))
p(`- App Router: **${hasApp ? 'yes' : 'NO'}**`)
p(`- Pages Router present: ${hasPages ? '⚠️ **yes**' : 'no'}`)
p('')

const EXEMPT = /(^|\/)(layout\.tsx|route\.ts|route\.tsx|middleware\.ts)$/
const tsx = code.filter((f) => /(^|\/)(app|src)\//.test(f.path) && /\.tsx?$/.test(f.path))
const missingUseClient = [], hasUseServer = [], asyncComponents = []
for (const f of tsx) {
  const body = read(f.path) ?? ''
  const head = body.slice(0, 400)
  if (/['"]use server['"]/.test(body)) hasUseServer.push(f.path)
  if (EXEMPT.test(f.path)) continue
  if (!/^\s*['"]use client['"]/m.test(head)) missingUseClient.push(f.path)
  if (/export\s+default\s+async\s+function/.test(body)) asyncComponents.push(f.path)
}
p(`Files under app/ or src/ missing \`"use client"\` (layout.tsx, route.ts, middleware.ts exempt): **${missingUseClient.length}**`)
if (missingUseClient.length) { p('```'); missingUseClient.slice(0, 40).forEach((f) => p('  ' + f)); p('```') }
p('')
p(`\`"use server"\` found in: ${hasUseServer.length ? '⚠️ ' + hasUseServer.join(', ') : 'none'}`)
p(`\`export default async function\` (possible server component): ${asyncComponents.length ? '⚠️ ' + asyncComponents.join(', ') : 'none'}`)
p('')

// ---------------------------------------------------------------------- 6. css
p('## 6. Styling')
p('')
const cssFiles = files.filter((f) => f.path.endsWith('.css'))
for (const f of cssFiles.slice(0, 6)) {
  const body = read(f.path) ?? ''
  p(`### ${f.path}`)
  p('```css')
  p(body.length > 1600 ? body.slice(0, 1600) + '\n… truncated' : body)
  p('```')
  p('')
}
const allCss = cssFiles.map((f) => read(f.path) ?? '').join('\n')
p('```')
p(`@import "tailwindcss"       ${/@import\s+["']tailwindcss["']/.test(allCss) ? 'present' : 'NOT FOUND'}`)
p(`heroui css imports          ${(allCss.match(/heroui/gi) ?? []).length} reference(s)`)
p(`@font-face declarations     ${(allCss.match(/@font-face/g) ?? []).length}`)
p(`:root custom properties     ${(allCss.match(/--[a-z0-9-]+\s*:/gi) ?? []).length}`)
p('```')
p('')

// ------------------------------------------------------------------- 7. mapbox
p('## 7. Mapbox / PWA / fonts / images')
p('')
const allCode = code.map((f) => read(f.path) ?? '').join('\n')
const mapboxFiles = code.filter((f) => /mapbox/i.test(read(f.path) ?? ''))
p('```')
p(`mapbox-gl imported in       ${mapboxFiles.map((f) => f.path).join(', ') || '(nowhere)'}`)
p(`next/dynamic used           ${/from\s+['"]next\/dynamic['"]/.test(allCode) ? 'yes' : 'NO'}`)
p(`ssr: false present          ${/ssr\s*:\s*false/.test(allCode) ? 'yes' : 'NO'}`)
p('')
const manifest = ['public/manifest.json', 'public/manifest.webmanifest', 'app/manifest.ts', 'src/app/manifest.ts'].find((f) => existsSync(join(ROOT, f)))
p(`web manifest                ${manifest ?? 'NOT FOUND'}`)
if (manifest) {
  const m = read(manifest) ?? ''
  p(`  display: standalone       ${/standalone/.test(m) ? 'yes' : 'NO'}`)
  p(`  icons                     ${(m.match(/"src"/g) ?? []).length}`)
}
const layout = ['app/layout.tsx', 'src/app/layout.tsx'].find((f) => existsSync(join(ROOT, f)))
if (layout) {
  const l = read(layout) ?? ''
  p('')
  p(`layout.tsx                  ${layout}`)
  p(`  viewport export           ${/export\s+const\s+viewport/.test(l) ? 'yes' : 'NO'}`)
  p(`  viewportFit / viewport-fit ${/viewport-?[Ff]it/.test(l) ? 'yes' : 'NO'}`)
  p(`  appleWebApp / apple-mobile ${/apple/i.test(l) ? 'yes' : 'NO'}`)
  p(`  themeColor                ${/themeColor|theme-color/.test(l) ? 'yes' : 'NO'}`)
} else p('\nlayout.tsx                  NOT FOUND')
p('')
const fontFiles = files.filter((f) => /\.(woff2?|ttf|otf)$/.test(f.path))
p(`font files in repo          ${fontFiles.length}`)
fontFiles.slice(0, 12).forEach((f) => p(`  ${f.path} (${Math.round(f.size / 1024)} kB)`))
const imgFiles = files.filter((f) => /^public\/images\//.test(f.path))
p(`public/images               ${imgFiles.length} file(s)`)
p('```')
p('')

// --------------------------------------------------------------------- 8. env
p('## 8. Environment variables — NAMES ONLY')
p('')
const envNames = new Set()
for (const f of ['.env', '.env.local', '.env.development', '.env.production']) {
  const body = read(f)
  if (!body) continue
  body.split('\n').forEach((line) => {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=/)
    if (m) envNames.add(`${m[1]}  (in ${f})`)
  })
}
const referenced = new Set()
for (const m of allCode.matchAll(/process\.env\.([A-Z0-9_]+)/g)) referenced.add(m[1])
p('```')
p('defined locally:')
p(envNames.size ? [...envNames].map((s) => '  ' + s).join('\n') : '  (none found)')
p('')
p('referenced in code:')
p(referenced.size ? [...referenced].map((s) => '  ' + s).join('\n') : '  (none)')
p('```')
p('')
p('> Values are never printed. Confirm separately that each name above is also set in Vercel.')
p('')

// ------------------------------------------------------------------- 9. gitignore
p('## 9. .gitignore')
p('')
const gi = read('.gitignore')
p('```')
p(gi ? gi.trim() : '(no .gitignore)')
p('```')
const tracked = sh('git ls-files') ?? ''
const leaked = tracked.split('\n').filter((f) => /^\.env($|\.)/.test(f) || /\.env\.local$/.test(f))
p('')
p(leaked.length ? `> 🚨 **env files are tracked by git: ${leaked.join(', ')}** — remove and rotate keys.` : '> No env files tracked by git.')
p('')

// ------------------------------------------------------------- 10. agent docs
p('## 10. Agent docs and data layer')
p('')
p('```')
for (const f of ['AGENTS.md', 'CLAUDE.md', 'README.md', 'docs/BUILD_ORDER.md', 'docs/CURATION.md', 'data/places.csv', 'src/data/seed.ts', 'src/data/places.ts', 'src/data/vocab.ts', 'src/lib/schedule.ts', 'src/lib/geo.ts', 'scripts/build-places.mjs']) {
  p(`${existsSync(join(ROOT, f)) ? '✓' : '·'} ${f}`)
}
p('```')
p('')
const claude = read('CLAUDE.md')
if (claude) { p('CLAUDE.md contents:'); p('```'); p(claude.trim().slice(0, 400)); p('```'); p('') }

// ---------------------------------------------------------------- 11. verify
p('## 11. Gate checks — run these and paste the result')
p('')
p('```')
p('npm run build')
p('npx tsc --noEmit')
p('```')
p('')
p('Neither is run by this script: a build takes too long and its output is')
p('the thing that actually matters. Paste the last 20 lines of each.')
p('')

// ---------------------------------------------------------- 12. quick flags
p('## 12. Automatic flags')
p('')
const flags = []
if (!hasApp) flags.push('No App Router — `app/` directory not found.')
if (hasPages) flags.push('Pages Router present alongside App Router.')
if (missingUseClient.length) flags.push(`${missingUseClient.length} component file(s) missing "use client".`)
if (hasUseServer.length) flags.push('"use server" found — server actions are out of scope.')
if (!manifest) flags.push('No web manifest — the PWA cannot install without browser chrome.')
if (!/ssr\s*:\s*false/.test(allCode) && mapboxFiles.length) flags.push('Mapbox imported but no `ssr: false` — the Vercel build will likely fail.')
if (!fontFiles.length) flags.push('No font files in the repo.')
if (leaked.length) flags.push('Env file tracked by git — rotate those keys.')
if (existsSync(join(ROOT, 'tailwind.config.ts')) || existsSync(join(ROOT, 'tailwind.config.js'))) flags.push('tailwind.config present — unexpected under Tailwind v4.')
p(flags.length ? flags.map((f) => `- ⚠️ ${f}`).join('\n') : '- None.')
p('')

console.log(out.join('\n'))
