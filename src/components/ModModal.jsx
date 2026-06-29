import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { useC } from '../theme/index.js'
import { IS, IS_TA } from '../constants/index.js'
import { getMeta } from '../utils/misc.js'
import ConditionBuilder from './ConditionBuilder.jsx'

const ModModal = ({ mod: init, onSave, onClose, allSteps }) => {
  const C = useC()
  const [m, setM] = useState({ ...init })
  const s = (k, v) => setM(p => ({ ...p, [k]: v }))
  const meta = getMeta(m.type)

  const F = ({ label, k, area, ph }) => (
    <div style={{ marginBottom: 13 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.textMut, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 5 }}>{label}</label>
      {area
        ? <textarea value={m[k] || ''} onChange={e => s(k, e.target.value)} placeholder={ph} style={IS_TA}/>
        : <input    value={m[k] || ''} onChange={e => s(k, e.target.value)} placeholder={ph} style={IS}/>}
    </div>
  )

  const Sel = ({ label, k, opts }) => (
    <div style={{ marginBottom: 13 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.textMut, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 5 }}>{label}</label>
      <select value={m[k] || ''} onChange={e => s(k, e.target.value)} style={{ ...IS, cursor: 'pointer' }}>
        {opts.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  )

  const Note = ({ msg, c }) => (
    <div style={{ background: c + '18', border: `1px solid ${c}44`, borderRadius: 8, padding: '9px 12px', fontSize: 12, color: c, lineHeight: 1.6, marginBottom: 13 }}>{msg}</div>
  )

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: C.bgPop, border: `1px solid ${C.border}`, borderRadius: 16, width: 700, maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }} onClick={e => e.stopPropagation()} className="fu">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          <div style={{ width: 32, height: 32, borderRadius: 7, background: meta.ibg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: meta.ic }}>{meta.icon}</div>
          <span style={{ fontWeight: 700, fontSize: 14, color: C.textPri }}>{meta.label}</span>
          <span style={{ flex: 1 }}/>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMut, fontSize: 18 }}>&#x2715;</button>
        </div>
        <div style={{ padding: 18, overflowY: 'auto', flex: 1 }}>
          {m.type === 'conditional' && (
            <>
              <ConditionBuilder value={m.condition || ''} onChange={v => s('condition', v)} allSteps={allSteps || []}/>
              <Note msg="Los modulos dentro de TRUE/FALSE se configuran arrastrando desde la paleta derecha a cada rama del diagrama (no desde aqui)." c={C.jump}/>
            </>
          )}
          {m.type === 'apiCall' && (
            <>
              <F label="URL" k="url" ph="https://api.example.com/resource/{id}"/>
              <Sel label="Metodo HTTP" k="method" opts={['GET','POST','PUT','PATCH','DELETE']}/>
              <F label="Variable de salida" k="outputVariableName" ph="result"/>
              <Sel label="Scope" k="outputVariableScope" opts={['let','const','var']}/>
            </>
          )}
          {(m.type === 'variableDefinition' || m.type === 'variableAssignment') && (
            <>
              <F label="Nombre de variable" k="variableName" ph="miVariable"/>
              {m.type === 'variableDefinition' && <Sel label="Scope" k="variableScope" opts={['let','const','var']}/>}
              <F label="Valor" k="value" area ph="data?.result"/>
            </>
          )}
          {m.type === 'returnValue' && (
            <>
              <F label="Valor de retorno" k="value" area ph="Numero de paso (ej: 3) o array de resultado"/>
              <Note msg="Paso JumpToStep: pon el numero del paso destino (ej: 3). Paso ReturnResult: pon un array de resultado (ej: [{type:'patient_found'}])." c={C.true_}/>
            </>
          )}
          {m.type === 'log'          && <F label="Valor a loguear"  k="value" area ph="variable o expresion"/>}
          {m.type === 'cache'        && (
            <>
              <F label="Cache key" k="key" ph="key-${input.id}"/>
              <F label="Expires (seg)" k="expiresIn" ph="300"/>
              <F label="Variable de salida" k="outputVariableName" ph="cachedValue"/>
              <Sel label="Scope" k="outputVariableScope" opts={['let','const','var']}/>
            </>
          )}
          {m.type === 'functionCall' && (
            <>
              <F label="Nombre de funcion"  k="functionName"      ph="getIntentData"/>
              <F label="Variable de salida" k="outputVariableName" ph="result"/>
            </>
          )}
          {m.type === 'loop' && (
            <>
              <F label="Iterador"  k="iteratorName"   ph="item"/>
              <F label="Coleccion" k="collectionName" ph="items"/>
            </>
          )}
        </div>
        <div style={{ padding: '12px 18px', borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'flex-end', gap: 8, flexShrink: 0 }}>
          <button onClick={onClose} style={{ padding: '8px 16px', border: `1px solid ${C.border}`, borderRadius: 8, background: 'transparent', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: C.textSec }}>Cancelar</button>
          <button onClick={() => onSave(m)} title="Guardar cambios en este modulo" style={{ padding: '8px 18px', border: 'none', borderRadius: 8, background: C.primary, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>Guardar</button>
        </div>
      </div>
    </div>
  )
}

export default ModModal
