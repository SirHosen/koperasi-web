<template>
  <div class="container-fluid">
    <!-- Header -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h2 class="h3 mb-0">
              <i class="fas fa-chart-line me-2"></i>
              Analisis Keuangan Lanjutan
            </h2>
            <p class="text-muted mb-0">
              Dashboard analisis keuangan dan monitoring kinerja koperasi
            </p>
          </div>
          <div class="d-flex gap-2">
            <button
              class="btn btn-outline-primary"
              @click="exportFinancialAnalysis"
              :disabled="loading"
            >
              <i class="fas fa-file-pdf"></i>
              Export Analysis
            </button>
            <button class="btn btn-outline-success" @click="refreshData" :disabled="loading">
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="row mb-4">
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-primary text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-title mb-1">Total Aset</h6>
                <h4 class="mb-0">Rp {{ formatCurrency(financialOverview.totalAssets) }}</h4>
                <small class="opacity-75">
                  <i class="fas fa-arrow-up me-1"></i>
                  {{ financialOverview.assetGrowth }}% vs last month
                </small>
              </div>
              <i class="fas fa-coins fa-2x opacity-75"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-success text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-title mb-1">ROA</h6>
                <h4 class="mb-0">{{ financialOverview.roa }}%</h4>
                <small class="opacity-75">Return on Assets</small>
              </div>
              <i class="fas fa-percentage fa-2x opacity-75"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-info text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-title mb-1">Likuiditas</h6>
                <h4 class="mb-0">{{ financialOverview.liquidityRatio }}%</h4>
                <small class="opacity-75">Current Ratio</small>
              </div>
              <i class="fas fa-tint fa-2x opacity-75"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-warning text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-title mb-1">NPL</h6>
                <h4 class="mb-0">{{ financialOverview.npl }}%</h4>
                <small class="opacity-75">Non Performing Loan</small>
              </div>
              <i class="fas fa-exclamation-triangle fa-2x opacity-75"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="row mb-4">
      <div class="col-12">
        <ul class="nav nav-tabs" id="financialTabs" role="tablist">
          <li class="nav-item" role="presentation">
            <button
              class="nav-link"
              :class="{ active: activeTab === 'ratios' }"
              @click="activeTab = 'ratios'"
              type="button"
            >
              <i class="fas fa-calculator me-2"></i>
              Rasio Keuangan
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button
              class="nav-link"
              :class="{ active: activeTab === 'trends' }"
              @click="activeTab = 'trends'"
              type="button"
            >
              <i class="fas fa-chart-bar me-2"></i>
              Trend Analysis
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button
              class="nav-link"
              :class="{ active: activeTab === 'projections' }"
              @click="activeTab = 'projections'"
              type="button"
            >
              <i class="fas fa-crystal-ball me-2"></i>
              Proyeksi Keuangan
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button
              class="nav-link"
              :class="{ active: activeTab === 'benchmarking' }"
              @click="activeTab = 'benchmarking'"
              type="button"
            >
              <i class="fas fa-balance-scale me-2"></i>
              Benchmarking
            </button>
          </li>
        </ul>
      </div>
    </div>

    <!-- Financial Ratios Tab -->
    <div v-if="activeTab === 'ratios'">
      <div class="row">
        <!-- Profitability Ratios -->
        <div class="col-md-6 mb-4">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-white border-bottom">
              <h5 class="mb-0">
                <i class="fas fa-chart-pie me-2 text-success"></i>
                Rasio Profitabilitas
              </h5>
            </div>
            <div class="card-body">
              <canvas ref="profitabilityChart" width="400" height="300"></canvas>
              <div class="mt-3">
                <div class="row g-3">
                  <div class="col-6">
                    <div class="text-center p-3 bg-light rounded">
                      <small class="text-muted">ROA</small>
                      <h6 class="mb-0">{{ profitabilityRatios.roa }}%</h6>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="text-center p-3 bg-light rounded">
                      <small class="text-muted">ROE</small>
                      <h6 class="mb-0">{{ profitabilityRatios.roe }}%</h6>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="text-center p-3 bg-light rounded">
                      <small class="text-muted">Net Margin</small>
                      <h6 class="mb-0">{{ profitabilityRatios.netMargin }}%</h6>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="text-center p-3 bg-light rounded">
                      <small class="text-muted">Operating Margin</small>
                      <h6 class="mb-0">{{ profitabilityRatios.operatingMargin }}%</h6>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Liquidity Ratios -->
        <div class="col-md-6 mb-4">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-white border-bottom">
              <h5 class="mb-0">
                <i class="fas fa-tint me-2 text-info"></i>
                Rasio Likuiditas
              </h5>
            </div>
            <div class="card-body">
              <canvas ref="liquidityChart" width="400" height="300"></canvas>
              <div class="mt-3">
                <div class="row g-3">
                  <div class="col-6">
                    <div class="text-center p-3 bg-light rounded">
                      <small class="text-muted">Current Ratio</small>
                      <h6 class="mb-0">{{ liquidityRatios.currentRatio }}%</h6>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="text-center p-3 bg-light rounded">
                      <small class="text-muted">Quick Ratio</small>
                      <h6 class="mb-0">{{ liquidityRatios.quickRatio }}%</h6>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="text-center p-3 bg-light rounded">
                      <small class="text-muted">Cash Ratio</small>
                      <h6 class="mb-0">{{ liquidityRatios.cashRatio }}%</h6>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="text-center p-3 bg-light rounded">
                      <small class="text-muted">Operating CF</small>
                      <h6 class="mb-0">{{ liquidityRatios.operatingCashFlow }}%</h6>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Asset Quality Ratios -->
        <div class="col-md-6 mb-4">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-white border-bottom">
              <h5 class="mb-0">
                <i class="fas fa-shield-alt me-2 text-warning"></i>
                Kualitas Aset
              </h5>
            </div>
            <div class="card-body">
              <canvas ref="assetQualityChart" width="400" height="300"></canvas>
              <div class="mt-3">
                <div class="row g-3">
                  <div class="col-6">
                    <div class="text-center p-3 bg-light rounded">
                      <small class="text-muted">NPL</small>
                      <h6 class="mb-0 text-warning">{{ assetQualityRatios.npl }}%</h6>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="text-center p-3 bg-light rounded">
                      <small class="text-muted">PPP Ratio</small>
                      <h6 class="mb-0">{{ assetQualityRatios.pppRatio }}%</h6>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="text-center p-3 bg-light rounded">
                      <small class="text-muted">Loan Growth</small>
                      <h6 class="mb-0">{{ assetQualityRatios.loanGrowth }}%</h6>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="text-center p-3 bg-light rounded">
                      <small class="text-muted">Aging > 90d</small>
                      <h6 class="mb-0 text-danger">{{ assetQualityRatios.aging90 }}%</h6>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Capital Adequacy -->
        <div class="col-md-6 mb-4">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-white border-bottom">
              <h5 class="mb-0">
                <i class="fas fa-university me-2 text-primary"></i>
                Kecukupan Modal
              </h5>
            </div>
            <div class="card-body">
              <canvas ref="capitalChart" width="400" height="300"></canvas>
              <div class="mt-3">
                <div class="row g-3">
                  <div class="col-6">
                    <div class="text-center p-3 bg-light rounded">
                      <small class="text-muted">CAR</small>
                      <h6 class="mb-0">{{ capitalRatios.car }}%</h6>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="text-center p-3 bg-light rounded">
                      <small class="text-muted">Debt to Equity</small>
                      <h6 class="mb-0">{{ capitalRatios.debtToEquity }}%</h6>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="text-center p-3 bg-light rounded">
                      <small class="text-muted">Equity Ratio</small>
                      <h6 class="mb-0">{{ capitalRatios.equityRatio }}%</h6>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="text-center p-3 bg-light rounded">
                      <small class="text-muted">Leverage</small>
                      <h6 class="mb-0">{{ capitalRatios.leverage }}x</h6>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Trend Analysis Tab -->
    <div v-if="activeTab === 'trends'">
      <div class="row mb-4">
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white border-bottom">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Analisis Trend Keuangan</h5>
                <div class="d-flex gap-2">
                  <select
                    class="form-select form-select-sm"
                    v-model="trendPeriod"
                    @change="loadTrendData"
                  >
                    <option value="12">12 Bulan Terakhir</option>
                    <option value="24">24 Bulan Terakhir</option>
                    <option value="36">36 Bulan Terakhir</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="card-body">
              <canvas ref="trendChart" width="800" height="400"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Trend Insights -->
      <div class="row">
        <div class="col-md-4">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white border-bottom">
              <h6 class="mb-0">
                <i class="fas fa-trending-up me-2 text-success"></i>
                Positive Trends
              </h6>
            </div>
            <div class="card-body">
              <div
                v-for="trend in positiveTrends"
                :key="trend.metric"
                class="d-flex justify-content-between align-items-center mb-2"
              >
                <span class="text-sm">{{ trend.metric }}</span>
                <span class="badge bg-success">+{{ trend.growth }}%</span>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white border-bottom">
              <h6 class="mb-0">
                <i class="fas fa-trending-down me-2 text-warning"></i>
                Areas of Concern
              </h6>
            </div>
            <div class="card-body">
              <div
                v-for="trend in concernTrends"
                :key="trend.metric"
                class="d-flex justify-content-between align-items-center mb-2"
              >
                <span class="text-sm">{{ trend.metric }}</span>
                <span class="badge bg-warning">{{ trend.growth }}%</span>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white border-bottom">
              <h6 class="mb-0">
                <i class="fas fa-lightbulb me-2 text-info"></i>
                Recommendations
              </h6>
            </div>
            <div class="card-body">
              <div v-for="recommendation in recommendations" :key="recommendation.id" class="mb-3">
                <div class="d-flex align-items-start">
                  <i class="fas fa-chevron-right text-info mt-1 me-2"></i>
                  <div>
                    <strong class="text-sm">{{ recommendation.title }}</strong>
                    <p class="text-xs text-muted mb-0">{{ recommendation.description }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Projections Tab -->
    <div v-if="activeTab === 'projections'">
      <div class="row mb-4">
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white border-bottom">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Proyeksi Keuangan</h5>
                <div class="d-flex gap-2">
                  <select
                    class="form-select form-select-sm"
                    v-model="projectionPeriod"
                    @change="generateProjections"
                  >
                    <option value="3">3 Bulan ke Depan</option>
                    <option value="6">6 Bulan ke Depan</option>
                    <option value="12">12 Bulan ke Depan</option>
                  </select>
                  <button class="btn btn-outline-primary btn-sm" @click="generateProjections">
                    <i class="fas fa-magic"></i>
                    Generate
                  </button>
                </div>
              </div>
            </div>
            <div class="card-body">
              <canvas ref="projectionChart" width="800" height="400"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Projection Summary -->
      <div class="row">
        <div class="col-md-3">
          <div class="card border-0 shadow-sm text-center">
            <div class="card-body">
              <i class="fas fa-coins fa-2x text-primary mb-3"></i>
              <h6>Projected Revenue</h6>
              <h4 class="text-primary">Rp {{ formatCurrency(projections.revenue) }}</h4>
              <small class="text-muted">Next {{ projectionPeriod }} months</small>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm text-center">
            <div class="card-body">
              <i class="fas fa-chart-line fa-2x text-success mb-3"></i>
              <h6>Projected Profit</h6>
              <h4 class="text-success">Rp {{ formatCurrency(projections.profit) }}</h4>
              <small class="text-muted">Net Income</small>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm text-center">
            <div class="card-body">
              <i class="fas fa-users fa-2x text-info mb-3"></i>
              <h6>Member Growth</h6>
              <h4 class="text-info">+{{ projections.memberGrowth }}</h4>
              <small class="text-muted">New members</small>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm text-center">
            <div class="card-body">
              <i class="fas fa-hand-holding-usd fa-2x text-warning mb-3"></i>
              <h6>Loan Portfolio</h6>
              <h4 class="text-warning">Rp {{ formatCurrency(projections.loanPortfolio) }}</h4>
              <small class="text-muted">Outstanding</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Scenario Analysis -->
      <div class="row mt-4">
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white border-bottom">
              <h5 class="mb-0">Analisis Skenario</h5>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-bordered">
                  <thead class="table-light">
                    <tr>
                      <th>Skenario</th>
                      <th>Revenue Growth</th>
                      <th>Expense Growth</th>
                      <th>Net Income</th>
                      <th>ROA</th>
                      <th>NPL</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="scenario in scenarios" :key="scenario.name">
                      <td>
                        <strong>{{ scenario.name }}</strong>
                        <br />
                        <small class="text-muted">{{ scenario.description }}</small>
                      </td>
                      <td>
                        <span
                          :class="{
                            'text-success': scenario.revenueGrowth > 0,
                            'text-danger': scenario.revenueGrowth < 0,
                          }"
                        >
                          {{ scenario.revenueGrowth > 0 ? '+' : '' }}{{ scenario.revenueGrowth }}%
                        </span>
                      </td>
                      <td>{{ scenario.expenseGrowth }}%</td>
                      <td>Rp {{ formatCurrency(scenario.netIncome) }}</td>
                      <td>{{ scenario.roa }}%</td>
                      <td>
                        <span
                          :class="{
                            'text-success': scenario.npl <= 3,
                            'text-warning': scenario.npl > 3 && scenario.npl <= 5,
                            'text-danger': scenario.npl > 5,
                          }"
                        >
                          {{ scenario.npl }}%
                        </span>
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

    <!-- Benchmarking Tab -->
    <div v-if="activeTab === 'benchmarking'">
      <div class="row">
        <div class="col-md-8">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white border-bottom">
              <h5 class="mb-0">Perbandingan dengan Industri</h5>
            </div>
            <div class="card-body">
              <canvas ref="benchmarkChart" width="600" height="400"></canvas>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white border-bottom">
              <h5 class="mb-0">Performance Score</h5>
            </div>
            <div class="card-body">
              <div class="text-center mb-4">
                <div class="position-relative d-inline-block">
                  <canvas ref="scoreChart" width="200" height="200"></canvas>
                  <div class="position-absolute top-50 start-50 translate-middle text-center">
                    <h2 class="mb-0">{{ overallScore }}</h2>
                    <small class="text-muted">Overall Score</small>
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="text-sm">Profitability</span>
                  <span class="badge bg-success">{{ benchmarkScores.profitability }}/100</span>
                </div>
                <div class="progress" style="height: 6px">
                  <div
                    class="progress-bar bg-success"
                    :style="{ width: benchmarkScores.profitability + '%' }"
                  ></div>
                </div>
              </div>

              <div class="mb-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="text-sm">Liquidity</span>
                  <span class="badge bg-info">{{ benchmarkScores.liquidity }}/100</span>
                </div>
                <div class="progress" style="height: 6px">
                  <div
                    class="progress-bar bg-info"
                    :style="{ width: benchmarkScores.liquidity + '%' }"
                  ></div>
                </div>
              </div>

              <div class="mb-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="text-sm">Asset Quality</span>
                  <span class="badge bg-warning">{{ benchmarkScores.assetQuality }}/100</span>
                </div>
                <div class="progress" style="height: 6px">
                  <div
                    class="progress-bar bg-warning"
                    :style="{ width: benchmarkScores.assetQuality + '%' }"
                  ></div>
                </div>
              </div>

              <div class="mb-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="text-sm">Capital</span>
                  <span class="badge bg-primary">{{ benchmarkScores.capital }}/100</span>
                </div>
                <div class="progress" style="height: 6px">
                  <div
                    class="progress-bar bg-primary"
                    :style="{ width: benchmarkScores.capital + '%' }"
                  ></div>
                </div>
              </div>

              <div class="mt-4 pt-3 border-top">
                <h6 class="mb-2">Industry Ranking</h6>
                <p class="text-sm text-muted mb-2">
                  Your cooperative ranks <strong>#{{ industryRanking.position }}</strong> out of
                  {{ industryRanking.total }} similar cooperatives
                </p>
                <div class="badge bg-light text-dark">
                  Top {{ Math.round((industryRanking.position / industryRanking.total) * 100) }}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Benchmark Details -->
      <div class="row mt-4">
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white border-bottom">
              <h5 class="mb-0">Detail Perbandingan</h5>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-hover mb-0">
                  <thead class="table-light">
                    <tr>
                      <th>Metrik</th>
                      <th>Koperasi Anda</th>
                      <th>Rata-rata Industri</th>
                      <th>Benchmark Terbaik</th>
                      <th>Status</th>
                      <th>Gap</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="metric in benchmarkDetails" :key="metric.name">
                      <td>
                        <strong>{{ metric.name }}</strong>
                        <br />
                        <small class="text-muted">{{ metric.description }}</small>
                      </td>
                      <td>{{ metric.yourValue }}{{ metric.unit }}</td>
                      <td>{{ metric.industryAvg }}{{ metric.unit }}</td>
                      <td>{{ metric.bestPractice }}{{ metric.unit }}</td>
                      <td>
                        <span
                          class="badge"
                          :class="{
                            'bg-success': metric.status === 'Above Average',
                            'bg-warning': metric.status === 'Average',
                            'bg-danger': metric.status === 'Below Average',
                          }"
                        >
                          {{ metric.status }}
                        </span>
                      </td>
                      <td>
                        <span
                          :class="{
                            'text-success': metric.gap > 0,
                            'text-danger': metric.gap < 0,
                          }"
                        >
                          {{ metric.gap > 0 ? '+' : '' }}{{ metric.gap }}{{ metric.unit }}
                        </span>
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
  </div>
</template>

<script lang="ts">
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

interface FinancialOverview {
  totalAssets: number
  assetGrowth: number
  roa: number
  liquidityRatio: number
  npl: number
}

interface Ratios {
  [key: string]: number
}

interface Trend {
  metric: string
  growth: number
}

interface Recommendation {
  id: number
  title: string
  description: string
}

interface Projection {
  revenue: number
  profit: number
  memberGrowth: number
  loanPortfolio: number
}

interface Scenario {
  name: string
  description: string
  revenueGrowth: number
  expenseGrowth: number
  netIncome: number
  roa: number
  npl: number
}

interface BenchmarkScore {
  profitability: number
  liquidity: number
  assetQuality: number
  capital: number
}

interface IndustryRanking {
  position: number
  total: number
}

interface BenchmarkDetail {
  name: string
  description: string
  yourValue: number
  industryAvg: number
  bestPractice: number
  unit: string
  status: string
  gap: number
}

export default {
  name: 'FinancialAnalysisView',
  data() {
    return {
      loading: false,
      activeTab: 'ratios',

      // Overview data
      financialOverview: {
        totalAssets: 580000000,
        assetGrowth: 12.5,
        roa: 8.2,
        liquidityRatio: 125.5,
        npl: 2.8,
      } as FinancialOverview,

      // Ratios
      profitabilityRatios: {
        roa: 8.2,
        roe: 15.4,
        netMargin: 12.8,
        operatingMargin: 18.5,
      } as Ratios,

      liquidityRatios: {
        currentRatio: 125.5,
        quickRatio: 98.2,
        cashRatio: 45.8,
        operatingCashFlow: 110.2,
      } as Ratios,

      assetQualityRatios: {
        npl: 2.8,
        pppRatio: 85.5,
        loanGrowth: 15.2,
        aging90: 1.2,
      } as Ratios,

      capitalRatios: {
        car: 18.5,
        debtToEquity: 65.8,
        equityRatio: 35.2,
        leverage: 2.8,
      } as Ratios,

      // Trend analysis
      trendPeriod: 12,
      positiveTrends: [
        { metric: 'Revenue Growth', growth: 15.2 },
        { metric: 'Member Acquisition', growth: 8.5 },
        { metric: 'Operational Efficiency', growth: 12.8 },
      ] as Trend[],

      concernTrends: [
        { metric: 'Operating Expenses', growth: -8.2 },
        { metric: 'Collection Period', growth: -5.5 },
      ] as Trend[],

      recommendations: [
        {
          id: 1,
          title: 'Diversify Revenue Streams',
          description: 'Consider expanding into micro-insurance or digital services',
        },
        {
          id: 2,
          title: 'Improve Collection Process',
          description: 'Implement automated payment reminders to reduce NPL',
        },
        {
          id: 3,
          title: 'Optimize Cash Management',
          description: 'Invest excess liquidity in short-term instruments',
        },
      ] as Recommendation[],

      // Projections
      projectionPeriod: 6,
      projections: {
        revenue: 125000000,
        profit: 18500000,
        memberGrowth: 145,
        loanPortfolio: 450000000,
      } as Projection,

      scenarios: [
        {
          name: 'Optimistic',
          description: 'Best case scenario with favorable market conditions',
          revenueGrowth: 25,
          expenseGrowth: 15,
          netIncome: 22000000,
          roa: 9.8,
          npl: 2.2,
        },
        {
          name: 'Base Case',
          description: 'Most likely scenario based on current trends',
          revenueGrowth: 15,
          expenseGrowth: 12,
          netIncome: 18500000,
          roa: 8.2,
          npl: 2.8,
        },
        {
          name: 'Pessimistic',
          description: 'Conservative scenario with challenging conditions',
          revenueGrowth: 5,
          expenseGrowth: 8,
          netIncome: 12000000,
          roa: 6.5,
          npl: 4.2,
        },
      ] as Scenario[],

      // Benchmarking
      overallScore: 78,
      benchmarkScores: {
        profitability: 85,
        liquidity: 92,
        assetQuality: 68,
        capital: 75,
      } as BenchmarkScore,

      industryRanking: {
        position: 15,
        total: 78,
      } as IndustryRanking,

      benchmarkDetails: [
        {
          name: 'ROA',
          description: 'Return on Assets',
          yourValue: 8.2,
          industryAvg: 6.5,
          bestPractice: 12.8,
          unit: '%',
          status: 'Above Average',
          gap: 1.7,
        },
        {
          name: 'NPL',
          description: 'Non Performing Loan',
          yourValue: 2.8,
          industryAvg: 4.2,
          bestPractice: 1.5,
          unit: '%',
          status: 'Above Average',
          gap: -1.4,
        },
        {
          name: 'CAR',
          description: 'Capital Adequacy Ratio',
          yourValue: 18.5,
          industryAvg: 15.8,
          bestPractice: 25.2,
          unit: '%',
          status: 'Above Average',
          gap: 2.7,
        },
      ] as BenchmarkDetail[],

      // Chart instances
      profitabilityChart: null as Chart | null,
      liquidityChart: null as Chart | null,
      assetQualityChart: null as Chart | null,
      capitalChart: null as Chart | null,
      trendChart: null as Chart | null,
      projectionChart: null as Chart | null,
      benchmarkChart: null as Chart | null,
      scoreChart: null as Chart | null,
    }
  },

  async mounted() {
    await this.loadData()
    this.$nextTick(() => {
      this.initializeCharts()
    })
  },

  beforeUnmount() {
    // Destroy charts
    this.destroyCharts()
  },

  methods: {
    async loadData() {
      this.loading = true
      try {
        // Mock API calls - replace with actual API endpoints
        await Promise.all([
          this.loadFinancialOverview(),
          this.loadRatios(),
          this.loadTrendData(),
          this.generateProjections(),
        ])
      } finally {
        this.loading = false
      }
    },

    async loadFinancialOverview() {
      // Mock implementation
      await new Promise((resolve) => setTimeout(resolve, 500))
    },

    async loadRatios() {
      // Mock implementation
      await new Promise((resolve) => setTimeout(resolve, 500))
    },

    async loadTrendData() {
      // Mock implementation
      await new Promise((resolve) => setTimeout(resolve, 500))
    },

    async generateProjections() {
      // Mock implementation - replace with actual projection algorithm
      await new Promise((resolve) => setTimeout(resolve, 800))

      const baseRevenue = 100000000
      const growthRate = 0.15
      const periods = this.projectionPeriod

      this.projections = {
        revenue: baseRevenue * Math.pow(1 + growthRate, periods / 12),
        profit: baseRevenue * Math.pow(1 + growthRate, periods / 12) * 0.15,
        memberGrowth: Math.floor(periods * 25),
        loanPortfolio: baseRevenue * Math.pow(1 + growthRate, periods / 12) * 3.5,
      }
    },

    async refreshData() {
      await this.loadData()
      this.updateCharts()
    },

    initializeCharts() {
      this.createProfitabilityChart()
      this.createLiquidityChart()
      this.createAssetQualityChart()
      this.createCapitalChart()
      this.createTrendChart()
      this.createProjectionChart()
      this.createBenchmarkChart()
      this.createScoreChart()
    },

    createProfitabilityChart() {
      const ctx = this.$refs.profitabilityChart as HTMLCanvasElement
      if (!ctx) return

      this.profitabilityChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['ROA', 'ROE', 'Net Margin', 'Operating Margin'],
          datasets: [
            {
              data: [
                this.profitabilityRatios.roa,
                this.profitabilityRatios.roe,
                this.profitabilityRatios.netMargin,
                this.profitabilityRatios.operatingMargin,
              ],
              backgroundColor: ['#28a745', '#17a2b8', '#ffc107', '#fd7e14'],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
            },
          },
        },
      })
    },

    createLiquidityChart() {
      const ctx = this.$refs.liquidityChart as HTMLCanvasElement
      if (!ctx) return

      this.liquidityChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Current', 'Quick', 'Cash', 'Operating CF'],
          datasets: [
            {
              label: 'Liquidity Ratios (%)',
              data: [
                this.liquidityRatios.currentRatio,
                this.liquidityRatios.quickRatio,
                this.liquidityRatios.cashRatio,
                this.liquidityRatios.operatingCashFlow,
              ],
              backgroundColor: '#17a2b8',
              borderColor: '#138496',
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
          plugins: {
            legend: {
              display: false,
            },
          },
        },
      })
    },

    createAssetQualityChart() {
      const ctx = this.$refs.assetQualityChart as HTMLCanvasElement
      if (!ctx) return

      this.assetQualityChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [
            {
              label: 'NPL (%)',
              data: [3.2, 2.8, 2.5, 2.9, 3.1, 2.8],
              borderColor: '#ffc107',
              backgroundColor: 'rgba(255, 193, 7, 0.1)',
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              max: 5,
            },
          },
        },
      })
    },

    createCapitalChart() {
      const ctx = this.$refs.capitalChart as HTMLCanvasElement
      if (!ctx) return

      this.capitalChart = new Chart(ctx, {
        type: 'radar',
        data: {
          labels: ['CAR', 'Debt/Equity', 'Equity Ratio', 'Leverage'],
          datasets: [
            {
              label: 'Your Cooperative',
              data: [
                this.capitalRatios.car,
                this.capitalRatios.debtToEquity,
                this.capitalRatios.equityRatio,
                this.capitalRatios.leverage * 10, // Scale for visibility
              ],
              borderColor: '#007bff',
              backgroundColor: 'rgba(0, 123, 255, 0.1)',
            },
            {
              label: 'Industry Average',
              data: [15.8, 70.2, 30.5, 32],
              borderColor: '#6c757d',
              backgroundColor: 'rgba(108, 117, 125, 0.1)',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            r: {
              beginAtZero: true,
            },
          },
        },
      })
    },

    createTrendChart() {
      const ctx = this.$refs.trendChart as HTMLCanvasElement
      if (!ctx) return

      this.trendChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
          ],
          datasets: [
            {
              label: 'Revenue (Million)',
              data: [85, 88, 92, 95, 98, 102, 105, 108, 112, 115, 118, 122],
              borderColor: '#28a745',
              backgroundColor: 'rgba(40, 167, 69, 0.1)',
              yAxisID: 'y',
            },
            {
              label: 'ROA (%)',
              data: [7.2, 7.5, 7.8, 8.0, 8.1, 8.0, 8.2, 8.4, 8.3, 8.2, 8.5, 8.2],
              borderColor: '#007bff',
              backgroundColor: 'rgba(0, 123, 255, 0.1)',
              yAxisID: 'y1',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              type: 'linear',
              display: true,
              position: 'left',
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              grid: {
                drawOnChartArea: false,
              },
            },
          },
        },
      })
    },

    createProjectionChart() {
      const ctx = this.$refs.projectionChart as HTMLCanvasElement
      if (!ctx) return

      // Mock projection data
      const months = []
      const projectedRevenue = []
      const projectedProfit = []

      for (let i = 1; i <= this.projectionPeriod; i++) {
        months.push(`Month ${i}`)
        projectedRevenue.push(100 + i * 3.5) // Growth trend
        projectedProfit.push(15 + i * 0.8) // Profit growth
      }

      this.projectionChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: months,
          datasets: [
            {
              label: 'Projected Revenue (Million)',
              data: projectedRevenue,
              borderColor: '#28a745',
              backgroundColor: 'rgba(40, 167, 69, 0.1)',
              borderDash: [5, 5],
            },
            {
              label: 'Projected Profit (Million)',
              data: projectedProfit,
              borderColor: '#007bff',
              backgroundColor: 'rgba(0, 123, 255, 0.1)',
              borderDash: [5, 5],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
        },
      })
    },

    createBenchmarkChart() {
      const ctx = this.$refs.benchmarkChart as HTMLCanvasElement
      if (!ctx) return

      this.benchmarkChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['ROA', 'ROE', 'NPL', 'CAR', 'Liquidity'],
          datasets: [
            {
              label: 'Your Cooperative',
              data: [8.2, 15.4, 2.8, 18.5, 125.5],
              backgroundColor: '#007bff',
            },
            {
              label: 'Industry Average',
              data: [6.5, 12.8, 4.2, 15.8, 110.2],
              backgroundColor: '#6c757d',
            },
            {
              label: 'Best Practice',
              data: [12.8, 22.5, 1.5, 25.2, 150.8],
              backgroundColor: '#28a745',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      })
    },

    createScoreChart() {
      const ctx = this.$refs.scoreChart as HTMLCanvasElement
      if (!ctx) return

      this.scoreChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          datasets: [
            {
              data: [this.overallScore, 100 - this.overallScore],
              backgroundColor: ['#28a745', '#e9ecef'],
              borderWidth: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '80%',
          plugins: {
            legend: {
              display: false,
            },
          },
        },
      })
    },

    updateCharts() {
      // Update all charts with new data
      this.destroyCharts()
      this.$nextTick(() => {
        this.initializeCharts()
      })
    },

    destroyCharts() {
      const charts = [
        'profitabilityChart',
        'liquidityChart',
        'assetQualityChart',
        'capitalChart',
        'trendChart',
        'projectionChart',
        'benchmarkChart',
        'scoreChart',
      ]

      charts.forEach((chartName) => {
        const chart = this[chartName as keyof this] as Chart | null
        if (chart) {
          chart.destroy()
        }
      })
    },

    exportFinancialAnalysis() {
      this.$toast?.info('Exporting comprehensive financial analysis report...')
    },

    formatCurrency(amount: number) {
      if (!amount && amount !== 0) return '0'
      return new Intl.NumberFormat('id-ID').format(amount)
    },
  },
}
</script>

<style scoped>
.card {
  transition: all 0.2s ease-in-out;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
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

.progress {
  border-radius: 10px;
}

.progress-bar {
  border-radius: 10px;
}

.text-xs {
  font-size: 0.75rem;
}

.text-sm {
  font-size: 0.875rem;
}

.bg-light {
  background-color: #f8f9fa !important;
}

.opacity-75 {
  opacity: 0.75;
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

canvas {
  max-height: 300px;
}

.table th {
  background-color: #f8f9fa;
  font-weight: 600;
  border-top: none;
}

.badge {
  font-size: 0.75em;
}
</style>
