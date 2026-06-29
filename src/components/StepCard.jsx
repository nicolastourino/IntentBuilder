import React, { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useC } from '../theme/index.js'
import { STEP_CFG, DEF } from '../constants/index.js'
import { getMeta, getAt, setAt } from '../utils/misc.js'
import ModulesFlow from './ModulesFlow.jsx'
import ModModal from './ModModal.jsx'

const getStepAccent = (modules, C) => {
  const types = new Set()
  const collect = mods => (mods || []).forEach(m => {
    types.add(m.type)
    if (m.conditionTrueModules)  collect(m.conditionTrueModules)
    if (m.conditionFalseModules) collect(m.conditionFalseModules)
    if (m.modules)               collect(m.modules)
  })
  collect(modules)
  if (!types.size) return 'rgba(168,196,202,0.35)'
  if (types.has('conditional') && types.has('returnValue')) return C.jump
  if (types.has('conditional'))  return C.jump
  if (types.has('returnValue'))  return C.true_
  if (types.has('apiCall'))      return '#0e7490'
  if (types.has('cache'))        return C.primary
  if (types.has('functionCall')) return '#a855f7'
  if (types.has('variableDefinition') || types.has('variableAssignment')) return '#6366f1'
  return C.primary
}

const StepCard = ({
  step, allSteps, onStepChange, onRemove,
  collapsed, onToggleCollapse,
  isDragOver, isHovered, isHighlighted,
  setHighlightStep, editMode,
  onDragStart, onDragEnd,
}) => {
  const C   = useC()
  const cfg = STEP_CFG[step.type] || STEP_CFG.obtainValue
  const [modal, setModal] = useState(null)
  const accent = useMemo(() => getStepAccent(step.modules, C), [step.modules, C])

  const directMods = step.modules.length

  const modSummary = useMemo(() => {
    const counts = new Map()
    ;(step.modules || []).forEach(m => counts.set(m.type, (counts.get(m.type) || 0) + 1))
    return [...counts.entries()].map(([t, n]) => ({ ...getMeta(t), t, n }))
  }, [step.modules])

  const handleModuleOp = useCallback((op, path, data) => {
    if (op === 'edit') { setModal({ path, mod: data }); return }
    let ns = { ...step }
    if (op === 'add') {
      const arr = getAt(ns, path) || []
      ns = setAt(ns, path, [...arr, DEF[data] ? DEF[data]() : { type: data }])
    } else if (op === 'remove') {
      const ap  = path.slice(0, -1)
      const idx = path[path.length - 1]
      const arr = getAt(ns, ap) || []
      ns = setAt(ns, ap, arr.filter((_, i) => i !== idx))
    } else if (op === 'update') {
      ns = setAt(ns, path, data)
    } else if (op === 'reorder') {
      ns = setAt(ns, path, data)
    }
    onStepChange(ns)
  }, [step, onStepChange])

  const stepDesc = {
    obtainValue:  'Ejecuta módulos en secuencia y avanza al siguiente paso',
    jumpToStep:   'Evalúa condición y salta al paso indicado',
    returnResult: 'Termina el flujo y retorna el resultado final',
  }[step.type] || ''

  return (
    <div style={{
      minWidth: 860,
      background: C.bgCard,
      borderRadius: 14,
      border: `1px solid ${isDragOver ? C.primary : isHighlighted ? C.jump : cfg.ic + '66'}`,
      borderLeft: `4px solid ${cfg.ic}`,
      boxShadow: isHighlighted
        ? `0 0 0 3px rgba(245,158,11,.35),0 0 28px rgba(245,158,11,.18)`
        : isDragOver ? `0 0 0 3px ${C.primary}33`
        : isHovered  ? `0 0 0 2px ${cfg.ic}33, 0 4px 24px rgba(0,0,0,0.32)`
        : '0 2px 14px rgba(0,0,0,0.22)',
      overflow: 'hidden',
      transition: 'border-color .18s,box-shadow .18s,background .18s',
      animation: isHighlighted ? 'pulseStep 1.5s ease infinite' : 'none',
    }}>

      {/* ── Step Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '11px 14px',
        background: C.bgSec,
        borderBottom: collapsed ? 'none' : `1px solid ${C.border}`,
        minWidth: 0,
      }}>
        {editMode && (
          <div onMouseDown={onDragStart}
            style={{ fontSize: 16, color: C.textMut + '66', cursor: 'grab', padding: '0 4px',
              userSelect: 'none', flexShrink: 0, letterSpacing: '-1px', transition: 'color .12s' }}
            title="Arrastra para reordenar el paso"
            onMouseEnter={e => e.currentTarget.style.color = C.primary}
            onMouseLeave={e => e.currentTarget.style.color = C.textMut + '66'}>&#x2807;</div>
        )}

        <div style={{ width: 34, height: 34, borderRadius: 8, flexShrink: 0, background: cfg.ibg,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: cfg.ic, fontWeight: 800 }}>
          {cfg.icon}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: cfg.ic, letterSpacing: '.09em', textTransform: 'uppercase' }}>Paso {step.step}</span>
            <span style={{ fontSize: 10, color: C.textMut }}>·</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: C.textMut, textTransform: 'uppercase', letterSpacing: '.07em' }}>{cfg.label}</span>
          </div>
          {editMode
            ? <input value={step.title || ''} onChange={e => onStepChange({ ...step, title: e.target.value })}
                style={{ border: 'none', background: 'transparent', fontWeight: 700, fontSize: 14, color: C.textPri, outline: 'none', width: '100%' }}
                placeholder="Nombre del paso..."/>
            : <div style={{ fontWeight: 700, fontSize: 14, color: C.textPri }}>{step.title || 'sin nombre'}</div>
          }
        </div>

        {editMode && (
          <select value={step.type} onChange={e => onStepChange({ ...step, type: e.target.value })}
            style={{ fontSize: 11, fontWeight: 700, color: cfg.ic, background: cfg.ibg, border: `1px solid ${cfg.ic}44`,
              borderRadius: 7, padding: '3px 8px', cursor: 'pointer', outline: 'none', flexShrink: 0 }}>
            <option value="obtainValue">Obtain Value</option>
            <option value="jumpToStep">Jump To Step</option>
            <option value="returnResult">Return Result</option>
          </select>
        )}

        {directMods > 0 && (
          <span title="Módulos directos en este step"
            style={{ fontSize: 11, fontWeight: 800, color: accent, background: accent + '18', border: `1px solid ${accent}44`,
              borderRadius: 99, padding: '2px 9px', flexShrink: 0, minWidth: 26, textAlign: 'center', cursor: 'default' }}>
            {directMods}
          </span>
        )}

        <button onClick={onToggleCollapse}
          title={collapsed ? 'Mostrar módulos' : 'Ocultar módulos'}
          style={{ background: collapsed ? 'rgba(59,154,240,.14)' : 'none', border: `1px solid ${collapsed ? C.primary : C.border}`,
            borderRadius: 6, cursor: 'pointer',
            color: collapsed ? C.primary : C.textMut, fontSize: 11, fontWeight: 700, padding: '4px 10px', flexShrink: 0, lineHeight: 1, transition: 'all .12s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.color = C.primary }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = collapsed ? C.primary : C.border; e.currentTarget.style.color = collapsed ? C.primary : C.textMut }}>
          {collapsed ? '▶ Ver' : '▼ Ocultar'}
        </button>

        {editMode && (
          <button onClick={() => { if (confirm('Eliminar Paso ' + step.step + '?')) onRemove() }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(248,113,113,0.45)', fontSize: 14, padding: '3px 5px', borderRadius: 4, flexShrink: 0 }}
            onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(248,113,113,0.45)'}>&#x2715;</button>
        )}
      </div>

      {/* ── Collapsed view: module pills ── */}
      {collapsed && (
        <div style={{ padding: '8px 14px 10px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6, minHeight: 44,
          borderTop: `1px solid ${C.border}`, background: C.bgCard }}>
          {modSummary.length > 0
            ? <>
                {modSummary.map(({ t, n, icon, label, ic, ibg }) => (
                  <span key={t}
                    title={`${n} módulo${n > 1 ? 's' : ''} de tipo ${label} · click para expandir`}
                    onClick={onToggleCollapse}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 99,
                      background: ibg, border: `1px solid ${ic}33`, fontSize: 11, color: ic, fontWeight: 600,
                      cursor: 'pointer', userSelect: 'none', transition: 'border-color .1s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = ic}
                    onMouseLeave={e => e.currentTarget.style.borderColor = ic + '33'}>
                    {icon} {label}{n > 1 ? ` ×${n}` : ''}
                  </span>
                ))}
                <span style={{ fontSize: 10, color: C.textMut, marginLeft: 'auto', fontStyle: 'italic', whiteSpace: 'nowrap' }}>{stepDesc}</span>
              </>
            : <span style={{ fontSize: 11, color: C.textMut, fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 6 }}>
                {editMode
                  ? <><span style={{ fontSize: 14 }}>⊕</span> Sin módulos · arrastra desde la paleta para agregar</>
                  : <><span style={{ fontSize: 14 }}>○</span> Sin módulos</>
                }
              </span>
          }
        </div>
      )}

      {/* ── Expanded view: modules flow ── */}
      {!collapsed && (
        <div style={{ padding: 14 }}>
          <ModulesFlow modules={step.modules} arrayPath={['modules']} allSteps={allSteps}
            onModuleOp={handleModuleOp} depth={0} setHighlightStep={setHighlightStep}/>
        </div>
      )}

      {modal && createPortal(
        <ModModal mod={modal.mod} allSteps={allSteps}
          onSave={u => { handleModuleOp('update', modal.path, u); setModal(null) }}
          onClose={() => setModal(null)}/>,
        document.body
      )}
    </div>
  )
}

export default StepCard
