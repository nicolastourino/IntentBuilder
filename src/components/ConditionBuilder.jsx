import React, { useState, useMemo } from 'react'
import { useC } from '../theme/index.js'
import { IS, IS_SM, IS_TA } from '../constants/index.js'
import { uid } from '../utils/misc.js'

const COND_OPS = [
  { v: '=== true',  l: 'es verdadero',         nv: false },
  { v: '=== false', l: 'es falso',              nv: false },
  { v: '!== null',  l: 'existe (no es nulo)',   nv: false },
  { v: '=== null',  l: 'no existe (es nulo)',   nv: false },
  { v: '>',         l: 'mayor que',             nv: true  },
  { v: '<',         l: 'menor que',             nv: true  },
  { v: '>=',        l: 'mayor o igual que',     nv: true  },
  { v: '<=',        l: 'menor o igual que',     nv: true  },
  { v: '===',       l: 'igual a (===)',          nv: true  },
  { v: '!==',       l: 'distinto de (!==)',      nv: true  },
]
const FIELD_CHIPS = ['success','data','data.length','message','error','code','result','id','status','count','total']
const SPECIAL_OPS = ['=== true','=== false','=== null','!== null']

const makeBase = r => {
  if (r.src === 'input')    return 'payload.input'
  if (r.src === 'variable') return r.varName || 'myVar'
  const sn = String(r.src || '').replace('step:', '')
  return `payload.stepResults.filter(sr => sr.step == ${sn})[0].value`
}

const makeRuleExpr = r => {
  const base = makeBase(r)
  const fp   = r.field ? `.${r.field}` : ''
  const full = base + fp
  if (SPECIAL_OPS.includes(r.op)) return `${full} ${r.op}`
  return `${full} ${r.op} ${r.val || '0'}`
}

const makeGroupExpr = group => {
  if (!group.rules || !group.rules.length) return ''
  const parts = group.rules.map(makeRuleExpr)
  if (parts.length === 1) return parts[0]
  return `(${parts.join(` ${group.comb} `)})`
}

const makeFullExpr = (groups, outerComb) => {
  const exprs = (groups || []).map(makeGroupExpr).filter(Boolean)
  if (!exprs.length) return ''
  if (exprs.length === 1) return exprs[0]
  return exprs.join(` ${outerComb} `)
}

const parseSingleRule = part => {
  const sm = part.match(/^payload\.stepResults\.filter\(sr => sr\.step == (\d+)\)\[0\]\.value\.?([\w.]*?)\s*(===|!==|==|!=|>=|<=|>|<)\s*(.+)$/)
  if (sm) {
    let op = sm[3], val = sm[4].trim()
    if (op === '===' && val === 'true')  { op = '=== true';  val = '' }
    else if (op === '===' && val === 'false') { op = '=== false'; val = '' }
    else if (op === '===' && val === 'null')  { op = '=== null';  val = '' }
    else if (op === '!==' && val === 'null')  { op = '!== null';  val = '' }
    return { src: `step:${sm[1]}`, field: sm[2] || '', op, val }
  }
  const im = part.match(/^payload\.input\.?([\w.]*?)\s*(===|!==|==|!=|>=|<=|>|<)\s*(.+)$/)
  if (im) {
    let op = im[2], val = im[3].trim()
    if (op === '===' && val === 'true')  { op = '=== true';  val = '' }
    else if (op === '===' && val === 'false') { op = '=== false'; val = '' }
    else if (op === '===' && val === 'null')  { op = '=== null';  val = '' }
    else if (op === '!==' && val === 'null')  { op = '!== null';  val = '' }
    return { src: 'input', field: im[1] || '', op, val }
  }
  return null
}

export const parseCondExpr = expr => {
  if (!expr || !expr.trim()) return { rules: [], comb: '&&', ok: true }
  let comb = '&&', parts = [expr.trim()]
  if (expr.includes(' && ')) { comb = '&&'; parts = expr.split(' && ').map(p => p.trim().replace(/^\(|\)$/g, '')) }
  else if (expr.includes(' || ')) { comb = '||'; parts = expr.split(' || ').map(p => p.trim().replace(/^\(|\)$/g, '')) }
  const rules = []
  for (const part of parts) {
    const r = parseSingleRule(part.trim())
    if (!r) return { rules: [], comb, ok: false }
    rules.push(r)
  }
  return { rules, comb, ok: true }
}

