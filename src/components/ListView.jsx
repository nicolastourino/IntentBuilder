import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { useC, useM } from '../theme/index.js'
import { IconPlus, IconSun, IconMoon } from './icons/index.jsx'
import IntentCard from './IntentCard.jsx'
import NewModal   from './NewModal.jsx'

const ListView = ({ intents, onOpen, onCreate, onToggleTheme, dark, onToggleActive }) => {
  const C = useC()
  const M = useM()
  const [q,       setQ]       = useState('')
  const [showNew, setShowNew] = useState(false)

  const filtered = q.trim()
    ? intents.filter(i =>
        i.type.toLowerCase().includes(q.toLowerCase()) ||
        (i.description || '').toLowerCase().includes(q.toLowerCase()))
    : intents

  const activeIntents   = filtered.filter(i => i.active !== false)
  const inactiveIntents = filtered.filter(i => i.active === false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: C.bgBase, overflow: 'hidden' }}>

      {/* ── MOBILE HEADER ── */}
      {M ? (
        <div style={{ background: C.bgCard, borderBottom: `1px solid ${C.border}`, flexShrink: 0, boxShadow: '0 1px 8px rgba(0,0,0,.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10,
            padding: `calc(env(safe-area-inset-top,0px) + 14px) 20px 10px` }}>
            <img src={C.logo} alt="SAIL" style={{ height: 26, objectFit: 'contain' }}/>
            <div style={{ flex: 1 }}/>
            <button onClick={onToggleTheme}
              style={{ background: 'none', border: 'none', padding: 8, cursor: 'pointer',
                color: C.textSec, display: 'flex', alignItems: 'center', borderRadius: 10, transition: 'all .12s' }}
              title={dark ? 'Modo Light' : 'Modo Dark'}>
              {dark ? <IconSun size={18}/> : <IconMoon size={18}/>}
            </button>
            <button onClick={() => setShowNew(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: C.primary, border: 'none',
                borderRadius: 12, padding: '9px 16px', color: '#fff', fontWeight: 700, fontSize: 13,
                cursor: 'pointer', boxShadow: `0 2px 10px ${C.primary}55` }}>
              <IconPlus size={14}/>
              <span>Nuevo</span>
            </button>
          </div>
          <div style={{ padding: '0 16px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10,
              background: C.bgSec, borderRadius: 12, padding: '10px 14px', border: `1px solid ${C.border}` }}>
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="6.5" cy="6.5" r="5" stroke={C.textMut} strokeWidth="1.5"/>
                <line x1="10.5" y1="10.5" x2="14" y2="14" stroke={C.textMut} strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar intents..."
                style={{ background: 'none', border: 'none', outline: 'none', color: C.textPri,
                  fontSize: 14, width: '100%', minWidth: 0 }}/>
              {q && (
                <button onClick={() => setQ('')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMut,
                    fontSize: 16, lineHeight: 1, padding: 0, flexShrink: 0 }}>&#x2715;</button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ── DESKTOP HEADER ── */
        <div style={{ display: 'flex', alignItems: 'center', gap: 12,
          padding: '0 28px', height: 64,
          background: C.bgCard, borderBottom: `1px solid ${C.border}`, flexShrink: 0,
          boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}>
          <img src={C.logo} alt="SAIL" style={{ height: 28, objectFit: 'contain', cursor: 'default' }}/>
          <div style={{ width: 1, height: 28, background: C.border }}/>
          <div style={{ flex: 1 }}/>
          <button onClick={onToggleTheme}
            title={dark ? 'Modo Light' : 'Modo Dark'}
            style={{ background: C.bgSec, border: `1px solid ${C.border}`, borderRadius: 8,
              padding: '6px 8px', cursor: 'pointer', color: C.textSec, display: 'flex',
              alignItems: 'center', transition: 'all .14s' }}
            onMouseEnter={e => { e.currentTarget.style.background = C.bgPop; e.currentTarget.style.color = C.primary }}
            onMouseLeave={e => { e.currentTarget.style.background = C.bgSec; e.currentTarget.style.color = C.textSec }}>
            {dark ? <IconSun size={16}/> : <IconMoon size={16}/>}
          </button>
          <button onClick={() => setShowNew(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 7, background: C.primary, border: 'none',
              borderRadius: 9, padding: '8px 16px', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
              boxShadow: `0 2px 8px ${C.primary}55`, transition: 'background .14s' }}
            onMouseEnter={e => e.currentTarget.style.background = C.priHov}
            onMouseLeave={e => e.currentTarget.style.background = C.primary}>
            <IconPlus size={15}/>{' Nuevo Intent'}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: C.bgSec,
            border: `1px solid ${C.border}`, borderRadius: 9, padding: '6px 12px', flex: 1, maxWidth: 340 }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="6.5" cy="6.5" r="5" stroke={C.textMut} strokeWidth="1.5"/>
              <line x1="10.5" y1="10.5" x2="14" y2="14" stroke={C.textMut} strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar intents..."
              style={{ background: 'none', border: 'none', outline: 'none', color: C.textPri, fontSize: 13, width: '100%', minWidth: 0 }}/>
          </div>
        </div>
      )}

      {/* ── CONTENT ── */}
      <div style={{ flex: 1, overflowY: 'auto',
        padding: M ? '12px 16px calc(env(safe-area-inset-bottom,0px) + 24px)' : '28px 28px 40px' }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: C.textMut }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>&#128269;</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: C.textSec, marginBottom: 4 }}>Sin resultados</div>
            <div style={{ fontSize: 13 }}>Intenta con otro término</div>
          </div>
        )}
        {activeIntents.length > 0 && (
          <div style={{ marginBottom: M ? 20 : 28 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.textMut, letterSpacing: '0.07em',
              textTransform: 'uppercase', marginBottom: M ? 10 : 14, paddingLeft: M ? 4 : 0 }}>
              Activos &middot; {activeIntents.length}
            </div>
            <div style={{ display: M ? 'flex' : 'grid', flexDirection: M ? 'column' : undefined,
              gridTemplateColumns: M ? undefined : 'repeat(5,1fr)', gap: M ? 8 : 16 }}>
              {activeIntents.map(i => (
                <IntentCard key={i._id || i.id} intent={i}
                  onEdit={() => onOpen(i)}
                  onPreview={() => onOpen(i, true)}
                  onToggleActive={() => onToggleActive(i._id || i.id)}/>
              ))}
            </div>
          </div>
        )}
        {inactiveIntents.length > 0 && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.textMut, letterSpacing: '0.07em',
              textTransform: 'uppercase', marginBottom: M ? 10 : 14, paddingLeft: M ? 4 : 0 }}>
              Inactivos &middot; {inactiveIntents.length}
            </div>
            <div style={{ display: M ? 'flex' : 'grid', flexDirection: M ? 'column' : undefined,
              gridTemplateColumns: M ? undefined : 'repeat(5,1fr)', gap: M ? 8 : 16 }}>
              {inactiveIntents.map(i => (
                <IntentCard key={i._id || i.id} intent={i}
                  onEdit={() => onOpen(i)}
                  onPreview={() => onOpen(i, true)}
                  onToggleActive={() => onToggleActive(i._id || i.id)}/>
              ))}
            </div>
          </div>
        )}
      </div>

      {showNew && createPortal(
        <NewModal onClose={() => setShowNew(false)} onCreate={name => { onCreate(name); setShowNew(false) }}/>,
        document.body
      )}
    </div>
  )
}

export default ListView
