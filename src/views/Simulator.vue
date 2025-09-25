<script setup lang="ts">
// Component name for lint rule (multi-word):
defineOptions({ name: 'FcfsSimulator' })
import { ref, computed } from 'vue'
import { fcfsSchedule } from '../lib/fcfs'
import type { LoanApplication } from '../types'

let counter = 1
const apps = ref<LoanApplication[]>([])

// Form state
const pemohon = ref('')
const jumlahPinjaman = ref<number | null>(null)
const arrivalTime = ref<number | null>(null)
const burstTime = ref<number | null>(10)

function addApp() {
  if (!pemohon.value || !jumlahPinjaman.value || arrivalTime.value == null || !burstTime.value)
    return
  apps.value.push({
    id: `APP-${counter++}`,
    pemohon: pemohon.value.trim(),
    jumlahPinjaman: Number(jumlahPinjaman.value),
    arrivalTime: Number(arrivalTime.value),
    burstTime: Number(burstTime.value),
  })
  pemohon.value = ''
  jumlahPinjaman.value = null
  arrivalTime.value = null
  burstTime.value = 10
}

function removeApp(id: string) {
  apps.value = apps.value.filter((a) => a.id !== id)
}

const result = computed(() => fcfsSchedule(apps.value))

const minTime = computed(() => Math.min(0, ...apps.value.map((a) => a.arrivalTime)))
const maxTime = computed(() => Math.max(10, ...result.value.schedule.map((a) => a.finishTime)))

function formatCurrency(n: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(n)
}
</script>

<template>
  <div class="container">
    <h1>Simulasi Koperasi Simpan Pinjam - FCFS</h1>
    <p class="lead">
      Masukkan aplikasi pinjaman (arrival time dalam menit) lalu lihat urutan pemrosesan FCFS.
    </p>

    <section class="card">
      <h2>Tambah Aplikasi</h2>
      <form class="form" @submit.prevent="addApp">
        <label>
          Nama Pemohon
          <input v-model="pemohon" placeholder="Budi" />
        </label>
        <label>
          Jumlah Pinjaman (Rp)
          <input
            v-model.number="jumlahPinjaman"
            type="number"
            min="0"
            step="1000"
            placeholder="3000000"
          />
        </label>
        <label>
          Arrival Time (menit)
          <input v-model.number="arrivalTime" type="number" min="0" step="1" placeholder="0" />
        </label>
        <label>
          Burst Time (menit)
          <input v-model.number="burstTime" type="number" min="1" step="1" placeholder="10" />
        </label>
        <button type="submit">Tambah</button>
      </form>
    </section>

    <section class="grid">
      <div class="card">
        <h2>Antrean (FCFS)</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Pemohon</th>
              <th>Pinjaman</th>
              <th>Arrival</th>
              <th>Burst</th>
              <th>Start</th>
              <th>Finish</th>
              <th>Waiting</th>
              <th>Turnaround</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in result.schedule" :key="item.id">
              <td>{{ item.id }}</td>
              <td>{{ item.pemohon }}</td>
              <td>{{ formatCurrency(item.jumlahPinjaman) }}</td>
              <td>{{ item.arrivalTime }}</td>
              <td>{{ item.burstTime }}</td>
              <td>{{ item.startTime }}</td>
              <td>{{ item.finishTime }}</td>
              <td>{{ item.waitingTime }}</td>
              <td>{{ item.turnaroundTime }}</td>
              <td><button @click="removeApp(item.id)">Hapus</button></td>
            </tr>
          </tbody>
          <tfoot v-if="result.schedule.length">
            <tr>
              <td colspan="7">Rata-rata</td>
              <td>{{ result.averageWaitingTime.toFixed(2) }}</td>
              <td>{{ result.averageTurnaroundTime.toFixed(2) }}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div class="card">
        <h2>Timeline</h2>
        <div class="timeline">
          <div class="axis">
            <span>{{ minTime }}</span>
            <span>{{ maxTime }}</span>
          </div>
          <div class="bars">
            <div
              class="bar"
              v-for="item in result.schedule"
              :key="item.id"
              :style="{
                left: ((item.startTime - minTime) / (maxTime - minTime)) * 100 + '%',
                width: ((item.finishTime - item.startTime) / (maxTime - minTime)) * 100 + '%',
              }"
            >
              <span>{{ item.id }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 1rem;
}
.lead {
  color: #444;
  margin-bottom: 1rem;
}
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}
@media (min-width: 900px) {
  .grid {
    grid-template-columns: 1.4fr 1fr;
  }
}
.card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}
.form {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  align-items: end;
}
.form label {
  display: grid;
  gap: 0.25rem;
  font-size: 0.9rem;
}
.form input {
  padding: 0.5rem 0.6rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
}
.form button {
  padding: 0.6rem 0.9rem;
  border: 1px solid #1f2937;
  background: #111827;
  color: white;
  border-radius: 6px;
  cursor: pointer;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.92rem;
}
th,
td {
  padding: 0.5rem 0.6rem;
  border-bottom: 1px solid #eee;
  text-align: left;
}
th {
  background: #f9fafb;
  position: sticky;
  top: 0;
  z-index: 1;
}
.timeline {
  position: relative;
  height: 220px;
}
.axis {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #555;
  margin-bottom: 0.5rem;
}
.bars {
  position: relative;
  height: 180px;
  background: #f8fafc;
  border: 1px dashed #e2e8f0;
  border-radius: 8px;
}
.bar {
  position: absolute;
  top: 8px;
  height: 36px;
  background: #10b981;
  border-radius: 6px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);
}
.bar + .bar {
  top: auto;
  margin-top: 8px;
}
</style>
