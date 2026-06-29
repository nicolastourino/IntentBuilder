import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useC, useM } from '../theme/index.js'
import { STEP_CFG } from '../constants/index.js'
import { buildDiagram } from '../utils/diagram.js'
import { IconSun, IconMoon } from './icons/index.jsx'
import StepDiagNode from './diagram/StepDiagNode.jsx'
import ModDiagNode  from './diagram/ModDiagNode.jsx'

const DiagramView = ({ steps, intentName, onClose, onHome, onOpenStep, onToggleTheme, dark }) => {
  const C = useC()
  const M = useM()
  const [zoom,       setZoom]       = useState(1)
  const [pan,        setPan]        = useState({ x: 0, y: 40 })
  const [zoomInput,  setZoomInput]  = useState(null)
  const [dragging,   setDragging]   = useState(false)
  const [dragStart,  setDragStart]  = useState(null)
  const [hlStep,     setHlStep]     = useState(null)
  const canvasRef = useRef(null)
  const zoomRef   = useRef(1)
  const panRef    = useRef({ x: 0, y: 40 })
  useEffect(() => { zoomRef.current = zoom }, [zoom])
  useEffect(() => { panRef.current  = pan  }, [pan])

  const diag = useMemo(() => buildDiagram(steps), [steps])
  const { nodes, edges, stepSeqEdges, stepBounds, totalH, CW, nm, contentLeft = 0, contentRight = CW } = diag

  useEffect(() => {
    if (!CW) return
    const center = () => {
      const r = canvasRef.current?.getBoundingClientRect()
      if (r && r.width > 100) {
        const contentW = contentRight - contentLeft
        const cx = (r.width - contentW) / 2 - contentLeft
        setPan({ x: Math.max(20, cx), y: 40 })
        panRef.current = { x: Math.max(20, cx), y: 40 }
      }
    }
    center()
    const t = setTimeout(center, 120)
    return () => clearTimeout(t)
  }, [CW, contentLeft, contentRight])

  const zoomAt = useCallback((cx, cy, delta) => {
    const oldZ = zoomRef.current
    const newZ = Math.min(2.5, Math.max(.2, oldZ + delta))
    const scale = newZ / oldZ
    const p = panRef.current
    setZoom(newZ)
    setPan({ x: cx - (cx - p.x) * scale, y: cy - (cy - p.y) * scale })
  }, [])

  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const h = e => {
      e.preventDefault()
      const r = el.getBoundingClientRect()
      zoomAt(e.clientX - r.left, e.clientY - r.top, e.deltaY < 0 ? .12 : -.12)
    }
    el.addEventListener('wheel', h, { passive: false })
    return () => el.removeEventListener('wheel', h)
  }, [zoomAt])

  const onMD = useCallback(e => {
    setDragging(true)
    setDragStart({ x: e.clientX - panRef.current.x, y: e.clientY - panRef.current.y })
  }, [])
  const onMM = useCallback(e => {
    if (!dragging || !dragStart) return
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
  }, [dragging, dragStart])
  const onMU = useCallback(() => { setDragging(false); setDragStart(null) }, [])

  const touchDistRef = useRef(null)
  const onTouchStart = useCallback(e => {
    if (e.touches.length === 1) {
      const t = e.touches[0]
      onMD({ clientX: t.clientX, clientY: t.clientY, button: 0 })
      touchDistRef.current = null
    } else if (e.touches.length === 2) {
      setDragging(false)
      touchDistRef.current = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
    }
  }, [onMD])
  const onTouchMove = useCallback(e => {
    e.preventDefault()
    if (e.touches.length === 1 && touchDistRef.current === null) {
      onMM({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY })
    } else if (e.touches.length === 2 && touchDistRef.current !== null) {
      const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY)
      const r = canvasRef.current?.getBoundingClientRect()
      if (r) {
        const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2 - r.left
        const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2 - r.top
        zoomAt(cx, cy, (dist - touchDistRef.current) * 0.005)
      }
      touchDistRef.current = dist
    }
  }, [onMM, zoomAt])
  const onTouchEnd = useCallback(() => { touchDistRef.current = null; onMU() }, [onMU])

  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove',  onTouchMove,  { passive: false })
    el.addEventListener('touchend',   onTouchEnd,   { passive: true })
    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove',  onTouchMove)
      el.removeEventListener('touchend',   onTouchEnd)
    }
  }, [onTouchStart, onTouchMove, onTouchEnd])

  const bzr = (x1, y1, x2, y2) => {
    const dx = x2 - x1, dy = y2 - y1
    if (Math.abs(dx) < 4) return `M ${x1} ${y1} L ${x2} ${y2}`
    const hy = y1 + Math.max(24, dy * .42)
    const r  = Math.min(14, Math.abs(dx) / 2, Math.abs(dy) / 2)
    const sx = dx > 0 ? 1 : -1
    return [
      `M ${x1} ${y1}`,
      `L ${x1} ${hy - r}`,
      `Q ${x1} ${hy} ${x1 + sx * r} ${hy}`,
      `L ${x2 - sx * r} ${hy}`,
      `Q ${x2} ${hy} ${x2} ${hy + r}`,
      `L ${x2} ${y2}`,
    ].join(' ')
  }

  const defCol = 'rgba(168,196,202,0.32)'
  const btnZ = { background: 'none', border: `1px solid ${C.border}`, borderRadius: 4,
    cursor: 'pointer', color: C.textSec, fontWeight: 700, fontSize: 13,
    width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', flexDirection: 'column', background: C.bgBase }} className="fu">

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10,
        paddingTop: M ? 'env(safe-area-inset-top,0px)' : 0,
        paddingLeft: 18, paddingRight: 18, paddingBottom: 0,
        height: M ? 'calc(48px + env(safe-area-inset-top,0px))' : 52,
        background: C.bgCard, borderBottom: `1px solid ${C.border}`,
        flexShrink: 0, boxShadow: '0 2px 16px rgba(0,0,0,.5)' }}>
        <img src={C.logo} alt="SAIL" onClick={onHome || onClose}
          style={{ height: 30, objectFit: 'contain', marginRight: 4, cursor: 'pointer' }} title="Página principal"/>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span style={{ fontWeight: 800, fontSize: 14, color: C.textPri }}>Flujo del Intent</span>
          {intentName && !M && <span style={{ fontSize: 10, color: C.textMut, fontWeight: 600, letterSpacing: '.05em' }}>{intentName}</span>}
        </div>
        <div style={{ flex: 1 }}/>
        <button onClick={onToggleTheme}
          title={dark ? 'Modo Light' : 'Modo Dark'}
          style={{ background: C.bgSec, border: `1px solid ${C.border}`, borderRadius: 8,
            padding: '6px 8px', cursor: 'pointer', color: C.textSec, display: 'flex', alignItems: 'center', transition: 'all .14s' }}
          onMouseEnter={e => { e.currentTarget.style.background = C.bgPop; e.currentTarget.style.color = C.primary }}
          onMouseLeave={e => { e.currentTarget.style.background = C.bgSec; e.currentTarget.style.color = C.textSec }}>
          {dark ? <IconSun size={16}/> : <IconMoon size={16}/>}
        </button>
      </div>

      {/* Sub-bar */}
      <div style={{ padding: '0 20px', height: 36, background: C.bgSec,
        borderBottom: `1px solid ${C.border}`, fontSize: 11, color: C.textMut,
        display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, overflowX: M ? 'auto' : 'hidden' }}>
        {!M && [
          [STEP_CFG.jumpToStep.ic,   'Jump to Step'],
          [STEP_CFG.returnResult.ic, 'Return Result'],
          [STEP_CFG.obtainValue.ic,  'Obtain Value'],
        ].map(([col, lbl]) => (
          <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 9, height: 9, borderRadius: 2, background: col, flexShrink: 0 }}/>
            <span style={{ fontSize: 10, color: col, fontWeight: 700 }}>{lbl}</span>
          </div>
        ))}
        <div style={{ flex: 1 }}/>
        <button onClick={onClose}
          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 6,
            fontSize: 10, fontWeight: 700, cursor: 'pointer', border: `1.5px solid ${C.primary}`,
            color: C.primary, background: 'rgba(59,154,240,.08)', transition: 'all .12s', flexShrink: 0 }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,154,240,.22)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(59,154,240,.08)'}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
          Vista Edición
        </button>
        <div style={{ width: 1, height: 14, background: C.border, margin: '0 2px' }}/>
        <button style={btnZ} title="Acercar (+)"
          onClick={() => { const r = canvasRef.current?.getBoundingClientRect(); if (r) zoomAt(r.width / 2, r.height / 2, .12) }}>+</button>
        <input
          style={{ width: 46, textAlign: 'center', fontSize: 11, fontWeight: 700,
            color: '#A8C4CA', background: 'rgba(59,154,240,.1)',
            border: '1px solid rgba(59,154,240,.22)', borderRadius: 4, padding: '2px 4px',
            outline: 'none', cursor: 'text' }}
          value={zoomInput !== null ? zoomInput : Math.round(zoom * 100) + '%'}
          onChange={e => setZoomInput(e.target.value)}
          onFocus={e => { setZoomInput(Math.round(zoom * 100) + ''); e.target.select() }}
          onBlur={() => { const v = parseInt(zoomInput); if (!isNaN(v)) setZoom(Math.min(2.5, Math.max(.1, v / 100))); setZoomInput(null) }}
          onKeyDown={e => {
            if (e.key === 'Enter')  { const v = parseInt(zoomInput); if (!isNaN(v)) setZoom(Math.min(2.5, Math.max(.1, v / 100))); setZoomInput(null); e.target.blur() }
            if (e.key === 'Escape') { setZoomInput(null); e.target.blur() }
          }}
        />
        <button style={btnZ} title="Alejar (-)"
          onClick={() => { const r = canvasRef.current?.getBoundingClientRect(); if (r) zoomAt(r.width / 2, r.height / 2, -.12) }}>&#8722;</button>
        <button style={{ ...btnZ, fontSize: 14 }} title="Fit to screen"
          onClick={() => {
            const r = canvasRef.current?.getBoundingClientRect()
            if (!r) return
            const fz = Math.min(r.width / CW, r.height / totalH, .9) * .88
            const nz = Math.min(2.5, Math.max(.2, fz))
            setZoom(nz)
            const cx = (r.width  - CW     * nz) / 2
            const cy = Math.max(20, (r.height - totalH * nz) / 2)
            setPan({ x: cx, y: cy }); panRef.current = { x: cx, y: cy }
          }}>⛶</button>
      </div>

      {/* Canvas */}
      <div ref={canvasRef}
        style={{ flex: 1, overflow: 'hidden', position: 'relative',
          cursor: dragging ? 'grabbing' : 'grab',
          backgroundImage: 'radial-gradient(circle,rgba(59,154,240,0.12) 1px,transparent 1px)',
          backgroundSize: '26px 26px', backgroundPosition: '13px 13px',
          userSelect: 'none' }}
        onMouseDown={onMD} onMouseMove={onMM} onMouseUp={onMU} onMouseLeave={onMU}>
        <div style={{
          transform: `translate(${pan.x}px,${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          width: CW, position: 'relative', minHeight: totalH,
          paddingBottom: 60, pointerEvents: 'none',
        }}>

          {/* Step background panels */}
          {stepBounds.map((b, i) => b && (
            <div key={`sbg${i}`} style={{
              position: 'absolute', left: b.x, top: b.y, width: b.w, height: b.h,
              background: `linear-gradient(160deg,${b.acc}28 0%,${b.acc}10 100%)`,
              border: `2px solid ${b.acc}70`,
              borderLeft: `5px solid ${b.acc}`,
              borderRadius: 18,
              pointerEvents: 'none',
              boxShadow: `inset 0 0 40px ${b.acc}12, 0 0 0 1px ${b.acc}18`,
            }}>
              <div style={{ position: 'absolute', top: 10, right: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: b.acc,
                  background: `${b.acc}18`, border: `1px solid ${b.acc}50`, borderRadius: 6, padding: '2px 8px', userSelect: 'none' }}>
                  {(STEP_CFG[b.stype] || STEP_CFG.obtainValue).label}
                </span>
              </div>
            </div>
          ))}

          {/* SVG edges */}
          <svg width={CW} height={totalH} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', overflow: 'visible' }}>
            <defs>
              {[
                { id: 'ma0', c: defCol },
                { id: 'ma1', c: 'rgba(59,154,240,.7)' },
                { id: 'ma2', c: '#10b981' },
                { id: 'ma3', c: '#f87171' },
                { id: 'ma4', c: 'rgba(59,154,240,.45)' },
              ].map(({ id, c }) => (
                <marker key={id} id={id} markerWidth="10" markerHeight="10"
                  refX="8" refY="5" orient="auto" markerUnits="userSpaceOnUse">
                  <path d="M 1,1 L 9,5 L 1,9 Z" fill={c}/>
                </marker>
              ))}
            </defs>

            {edges.map((e, ei) => {
              const fn = nm[e.f], tn = nm[e.t]
              if (!fn || !tn) return null
              const x1 = fn.cx, y1 = fn.y + fn.h
              const x2 = e.toCX !== undefined ? e.toCX : tn.cx
              const y2 = tn.y
              const isTr  = e.col === '#10b981'
              const isFa  = e.col === '#f87171'
              const isAcc = !!e.col && !e.lbl && !isTr && !isFa
              const col   = e.col || (isAcc ? 'rgba(59,154,240,.6)' : defCol)
              const mId   = isTr ? 'ma2' : isFa ? 'ma3' : isAcc ? 'ma1' : 'ma0'
              const d     = bzr(x1, y1, x2, y2)
              const lx = x1 + (x2 - x1) * .22
              const ly = y1 + (y2 - y1) * .22
              return (
                <g key={ei}>
                  <path d={d} fill="none" stroke={col} strokeWidth="1.5"
                    strokeOpacity={isAcc ? .65 : 1} markerEnd={`url(#${mId})`}/>
                  {e.lbl && (
                    <g>
                      <rect x={lx - 16} y={ly - 10} width={32} height={20} rx="10"
                        fill={dark ? '#0E1B32' : '#FFFFFF'} stroke={col} strokeWidth="2"/>
                      <text x={lx} y={ly + .5} textAnchor="middle"
                        fill={dark ? col : col === '#10b981' ? '#059669' : col === '#f87171' ? '#dc2626' : col}
                        fontSize="9" fontWeight="900" dominantBaseline="middle">
                        {e.lbl}
                      </text>
                    </g>
                  )}
                </g>
              )
            })}

            {stepSeqEdges.map((e, i) => (
              <g key={`sq${i}`}>
                <line x1={e.x} y1={e.y1} x2={e.x} y2={e.y2}
                  stroke="rgba(59,154,240,.3)" strokeWidth="1.5" strokeDasharray="5 4"
                  markerEnd="url(#ma4)"/>
              </g>
            ))}
          </svg>

          {/* Nodes */}
          {nodes.map(nd => (
            <div key={nd.id} style={{ position: 'absolute', left: nd.x, top: nd.y, width: nd.w, height: nd.h }}>
              {nd.role === 'step'
                ? <StepDiagNode step={nd.step} isHighlighted={hlStep === nd.step.step} onClick={() => onOpenStep(nd.step.step)}/>
                : <ModDiagNode  nd={nd} setHighlightStep={setHlStep} onOpenStep={onOpenStep}/>
              }
            </div>
          ))}

          {/* Highlight ring */}
          {hlStep !== null && (() => {
            const snd = nodes.find(n => n.role === 'step' && n.step && n.step.step === hlStep)
            if (!snd) return null
            return (
              <div style={{
                position: 'absolute', left: snd.x - 4, top: snd.y - 4,
                width: snd.w + 8, height: snd.h + 8,
                border: `2px solid ${C.jump}`, borderRadius: 14,
                boxShadow: `0 0 0 4px rgba(245,158,11,.2),0 0 28px rgba(245,158,11,.18)`,
                pointerEvents: 'none', animation: 'pulseStep 1.5s ease infinite',
              }}/>
            )
          })()}
        </div>
      </div>
    </div>
  )
}

export default DiagramView
