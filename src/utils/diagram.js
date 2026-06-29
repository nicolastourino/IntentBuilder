import { STEP_CFG } from '../constants/index.js'

const D = { NW: 200, SW: 230, NH: 52, SH: 60, VG: 56, HG: 30, SGP: 72 }

const _bW = ms => ms && ms.length ? Math.max(...ms.map(_mW)) : D.NW
const _mW = m => m.type === 'conditional'
  ? Math.max(D.NW, _bW(m.conditionTrueModules) + _bW(m.conditionFalseModules) + D.HG)
  : D.NW

const _bH = ms => {
  if (!ms || !ms.length) return 0
  return ms.reduce((h, m, i) => h + _mH(m) + (i < ms.length - 1 ? D.VG : 0), 0)
}
const _mH = m => m.type === 'conditional'
  ? D.NH + D.VG + Math.max(_bH(m.conditionTrueModules || []), _bH(m.conditionFalseModules || []))
  : D.NH

const uid = () => Math.random().toString(36).slice(2)

export const buildDiagram = steps => {
  const nodes = [], edges = [], stepSeqEdges = []
  const maxW = Math.max(...steps.map(s => s.modules.length ? _bW(s.modules) : D.SW), D.SW)
  const CW = Math.max(maxW + 160, D.SW + 200)
  const CX = CW / 2

  const branch = (mods, cx, y0, pfx, si, stepNum) => {
    let y = y0, prev = null, first = null
    ;(mods || []).forEach((m, i) => {
      const id = `${pfx}${i}`
      if (m.type === 'conditional') {
        const tw = _bW(m.conditionTrueModules || [])
        const fw = _bW(m.conditionFalseModules || [])
        const tCX = cx - (fw + D.HG) / 2
        const fCX = cx + (tw + D.HG) / 2
        nodes.push({ id, role: 'cond', m, x: cx - D.NW / 2, y, w: D.NW, h: D.NH, cx, si, stepNum })
        if (!first) first = id
        if (prev) edges.push({ f: prev, t: id })
        const bY = y + D.NH + D.VG
        const tf = branch(m.conditionTrueModules || [],  tCX, bY, `${id}T`, si, stepNum)
        const ff = branch(m.conditionFalseModules || [], fCX, bY, `${id}F`, si, stepNum)
        if (tf) edges.push({ f: id, t: tf, lbl: 'SI',  col: '#10b981', toCX: tCX })
        if (ff) edges.push({ f: id, t: ff, lbl: 'NO', col: '#f87171', toCX: fCX })
        y += _mH(m) + D.VG; prev = id
      } else {
        nodes.push({ id, role: m.type, m, x: cx - D.NW / 2, y, w: D.NW, h: D.NH, cx, si, stepNum })
        if (!first) first = id
        if (prev) edges.push({ f: prev, t: id })
        y += D.NH + D.VG; prev = id
      }
    })
    return first
  }

  let gY = 30
  const secs = []
  steps.forEach((step, si) => {
    const sid = `S${step.step}`
    const acc = (STEP_CFG[step.type] || STEP_CFG.obtainValue).ic
    const sY = gY
    nodes.push({ id: sid, role: 'step', step, x: CX - D.SW / 2, y: gY, w: D.SW, h: D.SH, cx: CX, acc, si })
    if (step.modules.length > 0) {
      const fid = branch(step.modules, CX, gY + D.SH + D.VG, sid + 'm', si, step.step)
      if (fid) edges.push({ f: sid, t: fid, col: acc })
      gY += D.SH + D.VG + _bH(step.modules) + D.SGP
    } else {
      gY += D.SH + D.SGP
    }
    secs.push({ sid, sY, eY: gY - D.SGP, type: step.type })
  })

  const PAD = 16, TPAD = 36
  const stepBounds = steps.map((_, si) => {
    const sn = nodes.filter(n => n.si === si)
    if (!sn.length) return null
    const minX = Math.min(...sn.map(n => n.x)) - PAD
    const minY = Math.min(...sn.map(n => n.y)) - TPAD
    const maxX = Math.max(...sn.map(n => n.x + n.w)) + PAD
    const maxY = Math.max(...sn.map(n => n.y + n.h)) + PAD
    const sNode = sn.find(n => n.role === 'step')
    const acc = sNode?.acc || '#3B9AF0'
    const stype = sNode?.step?.type || 'obtainValue'
    const stitle = sNode?.step?.title || ''
    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY, acc, stype, stitle }
  })

  const validBounds = stepBounds.filter(Boolean)
  if (validBounds.length > 0) {
    const gMinX = Math.min(...validBounds.map(b => b.x))
    const gMaxX = Math.max(...validBounds.map(b => b.x + b.w))
    stepBounds.forEach(b => { if (b) { b.x = gMinX; b.w = gMaxX - gMinX } })
  }

  for (let i = 0; i < steps.length - 1; i++) {
    const b0 = stepBounds[i], b1 = stepBounds[i + 1]
    stepSeqEdges.push({
      x:  CX,
      y1: b0 ? b0.y + b0.h : secs[i].eY,
      y2: b1 ? b1.y        : secs[i + 1].sY,
    })
  }

  const nm = Object.fromEntries(nodes.map(n => [n.id, n]))
  const contentLeft  = validBounds.length ? Math.min(...validBounds.map(b => b.x))       : 0
  const contentRight = validBounds.length ? Math.max(...validBounds.map(b => b.x + b.w)) : CW
  return { nodes, edges, stepSeqEdges, stepBounds, totalH: gY + 60, CW, CX, nm, contentLeft, contentRight }
}
