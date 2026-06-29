import React, { useState } from 'react'
import { useC } from '../theme/index.js'
import { isJumpVal } from '../utils/misc.js'

const ReturnNode = ({ mod, allSteps, onEdit, onRemove, setHighlightStep }) => {
  const C    = useC()
  const jump = isJumpVal(mod.value)
  const target = jump ? allSteps.find(s => s.step === parseInt(String(mod.value).trim())) : null
  const ic  = jump ? C.jump : C.true_
  const ibg = jump ? 'rgba(245,158,11,.15)' : 'rgba(16,185,129,.15)'
  const [hov, setHov] = useState(false)

  return (
    <div
      onMouseEnter={() => { setHov(true);  if (jump && setHighlightStep) setHighlightStep(parseInt(String(mod.value).trim())) }}
      onMouseLeave={() => { setHov(false); if (setHighlightStep) setHighlightStep(null) }}
      onClick={onEdit}
      title={jump ? `Salta al Paso ${mod.value}: ${target?.title || ''}` : 'Retorna el resultado final del intent'}
      style={{ display: 'flex', alignItems: 'center', gap: 10, background: C.bgCard,
        border: `1px solid ${hov ? ic : ic + '44'}`, borderRadius: 10, padding: '10px 12px',
        cursor: 'pointer', transition: 'border-color .15s' }}>
      <div style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0, background: ibg,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: ic }}>↩</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: ic, textTransform: 'uppercase', letterSpacing: '.08em' }}>
          {jump ? 'Saltar a paso' : 'Retornar resultado'}
        </div>
        {jump
          ? <div style={{ fontSize: 13, fontWeight: 700, color: C.textPri, marginTop: 2 }}>
              <span style={{ color: ic }}>→ Paso {mod.value}</span>
              {target && <span style={{ color: C.textMut, fontWeight: 400, fontSize: 11 }}> — {target.title}</span>}
            </div>
          : <div style={{ fontSize: 11, color: C.textSec, marginTop: 2, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {String(mod.value || '').slice(0, 42) || 'sin valor'}
            </div>
        }
      </div>
      {onRemove && (
        <button onClick={e => { e.stopPropagation(); onRemove() }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMut + '88', fontSize: 14, padding: '2px 4px', flexShrink: 0 }}
          onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
          onMouseLeave={e => e.currentTarget.style.color = C.textMut + '88'}>&#x2715;</button>
      )}
    </div>
  )
}

export default ReturnNode
