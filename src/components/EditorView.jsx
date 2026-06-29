import React, { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useC, useM } from '../theme/index.js'
import { STEP_CFG, BADGE_CFG, DEF } from '../constants/index.js'
import { getMeta } from '../utils/misc.js'
import { IconSun, IconMoon } from './icons/index.jsx'
import DiagramView   from './DiagramView.jsx'
import StepCard      from './StepCard.jsx'
import Palette       from './Palette.jsx'
import SettingsModal from './SettingsModal.jsx'
import Toast             from './Toast.jsx'
import StepConnectorComp from './diagram/StepConnector.jsx'

const dotGridBg = {
  backgroundImage: 'radial-gradient(circle,rgba(59,154,240,0.16) 1px,transparent 1px)',
  backgroundSize: '28px 28px',
}

const EditorView = ({ intent: ii, onBack, onSave, onToggleTheme, dark, initialDiagram = false }) => {
  const C = useC()
  const M = useM()

  const [intent,           setIntent]           = useState({ ...ii })
  const [steps,            setSteps]            = useState(() => (ii.workflow || []).map(s => ({ ...s })))
  const [saved,            setSaved]            = useState(false)
  const savedRef                                = useRef(JSON.stringify({ ...ii, workflow: ii.workflow || [] }))
  const [editMode,         setEditMode]         = useState(!initialDiagram)
  const [collapsedSteps,   setCollapsedSteps]   = useState(() => new Set((ii.workflow || []).map(s => s.step)))
  const [hovStepIdx,       setHovStepIdx]       = useState(null)
  const [dragStepIdx,      setDragStepIdx]      = useState(null)
  const dragIdxRef                              = useRef(null)
  const stepEls                                 = useRef([])
  const [dragOverIdx,      setDragOverIdx]      = useState(null)
  const [highlightStep,    setHighlightStep]    = useState(null)
  const [showSettingsModal,setShowSettingsModal]= useState(false)
  const [palettePinned,    setPalettePinned]    = useState(true)
  const [paletteMob,       setPaletteMob]       = useState(false)
  const [editZoom,         setEditZoom]         = useState(1)
  const [editZoomInput,    setEditZoomInput]    = useState(null)
  const [spacePan,         setSpacePan]         = useState(false)
  const isPanning                               = useRef(false)
  const panStart                                = useRef({ x: 0, y: 0, sl: 0, st: 0 })
  const [dragInsertIdx,    setDragInsertIdx]    = useState(null)
  const [toast,            setToast]            = useState(null)
  const [allCollapsed,     setAllCollapsed]     = useState(true)
  const toastTimer                              = useRef(null)
  const stepsRef                                = useRef(steps)
  const editZoomRef                             = useRef(editZoom)
  useEffect(() => { stepsRef.current   = steps   }, [steps])
  useEffect(() => { editZoomRef.current = editZoom }, [editZoom])

  const histRef = useRef({ stack: [(ii.workflow || []).map(s => ({ ...s }))], idx: 0 })

  const showToast = useCallback(msg => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast(msg)
    toastTimer.current = setTimeout(() => setToast(null), 2000)
  }, [])

  const pushHistory = useCallback(newSteps => {
    const h = histRef.current
    h.stack = h.stack.slice(0, h.idx + 1)
    h.stack.push(newSteps.map(s => ({ ...s })))
    if (h.stack.length > 40) h.stack.shift(); else h.idx++
  }, [])

  const undo = useCallback(() => {
    const h = histRef.current
    if (h.idx <= 0) { showToast('⚑ No hay más cambios para deshacer'); return }
    h.idx--
    setSteps(h.stack[h.idx].map(s => ({ ...s })))
    showToast('↩ Deshacer')
  }, [showToast])

  const redo = useCallback(() => {
    const h = histRef.current
    if (h.idx >= h.stack.length - 1) { showToast('⚑ No hay más cambios para rehacer'); return }
    h.idx++
    setSteps(h.stack[h.idx].map(s => ({ ...s })))
    showToast('↪ Rehacer')
  }, [showToast])

  useEffect(() => {
    const handler = e => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') { e.preventDefault(); undo() }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) { e.preventDefault(); redo() }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [undo, redo])

  const editCanvasRef = useRef(null)

  // Spacebar pan mode (Figma-style)
  useEffect(() => {
    const down = e => {
      if (e.code === 'Space' && !e.repeat && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault(); setSpacePan(true)
      }
    }
    const up = e => { if (e.code === 'Space') { setSpacePan(false); isPanning.current = false } }
    window.addEventListener('keydown', down, { capture: true })
    window.addEventListener('keyup',   up,   { capture: true })
    return () => {
      window.removeEventListener('keydown', down, { capture: true })
      window.removeEventListener('keyup',   up,   { capture: true })
    }
  }, [])

  useEffect(() => {
    const el = editCanvasRef.current
    if (!el) return
    const mdown = e => {
      if (!spacePan) return
      e.preventDefault()
      isPanning.current = true
      panStart.current = { x: e.clientX, y: e.clientY, sl: el.scrollLeft, st: el.scrollTop }
      el.style.cursor = 'grabbing'
    }
    const mmove = e => {
      if (!isPanning.current) return
      e.preventDefault()
      el.scrollLeft = panStart.current.sl - (e.clientX - panStart.current.x)
      el.scrollTop  = panStart.current.st - (e.clientY - panStart.current.y)
    }
    const mup = () => {
      if (isPanning.current) { isPanning.current = false; el.style.cursor = spacePan ? 'grab' : '' }
    }
    el.addEventListener('mousedown', mdown)
    window.addEventListener('mousemove', mmove)
    window.addEventListener('mouseup',   mup)
    return () => {
      el.removeEventListener('mousedown', mdown)
      window.removeEventListener('mousemove', mmove)
      window.removeEventListener('mouseup',   mup)
    }
  }, [spacePan])

  const toggleStep = sn => setCollapsedSteps(prev => { const n = new Set(prev); n.has(sn) ? n.delete(sn) : n.add(sn); return n })

  const collapseAll = () => { setCollapsedSteps(new Set(steps.map(s => s.step))); setAllCollapsed(true)  }
  const expandAll   = () => { setCollapsedSteps(new Set()); setAllCollapsed(false) }

  const handleStepChange = useCallback(u => {
    const next = stepsRef.current.map(s => s.step === u.step ? u : s)
    pushHistory(next)
    setSteps(next)
  }, [pushHistory])

  const addStep = () => {
    const mx = steps.reduce((m, s) => Math.max(m, s.step), -1)
    const ns = { step: mx + 1, type: 'obtainValue', title: 'step' + (mx + 1), modules: [] }
    const next = [...steps, ns]
    pushHistory(next)
    setSteps(next)
    setCollapsedSteps(prev => new Set([...prev, mx + 1]))
    showToast('✚ Paso agregado')
  }

  const removeStep = sn => {
    const next = steps.filter(s => s.step !== sn).map((s, i) => ({ ...s, step: i }))
    pushHistory(next)
    setSteps(next)
    setCollapsedSteps(prev => {
      const n = new Set()
      prev.forEach(v => { if (v !== sn) n.add(v < sn ? v : v - 1) })
      return n
    })
    showToast('✖ Paso eliminado')
  }

  const onHandleDown = (e, idx) => {
    if (e.button !== 0) return
    e.preventDefault()
    const startY = e.clientY
    let active = false
    let insIdx = idx
    dragIdxRef.current = idx

    const calcIns = clientY => {
      let ins = stepsRef.current.length
      for (let j = 0; j < stepEls.current.length; j++) {
        const el = stepEls.current[j]
        if (!el) continue
        const r = el.getBoundingClientRect()
        if (clientY <= r.top + r.height / 2) { ins = j; break }
      }
      return ins
    }

    const onMove = ev => {
      if (!active && Math.abs(ev.clientY - startY) < 4) return
      if (!active) { active = true; setDragStepIdx(idx) }
      insIdx = calcIns(ev.clientY)
      setDragInsertIdx(insIdx)
      setDragOverIdx(insIdx)
    }

    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup',   onUp)
      dragIdxRef.current = null
      if (active && insIdx !== idx && insIdx !== idx + 1) {
        const arr = [...stepsRef.current]
        const [item] = arr.splice(idx, 1)
        const at = insIdx > idx ? insIdx - 1 : insIdx
        arr.splice(at, 0, item)
        const reordered = arr.map((s, j) => ({ ...s, step: j }))
        pushHistory(reordered)
        setSteps(reordered)
        setCollapsedSteps(new Set(reordered.map(s => s.step)))
        showToast('⇅ Pasos reordenados')
      }
      setDragStepIdx(null); setDragInsertIdx(null); setDragOverIdx(null)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
  }

  const isDirtyEditor = JSON.stringify({ ...intent, workflow: steps }) !== savedRef.current
  const save = () => {
    const payload = { ...intent, workflow: steps }
    onSave(payload)
    savedRef.current = JSON.stringify(payload)
    setSaved(true)
    setTimeout(() => setSaved(false), 2200)
  }

  const openStepFromDiagram = sn => {
    setEditMode(true)
    setCollapsedSteps(prev => { const n = new Set(prev); n.delete(sn); return n })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: C.bgBase }}>

      {/* Diagram overlay */}
      {!editMode && (
        <DiagramView steps={steps} intentName={intent.type}
          onClose={() => setEditMode(true)} onHome={onBack}
          onOpenStep={openStepFromDiagram}
          onToggleTheme={onToggleTheme} dark={dark}/>
      )}

      {toast && <Toast msg={toast}/>}

      {/* ── Top bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8,
        paddingTop:    M ? 'env(safe-area-inset-top,0px)' : 0,
        paddingLeft:   M ? 12 : 16,
        paddingRight:  M ? 12 : 16,
        paddingBottom: 0,
        height: M ? 'calc(48px + env(safe-area-inset-top,0px))' : 52,
        background: C.bgCard, borderBottom: `1px solid ${C.border}`, flexShrink: 0,
        boxShadow: '0 2px 12px rgba(0,0,0,0.3)', zIndex: 10 }}>

        <img src={C.logo} alt="SAIL" onClick={onBack}
          style={{ height: 30, objectFit: 'contain', marginRight: 4, cursor: 'pointer' }}
          title="Volver al inicio"/>

        <button onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none',
            border: `1.5px solid ${C.primary}`, borderRadius: 8, cursor: 'pointer',
            color: C.primary, fontWeight: 700, fontSize: 12, padding: '6px 12px', transition: 'all .12s', flexShrink: 0 }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,154,240,.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}>
          ← Volver
        </button>

        {!M && <span style={{ color: C.border, fontSize: 18, opacity: .5 }}>/</span>}
        {!M && <span style={{ fontWeight: 700, fontSize: 14, color: C.textPri, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{intent.type}</span>}
        {!M && intent.canBeStarter && (
          <span style={{ color: BADGE_CFG['Starter']?.color || C.primary, background: BADGE_CFG['Starter']?.bg || 'rgba(59,154,240,.12)',
            border: `1px solid ${BADGE_CFG['Starter']?.border || C.primary}`, fontSize: 10, padding: '2px 8px', borderRadius: 99, fontWeight: 700, flexShrink: 0 }}>
            Starter
          </span>
        )}

        {editMode && (
          <>
            <div style={{ flex: 1 }}/>
            <button onClick={onToggleTheme}
              title={dark ? 'Modo Light' : 'Modo Dark'}
              style={{ background: C.bgSec, border: `1px solid ${C.border}`, borderRadius: 8,
                padding: '6px 8px', cursor: 'pointer', color: C.textSec, display: 'flex', alignItems: 'center', transition: 'all .14s' }}
              onMouseEnter={e => { e.currentTarget.style.background = C.bgPop; e.currentTarget.style.color = C.primary }}
              onMouseLeave={e => { e.currentTarget.style.background = C.bgSec; e.currentTarget.style.color = C.textSec }}>
              {dark ? <IconSun size={16}/> : <IconMoon size={16}/>}
            </button>
            <button onClick={save} disabled={!isDirtyEditor && !saved}
              style={{ padding: '7px 18px',
                background: saved ? '#059669' : isDirtyEditor ? C.primary : C.bgSec,
                color: saved || isDirtyEditor ? '#fff' : C.textMut,
                border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13,
                cursor: isDirtyEditor ? 'pointer' : 'default',
                transition: 'background .2s', flexShrink: 0,
                opacity: isDirtyEditor || saved ? 1 : 0.5 }}>
              {saved ? '✓ Guardado' : 'Guardar'}
            </button>
          </>
        )}
      </div>

      {/* ── Body (editor only) ── */}
      {editMode && (
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {showSettingsModal && createPortal(
            <SettingsModal intent={intent} onChange={setIntent} onClose={() => setShowSettingsModal(false)}/>,
            document.body
          )}

          {/* Palette — desktop only */}
          {!M && <Palette pinned={palettePinned} onTogglePin={() => setPalettePinned(v => !v)} onOpenSettings={() => setShowSettingsModal(true)}/>}

          {/* Main content */}
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', ...dotGridBg }}>

            {/* Sub-header */}
            <div style={{ padding: M ? '0 12px' : '0 20px', height: 36, background: C.bgSec,
              borderBottom: `1px solid ${C.border}`, fontSize: 11, color: C.textMut,
              display: 'flex', alignItems: 'center', gap: M ? 6 : 10, flexShrink: 0, overflowX: M ? 'auto' : 'hidden' }}>
              <span style={{ fontWeight: 700, color: C.textSec, whiteSpace: 'nowrap' }}>
                Editando &middot; <span style={{ color: C.primary }}>{intent.type}</span>
              </span>
              {!M && <span style={{ color: C.border }}>|</span>}
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

              {/* Vista Flujo */}
              <button onClick={() => setEditMode(false)}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 6,
                  fontSize: 10, fontWeight: 700, cursor: 'pointer', border: `1.5px solid ${C.primary}`,
                  color: C.primary, background: 'rgba(59,154,240,.08)', transition: 'all .12s', flexShrink: 0 }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,154,240,.22)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(59,154,240,.08)'}>
                <svg width="11" height="11" viewBox="0 0 13 13" fill="none"><circle cx="2" cy="2" r="1.5" fill="currentColor"/><circle cx="6.5" cy="2" r="1.5" fill="currentColor"/><circle cx="11" cy="2" r="1.5" fill="currentColor"/><line x1="6.5" y1="3.5" x2="6.5" y2="11" stroke="currentColor" strokeWidth="1.4"/><line x1="2" y1="3.5" x2="2" y2="7" stroke="currentColor" strokeWidth="1.4"/><line x1="11" y1="3.5" x2="11" y2="9" stroke="currentColor" strokeWidth="1.4"/></svg>
                Vista Flujo
              </button>

              {/* Collapse/Expand all */}
              <button onClick={allCollapsed ? expandAll : collapseAll}
                title={allCollapsed ? 'Expandir todos los pasos' : 'Contraer todos los pasos'}
                style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 6,
                  fontSize: 10, fontWeight: 700, cursor: 'pointer', transition: 'all .12s', flexShrink: 0,
                  border: `1px solid ${C.border}`, color: C.textSec, background: 'none' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.color = C.primary }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border;  e.currentTarget.style.color = C.textSec }}>
                {allCollapsed
                  ? <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M2 5L2 2L5 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 2L5.5 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><path d="M12 5L12 2L9 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 2L8.5 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><path d="M2 9L2 12L5 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 12L5.5 8.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><path d="M12 9L12 12L9 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 12L8.5 8.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
                  : <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M5.5 2L5.5 5.5L2 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M5.5 5.5L2 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><path d="M8.5 2L8.5 5.5L12 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M8.5 5.5L12 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><path d="M5.5 12L5.5 8.5L2 8.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M5.5 8.5L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><path d="M8.5 12L8.5 8.5L12 8.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M8.5 8.5L12 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
                }
                {allCollapsed ? 'Expandir' : 'Contraer'}
              </button>

              <span style={{ background: C.bgCard, padding: '2px 8px', borderRadius: 5, fontWeight: 600, fontSize: 10,
                color: C.textMut, border: `1px solid ${C.border}`, flexShrink: 0 }}>
                {steps.length} pasos
              </span>
              <div style={{ width: 1, height: 14, background: C.border, margin: '0 2px' }}/>

              {/* Zoom controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <button style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 4, cursor: 'pointer',
                  color: C.textSec, width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}
                  onClick={() => setEditZoom(z => Math.min(2.5, z + .1))}>+</button>
                <input
                  style={{ width: 46, textAlign: 'center', fontSize: 11, fontWeight: 700,
                    color: '#A8C4CA', background: 'rgba(59,154,240,.1)',
                    border: '1px solid rgba(59,154,240,.22)', borderRadius: 4, padding: '2px 4px',
                    outline: 'none', cursor: 'text' }}
                  value={editZoomInput !== null ? editZoomInput : Math.round(editZoom * 100) + '%'}
                  onChange={e => setEditZoomInput(e.target.value)}
                  onFocus={e => { setEditZoomInput(Math.round(editZoom * 100) + ''); e.target.select() }}
                  onBlur={() => { const v = parseInt(editZoomInput); if (!isNaN(v)) setEditZoom(Math.min(2.5, Math.max(.1, v / 100))); setEditZoomInput(null) }}
                  onKeyDown={e => {
                    if (e.key === 'Enter')  { const v = parseInt(editZoomInput); if (!isNaN(v)) setEditZoom(Math.min(2.5, Math.max(.1, v / 100))); setEditZoomInput(null); e.target.blur() }
                    if (e.key === 'Escape') { setEditZoomInput(null); e.target.blur() }
                  }}
                />
                <button style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 4, cursor: 'pointer',
                  color: C.textSec, width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}
                  onClick={() => setEditZoom(z => Math.max(.35, z - .1))}>&#8722;</button>
                <button style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 4, cursor: 'pointer',
                  color: C.textSec, width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}
                  title="Ajustar al área de trabajo"
                  onClick={() => {
                    const el = editCanvasRef.current
                    if (!el) return
                    const inner = el.firstElementChild
                    if (!inner) { setEditZoom(1); return }
                    const nw = inner.offsetWidth
                    if (nw < 10) return
                    const cw = el.clientWidth
                    const fz = Math.min((cw - 20) / nw, 1) * .98
                    setEditZoom(Math.max(.25, fz))
                    setTimeout(() => {
                      const e = editCanvasRef.current
                      if (!e) return
                      const scrollX = Math.max(0, (e.scrollWidth - e.clientWidth) / 2)
                      e.scrollTo(scrollX, 0)
                    }, 80)
                  }}>⛶</button>
              </div>
            </div>

            {/* Steps area */}
            <div ref={editCanvasRef} style={{ flex: 1, overflowY: 'auto', overflowX: 'auto',
              padding: '0 0 80px', cursor: spacePan ? 'grab' : '', userSelect: spacePan ? 'none' : '' }}>
              <div style={{
                transform: `scale(${editZoom})`, transformOrigin: 'top center',
                padding: '24px 32px 0',
                display: 'grid', gridTemplateColumns: 'max-content',
                justifyItems: 'stretch', justifyContent: 'center',
                rowGap: 0, minWidth: 'max-content', width: '100%',
              }}>
                {/* Insert zone before first step */}
                <div style={{ width: '100%', height: dragStepIdx !== null ? (dragInsertIdx === 0 ? 44 : 16) : 0,
                  transition: 'height .15s', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {dragInsertIdx === 0 && (
                    <div style={{ width: '100%', height: 4, background: C.primary, borderRadius: 2, boxShadow: `0 0 12px ${C.primary}`, position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)',
                        background: C.primary, color: '#fff', fontSize: 9, fontWeight: 800, borderRadius: 4,
                        padding: '2px 8px', whiteSpace: 'nowrap', pointerEvents: 'none' }}>Soltar aqui</div>
                    </div>
                  )}
                </div>

                {steps.map((step, i) => (
                  <React.Fragment key={step.step + '-' + i}>
                    <div
                      ref={el => stepEls.current[i] = el}
                      onDragOver={e => e.preventDefault()}
                      onDrop={e => {
                        const mt = e.dataTransfer.getData('moduleType')
                        if (mt) {
                          e.preventDefault(); e.stopPropagation()
                          const ns = { ...step, modules: [...(step.modules || []), DEF[mt] ? DEF[mt]() : { type: mt }] }
                          handleStepChange(ns)
                        }
                      }}
                      onMouseEnter={() => setHovStepIdx(i)}
                      onMouseLeave={() => setHovStepIdx(null)}
                      style={{ opacity: dragStepIdx === i ? .3 : 1, transition: 'opacity .15s',
                        cursor: dragStepIdx !== null && dragStepIdx !== i ? 'grabbing' : '' }}>
                      <StepCard
                        step={step} allSteps={steps}
                        onStepChange={handleStepChange}
                        onRemove={() => removeStep(step.step)}
                        collapsed={collapsedSteps.has(step.step)}
                        onToggleCollapse={() => toggleStep(step.step)}
                        isDragOver={false}
                        isHovered={hovStepIdx === i}
                        isHighlighted={highlightStep === step.step}
                        setHighlightStep={setHighlightStep}
                        editMode={true}
                        onDragStart={e => onHandleDown(e, i)}
                        onDragEnd={() => {}}
                      />
                    </div>

                    {/* Insert zone after each step */}
                    <div style={{ width: '100%', maxWidth: 940,
                      height: dragStepIdx !== null ? (dragInsertIdx === i + 1 ? 44 : 18) : 0,
                      transition: 'height .15s', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {dragInsertIdx === i + 1 && (
                        <div style={{ width: '100%', height: 4, background: C.primary, borderRadius: 2, boxShadow: `0 0 12px ${C.primary}`, position: 'relative' }}>
                          <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)',
                            background: C.primary, color: '#fff', fontSize: 9, fontWeight: 800, borderRadius: 4,
                            padding: '2px 8px', whiteSpace: 'nowrap', pointerEvents: 'none' }}>Soltar aqui</div>
                        </div>
                      )}
                    </div>

                    {i < steps.length - 1 && dragStepIdx === null && (
                      <StepConnectorComp fromStep={step} toStep={steps[i + 1]} highlight={hovStepIdx === i}/>
                    )}
                  </React.Fragment>
                ))}

                <button onClick={addStep}
                  style={{ marginTop: 22, justifySelf: 'center', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 28px',
                    border: `1.5px dashed ${C.primary}`, borderRadius: 10, background: 'rgba(59,154,240,0.07)',
                    color: C.primary, fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all .14s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,154,240,0.16)'; e.currentTarget.style.borderStyle = 'solid' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(59,154,240,0.07)'; e.currentTarget.style.borderStyle = 'dashed' }}>
                  + Agregar Nuevo Paso
                </button>
              </div>
            </div>

            {/* Mobile FAB */}
            {M && (
              <button onClick={() => setPaletteMob(v => !v)} style={{
                position: 'fixed', bottom: 24, right: 20, zIndex: 200,
                width: 52, height: 52, borderRadius: '50%', border: 'none',
                background: C.primary, color: '#fff', fontSize: 22, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 4px 20px ${C.primary}66`,
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mobile palette bottom sheet */}
      {M && paletteMob && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 199 }} onClick={() => setPaletteMob(false)}>
          <div style={{ background: 'rgba(0,0,0,.4)', position: 'absolute', inset: 0, animation: 'fadeInBd .2s ease' }}/>
          <div onClick={e => e.stopPropagation()} style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: C.bgCard, borderRadius: '20px 20px 0 0',
            padding: '8px 0 env(safe-area-inset-bottom,20px)', maxHeight: '70vh', overflowY: 'auto',
            animation: 'slideUpSheet .25s cubic-bezier(.32,0,.67,0)',
          }}>
            <div style={{ width: 40, height: 4, background: C.border, borderRadius: 2, margin: '8px auto 12px' }}/>
            <Palette pinned={true} onTogglePin={() => {}} onOpenSettings={() => { setShowSettingsModal(true); setPaletteMob(false) }}/>
          </div>
        </div>
      )}
    </div>
  )
}

export default EditorView
