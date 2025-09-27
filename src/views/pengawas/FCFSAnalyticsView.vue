<template>
  <div class="container-fluid">
    <!-- Header -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h2 class="h3 mb-0">
              <i class="fas fa-chart-bar me-2"></i>
              FCFS Analytics & Performance
            </h2>
            <p class="text-muted mb-0">
              Analisis sistem antrean FCFS dan perbandingan dengan sistem lain
            </p>
          </div>
          <div class="d-flex gap-2">
            <button
              class="btn btn-outline-info btn-sm"
              @click="runSimulation"
              :disabled="simulationRunning"
            >
              <span v-if="simulationRunning" class="spinner-border spinner-border-sm me-2"></span>
              <i v-else class="fas fa-play me-2"></i>
              {{ simulationRunning ? 'Running...' : 'Run Simulation' }}
            </button>
            <button class="btn btn-outline-success btn-sm" @click="exportAnalytics">
              <i class="fas fa-download"></i>
              Export Report
            </button>
            <button class="btn btn-outline-primary btn-sm" @click="refreshData" :disabled="loading">
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Performance Metrics -->
    <div class="row mb-4">
      <div class="col-lg-3 col-md-6 mb-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body text-center">
            <div class="d-flex align-items-center justify-content-center mb-2">
              <div class="bg-primary bg-opacity-10 rounded-circle p-3">
                <i class="fas fa-clock fa-2x text-primary"></i>
              </div>
            </div>
            <h6 class="text-muted mb-1">Avg Wait Time</h6>
            <h3 class="mb-0">{{ fcfsMetrics.avgWaitTime }}</h3>
            <small class="text-muted">minutes</small>
          </div>
        </div>
      </div>

      <div class="col-lg-3 col-md-6 mb-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body text-center">
            <div class="d-flex align-items-center justify-content-center mb-2">
              <div class="bg-success bg-opacity-10 rounded-circle p-3">
                <i class="fas fa-tachometer-alt fa-2x text-success"></i>
              </div>
            </div>
            <h6 class="text-muted mb-1">Throughput</h6>
            <h3 class="mb-0">{{ fcfsMetrics.throughput }}</h3>
            <small class="text-muted">requests/hour</small>
          </div>
        </div>
      </div>

      <div class="col-lg-3 col-md-6 mb-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body text-center">
            <div class="d-flex align-items-center justify-content-center mb-2">
              <div class="bg-warning bg-opacity-10 rounded-circle p-3">
                <i class="fas fa-exclamation-triangle fa-2x text-warning"></i>
              </div>
            </div>
            <h6 class="text-muted mb-1">Convoy Effect</h6>
            <h3 class="mb-0">{{ fcfsMetrics.convoyEffectScore }}%</h3>
            <small class="text-muted">detection rate</small>
          </div>
        </div>
      </div>

      <div class="col-lg-3 col-md-6 mb-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body text-center">
            <div class="d-flex align-items-center justify-content-center mb-2">
              <div class="bg-info bg-opacity-10 rounded-circle p-3">
                <i class="fas fa-chart-line fa-2x text-info"></i>
              </div>
            </div>
            <h6 class="text-muted mb-1">Efficiency</h6>
            <h3 class="mb-0">{{ fcfsMetrics.systemEfficiency }}%</h3>
            <small class="text-muted">overall performance</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Analytics -->
    <div class="row">
      <!-- Queue Visualization -->
      <div class="col-lg-8 mb-4">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white border-bottom">
            <div class="d-flex justify-content-between align-items-center">
              <h5 class="mb-0">
                <i class="fas fa-list-ol me-2"></i>
                Real-time Queue Visualization
              </h5>
              <div class="btn-group btn-group-sm">
                <button
                  class="btn"
                  :class="queueView === 'timeline' ? 'btn-primary' : 'btn-outline-primary'"
                  @click="queueView = 'timeline'"
                >
                  Timeline
                </button>
                <button
                  class="btn"
                  :class="queueView === 'position' ? 'btn-primary' : 'btn-outline-primary'"
                  @click="queueView = 'position'"
                >
                  Position
                </button>
                <button
                  class="btn"
                  :class="queueView === 'processing' ? 'btn-primary' : 'btn-outline-primary'"
                  @click="queueView = 'processing'"
                >
                  Processing
                </button>
              </div>
            </div>
          </div>
          <div class="card-body">
            <!-- Timeline View -->
            <div v-if="queueView === 'timeline'">
              <div class="timeline-container">
                <div class="timeline-header">
                  <div class="row text-center">
                    <div class="col">Submitted</div>
                    <div class="col">In Queue</div>
                    <div class="col">Processing</div>
                    <div class="col">Completed</div>
                  </div>
                </div>
                <div v-for="item in queueItems" :key="item.id" class="timeline-item mb-3">
                  <div class="row align-items-center">
                    <div class="col-2">
                      <strong>{{ item.member_name }}</strong>
                      <br />
                      <small class="text-muted">{{ item.request_id }}</small>
                    </div>
                    <div class="col-10">
                      <div class="progress position-relative" style="height: 30px">
                        <div
                          class="progress-bar"
                          :class="getProgressBarClass(item.status)"
                          :style="{ width: getProgressWidth(item) + '%' }"
                        >
                          <span class="position-absolute w-100 text-center">
                            {{ item.status }} - {{ getProcessingTime(item) }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Position Tracker View -->
            <div v-else-if="queueView === 'position'">
              <div class="position-tracker">
                <div class="row">
                  <div v-for="(item, index) in queueItems" :key="item.id" class="col-md-4 mb-3">
                    <div class="card" :class="getPositionCardClass(item.status)">
                      <div class="card-body text-center">
                        <div class="position-number mb-2">
                          {{ index + 1 }}
                        </div>
                        <h6 class="mb-1">{{ item.member_name }}</h6>
                        <p class="mb-1 text-muted small">{{ item.loan_type }}</p>
                        <p class="mb-1">{{ formatCurrency(item.amount) }}</p>
                        <span class="badge" :class="getStatusBadge(item.status)">
                          {{ item.status }}
                        </span>
                        <div class="mt-2">
                          <small class="text-muted">
                            Wait: {{ calculateWaitTime(item.submitted_at) }}
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Processing Status View -->
            <div v-else>
              <div class="processing-status">
                <div class="row">
                  <div class="col-md-6">
                    <h6>Currently Processing</h6>
                    <div
                      v-for="item in processingItems"
                      :key="item.id"
                      class="card border-success mb-2"
                    >
                      <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                          <div>
                            <strong>{{ item.member_name }}</strong>
                            <br />
                            <small class="text-muted">{{ item.request_id }}</small>
                          </div>
                          <div class="text-end">
                            <div class="spinner-border spinner-border-sm text-success"></div>
                            <br />
                            <small class="text-success">{{ getProcessingTime(item) }}</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <h6>Next in Queue</h6>
                    <div
                      v-for="(item, index) in nextInQueue"
                      :key="item.id"
                      class="card border-warning mb-2"
                    >
                      <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                          <div>
                            <strong>{{ item.member_name }}</strong>
                            <br />
                            <small class="text-muted">Position: {{ index + 1 }}</small>
                          </div>
                          <div class="text-end">
                            <span class="badge bg-warning"> ETA: {{ calculateETA(index) }} </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Live Stats -->
      <div class="col-lg-4 mb-4">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white border-bottom">
            <h5 class="mb-0">
              <i class="fas fa-chart-pie me-2"></i>
              Live Statistics
            </h5>
          </div>
          <div class="card-body">
            <canvas id="queueStatusChart" height="200"></canvas>

            <div class="mt-4">
              <h6>Queue Performance</h6>
              <div class="mb-3">
                <div class="d-flex justify-content-between mb-1">
                  <small>Queue Length</small>
                  <small>{{ queueStats.totalInQueue }}</small>
                </div>
                <div class="progress" style="height: 8px">
                  <div
                    class="progress-bar bg-info"
                    :style="{ width: (queueStats.totalInQueue / 50) * 100 + '%' }"
                  ></div>
                </div>
              </div>

              <div class="mb-3">
                <div class="d-flex justify-content-between mb-1">
                  <small>Processing Rate</small>
                  <small>{{ queueStats.processingRate }}%</small>
                </div>
                <div class="progress" style="height: 8px">
                  <div
                    class="progress-bar bg-success"
                    :style="{ width: queueStats.processingRate + '%' }"
                  ></div>
                </div>
              </div>

              <div class="mb-3">
                <div class="d-flex justify-content-between mb-1">
                  <small>System Load</small>
                  <small>{{ queueStats.systemLoad }}%</small>
                </div>
                <div class="progress" style="height: 8px">
                  <div
                    class="progress-bar"
                    :class="getLoadProgressClass(queueStats.systemLoad)"
                    :style="{ width: queueStats.systemLoad + '%' }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Analytics Tabs -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white border-bottom">
            <ul class="nav nav-tabs card-header-tabs">
              <li class="nav-item">
                <button
                  class="nav-link"
                  :class="{ active: activeTab === 'convoy' }"
                  @click="activeTab = 'convoy'"
                >
                  <i class="fas fa-exclamation-triangle me-2"></i>
                  Convoy Effect Monitor
                </button>
              </li>
              <li class="nav-item">
                <button
                  class="nav-link"
                  :class="{ active: activeTab === 'waittime' }"
                  @click="activeTab = 'waittime'"
                >
                  <i class="fas fa-clock me-2"></i>
                  Wait Time Analysis
                </button>
              </li>
              <li class="nav-item">
                <button
                  class="nav-link"
                  :class="{ active: activeTab === 'performance' }"
                  @click="activeTab = 'performance'"
                >
                  <i class="fas fa-tachometer-alt me-2"></i>
                  System Performance
                </button>
              </li>
              <li class="nav-item">
                <button
                  class="nav-link"
                  :class="{ active: activeTab === 'comparison' }"
                  @click="activeTab = 'comparison'"
                >
                  <i class="fas fa-balance-scale me-2"></i>
                  FCFS vs Priority
                </button>
              </li>
            </ul>
          </div>
          <div class="card-body">
            <!-- Convoy Effect Monitor -->
            <div v-if="activeTab === 'convoy'">
              <div class="row">
                <div class="col-md-8">
                  <h6>Convoy Effect Detection</h6>
                  <div class="alert alert-info">
                    <i class="fas fa-info-circle me-2"></i>
                    Convoy effect terjadi ketika proses dengan durasi panjang memblokir proses
                    dengan durasi pendek.
                  </div>

                  <div
                    v-for="convoy in convoyDetection"
                    :key="convoy.id"
                    class="card mb-3"
                    :class="getConvoyAlertClass(convoy.severity)"
                  >
                    <div class="card-body">
                      <div class="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 class="mb-1">{{ convoy.description }}</h6>
                          <p class="mb-1">
                            <strong>Blocking Process:</strong> {{ convoy.blocking_process }} ({{
                              convoy.blocking_duration
                            }}m)
                          </p>
                          <p class="mb-1">
                            <strong>Affected Processes:</strong>
                            {{ convoy.affected_count }} requests
                          </p>
                          <small class="text-muted"
                            >Detected at: {{ formatDateTime(convoy.detected_at) }}</small
                          >
                        </div>
                        <span class="badge" :class="getConvoySeverityBadge(convoy.severity)">
                          {{ convoy.severity }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-md-4">
                  <canvas id="convoyChart" height="300"></canvas>
                </div>
              </div>
            </div>

            <!-- Wait Time Analysis -->
            <div v-else-if="activeTab === 'waittime'">
              <div class="row">
                <div class="col-md-6">
                  <canvas id="waitTimeChart" height="300"></canvas>
                </div>
                <div class="col-md-6">
                  <h6>Wait Time Breakdown</h6>
                  <div class="table-responsive">
                    <table class="table table-sm">
                      <thead>
                        <tr>
                          <th>Loan Type</th>
                          <th>Avg Wait</th>
                          <th>Max Wait</th>
                          <th>Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="wt in waitTimeAnalysis" :key="wt.type">
                          <td>{{ wt.type }}</td>
                          <td>{{ wt.avgWait }}m</td>
                          <td>{{ wt.maxWait }}m</td>
                          <td>{{ wt.count }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <!-- System Performance -->
            <div v-else-if="activeTab === 'performance'">
              <div class="row">
                <div class="col-12">
                  <canvas id="performanceChart" height="300"></canvas>
                </div>
              </div>

              <div class="row mt-4">
                <div class="col-md-3 text-center">
                  <h4 class="text-primary">{{ performanceMetrics.throughput }}</h4>
                  <p class="text-muted mb-0">Requests/Hour</p>
                </div>
                <div class="col-md-3 text-center">
                  <h4 class="text-success">{{ performanceMetrics.efficiency }}%</h4>
                  <p class="text-muted mb-0">System Efficiency</p>
                </div>
                <div class="col-md-3 text-center">
                  <h4 class="text-warning">{{ performanceMetrics.avgLatency }}ms</h4>
                  <p class="text-muted mb-0">Avg Response Time</p>
                </div>
                <div class="col-md-3 text-center">
                  <h4 class="text-info">{{ performanceMetrics.uptime }}%</h4>
                  <p class="text-muted mb-0">System Uptime</p>
                </div>
              </div>
            </div>

            <!-- FCFS vs Priority Comparison -->
            <div v-else>
              <div class="row mb-4">
                <div class="col-12">
                  <div class="alert alert-primary">
                    <i class="fas fa-lightbulb me-2"></i>
                    <strong>Research Module:</strong> Perbandingan performa sistem FCFS dengan
                    sistem prioritas untuk analisis skripsi/thesis.
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6">
                  <div class="card">
                    <div class="card-header bg-primary text-white">
                      <h6 class="mb-0">FCFS System</h6>
                    </div>
                    <div class="card-body">
                      <div class="row text-center">
                        <div class="col-6">
                          <h4>{{ comparisonData.fcfs.avgWaitTime }}m</h4>
                          <small class="text-muted">Avg Wait Time</small>
                        </div>
                        <div class="col-6">
                          <h4>{{ comparisonData.fcfs.throughput }}</h4>
                          <small class="text-muted">Throughput</small>
                        </div>
                      </div>
                      <hr />
                      <div class="row text-center">
                        <div class="col-6">
                          <h4>{{ comparisonData.fcfs.fairness }}%</h4>
                          <small class="text-muted">Fairness</small>
                        </div>
                        <div class="col-6">
                          <h4>{{ comparisonData.fcfs.efficiency }}%</h4>
                          <small class="text-muted">Efficiency</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="card">
                    <div class="card-header bg-success text-white">
                      <h6 class="mb-0">Priority System (Simulated)</h6>
                    </div>
                    <div class="card-body">
                      <div class="row text-center">
                        <div class="col-6">
                          <h4>{{ comparisonData.priority.avgWaitTime }}m</h4>
                          <small class="text-muted">Avg Wait Time</small>
                        </div>
                        <div class="col-6">
                          <h4>{{ comparisonData.priority.throughput }}</h4>
                          <small class="text-muted">Throughput</small>
                        </div>
                      </div>
                      <hr />
                      <div class="row text-center">
                        <div class="col-6">
                          <h4>{{ comparisonData.priority.fairness }}%</h4>
                          <small class="text-muted">Fairness</small>
                        </div>
                        <div class="col-6">
                          <h4>{{ comparisonData.priority.efficiency }}%</h4>
                          <small class="text-muted">Efficiency</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="row mt-4">
                <div class="col-12">
                  <canvas id="comparisonChart" height="200"></canvas>
                </div>
              </div>

              <div class="row mt-4">
                <div class="col-12">
                  <div class="card">
                    <div class="card-header">
                      <h6 class="mb-0">What-if Analysis Results</h6>
                    </div>
                    <div class="card-body">
                      <div class="table-responsive">
                        <table class="table">
                          <thead>
                            <tr>
                              <th>Metric</th>
                              <th>FCFS</th>
                              <th>Priority</th>
                              <th>Difference</th>
                              <th>Impact</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>Average Wait Time</td>
                              <td>{{ comparisonData.fcfs.avgWaitTime }}m</td>
                              <td>{{ comparisonData.priority.avgWaitTime }}m</td>
                              <td class="text-success">
                                -{{
                                  comparisonData.fcfs.avgWaitTime -
                                  comparisonData.priority.avgWaitTime
                                }}m
                              </td>
                              <td><span class="badge bg-success">Improved</span></td>
                            </tr>
                            <tr>
                              <td>System Throughput</td>
                              <td>{{ comparisonData.fcfs.throughput }}</td>
                              <td>{{ comparisonData.priority.throughput }}</td>
                              <td class="text-success">
                                +{{
                                  comparisonData.priority.throughput -
                                  comparisonData.fcfs.throughput
                                }}
                              </td>
                              <td><span class="badge bg-success">Higher</span></td>
                            </tr>
                            <tr>
                              <td>Fairness Score</td>
                              <td>{{ comparisonData.fcfs.fairness }}%</td>
                              <td>{{ comparisonData.priority.fairness }}%</td>
                              <td class="text-danger">
                                -{{
                                  comparisonData.fcfs.fairness - comparisonData.priority.fairness
                                }}%
                              </td>
                              <td><span class="badge bg-warning">Trade-off</span></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Chart from 'chart.js/auto'

// Types
interface QueueItem {
  id: string
  member_name: string
  request_id: string
  loan_type: string
  amount: number
  status: 'submitted' | 'in_queue' | 'processing' | 'completed'
  submitted_at: string
  processing_started_at?: string
  completed_at?: string
}

interface ConvoyDetection {
  id: string
  description: string
  blocking_process: string
  blocking_duration: number
  affected_count: number
  severity: 'low' | 'medium' | 'high'
  detected_at: string
}

interface FCFSMetrics {
  avgWaitTime: number
  throughput: number
  convoyEffectScore: number
  systemEfficiency: number
}

interface QueueStats {
  totalInQueue: number
  processingRate: number
  systemLoad: number
}

// Reactive data
const loading = ref(false)
const simulationRunning = ref(false)
const queueView = ref('timeline')
const activeTab = ref('convoy')

const fcfsMetrics = ref<FCFSMetrics>({
  avgWaitTime: 12.5,
  throughput: 8.2,
  convoyEffectScore: 23,
  systemEfficiency: 87,
})

const queueStats = ref<QueueStats>({
  totalInQueue: 15,
  processingRate: 78,
  systemLoad: 65,
})

const queueItems = ref<QueueItem[]>([
  {
    id: 'Q001',
    member_name: 'Ahmad Subagyo',
    request_id: 'REQ-2024-001',
    loan_type: 'Produktif',
    amount: 15000000,
    status: 'processing',
    submitted_at: '2024-01-15T09:00:00',
    processing_started_at: '2024-01-15T10:30:00',
  },
  {
    id: 'Q002',
    member_name: 'Siti Nurhaliza',
    request_id: 'REQ-2024-002',
    loan_type: 'Konsumsi',
    amount: 8000000,
    status: 'in_queue',
    submitted_at: '2024-01-15T09:15:00',
  },
  {
    id: 'Q003',
    member_name: 'Budi Santoso',
    request_id: 'REQ-2024-003',
    loan_type: 'Produktif',
    amount: 25000000,
    status: 'in_queue',
    submitted_at: '2024-01-15T09:30:00',
  },
])

const convoyDetection = ref<ConvoyDetection[]>([
  {
    id: 'CONVOY-001',
    description: 'Large loan processing blocking smaller requests',
    blocking_process: 'REQ-2024-001 (Rp 50,000,000)',
    blocking_duration: 45,
    affected_count: 8,
    severity: 'high',
    detected_at: '2024-01-15T10:45:00',
  },
  {
    id: 'CONVOY-002',
    description: 'Complex verification delaying simple requests',
    blocking_process: 'REQ-2024-005 (Document Review)',
    blocking_duration: 25,
    affected_count: 3,
    severity: 'medium',
    detected_at: '2024-01-15T11:15:00',
  },
])

const waitTimeAnalysis = ref([
  { type: 'Produktif', avgWait: 18, maxWait: 35, count: 12 },
  { type: 'Konsumsi', avgWait: 8, maxWait: 15, count: 23 },
  { type: 'Darurat', avgWait: 5, maxWait: 12, count: 8 },
  { type: 'Mikro', avgWait: 6, maxWait: 18, count: 15 },
])

const performanceMetrics = ref({
  throughput: 8.5,
  efficiency: 87,
  avgLatency: 250,
  uptime: 99.8,
})

const comparisonData = ref({
  fcfs: {
    avgWaitTime: 12.5,
    throughput: 8.2,
    fairness: 95,
    efficiency: 87,
  },
  priority: {
    avgWaitTime: 8.3,
    throughput: 10.5,
    fairness: 78,
    efficiency: 92,
  },
})

// Computed properties
const processingItems = computed(() => {
  return queueItems.value.filter((item) => item.status === 'processing')
})

const nextInQueue = computed(() => {
  return queueItems.value.filter((item) => item.status === 'in_queue').slice(0, 5)
})

// Methods
async function refreshData() {
  loading.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    // Mock refresh data
  } finally {
    loading.value = false
  }
}

async function runSimulation() {
  simulationRunning.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 3000))
    // Mock simulation results
    comparisonData.value.priority.avgWaitTime = Math.random() * 10 + 5
    comparisonData.value.priority.throughput = Math.random() * 5 + 8
  } finally {
    simulationRunning.value = false
  }
}

