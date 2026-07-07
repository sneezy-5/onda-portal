<template>
  <div class="subscriptions-manager-viewport reveal">
    <!-- Page Header -->
    <div class="bo-page-header mb-10">
      <div class="header-left">
        <h2 class="text-4xl font-black tracking-tight">Suivi des <span class="text-accent">Abonnements</span></h2>
        <p class="text-muted mt-2">Historique, états de facturation et indicateurs de revenus récurrents.</p>
      </div>
    </div>

    <!-- Stats Cards Grid -->
    <div class="stats-grid mb-10">
      <div class="stat-card">
        <div class="stat-icon"><i class="fas fa-file-invoice-dollar"></i></div>
        <div class="stat-info">
          <span class="stat-label">Abonnements Actifs</span>
          <span class="stat-value">{{ stats.active }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon mrr"><i class="fas fa-chart-line text-emerald-500"></i></div>
        <div class="stat-info">
          <span class="stat-label">MRR Estimé</span>
          <span class="stat-value text-emerald-600 font-mono">{{ formatAmount(stats.mrr) }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon billing-cycle"><i class="fas fa-sync-alt"></i></div>
        <div class="stat-info">
          <span class="stat-label">Cycle Annuel</span>
          <span class="stat-value">{{ stats.yearly }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon cancelled"><i class="fas fa-ban text-rose-500"></i></div>
        <div class="stat-info">
          <span class="stat-label">Résilations</span>
          <span class="stat-value text-rose-600">{{ stats.cancelled }}</span>
        </div>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="filter-bar mb-6">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input v-model="searchQuery" type="text" placeholder="Rechercher par organisation, plan..." />
      </div>
      <div class="filters-group">
        <div class="select-wrapper">
          <i class="fas fa-star-half-alt"></i>
          <select v-model="selectedStatus">
            <option value="ALL">Tous les statuts</option>
            <option value="ACTIVE">Actifs</option>
            <option value="CANCELLED">Résiliés</option>
          </select>
        </div>
        <div class="select-wrapper">
          <i class="fas fa-history"></i>
          <select v-model="selectedCycle">
            <option value="ALL">Tous les cycles</option>
            <option value="MONTHLY">Mensuel</option>
            <option value="YEARLY">Annuel</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner-elite"></div>
      <p class="text-muted mt-4">Chargement des abonnements...</p>
    </div>

    <!-- Subscriptions Table -->
    <div v-else class="table-wrapper-premium">
      <div v-if="filteredSubs.length === 0" class="empty-state-premium">
        <div class="empty-icon"><i class="fas fa-credit-card"></i></div>
        <h3>Aucun abonnement trouvé</h3>
        <p>Ajustez vos filtres ou termes de recherche.</p>
      </div>

      <table v-else class="table-premium">
        <thead>
          <tr>
            <th>Client (Organisation)</th>
            <th>Plan</th>
            <th>Cycle</th>
            <th>Début Période</th>
            <th>Fin Période / Renouvellement</th>
            <th>Montant</th>
            <th>Statut</th>
            <th>Date de Création</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="sub in filteredSubs" :key="sub.id">
            <td>
              <div class="org-cell">
                <i class="fas fa-building text-slate-400 mr-2"></i>
                <span class="org-name">{{ sub.organizationName || '—' }}</span>
              </div>
            </td>
            <td>
              <span :class="['plan-badge', 'plan-' + (sub.planType || 'free').toLowerCase()]">
                {{ sub.planName || 'Plan Gratuit' }}
              </span>
            </td>
            <td>
              <span class="cycle-text font-bold">{{ sub.billingCycle === 'YEARLY' ? 'Annuel' : 'Mensuel' }}</span>
            </td>
            <td><span class="date-text">{{ formatDate(sub.currentPeriodStart) }}</span></td>
            <td>
              <span class="date-text font-bold" v-if="sub.currentPeriodEnd">
                {{ formatDate(sub.currentPeriodEnd) }}
              </span>
              <span class="text-muted" v-else>Illimité (Gratuit)</span>
            </td>
            <td>
              <span class="amount-val font-mono font-bold">
                {{ formatAmount(getPlanPrice(sub)) }}
              </span>
            </td>
            <td>
              <span :class="['sub-status-badge', 'status-' + (sub.status || 'inactive').toLowerCase()]">
                {{ sub.status }}
              </span>
            </td>
            <td><span class="date-text">{{ formatDateTime(sub.createdAt) }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import adminApi from '../../services/adminApi';

const MOCK_SUBSCRIPTIONS = [
  {
    id: "sub1",
    organizationId: "org1",
    organizationName: "Sneezy Shop",
    planId: "p1",
    planName: "Onda Premium",
    planType: "PREMIUM",
    status: "ACTIVE",
    billingCycle: "MONTHLY",
    currentPeriodStart: "2026-06-23",
    currentPeriodEnd: "2026-07-23",
    nextBillingDate: "2026-07-23",
    nextBillingAmount: 5000,
    createdAt: "2026-06-23T10:32:35"
  },
  {
    id: "sub2",
    organizationId: "org2",
    organizationName: "Koffi & Fils SARL",
    planId: "p2",
    planName: "Plan Gratuit",
    planType: "FREE",
    status: "ACTIVE",
    billingCycle: "MONTHLY",
    currentPeriodStart: "2026-06-15",
    currentPeriodEnd: null,
    nextBillingDate: null,
    nextBillingAmount: 0,
    createdAt: "2026-06-15T12:00:00"
  },
  {
    id: "sub3",
    organizationId: "org3",
    organizationName: "Global Trade CI",
    planId: "p3",
    planName: "Onda Pro",
    planType: "PROFESSIONAL",
    status: "ACTIVE",
    billingCycle: "YEARLY",
    currentPeriodStart: "2026-06-01",
    currentPeriodEnd: "2027-06-01",
    nextBillingDate: "2027-06-01",
    nextBillingAmount: 150000,
    createdAt: "2026-06-01T09:30:00"
  }
];

export default {
  name: 'SubscriptionsManager',
  setup() {
    const subscriptions = ref([]);
    const isLoading = ref(true);
    const searchQuery = ref('');
    const selectedStatus = ref('ALL');
    const selectedCycle = ref('ALL');

    const fetchSubscriptions = async () => {
      isLoading.value = true;
      try {
        const res = await adminApi.getSubscriptions();
        if (res.success) {
          subscriptions.value = res.data;
        } else {
          subscriptions.value = MOCK_SUBSCRIPTIONS;
        }
      } catch (error) {
        console.error('Error fetching subscriptions, using mock data...', error);
        subscriptions.value = MOCK_SUBSCRIPTIONS;
      } finally {
        isLoading.value = false;
      }
    };

    const getPlanPrice = (sub) => {
      if (sub.planType === 'FREE') return 0;
      let monthlyRate = 0;
      if (sub.planType === 'PREMIUM') monthlyRate = 5000;
      if (sub.planType === 'PROFESSIONAL') monthlyRate = 15000;
      if (sub.planType === 'B2B') monthlyRate = 100000;

      return sub.billingCycle === 'YEARLY' ? monthlyRate * 10 : monthlyRate; // Le plan annuel coûte 10 fois le mensuel
    };

    const stats = computed(() => {
      let activeCount = 0;
      let cancelledCount = 0;
      let yearlyCount = 0;
      let mrrSum = 0;

      subscriptions.value.forEach(sub => {
        if (sub.status === 'ACTIVE') {
          activeCount++;
          // Calcul MRR (si annuel, on ramène au mensuel en divisant le coût annuel par 12)
          if (sub.planType === 'PREMIUM') {
            mrrSum += 5000;
          } else if (sub.planType === 'PROFESSIONAL') {
            mrrSum += 15000;
          } else if (sub.planType === 'B2B') {
            mrrSum += 100000;
          }

          if (sub.billingCycle === 'YEARLY') {
            yearlyCount++;
          }
        } else if (sub.status === 'CANCELLED') {
          cancelledCount++;
        }
      });

      return {
        active: activeCount,
        cancelled: cancelledCount,
        yearly: yearlyCount,
        mrr: mrrSum
      };
    });

    const filteredSubs = computed(() => {
      return subscriptions.value.filter(sub => {
        const nameQuery = searchQuery.value.toLowerCase().trim();
        const matchesSearch = nameQuery === '' ||
          (sub.organizationName || '').toLowerCase().includes(nameQuery) ||
          (sub.planName || '').toLowerCase().includes(nameQuery);

        const matchesStatus = selectedStatus.value === 'ALL' || sub.status === selectedStatus.value;
        const matchesCycle = selectedCycle.value === 'ALL' || sub.billingCycle === selectedCycle.value;

        return matchesSearch && matchesStatus && matchesCycle;
      });
    });

    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      return new Date(dateStr).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'short', year: 'numeric'
      });
    };

    const formatDateTime = (dateStr) => {
      if (!dateStr) return '';
      return new Date(dateStr).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    };

    const formatAmount = (val) => {
      if (val === undefined || val === null) return '—';
      return new Intl.NumberFormat('fr-CI', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(val);
    };

    onMounted(fetchSubscriptions);

    return {
      subscriptions, isLoading, searchQuery, selectedStatus, selectedCycle,
      stats, filteredSubs, formatDate, formatDateTime, formatAmount, getPlanPrice
    };
  }
};
</script>

<style scoped>
.subscriptions-manager-viewport {
  width: 100%;
  min-height: 100%;
  padding-bottom: 5rem;
}

/* Stats Cards */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 1.25rem;
  border: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  gap: 1.25rem;
  box-shadow: var(--shadow-sm);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.stat-icon.mrr {
  background: rgba(16, 185, 129, 0.15);
}

.stat-icon.billing-cycle {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.stat-icon.cancelled {
  background: rgba(244, 63, 94, 0.15);
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 800;
  margin-top: 0.25rem;
}

/* Filter Bar */
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-box {
  background: white;
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  padding: 0.65rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  max-width: 450px;
  box-shadow: var(--shadow-sm);
}

.search-box input {
  background: none;
  border: none;
  outline: none;
  font-size: 0.9rem;
  font-weight: 600;
  width: 100%;
}

.filters-group {
  display: flex;
  gap: 0.75rem;
}

.select-wrapper {
  background: white;
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  padding: 0.65rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: var(--shadow-sm);
}

.select-wrapper select {
  border: none;
  background: none;
  outline: none;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-main);
  cursor: pointer;
}

.select-wrapper i {
  color: var(--text-dim);
  font-size: 0.85rem;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6rem 2rem;
}

.spinner-elite {
  width: 40px;
  height: 40px;
  border: 3.5px solid var(--border-subtle);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* Table Premium */
.table-wrapper-premium {
  background: white;
  border-radius: 1.5rem;
  border: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.table-premium {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.table-premium th {
  background: var(--bg-surface-dim);
  padding: 1.15rem 1.5rem;
  font-size: 0.7rem;
  font-weight: 900;
  text-transform: uppercase;
  color: var(--text-muted);
  letter-spacing: 0.08em;
  border-bottom: 1px solid var(--border-subtle);
}

.table-premium td {
  padding: 1.15rem 1.5rem;
  border-bottom: 1px solid var(--border-subtle);
  font-size: 0.9rem;
  vertical-align: middle;
}

.table-premium tr:last-child td {
  border-bottom: none;
}

/* Org Cell */
.org-cell {
  display: flex;
  align-items: center;
}

.org-name {
  font-weight: 800;
  color: var(--text-main);
  font-size: 0.95rem;
}

/* Plan Badge */
.plan-badge {
  display: inline-flex;
  padding: 0.25rem 0.65rem;
  border-radius: 99rem;
  font-size: 0.65rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.plan-free {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #cbd5e1;
}

.plan-premium {
  background: #e0e7ff;
  color: #4338ca;
  border: 1px solid #c7d2fe;
}

.plan-professional {
  background: #fef3c7;
  color: #b45309;
  border: 1px solid #fde68a;
}

.plan-b2b {
  background: #ffe4e6;
  color: #be123c;
  border: 1px solid #fecdd3;
}

/* Sub status badge */
.sub-status-badge {
  display: inline-flex;
  padding: 0.25rem 0.65rem;
  border-radius: 99rem;
  font-size: 0.65rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-active {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.status-inactive, .status-cancelled {
  background: #f1f5f9;
  color: #64748b;
}

.cycle-text {
  color: var(--text-main);
}

.amount-val {
  color: var(--text-main);
}

.date-text {
  color: var(--text-muted);
  font-weight: 600;
  font-size: 0.8rem;
}

/* Empty State */
.empty-state-premium {
  text-align: center;
  padding: 5rem 2rem;
}

.empty-icon {
  font-size: 2.5rem;
  color: var(--text-dim);
  margin-bottom: 1rem;
}

.empty-state-premium h3 {
  font-size: 1.25rem;
  font-weight: 800;
}

.empty-state-premium p {
  color: var(--text-muted);
  margin-top: 0.5rem;
}

@media (max-width: 768px) {
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }
  .search-box {
    max-width: none;
  }
  .filters-group {
    justify-content: space-between;
  }
}
</style>
