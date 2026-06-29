import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useC } from '../theme/index.js'
import { MOD_META } from '../constants/index.js'

const DropZone = ({ onDrop, label, compact }) => {
  const C = useC()
  const [over, setOver] = useState(false)
  const [open, setOpen] = useState(false)
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 })
  const zoneRef = useRef(null)
  const btnRef  = useRef(null)

  useEffect(() => {
    if (!open) return
    const h = e => {
      if (!e.target.closest('[data-dzmenu]') && !e.target.closest('[data-dzbtn]')) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  const toggleMenu = e => {
    e.stopPropagation()
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect()
      setMenuPos({ top: r.bottom + 6, left: r.left })
    }
    setOpen(o => !o)
  }

  const allMods = Object.entries(MOD_META)

  const menu = open ? createPortal(
    <div data-dzmenu style={{
      position: 'fixed', top: menuPos.top, left: menuPos.left, minWidth: 180,
      zIndex: 9999, background: C.bgPop, border: `1px solid ${C.border}`, borderRadius: 12,
      boxShadow: '0 12px 40px rgba(0,0,0,.55)', padding: 6,
      display: 'flex', flexDirection: 'column', gap: 2,
      animation: 'dzMenuIn .15s cubic-bezier(.22,1,.36,1)',
    }}>
      {allMods.map(([type, meta]) => (
        <button key={type}
          onClick={() => { onDrop(type); setOpen(false) }}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px',
            background: meta.ibg, border: `1px solid ${meta.ic}44`, borderRadius: 8,
            cursor: 'pointer', color: C.textPri, fontSize: 11, fontWeight: 700,
            whiteSpace: 'nowrap', transition: 'filter .1s', width: '100%', textAlign: 'left' }}
          onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.3)'}
          onMouseLeave={e => e.currentTarget.style.filter = ''}>
          <span style={{ fontSize: 13, color: meta.ic }}>{meta.icon}</span>
          {meta.label}
        </button>
      ))}
    </div>,
    document.body
  ) : null

  return (
    <>
      <div ref={zoneRef}
        onDragOver={e => { e.preventDefault(); if (e.dataTransfer.types.includes('moduletype')) { e.stopPropagation(); setOver(true) } }}
        onDragLeave={e => { e.stopPropagation(); setOver(false) }}
        onDrop={e => { e.preventDefault(); const mt = e.dataTransfer.getData('moduleType'); if (mt) { e.stopPropagation(); onDrop(mt) } setOver(false) }}
        style={{
          position: 'relative', minHeight: compact ? 30 : 42,
          border: `1.5px dashed ${over ? C.primary : open ? 'rgba(75,175,245,0.6)' : 'rgba(75,175,245,0.35)'}`,
          borderRadius: 8,
          background: over ? 'rgba(59,154,240,0.18)' : open ? 'rgba(75,175,245,0.08)' : 'rgba(75,175,245,0.05)',
          boxShadow: over ? '0 0 0 3px rgba(59,154,240,0.15)' : open ? '0 0 0 2px rgba(75,175,245,0.2)' : 'none',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
          transition: 'all .12s', fontSize: 11,
          color: over ? C.primary : 'rgba(75,175,245,0.55)',
          fontWeight: 600, cursor: 'default', userSelect: 'none', padding: '6px 8px',
          letterSpacing: '.02em',
        }}>
        {over ? <span style={{ fontSize: 10 }}>✦ Soltar aquí</span> : null}
        <button ref={btnRef} data-dzbtn onClick={toggleMenu}
          style={{ width: 20, height: 20, borderRadius: '50%',
            background: open ? 'rgba(75,175,245,0.25)' : 'rgba(75,175,245,0.12)',
            border: `1px solid rgba(75,175,245,${open ? .6 : .35})`,
            color: `rgba(75,175,245,${open ? .9 : .65})`,
            fontSize: 14, fontWeight: 700, lineHeight: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all .12s', flexShrink: 0, padding: 0 }}>
          {open ? '×' : '+'}
        </button>
      </div>
      {menu}
    </>
  )
}

export default DropZone
