<template>
  <div class="container-fluid">
    <!-- Header -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h2 class="h3 mb-0">
              <i class="fas fa-shield-alt me-2"></i>
              Manajemen Risiko
            </h2>
            <p class="text-muted mb-0">Monitoring dan mitigasi risiko operasional koperasi</p>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-outline-danger" @click="generateRiskReport" :disabled="loading">
              <i class="fas fa-file-pdf"></i>
              Risk Report
            </button>
            <button class="btn btn-outline-success" @click="refreshData" :disabled="loading">
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Risk Level Overview -->
    <div class="row mb-4">
      <div class="col-md-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body text-center">
            <div class="risk-circle risk-low mb-3">
              <span class="h4 mb-0 text-white">{{ riskLevels.low }}</span>
            </div>
            <h6>Risiko Rendah</h6>
            <p class="text-muted mb-0">Monitoring rutin</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body text-center">
            <div class="risk-circle risk-medium mb-3">
              <span class="h4 mb-0 text-white">{{ riskLevels.medium }}</span>
            </div>
            <h6>Risiko Sedang</h6>
            <p class="text-muted mb-0">Perlu perhatian</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body text-center">
            <div class="risk-circle risk-high mb-3">
              <span class="h4 mb-0 text-white">{{ riskLevels.high }}</span>
            </div>
            <h6>Risiko Tinggi</h6>
            <p class="text-muted mb-0">Tindakan segera</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body text-center">
            <div class="risk-circle risk-critical mb-3">
              <span class="h4 mb-0 text-white">{{ riskLevels.critical }}</span>
            </div>
            <h6>Risiko Kritis</h6>
            <p class="text-muted mb-0">Eskalasi langsung</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="row mb-4">
      <div class="col-12">
        <ul class="nav nav-tabs" id="riskTabs" role="tablist">
          <li class="nav-item" role="presentation">
            <button
              class="nav-link"
              :class="{ active: activeTab === 'dashboard' }"
              @click="activeTab = 'dashboard'"
              type="button"
            >
              <i class="fas fa-tachometer-alt me-2"></i>
              Dashboard Risiko
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button
              class="nav-link"
              :class="{ active: activeTab === 'credit' }"
              @click="activeTab = 'credit'"
              type="button"
            >
              <i class="fas fa-credit-card me-2"></i>
              Risiko Kredit
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button
              class="nav-link"
              :class="{ active: activeTab === 'operational' }"
              @click="activeTab = 'operational'"
              type="button"
            >
              <i class="fas fa-cogs me-2"></i>
              Risiko Operasional
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button
              class="nav-link"
              :class="{ active: activeTab === 'liquidity' }"
              @click="activeTab = 'liquidity'"
              type="button"
            >
              <i class="fas fa-tint me-2"></i>
              Risiko Likuiditas
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button
              class="nav-link"
              :class="{ active: activeTab === 'mitigation' }"
              @click="activeTab = 'mitigation'"
              type="button"
            >
              <i class="fas fa-shield-alt me-2"></i>
              Mitigasi
            </button>
          </li>
        </ul>
      </div>
    </div>

    <!-- Dashboard Tab -->
    <div v-if="activeTab === 'dashboard'">
      <div class="row mb-4">
        <div class="col-md-8">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white border-bottom">
              <h5 class="mb-0">Risk Heat Map</h5>
            </div>
            <div class="card-body">
              <canvas ref="riskHeatMap" width="600" height="400"></canvas>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white border-bottom">
              <h5 class="mb-0">Overall Risk Score</h5>
            </div>
            <div class="card-body text-center">
              <div class="position-relative d-inline-block mb-4">
                <canvas ref="riskScoreChart" width="200" height="200"></canvas>
                <div class="position-absolute top-50 start-50 translate-middle text-center">
                  <h2 class="mb-0">{{ overallRiskScore }}</h2>
                  <small class="text-muted">Risk Score</small>
                </div>
              </div>

              <div class="risk-status-badge mb-3">
                <span
                  class="badge fs-6 px-3 py-2"
                  :class="{
                    'bg-success': overallRiskScore <= 30,
                    'bg-warning': overallRiskScore > 30 && overallRiskScore <= 60,
                    'bg-danger': overallRiskScore > 60,
                  }"
                >
                  {{ getRiskLevel(overallRiskScore) }}
                </span>
              </div>

              <p class="text-sm text-muted">
                Risk assessment berdasarkan 15 indikator utama dengan metodologi weighted scoring
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Risk Indicators -->
      <div class="row">
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white border-bottom">
              <h5 class="mb-0">Indikator Risiko Utama</h5>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-hover mb-0">
                  <thead class="table-light">
                    <tr>
                      <th>Indikator</th>
                      <th>Nilai Saat Ini</th>
                      <th>Threshold</th>
                      <th>Trend</th>
                      <th>Level Risiko</th>
                      <th width="200">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="indicator in riskIndicators" :key="indicator.id">
                      <td>
                        <strong>{{ indicator.name }}</strong>
                        <br />
                        <small class="text-muted">{{ indicator.description }}</small>
                      </td>
                      <td>{{ indicator.currentValue }}{{ indicator.unit }}</td>
                      <td>{{ indicator.threshold }}{{ indicator.unit }}</td>
                      <td>
                        <i
                          class="fas"
                          :class="{
                            'fa-arrow-up text-danger': indicator.trend === 'increasing',
                            'fa-arrow-down text-success': indicator.trend === 'decreasing',
                            'fa-minus text-muted': indicator.trend === 'stable',
                          }"
                        ></i>
                      </td>
                      <td>
                        <span
                          class="badge"
                          :class="{
                            'bg-success': indicator.riskLevel === 'Low',
                            'bg-warning': indicator.riskLevel === 'Medium',
                            'bg-danger': indicator.riskLevel === 'High',
                            'bg-dark': indicator.riskLevel === 'Critical',
                          }"
                        >
                          {{ indicator.riskLevel }}
                        </span>
                      </td>
                      <td>
                        <div class="progress" style="height: 8px">
                          <div
                            class="progress-bar"
                            :class="{
                              'bg-success': indicator.riskScore <= 30,
                              'bg-warning': indicator.riskScore > 30 && indicator.riskScore <= 60,
                              'bg-danger': indicator.riskScore > 60,
                            }"
                            :style="{ width: indicator.riskScore + '%' }"
                          ></div>
                        </div>
                        <small class="text-muted">{{ indicator.riskScore }}/100</small>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Credit Risk Tab -->
    <div v-if="activeTab === 'credit'">
      <div class="row mb-4">
        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white border-bottom">
              <h5 class="mb-0">Portfolio Credit Risk</h5>
            </div>
            <div class="card-body">
              <canvas ref="creditRiskChart" width="400" height="300"></canvas>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white border-bottom">
              <h5 class="mb-0">NPL by Segment</h5>
            </div>
            <div class="card-body">
              <div class="row g-3">
                <div v-for="segment in creditSegments" :key="segment.name" class="col-12">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="text-sm fw-bold">{{ segment.name }}</span>
                    <span class="badge bg-light text-dark"
                      >Rp {{ formatCurrency(segment.amount) }}</span
                    >
                  </div>
                  <div class="d-flex justify-content-between align-items-center mb-1">
                    <small class="text-muted">NPL: {{ segment.npl }}%</small>
                    <small class="text-muted">{{ segment.count }} loans</small>
                  </div>
                  <div class="progress" style="height: 6px">
                    <div
                      class="progress-bar"
                      :class="{
                        'bg-success': segment.npl <= 3,
                        'bg-warning': segment.npl > 3 && segment.npl <= 5,
                        'bg-danger': segment.npl > 5,
                      }"
                      :style="{ width: (segment.npl / 10) * 100 + '%' }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- High Risk Borrowers -->
      <div class="row">
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white border-bottom">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Debitur Berisiko Tinggi</h5>
                <button class="btn btn-outline-warning btn-sm">
                  <i class="fas fa-exclamation-triangle"></i>
                  Review All
                </button>
              </div>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-hover mb-0">
                  <thead class="table-light">
                    <tr>
                      <th>Nama Debitur</th>
                      <th>Outstanding</th>
                      <th>Days Past Due</th>
                      <th>Credit Score</th>
                      <th>Risk Level</th>
                      <th>Action Required</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="borrower in highRiskBorrowers" :key="borrower.id">
                      <td>
                        <strong>{{ borrower.name }}</strong>
                        <br />
                        <small class="text-muted">{{ borrower.memberNumber }}</small>
                      </td>
                      <td>Rp {{ formatCurrency(borrower.outstanding) }}</td>
                      <td>
                        <span
                          class="badge"
                          :class="{
                            'bg-warning': borrower.daysPastDue <= 90,
                            'bg-danger': borrower.daysPastDue > 90,
                          }"
                        >
                          {{ borrower.daysPastDue }} days
                        </span>
                      </td>
                      <td>{{ borrower.creditScore }}/1000</td>
                      <td>
                        <span
                          class="badge"
                          :class="{
                            'bg-warning': borrower.riskLevel === 'Medium',
                            'bg-danger': borrower.riskLevel === 'High',
                            'bg-dark': borrower.riskLevel === 'Critical',
                          }"
                        >
                          {{ borrower.riskLevel }}
                        </span>
                      </td>
                      <td>
                        <div class="btn-group btn-group-sm">
                          <button class="btn btn-outline-primary" title="Contact">
                            <i class="fas fa-phone"></i>
                          </button>
                          <button class="btn btn-outline-warning" title="Restructure">
                            <i class="fas fa-edit"></i>
                          </button>
                          <button class="btn btn-outline-danger" title="Legal Action">
                            <i class="fas fa-gavel"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Operational Risk Tab -->
    <div v-if="activeTab === 'operational'">
      <div class="row mb-4">
        <div class="col-md-8">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white border-bottom">
              <h5 class="mb-0">Operational Risk Events</h5>
            </div>
            <div class="card-body">
              <canvas ref="operationalRiskChart" width="600" height="400"></canvas>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white border-bottom">
              <h5 class="mb-0">Recent Incidents</h5>
            </div>
            <div class="card-body">
              <div
                v-for="incident in recentIncidents"
                :key="incident.id"
                class="incident-item mb-3 p-3 border rounded"
              >
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <span
                    class="badge"
                    :class="{
                      'bg-warning': incident.severity === 'Medium',
                      'bg-danger': incident.severity === 'High',
                    }"
                  >
                    {{ incident.severity }}
                  </span>
                  <small class="text-muted">{{ formatDate(incident.date) }}</small>
                </div>
                <h6 class="mb-1">{{ incident.title }}</h6>
                <p class="text-sm text-muted mb-2">{{ incident.description }}</p>
                <div class="d-flex justify-content-between align-items-center">
                  <small class="text-muted">{{ incident.department }}</small>
                  <span
                    class="badge"
                    :class="{
                      'bg-warning': incident.status === 'In Progress',
                      'bg-success': incident.status === 'Resolved',
                      'bg-danger': incident.status === 'Open',
                    }"
                  >
                    {{ incident.status }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Risk Categories -->
      <div class="row">
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white border-bottom">
              <h5 class="mb-0">Operational Risk Categories</h5>
            </div>
            <div class="card-body">
              <div class="row g-4">
                <div
                  v-for="category in operationalRiskCategories"
                  :key="category.name"
                  class="col-md-6 col-lg-4"
                >
                  <div class="risk-category-card p-4 border rounded h-100">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                      <i :class="category.icon + ' fa-2x text-primary'"></i>
                      <span
                        class="badge"
                        :class="{
                          'bg-success': category.riskLevel === 'Low',
                          'bg-warning': category.riskLevel === 'Medium',
                          'bg-danger': category.riskLevel === 'High',
                        }"
                      >
                        {{ category.riskLevel }}
                      </span>
                    </div>
                    <h6>{{ category.name }}</h6>
                    <p class="text-sm text-muted mb-3">{{ category.description }}</p>
                    <div class="d-flex justify-content-between align-items-center">
                      <small class="text-muted">{{ category.incidents }} incidents</small>
                      <small class="text-muted">Score: {{ category.score }}/100</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Liquidity Risk Tab -->
    <div v-if="activeTab === 'liquidity'">
      <div class="row mb-4">
        <div class="col-md-8">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white border-bottom">
              <h5 class="mb-0">Liquidity Coverage Ratio</h5>
            </div>
            <div class="card-body">
              <canvas ref="liquidityChart" width="600" height="400"></canvas>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white border-bottom">
              <h5 class="mb-0">Liquidity Metrics</h5>
            </div>
            <div class="card-body">
              <div class="metric-item mb-4">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="text-sm fw-bold">Cash Coverage</span>
                  <span class="badge bg-success">{{ liquidityMetrics.cashCoverage }}%</span>
                </div>
                <div class="progress" style="height: 8px">
                  <div
                    class="progress-bar bg-success"
                    :style="{ width: liquidityMetrics.cashCoverage + '%' }"
                  ></div>
                </div>
              </div>

              <div class="metric-item mb-4">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="text-sm fw-bold">LCR</span>
                  <span class="badge bg-info">{{ liquidityMetrics.lcr }}%</span>
                </div>
                <div class="progress" style="height: 8px">
                  <div
                    class="progress-bar bg-info"
                    :style="{ width: liquidityMetrics.lcr + '%' }"
                  ></div>
                </div>
              </div>

              <div class="metric-item mb-4">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="text-sm fw-bold">NSFR</span>
                  <span class="badge bg-warning">{{ liquidityMetrics.nsfr }}%</span>
                </div>
                <div class="progress" style="height: 8px">
                  <div
                    class="progress-bar bg-warning"
                    :style="{ width: liquidityMetrics.nsfr + '%' }"
                  ></div>
                </div>
              </div>

              <div class="mt-4 p-3 bg-light rounded">
                <h6 class="mb-2">Stress Test Result</h6>
                <p class="text-sm text-muted mb-0">
                  Under severe stress scenario, liquidity can sustain operations for
                  <strong>{{ liquidityMetrics.stressTestDays }} days</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Cash Flow Projection -->
      <div class="row">
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white border-bottom">
              <h5 class="mb-0">Cash Flow Risk Analysis</h5>
            </div>
            <div class="card-body">
              <canvas ref="cashFlowChart" width="800" height="400"></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mitigation Tab -->
    <div v-if="activeTab === 'mitigation'">
      <div class="row mb-4">
        <div class="col-md-4">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white border-bottom">
              <h5 class="mb-0">Risk Treatment Status</h5>
            </div>
            <div class="card-body">
              <canvas ref="mitigationChart" width="300" height="300"></canvas>
            </div>
          </div>
        </div>
        <div class="col-md-8">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white border-bottom">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Risk Mitigation Plans</h5>
                <button class="btn btn-primary btn-sm" @click="showAddMitigationModal = true">
                  <i class="fas fa-plus"></i>
                  Add Plan
                </button>
              </div>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-hover mb-0">
                  <thead class="table-light">
                    <tr>
                      <th>Risk</th>
                      <th>Mitigation Plan</th>
                      <th>Owner</th>
                      <th>Due Date</th>
                      <th>Status</th>
                      <th>Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="plan in mitigationPlans" :key="plan.id">
                      <td>
                        <strong>{{ plan.riskName }}</strong>
                        <br />
                        <span
                          class="badge badge-sm"
                          :class="{
                            'bg-warning': plan.riskLevel === 'Medium',
                            'bg-danger': plan.riskLevel === 'High',
                          }"
                        >
                          {{ plan.riskLevel }}
                        </span>
                      </td>
                      <td>{{ plan.mitigationPlan }}</td>
                      <td>{{ plan.owner }}</td>
                      <td>{{ formatDate(plan.dueDate) }}</td>
                      <td>
                        <span
                          class="badge"
                          :class="{
                            'bg-secondary': plan.status === 'Planned',
                            'bg-primary': plan.status === 'In Progress',
                            'bg-success': plan.status === 'Completed',
                            'bg-danger': plan.status === 'Overdue',
                          }"
                        >
                          {{ plan.status }}
                        </span>
                      </td>
                      <td>
                        <div class="progress" style="height: 6px">
                          <div
                            class="progress-bar bg-primary"
                            :style="{ width: plan.progress + '%' }"
                          ></div>
                        </div>
                        <small class="text-muted">{{ plan.progress }}%</small>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Risk Policies -->
      <div class="row">
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white border-bottom">
              <h5 class="mb-0">Risk Management Policies</h5>
            </div>
            <div class="card-body">
              <div class="row g-4">
                <div v-for="policy in riskPolicies" :key="policy.id" class="col-md-6">
                  <div class="policy-card p-4 border rounded h-100">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                      <i :class="policy.icon + ' fa-2x text-primary'"></i>
                      <span
                        class="badge"
                        :class="{
                          'bg-success': policy.status === 'Active',
                          'bg-warning': policy.status === 'Review',
                          'bg-danger': policy.status === 'Expired',
                        }"
                      >
                        {{ policy.status }}
                      </span>
                    </div>
                    <h6>{{ policy.name }}</h6>
                    <p class="text-sm text-muted mb-3">{{ policy.description }}</p>
                    <div class="d-flex justify-content-between align-items-center text-sm">
                      <span class="text-muted"
                        >Last Review: {{ formatDate(policy.lastReview) }}</span
                      >
                      <span class="text-muted"
                        >Next Review: {{ formatDate(policy.nextReview) }}</span
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Mitigation Plan Modal -->
    <div
      v-if="showAddMitigationModal"
      class="modal fade show d-block"
      tabindex="-1"
      style="background-color: rgba(0, 0, 0, 0.5)"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Add Risk Mitigation Plan</h5>
            <button
              type="button"
              class="btn-close"
              @click="showAddMitigationModal = false"
            ></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveMitigationPlan">
              <div class="mb-3">
                <label class="form-label">Risk Name</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="mitigationForm.riskName"
                  required
                />
              </div>
              <div class="mb-3">
                <label class="form-label">Risk Level</label>
                <select class="form-select" v-model="mitigationForm.riskLevel" required>
                  <option value="">Select Level</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Mitigation Plan</label>
                <textarea
                  class="form-control"
                  v-model="mitigationForm.mitigationPlan"
                  rows="3"
                  required
                ></textarea>
              </div>
              <div class="mb-3">
                <label class="form-label">Owner</label>
                <input type="text" class="form-control" v-model="mitigationForm.owner" required />
              </div>
              <div class="mb-3">
                <label class="form-label">Due Date</label>
                <input type="date" class="form-control" v-model="mitigationForm.dueDate" required />
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showAddMitigationModal = false">
              Cancel
            </button>
            <button type="button" class="btn btn-primary" @click="saveMitigationPlan">
              <i class="fas fa-save me-2"></i>
              Save Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

