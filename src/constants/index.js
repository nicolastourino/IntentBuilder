export const MOD_META = {
  apiCall:            { label: 'API Call',       sub: 'HTTP request',       icon: '🌐', ic: '#0ea5e9', ibg: 'rgba(14,165,233,.18)' },
  variableAssignment: { label: 'Var Assignment', sub: 'Assign value',       icon: '=',  ic: '#6366f1', ibg: 'rgba(99,102,241,.18)' },
  variableDefinition: { label: 'Var Definition', sub: 'Define variable',    icon: '{}', ic: '#a855f7', ibg: 'rgba(168,85,247,.18)' },
  conditional:        { label: 'Conditional',    sub: 'Branch logic',       icon: '◆',  ic: '#f59e0b', ibg: 'rgba(245,158,11,.18)' },
  loop:               { label: 'Loop',           sub: 'Iterate collection', icon: '↻',  ic: '#10b981', ibg: 'rgba(16,185,129,.18)' },
  functionCall:       { label: 'Function Call',  sub: 'Call function',      icon: 'ƒ',  ic: '#ec4899', ibg: 'rgba(236,72,153,.18)' },
  log:                { label: 'Log',            sub: 'Print value',        icon: '▸',  ic: '#94a3b8', ibg: 'rgba(148,163,184,.15)' },
  cache:              { label: 'Cache',          sub: 'Cache result',       icon: '⚡', ic: '#f97316', ibg: 'rgba(249,115,22,.18)' },
  returnValue:        { label: 'Return Value',   sub: 'Return or jump',     icon: '↩',  ic: '#22d3ee', ibg: 'rgba(34,211,238,.18)' },
}

export const MOD_ORDER = [
  'apiCall', 'variableAssignment', 'variableDefinition', 'conditional',
  'loop', 'functionCall', 'log', 'cache', 'returnValue',
]

export const STEP_CFG = {
  obtainValue:  { label: 'Obtain Value',  dot: '#8b5cf6', ic: '#8b5cf6', ibg: 'rgba(139,92,246,.22)',  icon: '⚙' },
  jumpToStep:   { label: 'Jump To Step',  dot: '#f59e0b', ic: '#f59e0b', ibg: 'rgba(245,158,11,.22)',  icon: '⇀' },
  returnResult: { label: 'Return Result', dot: '#10b981', ic: '#10b981', ibg: 'rgba(16,185,129,.22)',   icon: '✓' },
}

export const BADGE_CFG = {
  Starter:  { color: '#10b981', bg: 'rgba(16,185,129,.15)',  border: 'rgba(16,185,129,.35)' },
  Core:     { color: '#3B9AF0', bg: 'rgba(59,154,240,.15)',  border: 'rgba(59,154,240,.35)' },
  Advanced: { color: '#a855f7', bg: 'rgba(168,85,247,.15)', border: 'rgba(168,85,247,.35)' },
}

export const INPUT_TYPES = ['String', 'Number', 'Boolean', 'Object', 'Array']

export const DEF = {
  conditional:        () => ({ type: 'conditional',        condition: '', conditionTrueModules: [], conditionFalseModules: [] }),
  apiCall:            () => ({ type: 'apiCall',            url: '', method: 'GET', headers: [], parameters: {}, outputVariableName: 'result', outputVariableScope: 'let' }),
  variableDefinition: () => ({ type: 'variableDefinition', variableName: '', variableScope: 'let', value: '' }),
  variableAssignment: () => ({ type: 'variableAssignment', variableName: '', value: '' }),
  returnValue:        () => ({ type: 'returnValue',        value: '' }),
  log:                () => ({ type: 'log',                value: '' }),
  cache:              () => ({ type: 'cache',              key: '', outputVariableName: 'cachedValue', outputVariableScope: 'let', expiresIn: 300 }),
  functionCall:       () => ({ type: 'functionCall',       functionName: '', parameters: [], outputVariableName: 'result', outputVariableScope: 'let' }),
  loop:               () => ({ type: 'loop',               iteratorName: 'item', collectionName: 'items', modules: [] }),
}

/* Shared input style bases */
export const IS    = { width: '100%', padding: '8px 10px', border: '1px solid var(--sail-border)', borderRadius: 8, fontSize: 13, outline: 'none', background: 'var(--sail-bgInput)', color: 'var(--sail-textPri)', transition: 'border-color .12s' }
export const IS_TA = { ...IS, resize: 'vertical', minHeight: 60, fontFamily: 'monospace', lineHeight: 1.5 }
export const IS_SM = { ...IS, padding: '6px 8px', fontSize: 12 }
