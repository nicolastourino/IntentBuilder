import React, { useState } from 'react'
import { useC } from '../../theme/index.js'
import { getMeta, isJumpVal } from '../../utils/misc.js'

const ModDiagNode = ({ nd, setHighlightStep, onOpenStep }) => {
  const C  = useC()
  const m  = nd.m
  const meta   = getMeta(m.type)
  const [hov, setHov] = useState(false)
  const isRet  = m.type === 'returnValue'
  const isCond = m.type === 'conditional'
  const jump   = isRet && isJumpVal(m.value)
  const tNum   = jump ? parseInt(String(m.value).trim()) : null
  const ic     = isCond ? C.jump : isRet ? (jump ? C.jump : C.true_) : meta.ic
  const ibg    = isCond ? 'rgba(245,158,11,.1)' : isRet ? (jump ? 'rgba(245,158,11,.1)' : 'rgba(16,185,129,.1)') : meta.ibg

  let line1 = meta.label
  let line2 = null
  if (isCond) {
    const cv = m.condition || ''
    line1 = cv.length > 34 ? cv.slice(0, 32) + '…' : cv || 'sin condicion'
  } else if (isRet) {
    line1 = jump ? `→ Paso ${tNum}` : 'Retornar resultado'
  } else {
    if      (m.type === 'apiCall'            && m.url)            line2 = `${m.method || 'GET'} ${m.url.replace(/^https?:\/\//, '').slice(0, 22)}`
    else if (m.type === 'functionCall'       && m.functionName)   line2 = `${m.functionName}()`
    else if (m.type === 'variableDefinition' && m.variableName)   line2 = `${m.variableScope || 'let'} ${m.variableName}`
    else if (m.type === 'variableAssignment' && m.variableName)   line2 = `${m.variableName} = …`
    else if (m.type === 'cache'              && m.key)            line2 = `key: ${m.key.slice(0, 18)}`
  }

  return (
    <div
      onClick={() => { if (onOpenStep && nd.stepNum != null) onOpenStep(nd.stepNum) }}
      onMouseEnter={() => { setHov(true);  if (jump && setHighlightStep) setHighlightStep(tNum) }}
      onMouseLeave={() => { setHov(false); if (setHighlightStep) setHighlightStep(null) }}
      style={{
        width: '100%', height: '100%', boxSizing: 'border-box',
        display: 'flex', alignItems: 'center', gap: 8, padding: '0 11px',
        background: hov ? ibg : C.bgCard,
        border: `1.5px solid ${hov ? ic : ic + '44'}`,
        cursor: 'pointer',
        borderRadius: isRet ? 20 : 8,
        boxShadow: hov ? `0 2px 14px rgba(0,0,0,.4)` : `0 1px 6px rgba(0,0,0,.25)`,
        transition: 'all .12s',
      }}>
      <div style={{ width: 24, height: 24, borderRadius: isCond ? 4 : isRet ? 12 : 5, flexShrink: 0,
        background: ibg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: isCond ? 13 : 11, color: ic, fontWeight: 800, border: `1px solid ${ic}22`,
        transform: isCond ? 'rotate(45deg)' : 'none', flexShrink: 0 }}>
        <span style={{ transform: isCond ? 'rotate(-45deg)' : 'none', display: 'flex' }}>
          {isCond ? '◆' : isRet ? '↩' : meta.icon}
        </span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: hov ? ic : C.textSec,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.25 }}>
          {line1}
        </div>
        {line2 && (
          <div style={{ fontSize: 9, color: C.textMut, overflow: 'hidden',
            textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            fontFamily: 'monospace', lineHeight: 1.2 }}>
            {line2}
          </div>
        )}
      </div>
    </div>
  )
}

export default ModDiagNode
