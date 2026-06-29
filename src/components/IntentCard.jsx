import React, { useState } from 'react'
import { useC, useM } from '../theme/index.js'
import { BADGE_CFG } from '../constants/index.js'

const IntentCard = ({ intent, onPreview, onEdit, onToggleActive }) => {
  const C   = useC()
  const M   = useM()
  const bCfg    = intent.canBeStarter ? BADGE_CFG['Starter'] : null
  const [hov,    setHov]    = useState(false)
  const [hovAct, setHovAct] = useState(null)
  const wfLen    = (intent.workflow || []).length
  const isActive = intent.active !== false
  const desc     = intent.description || ''
  const descPreview = desc.length > 72 ? desc.slice(0, 70) + '…' : desc

  // ── MOBILE ────────────────────────────────────────────────────────────
  if (M) return (
    <div onClick={() => onEdit && onEdit()}
      style={{ background: C.bgCard, borderRadius: 16, padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: 14,
        border: `1px solid ${C.border}`,
        boxShadow: `0 1px 4px rgba(0,0,0,.06)`,
        opacity: isActive ? 1 : 0.42, transition: 'opacity .14s', boxSizing: 'border-box',
        cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: `${C.primary}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 11, height: 11, borderRadius: '50%',
          background: isActive && wfLen > 0 ? C.primary : `${C.textMut}44` }}/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: C.textPri, lineHeight: 1.25,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>
          {intent.type}
          {bCfg && (
            <span style={{ marginLeft: 7, color: bCfg.color, background: bCfg.bg,
              fontSize: 9, padding: '1px 5px', borderRadius: 99, fontWeight: 700, verticalAlign: 'middle' }}>Starter</span>
          )}
        </div>
        {desc && (
          <div style={{ fontSize: 12, color: C.textMut, marginBottom: 4,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{desc}</div>
        )}
        <div style={{ display: 'flex', gap: 12 }}>
          <span style={{ fontSize: 11, color: C.textMut }}>Pasos <b style={{ color: C.textSec }}>{wfLen}</b></span>
          <span style={{ fontSize: 11, color: C.textMut }}>Inputs <b style={{ color: C.textSec }}>{(intent.input || []).length}</b></span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, flexShrink: 0 }}>
        <div onClick={e => { e.stopPropagation(); onToggleActive && onToggleActive() }}
          style={{ width: 42, height: 24, borderRadius: 99,
            background: isActive ? C.primary : `${C.textMut}33`,
            position: 'relative', cursor: 'pointer', transition: 'background .2s' }}>
          <div style={{ position: 'absolute', top: 3, left: isActive ? 20 : 3, width: 18, height: 18,
            borderRadius: '50%', background: '#fff', transition: 'left .18s',
            boxShadow: '0 1px 4px rgba(0,0,0,.28)' }}/>
        </div>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
          stroke={C.textMut} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </div>
    </div>
  )

  // ── DESKTOP ────────────────────────────────────────────────────────────
  return (
    <div
      style={{ background: isActive ? C.bgCard : C.bgSec,
        border: `1px solid ${hov && isActive ? C.primary : C.border}`, borderRadius: 14,
        padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 0,
        transition: 'all .16s',
        boxShadow: hov && isActive ? `0 4px 24px rgba(59,154,240,.14)` : 'none',
        cursor: 'default', height: '100%', boxSizing: 'border-box',
        opacity: isActive ? 1 : 0.55, filter: isActive ? 'none' : 'grayscale(0.4)' }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, flex: 1, minWidth: 0 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%',
            background: isActive && wfLen > 0 ? C.primary : 'rgba(168,196,202,0.3)',
            flexShrink: 0, marginTop: 4 }}/>
          <span style={{ fontWeight: 700, fontSize: 13, color: C.textPri, lineHeight: 1.3,
            overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            wordBreak: 'break-all' }}>{intent.type}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, marginTop: 1 }}>
          {bCfg && (
            <span style={{ color: bCfg.color, background: bCfg.bg, border: `1px solid ${bCfg.border}`,
              fontSize: 10, padding: '2px 7px', borderRadius: 99, fontWeight: 700, whiteSpace: 'nowrap' }}>Starter</span>
          )}
          <button onClick={e => { e.stopPropagation(); onPreview && onPreview() }}
            onMouseEnter={() => setHovAct('p')} onMouseLeave={() => setHovAct(null)}
            title="Vista previa"
            style={{ background: hovAct === 'p' ? C.bgPop : 'none', border: `1px solid ${hovAct === 'p' ? C.border : 'transparent'}`,
              borderRadius: 7, padding: '4px 5px', cursor: 'pointer', transition: 'all .12s', display: 'flex', alignItems: 'center', lineHeight: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke={hovAct === 'p' ? C.primary : C.textMut} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
          <button onClick={e => { e.stopPropagation(); onEdit && onEdit() }}
            onMouseEnter={() => setHovAct('e')} onMouseLeave={() => setHovAct(null)}
            title="Editar"
            style={{ background: hovAct === 'e' ? C.primary : 'none', border: `1px solid ${hovAct === 'e' ? C.primary : 'transparent'}`,
              borderRadius: 7, padding: '4px 5px', cursor: 'pointer', transition: 'all .12s', display: 'flex', alignItems: 'center', lineHeight: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke={hovAct === 'e' ? '#fff' : C.textMut} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Description */}
      <p style={{ fontSize: 11, color: C.textMut, margin: '0 0 8px 0', lineHeight: 1.4,
        minHeight: 28, flex: 1, overflow: 'hidden', display: '-webkit-box',
        WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
        {descPreview || <span style={{ fontStyle: 'italic', opacity: .5 }}>Sin descripción</span>}
      </p>

      {/* Stats + active toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
        <span style={{ fontSize: 11 }}><span style={{ color: C.textMut }}>Pasos </span><b style={{ color: C.textSec }}>{wfLen}</b></span>
        <span style={{ fontSize: 11 }}><span style={{ color: C.textMut }}>Inputs </span><b style={{ color: C.textSec }}>{(intent.input || []).length}</b></span>
        <div style={{ flex: 1 }}/>
        <div onClick={e => { e.stopPropagation(); onToggleActive && onToggleActive() }}
          title={isActive ? 'Desactivar' : 'Activar'}
          style={{ width: 32, height: 17, borderRadius: 99, background: isActive ? C.primary : C.textMut + '44',
            cursor: 'pointer', position: 'relative', transition: 'background .2s', flexShrink: 0 }}>
          <div style={{ position: 'absolute', top: 2, left: isActive ? 16 : 2, width: 13, height: 13,
            borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.25)' }}/>
        </div>
      </div>
    </div>
  )
}

export default IntentCard