interface RiskLevels {
  low: number
  medium: number
  high: number
  critical: number
}

interface RiskIndicator {
  id: number
  name: string
  description: string
  currentValue: number
  threshold: number
  unit: string
  trend: 'increasing' | 'decreasing' | 'stable'
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical'
  riskScore: number
}

interface CreditSegment {
  name: string
  amount: number
  npl: number
  count: number
}

interface HighRiskBorrower {
  id: number
  name: string
  memberNumber: string
  outstanding: number
  daysPastDue: number
  creditScore: number
  riskLevel: string
}

interface Incident {
  id: number
  title: string
  description: string
  date: string
  severity: string
  department: string
  status: string
}

interface OperationalRiskCategory {
  name: string
  description: string
  icon: string
  riskLevel: string
  incidents: number
  score: number
}

interface LiquidityMetrics {
  cashCoverage: number
  lcr: number
  nsfr: number
  stressTestDays: number
}

interface MitigationPlan {
  id: number
  riskName: string
  riskLevel: string
  mitigationPlan: string
  owner: string
  dueDate: string
  status: string
  progress: number
}

interface RiskPolicy {
  id: number
  name: string
  description: string
  icon: string
  status: string
  lastReview: string
  nextReview: string
}

export default {
  name: 'RiskManagementView',
  data() {
    return {
      loading: false,
      activeTab: 'dashboard',
      overallRiskScore: 42,

      riskLevels: {
        low: 8,
        medium: 5,
        high: 3,
        critical: 1,
      } as RiskLevels,

      riskIndicators: [
        {
          id: 1,
          name: 'NPL Ratio',
          description: 'Non Performing Loan ratio',
          currentValue: 2.8,
          threshold: 5.0,
          unit: '%',
          trend: 'decreasing',
          riskLevel: 'Low',
          riskScore: 28,
        },
        {
          id: 2,
          name: 'Liquidity Coverage',
          description: 'Liquidity coverage ratio',
          currentValue: 125.5,
          threshold: 100.0,
          unit: '%',
          trend: 'stable',
          riskLevel: 'Low',
          riskScore: 20,
        },
        {
          id: 3,
          name: 'Operational Loss',
          description: 'Monthly operational losses',
          currentValue: 15.2,
          threshold: 10.0,
          unit: 'M',
          trend: 'increasing',
          riskLevel: 'Medium',
          riskScore: 55,
        },
      ] as RiskIndicator[],

      creditSegments: [
        { name: 'Kredit Konsumsi', amount: 250000000, npl: 2.5, count: 145 },
        { name: 'Kredit Produktif', amount: 180000000, npl: 3.2, count: 89 },
        { name: 'Kredit Mikro', amount: 95000000, npl: 4.1, count: 234 },
      ] as CreditSegment[],

      highRiskBorrowers: [
        {
          id: 1,
          name: 'Ahmad Subagyo',
          memberNumber: 'A001234',
          outstanding: 15000000,
          daysPastDue: 95,
          creditScore: 485,
          riskLevel: 'High',
        },
        {
          id: 2,
          name: 'Siti Nurhaliza',
          memberNumber: 'A001456',
          outstanding: 8500000,
          daysPastDue: 125,
          creditScore: 425,
          riskLevel: 'Critical',
        },
      ] as HighRiskBorrower[],

      recentIncidents: [
        {
          id: 1,
          title: 'System Downtime',
          description: 'Core banking system was down for 2 hours',
          date: '2024-01-15',
          severity: 'High',
          department: 'IT',
          status: 'Resolved',
        },
        {
          id: 2,
          title: 'Fraud Attempt',
          description: 'Suspicious transaction pattern detected',
          date: '2024-01-14',
          severity: 'Medium',
          department: 'Security',
          status: 'In Progress',
        },
      ] as Incident[],

      operationalRiskCategories: [
        {
          name: 'Technology Risk',
          description: 'IT systems and cybersecurity risks',
          icon: 'fas fa-laptop',
          riskLevel: 'Medium',
          incidents: 5,
          score: 45,
        },
        {
          name: 'Process Risk',
          description: 'Operational process failures',
          icon: 'fas fa-cogs',
          riskLevel: 'Low',
          incidents: 2,
          score: 25,
        },
        {
          name: 'People Risk',
          description: 'Human resources related risks',
          icon: 'fas fa-users',
          riskLevel: 'Low',
          incidents: 1,
          score: 30,
        },
      ] as OperationalRiskCategory[],

      liquidityMetrics: {
        cashCoverage: 125,
        lcr: 118,
        nsfr: 95,
        stressTestDays: 45,
      } as LiquidityMetrics,

      mitigationPlans: [
        {
          id: 1,
          riskName: 'High NPL in Micro Credit',
          riskLevel: 'Medium',
          mitigationPlan: 'Implement enhanced credit scoring and monitoring',
          owner: 'Credit Manager',
          dueDate: '2024-03-15',
          status: 'In Progress',
          progress: 65,
        },
      ] as MitigationPlan[],

      riskPolicies: [
        {
          id: 1,
          name: 'Credit Risk Policy',
          description: 'Guidelines for credit risk assessment and management',
          icon: 'fas fa-credit-card',
          status: 'Active',
          lastReview: '2023-12-01',
          nextReview: '2024-12-01',
        },
        {
          id: 2,
          name: 'Operational Risk Framework',
          description: 'Framework for managing operational risks',
          icon: 'fas fa-cogs',
          status: 'Review',
          lastReview: '2023-06-01',
          nextReview: '2024-06-01',
        },
      ] as RiskPolicy[],

      showAddMitigationModal: false,
      mitigationForm: {
        riskName: '',
        riskLevel: '',
        mitigationPlan: '',
        owner: '',
        dueDate: '',
      },

      // Chart instances
      riskHeatMapChart: null as Chart | null,
      riskScoreChart: null as Chart | null,
      creditRiskChart: null as Chart | null,
      operationalRiskChart: null as Chart | null,
      liquidityChart: null as Chart | null,
      cashFlowChart: null as Chart | null,
      mitigationChart: null as Chart | null,
    }
  },

  async mounted() {
    await this.loadData()
    this.$nextTick(() => {
      this.initializeCharts()
    })
  },

  beforeUnmount() {
    this.destroyCharts()
  },

  methods: {
    async loadData() {
      this.loading = true
      try {
        // Mock API calls
        await new Promise((resolve) => setTimeout(resolve, 1000))
      } finally {
        this.loading = false
      }
    },

    async refreshData() {
      await this.loadData()
      this.updateCharts()
    },

    getRiskLevel(score: number): string {
      if (score <= 30) return 'Low Risk'
      if (score <= 60) return 'Medium Risk'
      return 'High Risk'
    },

    initializeCharts() {
      this.createRiskHeatMap()
      this.createRiskScoreChart()
      this.createCreditRiskChart()
      this.createOperationalRiskChart()
      this.createLiquidityChart()
      this.createCashFlowChart()
      this.createMitigationChart()
    },

    createRiskHeatMap() {
      const ctx = this.$refs.riskHeatMap as HTMLCanvasElement
      if (!ctx) return

      this.riskHeatMapChart = new Chart(ctx, {
        type: 'scatter',
        data: {
          datasets: [
            {
              label: 'Risk Positions',
              data: [
                { x: 3, y: 8 }, // Credit Risk
                { x: 6, y: 5 }, // Operational Risk
                { x: 2, y: 3 }, // Liquidity Risk
                { x: 4, y: 6 }, // Market Risk
                { x: 5, y: 4 }, // Regulatory Risk
              ],
              backgroundColor: 'rgba(255, 99, 132, 0.6)',
              pointRadius: 10,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              title: { display: true, text: 'Probability' },
              min: 0,
              max: 10,
            },
            y: {
              title: { display: true, text: 'Impact' },
              min: 0,
              max: 10,
            },
          },
          plugins: {
            legend: { display: false },
          },
        },
      })
    },

    createRiskScoreChart() {
      const ctx = this.$refs.riskScoreChart as HTMLCanvasElement
      if (!ctx) return

      this.riskScoreChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          datasets: [
            {
              data: [this.overallRiskScore, 100 - this.overallRiskScore],
              backgroundColor: ['#ffc107', '#e9ecef'],
              borderWidth: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '80%',
          plugins: { legend: { display: false } },
        },
      })
    },

    createCreditRiskChart() {
      const ctx = this.$refs.creditRiskChart as HTMLCanvasElement
      if (!ctx) return

      this.creditRiskChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: this.creditSegments.map((s) => s.name),
          datasets: [
            {
              data: this.creditSegments.map((s) => s.amount),
              backgroundColor: ['#28a745', '#17a2b8', '#ffc107'],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' },
          },
        },
      })
    },

    createOperationalRiskChart() {
      const ctx = this.$refs.operationalRiskChart as HTMLCanvasElement
      if (!ctx) return

      this.operationalRiskChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [
            {
              label: 'Operational Incidents',
              data: [2, 1, 3, 1, 2, 4],
              backgroundColor: '#dc3545',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true },
          },
        },
      })
    },

    createLiquidityChart() {
      const ctx = this.$refs.liquidityChart as HTMLCanvasElement
      if (!ctx) return

      this.liquidityChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          datasets: [
            {
              label: 'LCR (%)',
              data: [120, 118, 125, 118],
              borderColor: '#17a2b8',
              backgroundColor: 'rgba(23, 162, 184, 0.1)',
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: false,
              min: 80,
              max: 140,
            },
          },
        },
      })
    },

    createCashFlowChart() {
      const ctx = this.$refs.cashFlowChart as HTMLCanvasElement
      if (!ctx) return

      this.cashFlowChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Day 1', 'Day 7', 'Day 14', 'Day 21', 'Day 30'],
          datasets: [
            {
              label: 'Cash Inflow',
              data: [50, 45, 60, 55, 65],
              borderColor: '#28a745',
              backgroundColor: 'rgba(40, 167, 69, 0.1)',
            },
            {
              label: 'Cash Outflow',
              data: [45, 50, 48, 52, 58],
              borderColor: '#dc3545',
              backgroundColor: 'rgba(220, 53, 69, 0.1)',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
        },
      })
    },

    createMitigationChart() {
      const ctx = this.$refs.mitigationChart as HTMLCanvasElement
      if (!ctx) return

      this.mitigationChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: ['Completed', 'In Progress', 'Planned', 'Overdue'],
          datasets: [
            {
              data: [8, 5, 3, 2],
              backgroundColor: ['#28a745', '#17a2b8', '#6c757d', '#dc3545'],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' },
          },
        },
      })
    },

    updateCharts() {
      this.destroyCharts()
      this.$nextTick(() => {
        this.initializeCharts()
      })
    },

    destroyCharts() {
      const charts = [
        'riskHeatMapChart',
        'riskScoreChart',
        'creditRiskChart',
        'operationalRiskChart',
        'liquidityChart',
        'cashFlowChart',
        'mitigationChart',
      ]

      charts.forEach((chartName) => {
        const chart = this[chartName as keyof this] as Chart | null
        if (chart) {
          chart.destroy()
        }
      })
    },

    saveMitigationPlan() {
      // Mock save
      const newPlan = {
        id: this.mitigationPlans.length + 1,
        ...this.mitigationForm,
        status: 'Planned',
        progress: 0,
      }

      this.mitigationPlans.push(newPlan)
      this.showAddMitigationModal = false

      // Reset form
      this.mitigationForm = {
        riskName: '',
        riskLevel: '',
        mitigationPlan: '',
        owner: '',
        dueDate: '',
      }

      this.$toast?.success('Mitigation plan added successfully')
    },

    generateRiskReport() {
      this.$toast?.info('Generating comprehensive risk report...')
    },

    formatDate(dateString: string) {
      if (!dateString) return '-'
      return new Date(dateString).toLocaleDateString('id-ID')
    },

    formatCurrency(amount: number) {
      if (!amount && amount !== 0) return '0'
      return new Intl.NumberFormat('id-ID').format(amount)
    },
  },
}
</script>

<style scoped>
.risk-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.risk-low {
  background-color: #28a745;
}
.risk-medium {
  background-color: #ffc107;
}
.risk-high {
  background-color: #fd7e14;
}
.risk-critical {
  background-color: #dc3545;
}

.nav-tabs .nav-link {
  border: none;
  color: #6c757d;
  font-weight: 500;
}

.nav-tabs .nav-link.active {
  background-color: #fff;
  border-bottom: 2px solid #0d6efd;
  color: #0d6efd;
}

.nav-tabs .nav-link:hover {
  border-color: transparent;
  color: #0d6efd;
}

.incident-item {
  border-left: 4px solid #17a2b8;
}

.risk-category-card {
  transition: all 0.2s ease-in-out;
}

.risk-category-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.policy-card {
  transition: all 0.2s ease-in-out;
}

.policy-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.metric-item {
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.metric-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.progress {
  border-radius: 10px;
}

.progress-bar {
  border-radius: 10px;
}

.table th {
  background-color: #f8f9fa;
  font-weight: 600;
  border-top: none;
}

.badge {
  font-size: 0.75em;
}

.badge-sm {
  font-size: 0.65em;
}

.btn-group-sm .btn {
  padding: 0.25rem 0.5rem;
}

.modal.show {
  display: block !important;
}

.position-relative {
  position: relative;
}

.position-absolute {
  position: absolute;
}

.top-50 {
  top: 50%;
}

.start-50 {
  left: 50%;
}

.translate-middle {
  transform: translate(-50%, -50%);
}

.text-sm {
  font-size: 0.875rem;
}

canvas {
  max-height: 400px;
}

.card {
  transition: all 0.2s ease-in-out;
}

.card:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
}
</style>