const parseGroupedExpr = (expr, defRuleFn) => {
  if (!expr || !expr.trim()) return { groups: [], outerComb: '||', ok: true }
  const trimmed = expr.trim()
  const outerOrPat  = /\)\s*\|\|\s*\(/
  const outerAndPat = /\)\s*&&\s*\(/
  const hasOuterOr  = outerOrPat.test(trimmed)
  const hasOuterAnd = outerAndPat.test(trimmed)

  if (hasOuterOr || hasOuterAnd) {
    const outerComb = hasOuterOr ? '||' : '&&'
    let stripped = trimmed
    if (stripped.startsWith('(')) stripped = stripped.slice(1)
    if (stripped.endsWith(')'))   stripped = stripped.slice(0, -1)
    const groupStrs = stripped.split(hasOuterOr ? ' || ' : ' && ')
    const groups = []
    for (const gs of groupStrs) {
      const gStr = gs.trim().replace(/^\(|\)$/g, '')
      const innerComb = gStr.includes(' && ') ? '&&' : gStr.includes(' || ') ? '||' : '&&'
      const innerParts = innerComb === '&&' ? gStr.split(' && ') : gStr.split(' || ')
      const rules = []
      for (const p of innerParts) {
        const r = parseSingleRule(p.trim())
        if (!r) return { ok: false }
        rules.push(r)
      }
      groups.push({ id: uid(), comb: innerComb, rules })
    }
    return { groups, outerComb, ok: true }
  }

  const flat = parseCondExpr(trimmed)
  if (!flat.ok) return { ok: false }
  return {
    groups: [{ id: uid(), comb: flat.comb, rules: flat.rules.length ? flat.rules : [defRuleFn()] }],
    outerComb: '||', ok: true,
  }
}

