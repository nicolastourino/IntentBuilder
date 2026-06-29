import React from 'react'
import { useC } from '../../theme/index.js'
import { STEP_CFG } from '../../constants/index.js'

const StepConnector = ({ fromStep, toStep, highlight }) => {
  const C   = useC()
  const cfg = STEP_CFG[fromStep?.type] || STEP_CFG.obtainValue
  const col = highlight ? C.primary : cfg.ic
  const op  = highlight ? 1 : .45
  const h   = 28
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0', position: 'relative' }}>
      <svg width="28" height={h + 10} style={{ overflow: 'visible', display: 'block' }}>
        <line x1="14" y1="0" x2="14" y2={h}
          stroke={col} strokeWidth={highlight ? 2 : 1} strokeOpacity={op}
          strokeDasharray={highlight ? '7 5' : undefined}
          style={highlight ? { animation: 'dashFlow .45s linear infinite' } : undefined}/>
        <polygon points={`10,${h} 18,${h} 14,${h + 8}`} fill={col} fillOpacity={op}/>
      </svg>
    </div>
  )
}

export default StepConnector
