import React, { useState } from 'react'
import { useC } from '../../theme/index.js'
import { STEP_CFG } from '../../constants/index.js'

const StepDiagNode = ({ step, isHighlighted, onClick }) => {
  const C   = useC()
  const cfg = STEP_CFG[step.type] || STEP_CFG.obtainValue
  const acc = cfg.ic
  const [hov, setHov] = useState(false)
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        width: '100%', height: '100%', boxSizing: 'border-box',
        display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px',
        background: isHighlighted ? 'rgba(245,158,11,.12)' : C.bgSec,
        border: `2px solid ${isHighlighted ? C.jump : hov ? acc : acc + '66'}`,
        borderLeft: `4px solid ${acc}`, borderRadius: 12,
        cursor: 'pointer', userSelect: 'none',
        boxShadow: isHighlighted
          ? `0 0 0 3px rgba(245,158,11,.28),0 4px 20px rgba(0,0,0,.4)`
          : hov ? `0 4px 18px rgba(0,0,0,.45)` : `0 2px 10px rgba(0,0,0,.35)`,
        transition: 'all .14s',
        animation: isHighlighted ? 'pulseStep 1.5s ease infinite' : 'none',
      }}>
      <div style={{ width: 30, height: 30, borderRadius: 7, background: cfg.ibg, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, color: cfg.ic, fontWeight: 800, border: `1px solid ${cfg.ic}33` }}>
        {cfg.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 8, fontWeight: 800, color: cfg.ic, letterSpacing: '.09em', textTransform: 'uppercase', marginBottom: 1 }}>
          Paso {step.step}
        </div>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.textPri, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {step.title || 'sin nombre'}
        </div>
      </div>
      {step.modules.length > 0 && (
        <span style={{ fontSize: 9, color: cfg.ic, background: cfg.ibg,
          border: `1px solid ${cfg.ic}22`, borderRadius: 99,
          padding: '1px 6px', flexShrink: 0, fontWeight: 700 }}>
          {step.modules.length}
        </span>
      )}
    </div>
  )
}

export default StepDiagNode
