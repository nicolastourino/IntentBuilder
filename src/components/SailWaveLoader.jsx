import React from 'react'

const SailWaveLoader = ({ width = 260, height = 52, style: st = {} }) => {
  const W = 800, VH = 60, HW = 200
  const Q = HW * .35, R = HW * .65
  const p1 = `M 0,0 C ${Q},-20 ${R},-20 ${HW},0 C ${HW+Q},20 ${HW+R},20 ${HW*2},0 C ${HW*2+Q},-20 ${HW*2+R},-20 ${HW*3},0 C ${HW*3+Q},20 ${HW*3+R},20 ${HW*4},0`
  const Q2 = HW * .32, R2 = HW * .68, A2 = 13
  const p2 = `M 0,4 C ${Q2},-${A2} ${R2},-${A2} ${HW},4 C ${HW+Q2},${A2+4} ${HW+R2},${A2+4} ${HW*2},4 C ${HW*2+Q2},-${A2} ${HW*2+R2},-${A2} ${HW*3},4 C ${HW*3+Q2},${A2+4} ${HW*3+R2},${A2+4} ${HW*4},4`
  const wrapStyle = { position: 'absolute', top: '50%', left: 0, marginTop: -(VH / 2) }
  const svgProps = { width: W, height: VH, viewBox: `0 -${VH/2} ${W} ${VH}`, style: { display: 'block' } }
  return (
    <div style={{ width, height, overflow: 'hidden', position: 'relative', flexShrink: 0, ...st }}>
      <div style={wrapStyle}>
        <svg {...svgProps} style={{ ...svgProps.style, animation: 'sailWave2 2.8s cubic-bezier(.45,0,.55,1) infinite', opacity: .38 }}>
          <path d={p2} fill="none" stroke="#38A9FF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div style={wrapStyle}>
        <svg {...svgProps} style={{ ...svgProps.style, animation: 'sailWave1 2s cubic-bezier(.45,0,.55,1) infinite' }}>
          <path d={p1} fill="none" stroke="#1E88FF" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  )
}

export default SailWaveLoader
