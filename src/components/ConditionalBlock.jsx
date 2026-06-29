import React, { useState, useMemo } from 'react'
import { useC } from '../theme/index.js'
import { parseCondExpr } from './ConditionBuilder.jsx'

// ModulesFlow is imported lazily via prop drilling to avoid circular dep
// The component receives onModuleOp and renders ModulesFlow inline via a render prop approach.
// We import ModulesFlow directly — the circular reference is safe in Vite (ESM handles it).
import ModulesFlow from './ModulesFlow.jsx'

const COND_OPS = [
  { v: '=== true',  l: 'es verdadero' },
  { v: '=== false', l: 'es falso' },
  { v: '!== null',  l: 'existe (no es nulo)' },
  { v: '=== null',  l: 'no existe (es nulo)' },
  { v: '>',         l: 'mayor que' },
  { v: '<',         l: 'menor que' },
  { v: '>=',        l: 'mayor o igual que' },
  { v: '<=',        l: 'menor o igual que' },
  { v: '===',       l: 'igual a (===)' },
  { v: '!==',       l: 'distinto de (!==)' },
]

const ConditionalBlock = ({ mod, path, allSteps, onEditThis, onRemoveThis, onModuleOp, depth, setHighlightStep }) => {
  const C = useC()
  const [collapsed, setCollapsed] = useState(false)
  const [hov, setHov] = useState(false)
  const truePath  = [...path, 'conditionTrueModules']
  const falsePath = [...path, 'conditionFalseModules']
  const ic = '#f59e0b'

  const parsed = useMemo(() => parseCondExpr(mod.condition || ''), [mod.condition])
  const condPreview = parsed.ok && parsed.rules.length
    ? parsed.rules.map(r => {
        const sn       = String(r.src || '').replace('step:', '')
        const srcLabel = r.src === 'input' ? 'Input' : r.src === 'variable' ? (r.varName || 'Var') : `P${sn}`
        const opLabel  = COND_OPS.find(o => o.v === r.op)?.l || r.op
        return `${srcLabel}${r.field ? '.' + r.field : ''} ${opLabel}${r.val ? ' ' + r.val : ''}`
      }).join(parsed.comb === '&&' ? ' Y ' : ' O ')
    : (mod.condition || 'sin condicion')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
      <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        title="Condicional IF: click para editar la condicion."
        style={{ display: 'flex', alignItems: 'center', gap: 10, background: C.bgCard,
          border: `1px solid ${hov ? ic : ic + '55'}`, borderRadius: 10, padding: '10px 12px',
          cursor: 'pointer', transition: 'border-color .15s', boxShadow: hov ? `0 0 0 1px ${ic}22` : null }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0, background: 'rgba(245,158,11,.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: ic, fontWeight: 800 }}>◆</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: ic, textTransform: 'uppercase', letterSpacing: '.08em' }}>Condicional — IF</div>
          <div style={{ fontSize: 11, color: C.textSec, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{condPreview}</div>
        </div>
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
          <button onClick={e => { e.stopPropagation(); onEditThis() }}
            style={{ fontSize: 11, fontWeight: 700, color: C.textSec, background: 'none', border: `1px solid ${C.border}`,
              borderRadius: 5, cursor: 'pointer', padding: '2px 8px', transition: 'all .1s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.color = C.primary }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border;  e.currentTarget.style.color = C.textSec }}>
            Ver
          </button>
          <button onClick={e => { e.stopPropagation(); setCollapsed(v => !v) }}
            style={{ fontSize: 11, fontWeight: 700, background: 'none', border: `1px solid ${C.border}`,
              borderRadius: 5, cursor: 'pointer', padding: '2px 8px', transition: 'all .1s',
              color: collapsed ? C.primary : C.textSec, borderColor: collapsed ? C.primary : C.border }}
            onMouseEnter={e => e.currentTarget.style.borderColor = C.primary}
            onMouseLeave={e => e.currentTarget.style.borderColor = collapsed ? C.primary : C.border}>
            {collapsed ? 'Expandir' : 'Contraer'}
          </button>
        </div>
        {onRemoveThis && (
          <button onClick={e => { e.stopPropagation(); onRemoveThis() }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMut + '88', fontSize: 14, flexShrink: 0 }}
            onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
            onMouseLeave={e => e.currentTarget.style.color = C.textMut + '88'}>&#x2715;</button>
        )}
      </div>

      {!collapsed && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 4 }}>
          <div style={{ width: 1, height: 14, background: C.line, flexShrink: 0 }}/>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto auto', columnGap: 8, rowGap: 0 }}>
            {/* SI connector */}
            <div style={{ position: 'relative', height: 26, minWidth: 260 }}>
              <div style={{ position: 'absolute', top: 0, left: '50%', width: 1, height: '100%', background: C.line }}/>
              <div style={{ position: 'absolute', top: 0, left: '50%', right: -4, height: 1, background: C.line }}/>
              <div style={{ position: 'absolute', top: '50%', right: '50%', marginRight: 6, transform: 'translateY(-50%)',
                background: 'rgba(16,185,129,.18)', border: '1px solid rgba(16,185,129,.4)',
                borderRadius: 99, padding: '2px 10px', fontSize: 10, fontWeight: 800, color: C.true_,
                whiteSpace: 'nowrap', zIndex: 1 }}>Sí</div>
            </div>
            {/* NO connector */}
            <div style={{ position: 'relative', height: 26, minWidth: 260 }}>
              <div style={{ position: 'absolute', top: 0, right: '50%', width: 1, height: '100%', background: C.line }}/>
              <div style={{ position: 'absolute', top: 0, left: -4, right: '50%', height: 1, background: C.line }}/>
              <div style={{ position: 'absolute', top: '50%', left: '50%', marginLeft: 6, transform: 'translateY(-50%)',
                background: 'rgba(248,113,113,.12)', border: '1px solid rgba(248,113,113,.35)',
                borderRadius: 99, padding: '2px 10px', fontSize: 10, fontWeight: 800, color: C.false_,
                whiteSpace: 'nowrap', zIndex: 1 }}>No</div>
            </div>
            {/* TRUE column */}
            <div style={{ minWidth: 260, background: 'rgba(16,185,129,.06)', border: '1px solid rgba(16,185,129,.2)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px',
                borderBottom: '1px solid rgba(16,185,129,.12)', background: 'rgba(16,185,129,.04)' }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.true_, flexShrink: 0 }}/>
                <span style={{ fontSize: 10, fontWeight: 800, color: C.true_, letterSpacing: '.08em', textTransform: 'uppercase' }}>Verdadero</span>
              </div>
              <div style={{ padding: 10 }}>
                <ModulesFlow modules={mod.conditionTrueModules || []} arrayPath={truePath} allSteps={allSteps} onModuleOp={onModuleOp} depth={depth + 1} setHighlightStep={setHighlightStep}/>
              </div>
            </div>
            {/* FALSE column */}
            <div style={{ minWidth: 260, background: 'rgba(248,113,113,.06)', border: '1px solid rgba(248,113,113,.2)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px',
                borderBottom: '1px solid rgba(248,113,113,.12)', background: 'rgba(248,113,113,.04)' }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.false_, flexShrink: 0 }}/>
                <span style={{ fontSize: 10, fontWeight: 800, color: C.false_, letterSpacing: '.08em', textTransform: 'uppercase' }}>Falso</span>
              </div>
              <div style={{ padding: 10 }}>
                <ModulesFlow modules={mod.conditionFalseModules || []} arrayPath={falsePath} allSteps={allSteps} onModuleOp={onModuleOp} depth={depth + 1} setHighlightStep={setHighlightStep}/>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ConditionalBlock
