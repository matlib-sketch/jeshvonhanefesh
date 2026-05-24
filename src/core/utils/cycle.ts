import { differenceInDays, startOfDay, startOfWeek, endOfWeek, format } from 'date-fns'
import { MIDDOT } from '../domain/middot'
import type { Middah } from '../domain/types'

const WEEKS_PER_CYCLE = 13
const DAYS_PER_WEEK = 7
const DAYS_PER_CYCLE = WEEKS_PER_CYCLE * DAYS_PER_WEEK // 91

// Días transcurridos desde el inicio del ciclo (0-based)
const getDaysElapsed = (cycleStartDate: string, today: string): number => {
  const start = startOfDay(new Date(cycleStartDate))
  const current = startOfDay(new Date(today))
  return Math.max(0, differenceInDays(current, start))
}

// Número de ciclo actual (comienza en 1)
export const getCurrentCycleNumber = (cycleStartDate: string, today: string): number => {
  const days = getDaysElapsed(cycleStartDate, today)
  return Math.floor(days / DAYS_PER_CYCLE) + 1
}

// Semana dentro del ciclo actual (1-13)
export const getCurrentCycleWeek = (cycleStartDate: string, today: string): number => {
  const days = getDaysElapsed(cycleStartDate, today)
  const dayInCycle = days % DAYS_PER_CYCLE
  return Math.floor(dayInCycle / DAYS_PER_WEEK) + 1
}

// Día de la semana dentro del ciclo (1-7)
export const getDayOfWeekInCycle = (cycleStartDate: string, today: string): number => {
  const days = getDaysElapsed(cycleStartDate, today)
  return (days % DAYS_PER_WEEK) + 1
}

// Middah que es foco esta semana
export const getCurrentMiddahFocus = (cycleStartDate: string, today: string): Middah => {
  const week = getCurrentCycleWeek(cycleStartDate, today)
  return MIDDOT[week - 1]
}

// Inicio y fin de la semana gregoriana actual (domingo → sábado)
export const getCurrentWeekStart = (): string =>
  format(startOfWeek(new Date(), { weekStartsOn: 0 }), 'yyyy-MM-dd')

export const getCurrentWeekEnd = (): string =>
  format(endOfWeek(new Date(), { weekStartsOn: 0 }), 'yyyy-MM-dd')

// Fecha de inicio del ciclo actual
export const getCurrentCycleStartDate = (cycleStartDate: string, today: string): Date => {
  const days = getDaysElapsed(cycleStartDate, today)
  const cycleNum = Math.floor(days / DAYS_PER_CYCLE)
  const start = new Date(cycleStartDate)
  start.setDate(start.getDate() + cycleNum * DAYS_PER_CYCLE)
  return start
}
