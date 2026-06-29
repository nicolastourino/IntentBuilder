import React from 'react'
import { useC } from '../../theme/index.js'

const SvgConn = ({ color, highlight, height = 26 }) => {
  const C   = useC()
  const col = highlight ? (color || C.primary) : C.line
  const h   = height
  return (
    <svg width="24" height={h + 8} style={{ display: 'block', margin: '0 auto', overflow: 'visible' }}>
      <line x1="12" y1="0" x2="12" y2={h}
        stroke={col} strokeWidth={highlight ? 2 : 1} strokeOpacity={highlight ? 1 : .45}
        strokeDasharray={highlight ? '7 5' : undefined}
        style={highlight ? { animation: 'dashFlow .45s linear infinite' } : undefined}/>
      <polygon points={`9,${h} 15,${h} 12,${h + 7}`} fill={col} fillOpacity={highlight ? 1 : .45}/>
    </svg>
  )
}

export default SvgConn
