import React, { useState, useRef, useEffect } from 'react'
import { useC } from '../theme/index.js'
import { IS } from '../constants/index.js'

const NewModal = ({ onClose, onCreate }) => {
  const C   = useC()
  const [name, setName] = useState('')
  const ref = useRef(null)
  useEffect(() => { setTimeout(() => ref.current?.focus(), 50) }, [])
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="fu">
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.55)' }} onClick={onClose}/>
      <div style={{ position: 'relative', zIndex: 1, width: 'min(420px,95vw)', background: C.bgCard,
        borderRadius: 14, padding: '24px', boxShadow: '0 8px 48px rgba(0,0,0,.6)', border: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <span style={{ fontWeight: 800, fontSize: 15, color: C.textPri }}>Nuevo Intent</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMut, fontSize: 20 }}>&#x2715;</button>
        </div>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.textMut, letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 7 }}>Nombre (Type)</label>
        <input ref={ref} value={name} onChange={e => setName(e.target.value)} placeholder="ej: scheduleAppointment"
          onKeyDown={e => e.key === 'Enter' && name.trim() && onCreate(name.trim())}
          style={{ ...IS, padding: '10px 12px', fontSize: 14, marginBottom: 20 }}/>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onClose} style={{ padding: '8px 16px', border: `1px solid ${C.border}`, borderRadius: 8, background: 'transparent', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: C.textSec }}>Cancelar</button>
          <button onClick={() => name.trim() && onCreate(name.trim())} style={{ padding: '8px 20px', border: 'none', borderRadius: 8, background: C.primary, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>Crear Intent</button>
        </div>
      </div>
    </div>
  )
}

export default NewModal
