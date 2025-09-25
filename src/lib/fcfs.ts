import type { FcfsResult, LoanApplication, ScheduledItem } from '../types'

/**
 * Compute FCFS schedule for given loan applications.
 * - Sorts by arrivalTime asc then by id for stability
 * - Non-preemptive: once started, process until finish
 * - If CPU (officer) idle before next arrival, it starts exactly at arrivalTime
 */
export function fcfsSchedule(apps: LoanApplication[]): FcfsResult {
  const sorted = [...apps].sort((a, b) => a.arrivalTime - b.arrivalTime || a.id.localeCompare(b.id))

  const schedule: ScheduledItem[] = []
  let currentTime = sorted.length ? Math.min(...sorted.map((a) => a.arrivalTime)) : 0

  for (const a of sorted) {
    // If officer idle until this arrival
    const startTime = Math.max(currentTime, a.arrivalTime)
    const finishTime = startTime + Math.max(0, a.burstTime)
    const waitingTime = Math.max(0, startTime - a.arrivalTime)
    const turnaroundTime = finishTime - a.arrivalTime

    schedule.push({ ...a, startTime, finishTime, waitingTime, turnaroundTime })
    currentTime = finishTime
  }

  const n = schedule.length || 1
  const averageWaitingTime = schedule.reduce((s, x) => s + x.waitingTime, 0) / n
  const averageTurnaroundTime = schedule.reduce((s, x) => s + x.turnaroundTime, 0) / n

  return { schedule, averageWaitingTime, averageTurnaroundTime }
}
