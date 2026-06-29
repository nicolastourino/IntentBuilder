import React, { useState } from 'react'
import { useC } from '../theme/index.js'
import { MOD_META, MOD_ORDER } from '../constants/index.js'
import { getMeta } from '../utils/misc.js'

const Palette = ({ pinned, onTogglePin, onOpenSettings }) => {
  const C = useC()
  const [hov, setHov] = useState(false)
  const show = pinned || hov

  return (
    <div style={{ display: 'flex', flexDirection: 'row', position: 'relative', flexShrink: 0 }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <div style={{
        width: show ? 210 : 0, overflow: 'hidden', transition: 'width .2s ease', flexShrink: 0,
        position: pinned ? 'relative' : 'absolute', left: 0, top: 0, bottom: 0,
        boxShadow: pinned ? 'none' : '4px 0 16px rgba(0,0,0,.4)',
        zIndex: pinned ? 1 : 50,
      }}>
        <div style={{ width: 210, background: C.bgCard, borderRight: `1px solid ${C.border}`,
          padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 4, height: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: C.textMut, letterSpacing: '.1em', textTransform: 'uppercase' }}>Modulos</span>
            <button onClick={onTogglePin}
              style={{ background: pinned ? 'rgba(59,154,240,.15)' : 'none', border: `1px solid ${pinned ? C.primary : C.border}`,
                borderRadius: 6, cursor: 'pointer', color: pinned ? C.primary : C.textMut,
                width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, transition: 'all .12s' }}
              title={pinned ? 'Desanclar (auto-ocultar al no hacer hover)' : 'Anclar paleta (siempre visible)'}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ transform: pinned ? 'none' : 'rotate(45deg)', transition: 'transform .2s' }}>
                <line x1="12" y1="17" x2="12" y2="22"/>
                <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/>
              </svg>
            </button>
          </div>
          <div style={{ fontSize: 10, color: C.textMut, marginBottom: 4, lineHeight: 1.4 }}>Arrastra al flujo para agregar</div>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {MOD_ORDER.map(t => {
              const m = getMeta(t)
              return (
                <div key={t} draggable onDragStart={e => e.dataTransfer.setData('moduleType', t)}
                  title={`${m.label}: ${m.sub}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 9px', borderRadius: 8,
                    border: `1px solid ${m.ic}33`, background: m.ibg, cursor: 'grab', userSelect: 'none', transition: 'all .12s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = m.ic; e.currentTarget.style.transform = 'translateX(2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = m.ic + '33'; e.currentTarget.style.transform = '' }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: m.ic, minWidth: 20, textAlign: 'center' }}>{m.icon}</span>
                  <span style={{ fontSize: 11, color: C.textSec, fontWeight: 600 }}>{m.label}</span>
                </div>
              )
            })}
          </div>
          {onOpenSettings && (
            <button onClick={onOpenSettings}
              style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, flexShrink: 0,
                padding: '8px 10px', borderRadius: 8, border: `1px solid ${C.border}`, background: 'none',
                cursor: 'pointer', color: C.textSec, fontSize: 11, fontWeight: 600, width: '100%',
                boxSizing: 'border-box', transition: 'all .12s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,154,240,.1)'; e.currentTarget.style.color = C.primary; e.currentTarget.style.borderColor = C.primary }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = C.textSec; e.currentTarget.style.borderColor = C.border }}>
              &#9881; Ajustes
            </button>
          )}
        </div>
      </div>
      {!pinned && (
        <div style={{ width: 14, background: C.bgCard, borderRight: `1px solid ${C.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer', zIndex: 1 }}>
          <span style={{ color: C.textMut, fontSize: 9, writingMode: 'vertical-rl',
            userSelect: 'none', letterSpacing: 2, opacity: show ? 0 : 1, transition: 'opacity .15s' }}>
            MOD
          </span>
        </div>
      )}
    </div>
  )
}

export default Palette
