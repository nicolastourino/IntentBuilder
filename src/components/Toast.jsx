import React from 'react'
import { useC } from '../theme/index.js'

const Toast = ({ msg }) => {
  const C = useC()
  return (
    <div style={{
      position: 'fixed', bottom: 28, left: '50%',
      transform: 'translateX(-50%)', zIndex: 2000,
      background: C.bgPop, border: `1px solid ${C.primary}44`, borderRadius: 12,
      padding: '10px 22px', fontSize: 13, fontWeight: 700, color: C.textPri,
      boxShadow: '0 8px 32px rgba(0,0,0,.45)',
      animation: 'toastIn .2s ease', whiteSpace: 'nowrap', pointerEvents: 'none',
    }}>
      {msg}
    </div>
  )
}

export default Toast
