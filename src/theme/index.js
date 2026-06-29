import { createContext, useContext } from 'react'

export const DARK = {
  bgBase:   '#080F20',
  bgCard:   '#0E1B32',
  bgPop:    '#152844',
  bgInput:  '#050B18',
  bgSec:    '#0B1628',
  primary:  '#3B9AF0',
  priHov:   '#55AEFF',
  textPri:  '#EEF2FF',
  textSec:  '#7A9CC8',
  textMut:  '#4E6A8E',
  border:   'rgba(59,154,240,0.2)',
  line:     'rgba(122,156,200,0.25)',
  true_:    '#10b981',
  false_:   '#f87171',
  jump:     '#f59e0b',
  logo:     'sail-logo.png',
}

export const LIGHT = {
  bgBase:   '#F6FAFF',
  bgCard:   '#FFFFFF',
  bgPop:    '#FFFFFF',
  bgInput:  '#EFF5FF',
  bgSec:    '#EFF5FF',
  primary:  '#1E88FF',
  priHov:   '#38A9FF',
  textPri:  '#071E46',
  textSec:  '#3A5A8C',
  textMut:  '#7A9CBB',
  border:   '#DDE8F5',
  line:     '#DDE8F5',
  true_:    '#059669',
  false_:   '#dc2626',
  jump:     '#d97706',
  logo:     'sail-color.png',
}

export const ThemeCtx = createContext(DARK)
export const useC = () => useContext(ThemeCtx)

export const MobileCtx = createContext(false)
export const useM = () => useContext(MobileCtx)
