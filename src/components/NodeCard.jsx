import React, { useState } from 'react'
import { useC } from '../theme/index.js'
import { getMeta } from '../utils/misc.js'

const NodeCard = ({ mod, onEdit, onRemove }) => {
  const C    = useC()
  const meta = getMeta(mod.type)
  const [hov, setHov] = useState(false)

  const sub =
    mod.type === 'apiCall'            ? `${mod.method || 'GET'} ${(mod.url || '').replace(/^https?:\/\//, '').slice(0, 30) || '...'}`
    : mod.type === 'variableDefinition' ? `${mod.variableScope || 'let'} ${mod.variableName || '...'}`
    : mod.type === 'variableAssignment' ? `${mod.variableName || '...'} = ${String(mod.value || '').slice(0, 20)}`
    : mod.type === 'functionCall'       ? `${mod.functionName || '...'}()`
    : mod.type === 'log'                ? String(mod.value || '').slice(0, 30) || 'sin valor'
    : mod.type === 'cache'              ? `key: ${(mod.key || '').slice(0, 22) || '...'}`
    : mod.type === 'loop'               ? `${mod.iteratorName || 'item'} of ${mod.collectionName || 'items'}`
    : meta.sub

  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={onEdit}
      title={`${meta.label}: ${meta.sub} · Click para editar`}
      style={{ display: 'flex', alignItems: 'center', gap: 10, background: C.bgCard,
        border: `1px solid ${hov ? C.primary : C.border}`, borderRadius: 10, padding: '10px 12px',
        cursor: 'pointer', transition: 'border-color .15s,box-shadow .15s',
        boxShadow: hov ? `0 0 0 1px rgba(59,154,240,.18)` : null }}>
      <div style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0, background: meta.ibg,
        border: `1px solid ${meta.ic}33`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, fontWeight: 800, color: meta.ic }}>
        {meta.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.textPri, lineHeight: 1.2 }}>{meta.label}</div>
        <div style={{ fontSize: 11, color: C.textMut, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub}</div>
      </div>
      {onRemove && (
        <button onClick={e => { e.stopPropagation(); onRemove() }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMut + '88', fontSize: 14, padding: '2px 4px', borderRadius: 4, flexShrink: 0 }}
          onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
          onMouseLeave={e => e.currentTarget.style.color = C.textMut + '88'}>&#x2715;</button>
      )}
    </div>
  )
}

export default NodeCard