function exportAnalytics() {
  console.log('Exporting FCFS analytics...')
  // Mock export functionality
}

// Utility methods
function getProgressBarClass(status: string): string {
  const classes = {
    submitted: 'bg-info',
    in_queue: 'bg-warning',
    processing: 'bg-primary',
    completed: 'bg-success',
  }
  return classes[status as keyof typeof classes] || 'bg-secondary'
}

function getProgressWidth(item: QueueItem): number {
  const widths = {
    submitted: 25,
    in_queue: 50,
    processing: 75,
    completed: 100,
  }
  return widths[item.status as keyof typeof widths] || 0
}

function getPositionCardClass(status: string): string {
  const classes = {
    processing: 'border-primary',
    in_queue: 'border-warning',
    completed: 'border-success',
  }
  return classes[status as keyof typeof classes] || 'border-secondary'
}

function getStatusBadge(status: string): string {
  const badges = {
    submitted: 'bg-info',
    in_queue: 'bg-warning',
    processing: 'bg-primary',
    completed: 'bg-success',
  }
  return badges[status as keyof typeof badges] || 'bg-secondary'
}

function getConvoyAlertClass(severity: string): string {
  const classes = {
    low: 'border-info',
    medium: 'border-warning',
    high: 'border-danger',
  }
  return classes[severity as keyof typeof classes] || 'border-secondary'
}