const ConditionBuilder = ({ value, onChange, allSteps }) => {
  const C = useC()
  const defaultSrc = allSteps && allSteps.length ? `step:${allSteps[0].step}` : 'input'
  const defRule  = () => ({ id: uid(), src: defaultSrc, field: 'success', op: '=== true', val: '' })
  const defGroup = () => ({ id: uid(), comb: '&&', rules: [defRule()] })

  const init = useMemo(() => parseGroupedExpr(value, defRule), [])

  const [mode,      setMode]      = useState(!value || (init.ok && init.groups.length) ? 'visual' : 'advanced')
  const [groups,    setGroups]    = useState(init.ok && init.groups.length ? init.groups : [defGroup()])
  const [outerComb, setOuterComb] = useState(init.outerComb || '||')
  const [raw,       setRaw]       = useState(value || '')

  const sync = (grps, oc) => onChange(makeFullExpr(grps, oc))

  const addGroup    = ()           => { const ng = [...groups, defGroup()]; setGroups(ng); sync(ng, outerComb) }
  const removeGroup = gi           => { const ng = groups.filter((_, i) => i !== gi); setGroups(ng); sync(ng, outerComb) }
  const updGroupComb = (gi, c)     => { const ng = groups.map((g, i) => i === gi ? { ...g, comb: c } : g); setGroups(ng); sync(ng, outerComb) }
  const updOuterComb = c           => { setOuterComb(c); sync(groups, c) }
  const addRule     = gi           => { const ng = groups.map((g, i) => i === gi ? { ...g, rules: [...g.rules, defRule()] } : g); setGroups(ng); sync(ng, outerComb) }
  const remRule     = (gi, ri)     => { const ng = groups.map((g, i) => i === gi ? { ...g, rules: g.rules.filter((_, j) => j !== ri) } : g); setGroups(ng); sync(ng, outerComb) }
  const updRule     = (gi, ri, k, v) => { const ng = groups.map((g, i) => i === gi ? { ...g, rules: g.rules.map((r, j) => j === ri ? { ...r, [k]: v } : r) } : g); setGroups(ng); sync(ng, outerComb) }

  const toAdv = () => { setRaw(makeFullExpr(groups, outerComb)); setMode('advanced') }
  const toVis = () => {
    const p = parseGroupedExpr(raw, defRule)
    if (p.ok) {
      const grps = p.groups.length ? p.groups : [defGroup()]
      setGroups(grps); setOuterComb(p.outerComb)
      setMode('visual'); onChange(makeFullExpr(grps, p.outerComb))
    } else {
      alert('Expresion demasiado compleja. Simplifica o usa el editor JS.')
    }
  }

  const generatedExpr = mode === 'visual' ? makeFullExpr(groups, outerComb) : raw

  const srcLabel = src => {
    if (src === 'input')    return 'Input'
    if (src === 'variable') return 'Var'
    const sn = parseInt(String(src).replace('step:', ''))
    const s  = allSteps && allSteps.find(x => x.step === sn)
    return s ? `P${sn}·${s.title}` : `P${sn}`
  }

  const btnBase = { padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: 'none', transition: 'all .12s' }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12, gap: 8 }}>
        <div>
          <label style={{ fontSize: 11, fontWeight: 800, color: C.textMut, textTransform: 'uppercase', letterSpacing: '.07em' }}>Constructor de condicion</label>
          <div style={{ fontSize: 9, color: C.textMut, marginTop: 1, lineHeight: 1.4, opacity: .8 }}>Grupos: <span style={{ color: C.primary }}>(A Y B) O (C)</span></div>
        </div>
        <button onClick={mode === 'visual' ? toAdv : toVis}
          title={mode === 'visual' ? 'Editar la expresion JS directamente' : 'Volver al constructor visual'}
          style={{ ...btnBase, border: `1px solid ${C.border}`, background: 'transparent', color: C.textSec, padding: '3px 9px', whiteSpace: 'nowrap', flexShrink: 0 }}>
          {mode === 'visual' ? '</> JS' : '◈ Visual'}
        </button>
      </div>

      {mode === 'visual' && (
        <>
          {groups.length > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, padding: '8px 10px',
              background: 'rgba(59,154,240,0.06)', borderRadius: 8, border: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 11, color: C.textMut, flex: 1 }}>Los grupos se combinan con:</span>
              {[['&&', 'Y (AND)'], ['||', 'O (OR)']].map(([v, l]) => (
                <button key={v} onClick={() => updOuterComb(v)}
                  title={`Unir grupos con ${l}`}
                  style={{ ...btnBase, border: `1px solid ${outerComb === v ? C.primary : C.border}`,
                    background: outerComb === v ? 'rgba(59,154,240,.2)' : C.bgSec,
                    color: outerComb === v ? C.primary : C.textMut }}>
                  {l}
                </button>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {groups.map((group, gi) => (
              <React.Fragment key={group.id || gi}>
                {gi > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, height: 1, background: C.border }}/>
                    <span style={{ fontSize: 12, fontWeight: 800,
                      color: outerComb === '&&' ? C.primary : C.jump,
                      background: outerComb === '&&' ? 'rgba(59,154,240,.15)' : 'rgba(245,158,11,.15)',
                      padding: '2px 10px', borderRadius: 99,
                      border: `1px solid ${outerComb === '&&' ? C.border : 'rgba(245,158,11,.35)'}` }}>
                      {outerComb === '&&' ? 'Y tambien' : 'O bien'}
                    </span>
                    <div style={{ flex: 1, height: 1, background: C.border }}/>
                  </div>
                )}

                <div style={{ background: C.bgSec, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px',
                    borderBottom: `1px solid ${C.border}`, background: 'rgba(59,154,240,0.05)' }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: C.textSec, flex: 1 }}>Grupo {gi + 1}</span>
                    <span style={{ fontSize: 10, color: C.textMut }}>Reglas unidas por:</span>
                    {[['&&', 'AND'], ['||', 'OR']].map(([v, l]) => (
                      <button key={v} onClick={() => updGroupComb(gi, v)}
                        title={`Las reglas de este grupo se unen con ${l}`}
                        style={{ ...btnBase, padding: '2px 8px', fontSize: 10,
                          border: `1px solid ${group.comb === v ? C.primary : C.border}`,
                          background: group.comb === v ? 'rgba(59,154,240,.2)' : C.bgCard,
                          color: group.comb === v ? C.primary : C.textMut }}>
                        {l}
                      </button>
                    ))}
                    {groups.length > 1 && (
                      <button onClick={() => removeGroup(gi)} title="Eliminar este grupo"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMut + '88', fontSize: 14, padding: '2px 4px', borderRadius: 4 }}
                        onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                        onMouseLeave={e => e.currentTarget.style.color = C.textMut + '88'}>&#x2715;</button>
                    )}
                  </div>

                  <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {group.rules.map((r, ri) => {
                      const opMeta = COND_OPS.find(o => o.v === r.op) || COND_OPS[0]
                      return (
                        <React.Fragment key={r.id || ri}>
                          {ri > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <div style={{ flex: 1, height: 1, background: C.border }}/>
                              <span style={{ fontSize: 10, fontWeight: 800, color: C.textMut, padding: '0 4px' }}>
                                {group.comb === '&&' ? 'Y' : 'O'}
                              </span>
                              <div style={{ flex: 1, height: 1, background: C.border }}/>
                            </div>
                          )}
                          <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 11px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                              <div style={{ flex: '2 1 140px', minWidth: 120 }}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: C.textMut, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '.06em' }}>Origen</div>
                                <select value={r.src || 'input'} onChange={e => updRule(gi, ri, 'src', e.target.value)}
                                  title="Selecciona de donde viene el valor"
                                  style={{ ...IS_SM, width: '100%', cursor: 'pointer' }}>
                                  {(allSteps || []).map(s => <option key={s.step} value={`step:${s.step}`}>Paso {s.step} — {s.title || 'sin nombre'}</option>)}
                                  <option value="input">Input del intent</option>
                                  <option value="variable">Variable personalizada</option>
                                </select>
                              </div>
                              {r.src === 'variable' && (
                                <div style={{ flex: '1 1 90px', minWidth: 80 }}>
                                  <div style={{ fontSize: 10, fontWeight: 700, color: C.textMut, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '.06em' }}>Nombre</div>
                                  <input value={r.varName || ''} onChange={e => updRule(gi, ri, 'varName', e.target.value)}
                                    placeholder="miVariable" title="Nombre exacto de la variable JS"
                                    style={{ ...IS_SM, width: '100%' }}/>
                                </div>
                              )}
                              <div style={{ flex: '1 1 90px', minWidth: 80 }}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: C.textMut, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '.06em' }}>Campo</div>
                                <input value={r.field || ''} onChange={e => updRule(gi, ri, 'field', e.target.value)}
                                  placeholder="success"
                                  title="Propiedad del objeto .value del paso"
                                  style={{ ...IS_SM, width: '100%' }}/>
                              </div>
                              <div style={{ flex: '2 1 140px', minWidth: 120 }}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: C.textMut, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '.06em' }}>Condicion</div>
                                <select value={r.op} onChange={e => updRule(gi, ri, 'op', e.target.value)}
                                  title="Operador de comparacion"
                                  style={{ ...IS_SM, width: '100%', cursor: 'pointer' }}>
                                  {COND_OPS.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                                </select>
                              </div>
                              {opMeta.nv && (
                                <div style={{ flex: '1 1 70px', minWidth: 60 }}>
                                  <div style={{ fontSize: 10, fontWeight: 700, color: C.textMut, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '.06em' }}>Valor</div>
                                  <input value={r.val || ''} onChange={e => updRule(gi, ri, 'val', e.target.value)}
                                    placeholder="0" title="Valor a comparar"
                                    style={{ ...IS_SM, width: '100%' }}/>
                                </div>
                              )}
                              {group.rules.length > 1 && (
                                <button onClick={() => remRule(gi, ri)} title="Eliminar esta regla"
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMut + '88', fontSize: 14, padding: '4px', borderRadius: 4, alignSelf: 'flex-end', flexShrink: 0, marginBottom: 1 }}
                                  onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                                  onMouseLeave={e => e.currentTarget.style.color = C.textMut + '88'}>&#x2715;</button>
                              )}
                            </div>

                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
                              {FIELD_CHIPS.map(f => (
                                <button key={f} onClick={() => updRule(gi, ri, 'field', f)}
                                  title={`Usar campo "${f}"`}
                                  style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, cursor: 'pointer',
                                    border: `1px solid ${r.field === f ? C.primary : C.border}`,
                                    background: r.field === f ? 'rgba(59,154,240,.18)' : C.bgSec,
                                    color: r.field === f ? C.primary : C.textMut, transition: 'all .1s' }}>
                                  {f}
                                </button>
                              ))}
                            </div>

                            <div style={{ padding: '4px 8px', background: 'rgba(59,154,240,.07)', borderRadius: 6, fontSize: 11, color: C.textSec, fontStyle: 'italic' }}>
                              <span style={{ color: C.primary, fontWeight: 700, fontStyle: 'normal' }}>{srcLabel(r.src)}</span>
                              {r.field && <span style={{ color: C.textMut }}>{' → '}<span style={{ color: C.textSec, fontStyle: 'normal' }}>{r.field}</span></span>}
                              <span style={{ color: C.textMut }}>{' '}{COND_OPS.find(o => o.v === r.op)?.l || r.op}</span>
                              {opMeta.nv && r.val && <span style={{ color: C.textSec, fontStyle: 'normal' }}>{' '}{r.val}</span>}
                            </div>
                          </div>
                        </React.Fragment>
                      )
                    })}

                    <button onClick={() => addRule(gi)}
                      title="Agregar otra regla a este grupo"
                      style={{ padding: '5px', border: `1.5px dashed rgba(59,154,240,.35)`, borderRadius: 7,
                        background: 'rgba(59,154,240,.04)', color: C.textMut, fontWeight: 600, fontSize: 11, cursor: 'pointer', transition: 'all .12s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,154,240,.12)'; e.currentTarget.style.color = C.primary }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(59,154,240,.04)'; e.currentTarget.style.color = C.textMut }}>
                      + Regla en este grupo
                    </button>
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>

          <button onClick={addGroup}
            title="Agregar un nuevo grupo"
            style={{ width: '100%', marginTop: 10, padding: '7px', border: `1.5px dashed ${C.primary}`, borderRadius: 8,
              background: 'rgba(59,154,240,.07)', color: C.primary, fontWeight: 700, fontSize: 12, cursor: 'pointer', marginBottom: 4, transition: 'background .12s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,154,240,.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(59,154,240,.07)'}>
            + Agregar grupo
          </button>
          <div style={{ fontSize: 10, color: C.textMut, textAlign: 'center', marginBottom: 8 }}>
            Ejemplo: Grupo 1 <span style={{ color: C.primary }}>(A Y B)</span> O bien Grupo 2 <span style={{ color: C.primary }}>(C Y D)</span>
          </div>
        </>
      )}

      {mode === 'advanced' && (
        <>
          <div style={{ fontSize: 11, color: C.textMut, marginBottom: 6, lineHeight: 1.5, padding: '7px 10px', background: 'rgba(59,154,240,0.06)', borderRadius: 7, border: `1px solid ${C.border}` }}>
            Editor JS directo. Usa <code style={{ color: C.primary, fontSize: 10 }}>&&</code> para AND, <code style={{ color: C.jump, fontSize: 10 }}>||</code> para OR, y parentesis para grupos.
          </div>
          <textarea value={raw} onChange={e => { setRaw(e.target.value); onChange(e.target.value) }}
            placeholder="payload.stepResults.filter(sr => sr.step == 0)[0].value.success === true"
            style={{ ...IS_TA, minHeight: 80, marginBottom: 8 }}/>
        </>
      )}

      {generatedExpr && (
        <div style={{ background: C.bgBase, border: `1px solid ${C.border}`, borderRadius: 7, padding: '8px 10px', marginTop: 4 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.textMut, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.07em' }}>Expresion JS generada</div>
          <code style={{ fontSize: 10, color: '#4ade80', wordBreak: 'break-all', lineHeight: 1.7, display: 'block', fontFamily: 'monospace' }}>{generatedExpr}</code>
        </div>
      )}
    </div>
  )
}

export default ConditionBuilder
