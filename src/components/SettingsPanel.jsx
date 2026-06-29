import React, { useState } from 'react'
import { useC } from '../theme/index.js'
import { IS, IS_SM, IS_TA, INPUT_TYPES } from '../constants/index.js'

const SettingsPanel = ({ intent, onChange, visible, onToggle }) => {
  const C = useC()
  const [open, setOpen] = useState({ g: true, i: true, t: false, c: false })
  const tog = k => setOpen(p => ({ ...p, [k]: !p[k] }))

  const addIn  = ()      => onChange({ ...intent, input: [...(intent.input || []), { name: '', type: 'String', required: false, notes: '', possibleValues: [] }] })
  const updIn  = (i, u)  => onChange({ ...intent, input: (intent.input || []).map((x, j) => j === i ? { ...x, ...u } : x) })
  const delIn  = i       => onChange({ ...intent, input: (intent.input || []).filter((_, j) => j !== i) })
  const addPV  = i       => updIn(i, { possibleValues: [...((intent.input || [])[i]?.possibleValues || []), { value: '', label: '' }] })
  const updPV  = (i, pi, u) => updIn(i, { possibleValues: ((intent.input || [])[i]?.possibleValues || []).map((pv, k) => k === pi ? { ...pv, ...u } : pv) })
  const delPV  = (i, pi) => updIn(i, { possibleValues: ((intent.input || [])[i]?.possibleValues || []).filter((_, k) => k !== pi) })
  const addTrig = ()      => onChange({ ...intent, triggers:   [...(intent.triggers || []), ''] })
  const updTrig = (i, v)  => onChange({ ...intent, triggers:   (intent.triggers || []).map((t, j) => j === i ? v : t) })
  const delTrig = i       => onChange({ ...intent, triggers:   (intent.triggers || []).filter((_, j) => j !== i) })
  const addCond = ()      => onChange({ ...intent, conditions: [...(intent.conditions || []), ''] })
  const updCond = (i, v)  => onChange({ ...intent, conditions: (intent.conditions || []).map((c, j) => j === i ? v : c) })
  const delCond = i       => onChange({ ...intent, conditions: (intent.conditions || []).filter((_, j) => j !== i) })

  const L  = ({ t })           => <label style={{ display: 'block', fontSize: 10, fontWeight: 800, color: C.textMut, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 5, marginTop: 12 }}>{t}</label>
  const SH = ({ k, title, count }) => (
    <button onClick={() => tog(k)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '11px 14px', background: 'none', border: 'none', borderBottom: `1px solid ${C.border}`,
      cursor: 'pointer', fontWeight: 700, fontSize: 13, color: C.textPri }}>
      <span>{title}{count != null ? ` (${count})` : ''}</span>
      <span style={{ fontSize: 11, color: C.textMut }}>{open[k] ? '▾' : '▸'}</span>
    </button>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'row', position: 'relative', flexShrink: 0 }}>
      <div style={{ width: visible ? 272 : 0, overflow: 'hidden', transition: 'width .2s', flexShrink: 0 }}>
        <div style={{ width: 272, background: C.bgCard, borderRight: `1px solid ${C.border}`, overflowY: 'auto', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px 0', borderBottom: `1px solid ${C.border}`, paddingBottom: 12 }}>
            <span style={{ fontWeight: 800, fontSize: 13, color: C.textPri }}>Ajustes</span>
            <button onClick={onToggle} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMut, fontSize: 16, padding: '0 2px' }} title="Ocultar ajustes">‹</button>
          </div>

          <SH k="g" title="General"/>
          {open.g && (
            <div style={{ padding: '2px 14px 14px' }}>
              <div style={{ fontSize: 10, color: C.textMut, lineHeight: 1.5, padding: '8px 0 4px' }}>Configuración general del intent</div>
              <L t="Nombre (Type)"/>
              <input value={intent.type || ''} onChange={e => onChange({ ...intent, type: e.target.value })} placeholder="miIntent" style={IS}/>
              <L t="Descripción"/>
              <textarea value={intent.description || ''} onChange={e => onChange({ ...intent, description: e.target.value })} placeholder="Descripción..." style={{ ...IS_TA, minHeight: 44 }}/>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, padding: '10px 12px',
                background: intent.canBeStarter ? 'rgba(59,154,240,.1)' : 'transparent',
                border: `1px solid ${intent.canBeStarter ? C.primary : C.border}`, borderRadius: 8, transition: 'all .15s' }}>
                <input type="checkbox" id="cbs2" checked={!!intent.canBeStarter}
                  onChange={e => onChange({ ...intent, canBeStarter: e.target.checked, badge: e.target.checked ? 'Starter' : (intent.badge === 'Starter' ? null : intent.badge) })}
                  style={{ width: 15, height: 15, cursor: 'pointer', accentColor: C.primary }}/>
                <label htmlFor="cbs2" style={{ fontSize: 12, color: C.textSec, cursor: 'pointer', flex: 1 }}>
                  Puede iniciar conversación
                  {intent.canBeStarter && <span style={{ fontSize: 10, color: C.primary, marginLeft: 6, fontWeight: 700 }}>· badge Starter</span>}
                </label>
              </div>
            </div>
          )}

          <SH k="i" title="Inputs" count={(intent.input || []).length}/>
          {open.i && (
            <div style={{ padding: '6px 14px 14px' }}>
              <div style={{ fontSize: 10, color: C.textMut, lineHeight: 1.5, padding: '4px 0 6px' }}>Acceso: <code style={{ color: C.primary, fontSize: 10 }}>input.nombre</code></div>
              {(intent.input || []).map((inp, i) => (
                <div key={i} style={{ background: C.bgSec, border: `1px solid ${C.border}`, borderRadius: 9, padding: '9px', marginBottom: 7 }}>
                  <div style={{ display: 'flex', gap: 5, marginBottom: 5, alignItems: 'center' }}>
                    <input value={inp.name} onChange={e => updIn(i, { name: e.target.value })} placeholder="nombre" style={{ ...IS_SM, flex: 2 }}/>
                    <select value={inp.type} onChange={e => updIn(i, { type: e.target.value })} style={{ ...IS_SM, flex: 1, cursor: 'pointer', paddingRight: 20, appearance: 'auto' }}>
                      {INPUT_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                    <button onClick={() => delIn(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMut, fontSize: 13, padding: '0 2px', transition: 'color .1s' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#f87171'} onMouseLeave={e => e.currentTarget.style.color = C.textMut}>✕</button>
                  </div>
                  <input value={inp.notes || ''} onChange={e => updIn(i, { notes: e.target.value })} placeholder="Notas del campo..." style={{ ...IS_SM, width: '100%', marginBottom: 6 }}/>
                  {(inp.possibleValues || []).map((pv, pi) => (
                    <div key={pi} style={{ display: 'flex', gap: 4, marginBottom: 4, alignItems: 'center' }}>
                      <input value={pv.value || ''} onChange={e => updPV(i, pi, { value: e.target.value })} placeholder="valor" style={{ ...IS_SM, flex: 1, fontSize: 10 }}/>
                      <input value={pv.label || ''} onChange={e => updPV(i, pi, { label: e.target.value })} placeholder="etiqueta" style={{ ...IS_SM, flex: 2, fontSize: 10 }}/>
                      <button onClick={() => delPV(i, pi)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMut, fontSize: 12, padding: '0 2px' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#f87171'} onMouseLeave={e => e.currentTarget.style.color = C.textMut}>✕</button>
                    </div>
                  ))}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: C.textSec, cursor: 'pointer' }}>
                      <input type="checkbox" checked={!!inp.required} onChange={e => updIn(i, { required: e.target.checked })} style={{ accentColor: C.primary }}/>Requerido
                    </label>
                    <button onClick={() => addPV(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, color: C.primary, fontWeight: 700 }}>+ Valor</button>
                  </div>
                </div>
              ))}
              <button onClick={addIn} style={{ width: '100%', padding: '6px', border: `1.5px dashed ${C.primary}`, borderRadius: 7, background: 'rgba(59,154,240,0.07)', color: C.primary, fontWeight: 700, fontSize: 11, cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,154,240,0.15)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(59,154,240,0.07)'}>
                + Agregar Input
              </button>
            </div>
          )}

          <SH k="t" title="Triggers" count={(intent.triggers || []).length}/>
          {open.t && (
            <div style={{ padding: '6px 14px 14px' }}>
              {(intent.triggers || []).map((tr, i) => (
                <div key={i} style={{ display: 'flex', gap: 4, marginBottom: 5, alignItems: 'flex-start' }}>
                  <textarea value={tr} onChange={e => updTrig(i, e.target.value)} placeholder="Cuándo se activa..."
                    style={{ ...IS_SM, flex: 1, resize: 'none', minHeight: 32, fontSize: 11, lineHeight: 1.4 }}/>
                  <button onClick={() => delTrig(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMut, fontSize: 13, padding: '2px', transition: 'color .1s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#f87171'} onMouseLeave={e => e.currentTarget.style.color = C.textMut}>✕</button>
                </div>
              ))}
              <button onClick={addTrig} style={{ width: '100%', padding: '5px', border: `1.5px dashed ${C.primary}`, borderRadius: 7, background: 'rgba(59,154,240,0.07)', color: C.primary, fontWeight: 700, fontSize: 11, cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,154,240,0.15)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(59,154,240,0.07)'}>
                + Añadir Trigger
              </button>
            </div>
          )}

          <SH k="c" title="Conditions" count={(intent.conditions || []).length}/>
          {open.c && (
            <div style={{ padding: '6px 14px 14px' }}>
              {(intent.conditions || []).map((cd, i) => (
                <div key={i} style={{ display: 'flex', gap: 4, marginBottom: 5, alignItems: 'flex-start' }}>
                  <textarea value={cd} onChange={e => updCond(i, e.target.value)} placeholder="Condición necesaria..."
                    style={{ ...IS_SM, flex: 1, resize: 'none', minHeight: 32, fontSize: 11, lineHeight: 1.4 }}/>
                  <button onClick={() => delCond(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMut, fontSize: 13, padding: '2px', transition: 'color .1s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#f87171'} onMouseLeave={e => e.currentTarget.style.color = C.textMut}>✕</button>
                </div>
              ))}
              <button onClick={addCond} style={{ width: '100%', padding: '5px', border: `1.5px dashed ${C.primary}`, borderRadius: 7, background: 'rgba(59,154,240,0.07)', color: C.primary, fontWeight: 700, fontSize: 11, cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,154,240,0.15)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(59,154,240,0.07)'}>
                + Añadir Condición
              </button>
            </div>
          )}
        </div>
      </div>
      {!visible && (
        <div onMouseEnter={onToggle} onClick={onToggle}
          style={{ width: 14, background: C.bgCard, borderRight: `1px solid ${C.border}`, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ color: C.textMut, fontSize: 10, writingMode: 'vertical-lr', userSelect: 'none', letterSpacing: 2 }}>AJUSTES</span>
        </div>
      )}
    </div>
  )
}

export default SettingsPanel