function getConvoySeverityBadge(severity: string): string {
  const badges = {
    low: 'bg-info',
    medium: 'bg-warning',
    high: 'bg-danger',
  }
  return badges[severity as keyof typeof badges] || 'bg-secondary'
}

function getLoadProgressClass(load: number): string {
  if (load >= 80) return 'bg-danger'
  if (load >= 60) return 'bg-warning'
  return 'bg-success'
}

function getProcessingTime(item: QueueItem): string {
  if (item.status === 'processing' && item.processing_started_at) {
    const start = new Date(item.processing_started_at)
    const now = new Date()
    const diffMinutes = Math.floor((now.getTime() - start.getTime()) / (1000 * 60))
    return `${diffMinutes}m`
  }
  return '-'
}

function calculateWaitTime(submittedAt: string): string {
  const submitted = new Date(submittedAt)
  const now = new Date()
  const diffMinutes = Math.floor((now.getTime() - submitted.getTime()) / (1000 * 60))
  return `${diffMinutes}m`
}

function calculateETA(position: number): string {
  const avgProcessingTime = 15 // minutes
  const eta = position * avgProcessingTime
  return `${eta}m`
}

function formatDateTime(datetime: string): string {
  return new Date(datetime).toLocaleString('id-ID')
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID').format(amount)
}

