import { MOD_META } from '../constants/index.js'

export const uid = () => Math.random().toString(36).slice(2)

export const ts = () => {
  const d = new Date()
  return d.toLocaleDateString('es') + ' ' + d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
}

export const getMeta = t => MOD_META[t] || { label: t, sub: '', icon: '?', ic: '#4E6A8E', ibg: 'rgba(111,168,176,.12)' }

export const isJumpVal = v =>
  (typeof v === 'number' || /^\d+$/.test(String(v || '').trim())) &&
  String(v || '').trim() !== ''

export const getAt = (obj, path) => path.reduce((a, k) => a?.[k], obj)

export const setAt = (obj, path, val) => {
  if (!path.length) return val
  const [k, ...rest] = path
  if (Array.isArray(obj)) {
    const r = [...obj]
    r[k] = setAt(r[k], rest, val)
    return r
  }
  return { ...obj, [k]: setAt(obj?.[k], rest, val) }
}
