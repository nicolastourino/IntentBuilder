import React, { useState } from 'react'
import { useC } from '../theme/index.js'
import ConditionalBlock from './ConditionalBlock.jsx'
import ReturnNode from './ReturnNode.jsx'
import NodeCard from './NodeCard.jsx'
import DropZone from './DropZone.jsx'

const ModulesFlow = ({ modules, arrayPath, allSteps, onModuleOp, depth = 0, setHighlightStep }) => {
  const C     = useC()
  const empty = !modules || modules.length === 0
  const [dMod, setDMod]   = useState(null)
  const [dOver, setDOver] = useState(null)

  const startModDrag = (e, i) => {
    e.stopPropagation()
    e.dataTransfer.setData('modDrag', String(i))
    e.dataTransfer.effectAllowed = 'move'
    setDMod(i)
  }

  const modDragOver = (e, i) => {
    e.preventDefault()
    if (dMod === null) return
    e.stopPropagation()
    if (dOver !== i) setDOver(i)
  }

  const modDrop = (e, i) => {
    const mt = e.dataTransfer.getData('moduleType')
    if (mt) {
      e.preventDefault(); e.stopPropagation()
      onModuleOp('add', arrayPath, mt)
      setDMod(null); setDOver(null)
      return
    }
    const from = parseInt(e.dataTransfer.getData('modDrag'))
    if (isNaN(from)) return
    e.preventDefault(); e.stopPropagation()
    if (from === i) { setDMod(null); setDOver(null); return }
    const arr = [...(modules || [])]
    const [item] = arr.splice(from, 1)
    arr.splice(i, 0, item)
    onModuleOp('reorder', arrayPath, arr)
    setDMod(null); setDOver(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {(modules || []).map((mod, i) => {
        const modPath = [...arrayPath, i]
        const isLast  = i === modules.length - 1
        const el = mod.type === 'conditional'
          ? <ConditionalBlock key={i} mod={mod} path={modPath} allSteps={allSteps} onModuleOp={onModuleOp}
              onEditThis={()  => onModuleOp('edit',   modPath, mod)}
              onRemoveThis={() => onModuleOp('remove', modPath, null)}
              depth={depth} setHighlightStep={setHighlightStep}/>
          : mod.type === 'returnValue'
          ? <ReturnNode key={i} mod={mod} allSteps={allSteps}
              onEdit={()   => onModuleOp('edit',   modPath, mod)}
              onRemove={() => onModuleOp('remove', modPath, null)}
              setHighlightStep={setHighlightStep}/>
          : <NodeCard key={i} mod={mod}
              onEdit={()   => onModuleOp('edit',   modPath, mod)}
              onRemove={() => onModuleOp('remove', modPath, null)}/>

        const showInd = depth === 0 && dMod !== null && dOver === i && dMod !== i

        return (
          <React.Fragment key={i}>
            {showInd && (
              <div style={{ height: 3, background: C.primary, borderRadius: 2,
                margin: '2px 0', boxShadow: `0 0 8px ${C.primary}` }}/>
            )}
            {depth === 0
              ? <div
                  draggable
                  onDragStart={e => startModDrag(e, i)}
                  onDragOver={e  => modDragOver(e, i)}
                  onDrop={e      => modDrop(e, i)}
                  onDragEnd={() => { setDMod(null); setDOver(null) }}
                  style={{ opacity: dMod === i ? .35 : 1, transition: 'opacity .15s', cursor: 'grab' }}>
                  {el}
                </div>
              : el
            }
            {!isLast && (
              <div style={{ display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
                <div style={{ width: 1, height: 14, background: C.line }}/>
              </div>
            )}
          </React.Fragment>
        )
      })}
      {!empty && (
        <div style={{ display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
          <div style={{ width: 1, height: 10, background: C.line }}/>
        </div>
      )}
      <DropZone label={empty ? 'Arrastra un modulo desde la paleta →' : ''} compact={!empty} onDrop={mt => onModuleOp('add', arrayPath, mt)}/>
    </div>
  )
}

export default ModulesFlow