onMounted(() => {
  // Initialize charts
  setTimeout(() => {
    initializeCharts()
  }, 100)
})

function initializeCharts() {
  // Queue Status Chart
  const queueCtx = document.getElementById('queueStatusChart') as HTMLCanvasElement
  if (queueCtx) {
    new Chart(queueCtx, {
      type: 'doughnut',
      data: {
        labels: ['In Queue', 'Processing', 'Completed'],
        datasets: [
          {
            data: [15, 3, 85],
            backgroundColor: ['#ffc107', '#007bff', '#28a745'],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    })
  }

  // Convoy Chart
  const convoyCtx = document.getElementById('convoyChart') as HTMLCanvasElement
  if (convoyCtx) {
    new Chart(convoyCtx, {
      type: 'bar',
      data: {
        labels: ['Low', 'Medium', 'High'],
        datasets: [
          {
            label: 'Convoy Events',
            data: [2, 1, 1],
            backgroundColor: ['#17a2b8', '#ffc107', '#dc3545'],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    })
  }

  // Wait Time Chart
  const waitCtx = document.getElementById('waitTimeChart') as HTMLCanvasElement
  if (waitCtx) {
    new Chart(waitCtx, {
      type: 'bar',
      data: {
        labels: waitTimeAnalysis.value.map((w) => w.type),
        datasets: [
          {
            label: 'Average Wait Time (minutes)',
            data: waitTimeAnalysis.value.map((w) => w.avgWait),
            backgroundColor: '#007bff',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    })
  }

  // Performance Chart
  const perfCtx = document.getElementById('performanceChart') as HTMLCanvasElement
  if (perfCtx) {
    new Chart(perfCtx, {
      type: 'line',
      data: {
        labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
        datasets: [
          {
            label: 'Throughput',
            data: [3, 2, 8, 12, 10, 6],
            borderColor: '#007bff',
            backgroundColor: 'rgba(0, 123, 255, 0.1)',
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    })
  }

  // Comparison Chart
  const compCtx = document.getElementById('comparisonChart') as HTMLCanvasElement
  if (compCtx) {
    new Chart(compCtx, {
      type: 'radar',
      data: {
        labels: ['Wait Time', 'Throughput', 'Fairness', 'Efficiency'],
        datasets: [
          {
            label: 'FCFS',
            data: [60, 65, 95, 87],
            borderColor: '#007bff',
            backgroundColor: 'rgba(0, 123, 255, 0.2)',
          },
          {
            label: 'Priority',
            data: [85, 80, 78, 92],
            borderColor: '#28a745',
            backgroundColor: 'rgba(40, 167, 69, 0.2)',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
          },
        },
      },
    })
  }
}
</script>

<style scoped>
.bg-opacity-10 {
  --bs-bg-opacity: 0.1;
}

.timeline-container {
  max-height: 400px;
  overflow-y: auto;
}

.timeline-header {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
}

.position-number {
  width: 40px;
  height: 40px;
  background: #007bff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin: 0 auto;
}

.nav-tabs .nav-link {
  color: #6c757d;
  border: none;
  border-bottom: 2px solid transparent;
}

.nav-tabs .nav-link.active {
  color: #0d6efd;
  background-color: transparent;
  border-bottom-color: #0d6efd;
}

.card {
  transition: all 0.2s ease-in-out;
}

.card:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
}

.progress {
  border-radius: 0.375rem;
}

.badge {
  font-size: 0.75em;
}

.table th {
  font-weight: 600;
  color: #495057;
  border-bottom: 2px solid #dee2e6;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .position-number {
    width: 30px;
    height: 30px;
    font-size: 0.875rem;
  }

  .timeline-container {
    max-height: 300px;
  }
}
</style>
