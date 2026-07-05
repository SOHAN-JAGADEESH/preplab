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

// scale leading number + numbers inside "(n unit)" parentheticals
export function scaleText(text, f) {
  if (f === 1) return text
  let out = text.replace(/^(\d+\s*\/\s*\d+|\d+(?:\.\d+)?)/, (m) => fmtNum(parseNum(m) * f))
  out = out.replace(new RegExp('\\((\\d+(?:\\.\\d+)?)(\\s*)(' + UNITS + ')\\)', 'ig'),
    (m, num, sp, unit) => '(' + fmtNum(parseFloat(num) * f) + sp + unit + ')')
  return out
}

// split "1.5 Tsp Salt" -> {qty:"1.5 Tsp", name:"Salt"}
export function splitIng(text) {
  const m = text.match(new RegExp('^(\\d+\\s*\\/\\s*\\d+|\\d+(?:\\.\\d+)?)\\s*(' + UNITS + ')?\\s*', 'i'))
  if (m && m[0].trim()) return { qty: m[0].trim(), name: text.slice(m[0].length).trim() }
  return { qty: '', name: text }
}
