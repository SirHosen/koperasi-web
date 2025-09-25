import { describe, it, expect } from 'vitest'
import { fcfsSchedule } from '../lib/fcfs'

describe('fcfsSchedule', () => {
  it('schedules by arrival time and computes waiting/turnaround', () => {
    const { schedule, averageWaitingTime, averageTurnaroundTime } = fcfsSchedule([
      { id: 'C', pemohon: 'Cici', jumlahPinjaman: 500_000, arrivalTime: 2, burstTime: 5 },
      { id: 'A', pemohon: 'Ani', jumlahPinjaman: 1_000_000, arrivalTime: 0, burstTime: 10 },
      { id: 'B', pemohon: 'Budi', jumlahPinjaman: 50_000_000, arrivalTime: 1, burstTime: 60 },
    ])

    expect(schedule.map((s) => s.id)).toEqual(['A', 'B', 'C'])
    const A = schedule[0]
    const B = schedule[1]
    const C = schedule[2]
    expect(A.startTime).toBe(0)
    expect(A.finishTime).toBe(10)
    expect(A.waitingTime).toBe(0)
    expect(B.startTime).toBe(10)
    expect(B.finishTime).toBe(70)
    expect(B.waitingTime).toBe(9)
    expect(C.startTime).toBe(70)
    expect(C.finishTime).toBe(75)
    expect(C.waitingTime).toBe(68)
    expect(Number(averageWaitingTime.toFixed(2))).toBeCloseTo((0 + 9 + 68) / 3, 2)
    expect(Number(averageTurnaroundTime.toFixed(2))).toBeCloseTo((10 + 69 + 73) / 3, 2)
  })
})
