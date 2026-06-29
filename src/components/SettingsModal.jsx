import React, { useState, useRef, useEffect } from 'react'
import { useC, useM } from '../theme/index.js'
import { IS, IS_SM, IS_TA, INPUT_TYPES } from '../constants/index.js'

const SettingsModal = ({ intent: initIntent, onChange, onClose }) => {
  const C = useC()
  const M = useM()
  const [tab,     setTab]     = useState(0)
  const origRef               = useRef(JSON.stringify(initIntent))
  const [local,   setLocal]   = useState({ ...initIntent })
  const [confirm, setConfirm] = useState(false)
  const [saved,   setSaved]   = useState(false)

  const upd = patch => { const n = { ...local, ...patch }; setLocal(n); onChange(n); setSaved(false) }

  const isDirty = JSON.stringify(local) !== origRef.current

  const save = () => {
    origRef.current = JSON.stringify(local)
    onChange(local)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const tryClose = () => { if (isDirty) { setConfirm(true); return } onClose() }

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') tryClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [local])

  const addIn   = ()         => upd({ input: [...(local.input || []), { name: '', type: 'String', required: false, notes: '', possibleValues: [] }] })
  const updIn   = (i, u)     => upd({ input: (local.input || []).map((x, j) => j === i ? { ...x, ...u } : x) })
  const delIn   = i          => upd({ input: (local.input || []).filter((_, j) => j !== i) })
  const addPV   = i          => updIn(i, { possibleValues: [...((local.input || [])[i]?.possibleValues || []), { value: '', label: '' }] })
  const updPV   = (i, pi, u) => updIn(i, { possibleValues: ((local.input || [])[i]?.possibleValues || []).map((pv, k) => k === pi ? { ...pv, ...u } : pv) })
  const delPV   = (i, pi)    => updIn(i, { possibleValues: ((local.input || [])[i]?.possibleValues || []).filter((_, k) => k !== pi) })
  const addTrig = ()         => upd({ triggers:   [...(local.triggers || []), ''] })
  const updTrig = (i, v)     => upd({ triggers:   (local.triggers || []).map((t, j) => j === i ? v : t) })
  const delTrig = i          => upd({ triggers:   (local.triggers || []).filter((_, j) => j !== i) })
  const addCond = ()         => upd({ conditions: [...(local.conditions || []), ''] })
  const updCond = (i, v)     => upd({ conditions: (local.conditions || []).map((c, j) => j === i ? v : c) })
  const delCond = i          => upd({ conditions: (local.conditions || []).filter((_, j) => j !== i) })

  const SecLabel = ({ children, count }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${C.border}` }}>
      <span style={{ fontSize: 11, fontWeight: 800, color: C.textMut, letterSpacing: '.1em', textTransform: 'uppercase' }}>{children}</span>
      {count != null && <span style={{ background: C.primary + '22', color: C.primary, fontSize: 10, fontWeight: 800, padding: '1px 7px', borderRadius: 99 }}>{count}</span>}
    </div>
  )

  const FieldLabel = ({ children }) => (
    <div style={{ fontSize: 10, fontWeight: 700, color: C.textMut, letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 4, marginTop: 10 }}>{children}</div>
  )

  const AddBtn = ({ onClick, label }) => (
    <button onClick={onClick} style={{ width: '100%', padding: '7px', marginTop: 8,
      border: `1.5px dashed ${C.primary}`, borderRadius: 8, background: 'rgba(59,154,240,0.06)',
      color: C.primary, fontWeight: 700, fontSize: 12, cursor: 'pointer', transition: 'background .12s' }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,154,240,0.14)'}
      onMouseLeave={e => e.currentTarget.style.background = 'rgba(59,154,240,0.06)'}>
      {label}
    </button>
  )

  const DelBtn = ({ onClick }) => (
    <button onClick={onClick} style={{ background: 'none', border: 'none', cursor: 'pointer',
      color: C.textMut, padding: '3px 5px', borderRadius: 4, fontSize: 13, lineHeight: 1, flexShrink: 0, transition: 'color .1s' }}
      onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
      onMouseLeave={e => e.currentTarget.style.color = C.textMut}>✕</button>
  )

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 800, display: 'flex', alignItems: M ? 'flex-end' : 'center', justifyContent: 'center', padding: M ? 0 : 20 }} className="fu">
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.6)' }} onClick={tryClose}/>

      {confirm && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,.35)', borderRadius: 14 }}>
          <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12,
            padding: '32px 32px 24px', width: 380, boxShadow: '0 16px 48px rgba(0,0,0,.5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <span style={{ fontWeight: 800, fontSize: 15, color: C.textPri }}>Cambios sin guardar</span>
            </div>
            <p style={{ fontSize: 13, color: C.textSec, margin: '0 0 24px', lineHeight: 1.6 }}>
              Los ajustes del intent tienen cambios sin guardar. ¿Qué querés hacer?
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirm(false)}
                style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${C.border}`, background: 'none',
                  color: C.textSec, fontWeight: 600, fontSize: 12, cursor: 'pointer', transition: 'all .12s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.color = C.primary }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border;  e.currentTarget.style.color = C.textSec }}>
                Seguir editando
              </button>
              <button onClick={() => { setConfirm(false); onClose() }}
                style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(239,68,68,.4)', background: 'rgba(239,68,68,.08)',
                  color: '#ef4444', fontWeight: 600, fontSize: 12, cursor: 'pointer', transition: 'all .12s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,.18)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,.08)'}>
                Descartar cambios
              </button>
              <button onClick={() => { save(); setConfirm(false); onClose() }}
                style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: C.primary,
                  color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer', transition: 'opacity .12s' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                Guardar y salir
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ position: 'relative', zIndex: 1, width: '100%',
        maxWidth: M ? '100vw' : 'calc(100vw - 40px)',
        maxHeight: M ? '92vh' : 'calc(100vh - 40px)',
        background: C.bgCard, borderRadius: M ? '20px 20px 0 0' : 14,
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 12px 60px rgba(0,0,0,.65)', border: `1px solid ${C.border}` }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 24px', borderBottom: `1px solid ${C.border}`, flexShrink: 0,
          background: C.bgSec, borderRadius: '14px 14px 0 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, color: C.textPri }}>Ajustes del Intent</div>
              <div style={{ fontSize: 12, color: C.textMut, marginTop: 1 }}>{local.type || 'sin nombre'}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isDirty && !saved && (
              <span style={{ fontSize: 11, color: C.jump, fontWeight: 600, background: `${C.jump}18`,
                padding: '3px 10px', borderRadius: 6, border: `1px solid ${C.jump}44` }}>● Sin guardar</span>
            )}
            <button onClick={save}
              style={{ padding: '7px 18px', background: saved ? '#059669' : C.primary, color: '#fff', border: 'none',
                borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'background .2s', flexShrink: 0 }}>
              {saved ? '✓ Guardado' : 'Guardar'}
            </button>
            <button onClick={tryClose} style={{ background: 'none', border: `1px solid ${C.border}`, cursor: 'pointer',
              color: C.textMut, borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .12s' }}
              onMouseEnter={e => { e.currentTarget.style.background = C.bgPop; e.currentTarget.style.color = C.textPri; e.currentTarget.style.borderColor = C.textMut }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = C.textMut; e.currentTarget.style.borderColor = C.border }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>

        {M && (
          <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
            {['General', 'Triggers', 'Inputs'].map((t, i) => (
              <button key={i} onClick={() => setTab(i)} style={{
                flex: 1, padding: '12px 8px', border: 'none', background: 'none',
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
                color: tab === i ? C.primary : C.textMut,
                borderBottom: `2px solid ${tab === i ? C.primary : 'transparent'}`,
                transition: 'all .15s',
              }}>{t}</button>
            ))}
          </div>
        )}

        <div style={{ display: M ? 'block' : 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>

          {/* COL 1: General */}
          <div style={{ display: M && tab !== 0 ? 'none' : 'block',
            width: M ? '100%' : 280, flexShrink: M ? 1 : 0,
            borderRight: M ? 'none' : `1px solid ${C.border}`, overflowY: 'auto', padding: '20px 20px 24px' }}>
            <SecLabel>General</SecLabel>
            <FieldLabel>Nombre (Type)</FieldLabel>
            <input value={local.type || ''} onChange={e => upd({ type: e.target.value })} placeholder="ej: scheduleAppointment" style={IS}/>
            <FieldLabel>Descripción</FieldLabel>
            <textarea value={local.description || ''} onChange={e => upd({ description: e.target.value })}
              placeholder="Descripción del intent..." style={{ ...IS_TA, minHeight: 80, fontFamily: 'inherit', lineHeight: 1.5 }}/>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, padding: '10px 12px',
              background: local.canBeStarter ? `${C.primary}12` : 'transparent',
              border: `1px solid ${local.canBeStarter ? C.primary : C.border}`, borderRadius: 8, transition: 'all .15s' }}>
              <input type="checkbox" id="cbsM3" checked={!!local.canBeStarter}
                onChange={e => upd({ canBeStarter: e.target.checked, badge: e.target.checked ? 'Starter' : (local.badge === 'Starter' ? null : local.badge) })}
                style={{ width: 14, height: 14, cursor: 'pointer', accentColor: C.primary }}/>
              <label htmlFor="cbsM3" style={{ fontSize: 12, color: C.textSec, cursor: 'pointer', flex: 1, lineHeight: 1.4 }}>
                Puede iniciar conversación
                {local.canBeStarter && <span style={{ fontSize: 10, color: C.primary, marginLeft: 6, fontWeight: 700 }}>· Starter</span>}
              </label>
            </div>
          </div>

          {/* COL 2: Triggers + Conditions */}
          <div style={{ display: M && tab !== 1 ? 'none' : 'block',
            width: M ? '100%' : 280, flexShrink: M ? 1 : 0,
            borderRight: M ? 'none' : `1px solid ${C.border}`, overflowY: 'auto', padding: '20px 20px 24px' }}>
            <SecLabel count={(local.triggers || []).length}>Triggers</SecLabel>
            <div style={{ fontSize: 11, color: C.textMut, marginBottom: 10, lineHeight: 1.5 }}>Frases o condiciones que activan este intent.</div>
            {(local.triggers || []).map((tr, i) => (
              <div key={i} style={{ display: 'flex', gap: 5, marginBottom: 6, alignItems: 'flex-start' }}>
                <textarea value={tr} onChange={e => updTrig(i, e.target.value)} placeholder="ej: Usuario solicita agendar cita"
                  style={{ ...IS_SM, flex: 1, resize: 'none', minHeight: 40, lineHeight: 1.5 }}/>
                <DelBtn onClick={() => delTrig(i)}/>
              </div>
            ))}
            <AddBtn onClick={addTrig} label="+ Añadir Trigger"/>
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${C.border}` }}>
              <SecLabel count={(local.conditions || []).length}>Conditions</SecLabel>
              <div style={{ fontSize: 11, color: C.textMut, marginBottom: 10, lineHeight: 1.5 }}>Condiciones necesarias para ejecutar el intent.</div>
              {(local.conditions || []).map((cd, i) => (
                <div key={i} style={{ display: 'flex', gap: 5, marginBottom: 6, alignItems: 'flex-start' }}>
                  <textarea value={cd} onChange={e => updCond(i, e.target.value)} placeholder="ej: Se obtuvo documentNumber"
                    style={{ ...IS_SM, flex: 1, resize: 'none', minHeight: 40, lineHeight: 1.5 }}/>
                  <DelBtn onClick={() => delCond(i)}/>
                </div>
              ))}
              <AddBtn onClick={addCond} label="+ Añadir Condición"/>
            </div>
          </div>

          {/* COL 3: Inputs */}
          <div style={{ display: M && tab !== 2 ? 'none' : 'block',
            flex: M ? undefined : 1, width: M ? '100%' : undefined,
            overflowY: 'auto', padding: '20px 20px 24px', minWidth: 0 }}>
            <SecLabel count={(local.input || []).length}>Inputs del Intent</SecLabel>
            <div style={{ fontSize: 11, color: C.textMut, marginBottom: 12, lineHeight: 1.5 }}>
              Datos que recibe el intent. Acceso via{' '}
              <code style={{ color: C.primary, fontSize: 11, background: C.bgSec, padding: '1px 5px', borderRadius: 4 }}>input.nombre</code>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 10 }}>
              {(local.input || []).map((inp, i) => (
                <div key={i} style={{ background: C.bgSec, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px' }}>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 8, alignItems: 'center' }}>
                    <input value={inp.name} onChange={e => updIn(i, { name: e.target.value })} placeholder="nombre" style={{ ...IS_SM, flex: 2 }}/>
                    <select value={inp.type} onChange={e => updIn(i, { type: e.target.value })} style={{ ...IS_SM, flex: 1, cursor: 'pointer', paddingRight: 20, appearance: 'auto' }}>
                      {INPUT_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                    <DelBtn onClick={() => delIn(i)}/>
                  </div>
                  <input value={inp.notes || ''} onChange={e => updIn(i, { notes: e.target.value })} placeholder="Nota o descripción del campo..."
                    style={{ ...IS_SM, width: '100%', marginBottom: 10, boxSizing: 'border-box' }}/>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.textMut, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 6 }}>Possible Values</div>
                  {(inp.possibleValues || []).map((pv, pi) => (
                    <div key={pi} style={{ display: 'flex', gap: 5, marginBottom: 5, alignItems: 'center' }}>
                      <input value={pv.value || ''} onChange={e => updPV(i, pi, { value: e.target.value })} placeholder="valor" style={{ ...IS_SM, flex: 1 }}/>
                      <input value={pv.label || ''} onChange={e => updPV(i, pi, { label: e.target.value })} placeholder="etiqueta" style={{ ...IS_SM, flex: 2 }}/>
                      <DelBtn onClick={() => delPV(i, pi)}/>
                    </div>
                  ))}
                  <button onClick={() => addPV(i)} style={{ fontSize: 11, fontWeight: 700, color: C.primary, background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0', marginBottom: 8 }}>
                    + Añadir Valor
                  </button>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.textSec, cursor: 'pointer' }}>
                    <input type="checkbox" checked={!!inp.required} onChange={e => updIn(i, { required: e.target.checked })} style={{ accentColor: C.primary, width: 13, height: 13 }}/>
                    Requerido
                  </label>
                </div>
              ))}
            </div>
            <AddBtn onClick={addIn} label="+ Agregar Input"/>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal
