import React, { useState, useEffect, useCallback } from 'react'
import { ThemeCtx, MobileCtx, DARK, LIGHT } from './theme/index.js'
import { useIsMobile } from './hooks/useIsMobile.js'
import { INTENTS } from './data/mockIntents.js'
import SailWaveLoader from './components/SailWaveLoader.jsx'
import ListView  from './components/ListView.jsx'
import EditorView from './components/EditorView.jsx'

const App = () => {
  const [dark,          setDark]          = useState(false)
  const C                                 = dark ? DARK : LIGHT
  const [intents,       setIntents]       = useState(INTENTS)
  const [screen,        setScreen]        = useState('list')
  const [editingIntent, setEditingIntent] = useState(null)
  const [transiting,    setTransiting]    = useState(false)
  const [splash,        setSplash]        = useState(true)
  const [splashOut,     setSplashOut]     = useState(false)
  const isMobile                          = useIsMobile()

  useEffect(() => {
    const t  = setTimeout(() => setSplashOut(true), 900)
    const t2 = setTimeout(() => setSplash(false),   1320)
    return () => { clearTimeout(t); clearTimeout(t2) }
  }, [])

  const nav = useCallback((fn, dur = 240) => {
    setTransiting(true)
    setTimeout(() => { fn(); setTimeout(() => setTransiting(false), 60) }, dur)
  }, [])

  const [openDiagram, setOpenDiagram] = useState(false)

  const handleOpen = useCallback((intent, showDiagram = false) => {
    setOpenDiagram(showDiagram)
    nav(() => { setEditingIntent(intent); setScreen('editor') })
  }, [nav])

  const handleCreate = useCallback(name => {
    const newIntent = {
      id: Date.now(),
      type: name,
      description: '',
      canBeStarter: false,
      active: true,
      input: [],
      triggers: [],
      workflow: [{ id: 1, name: 'Paso 0', stepType: 'obtainValue', modules: [], collapsed: false }],
    }
    setIntents(prev => [...prev, newIntent])
    nav(() => { setEditingIntent(newIntent); setScreen('editor') })
  }, [nav])

  const handleSave = useCallback(updated => {
    setIntents(prev => prev.map(i => i.id === updated.id ? updated : i))
    nav(() => { setScreen('list'); setEditingIntent(null) })
  }, [nav])

  const handleBack = useCallback(() => {
    nav(() => { setScreen('list'); setEditingIntent(null) })
  }, [nav])

  const handleToggleActive = useCallback(id => {
    setIntents(prev => prev.map(i => (i._id || i.id) === id ? { ...i, active: i.active === false } : i))
  }, [])

  const handleToggleTheme = useCallback(() => setDark(d => !d), [])

  return (
    <MobileCtx.Provider value={isMobile}>
      <ThemeCtx.Provider value={C}>
        {splash && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#ffffff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: splashOut ? 'sailSplashOut .42s ease forwards' : undefined }}>
            <SailWaveLoader width={240} height={48}/>
          </div>
        )}
        {transiting && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 9000,
            background: dark ? 'rgba(8,15,32,0.82)' : 'rgba(255,255,255,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'sailOverlayIn .15s ease', pointerEvents: 'none' }}>
            <SailWaveLoader width={200} height={40}/>
          </div>
        )}
        {screen === 'list' && (
          <ListView
            intents={intents}
            onOpen={handleOpen}
            onCreate={handleCreate}
            onToggleTheme={handleToggleTheme}
            dark={dark}
            onToggleActive={handleToggleActive}
          />
        )}
        {screen === 'editor' && editingIntent && (
          <EditorView
            intent={editingIntent}
            onBack={handleBack}
            onSave={handleSave}
            onToggleTheme={handleToggleTheme}
            dark={dark}
            initialDiagram={openDiagram}
          />
        )}
      </ThemeCtx.Provider>
    </MobileCtx.Provider>
  )
}

export default App
