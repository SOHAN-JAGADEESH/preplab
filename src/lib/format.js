export const UNITS = 'g|kg|ml|l|oz|tbsp|tbs|tsp|cup|cups|can|cans|clove|cloves|slice|slices|sheet|sheets|block|handful|pinch'

export function fmtNum(n) {
  n = Math.round(n * 100) / 100
  if (Math.abs(n - Math.round(n)) < 0.04) return String(Math.round(n))
  return String(n)
}
export function parseNum(s) {
  s = s.replace(/\s/g, '')
  if (s.includes('/')) {
    const [a, b] = s.split('/')
    return parseFloat(a) / parseFloat(b)
  }
  return parseFloat(s)
}

// round a scaled quantity to a kitchen-sensible step for its unit
const step = (v, s) => Math.round(v / s) * s
export function roundQty(v, unit) {
  unit = (unit || '').toLowerCase()
  if (unit === 'g' || unit === 'ml') {
    if (v >= 100) return step(v, 10)
    if (v >= 20) return step(v, 5)
    if (v >= 3) return Math.round(v)
    return step(v, 0.5)
  }
  if (unit === 'kg' || unit === 'l') return step(v, 0.1)
  if (unit === 'oz') return step(v, 0.5)
  if (['tsp', 'tbsp', 'tbs'].includes(unit)) {
    if (v >= 8) return Math.round(v)
    if (v >= 3) return step(v, 0.5)
    return step(v, 0.25)
  }
  if (unit === 'cup' || unit === 'cups') return step(v, 0.25)
  // counts, cloves, slices, cans, sheets, blocks…
  return step(v, 0.5)
}

// scale leading number + numbers inside "(n unit)" parentheticals
export function scaleText(text, f) {
  if (f === 1) return text
  const lead = new RegExp('^(\\d+\\s*\\/\\s*\\d+|\\d+(?:\\.\\d+)?)(\\s*)(' + UNITS + ')?\\b', 'i')
  let out = text.replace(lead, (m, num, sp, unit) => fmtNum(roundQty(parseNum(num) * f, unit)) + sp + (unit || ''))
  out = out.replace(new RegExp('\\((\\d+(?:\\.\\d+)?)(\\s*)(' + UNITS + ')\\)', 'ig'),
    (m, num, sp, unit) => '(' + fmtNum(roundQty(parseFloat(num) * f, unit)) + sp + unit + ')')
  return out
}

// split "1.5 Tsp Salt" -> {qty:"1.5 Tsp", name:"Salt"}
export function splitIng(text) {
  const m = text.match(new RegExp('^(\\d+\\s*\\/\\s*\\d+|\\d+(?:\\.\\d+)?)\\s*(' + UNITS + ')?\\s*', 'i'))
  if (m && m[0].trim()) return { qty: m[0].trim(), name: text.slice(m[0].length).trim() }
  return { qty: '', name: text }
}
