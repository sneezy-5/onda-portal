<template>
  <div class="partner-orgs-manager-viewport reveal">
    <!-- Page Header -->
    <div class="bo-page-header mb-10">
      <div class="header-left">
        <router-link :to="{ name: 'AdminClients' }" class="btn-back mb-4 inline-flex items-center text-accent font-bold hover:opacity-80 transition-opacity">
          <i class="fas fa-arrow-left mr-2"></i> Retour aux Partenaires
        </router-link>
        <h2 class="text-4xl font-black tracking-tight mt-2">
          Organisations de <span class="text-accent">{{ partnerName || 'Chargement...' }}</span>
        </h2>
        <p class="text-muted mt-2">
          Visualisez et gérez les comptes des organisations rattachées à ce partenaire intégrateur.
        </p>
      </div>
    </div>

    <!-- Filter & Search Bar -->
    <div class="filter-bar mb-6">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input v-model="searchQuery" type="text" placeholder="Rechercher une organisation..." @input="onFilterChange" />
      </div>
      <div class="filters-group">
        <div class="select-wrapper">
          <i class="fas fa-globe"></i>
          <select v-model="selectedCountry" @change="onFilterChange">
            <option value="ALL">Tous les pays</option>
            <option value="CI">Côte d'Ivoire (CI)</option>
            <option value="SN">Sénégal (SN)</option>
            <option value="BF">Burkina Faso (BF)</option>
            <option value="ML">Mali (ML)</option>
            <option value="BJ">Bénin (BJ)</option>
            <option value="TG">Togo (TG)</option>
            <option value="GN">Guinée (GN)</option>
            <option value="NE">Niger (NE)</option>
            <option value="GH">Ghana (GH)</option>
            <option value="NG">Nigéria (NG)</option>
            <option value="CM">Cameroun (CM)</option>
            <option value="CG">Congo (CG)</option>
            <option value="GA">Gabon (GA)</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner-elite"></div>
      <p class="text-muted mt-4">Chargement des organisations...</p>
    </div>

    <!-- Organizations Table -->
    <div v-else class="table-wrapper-premium">
      <div v-if="filteredOrganizations.length === 0" class="empty-state-premium">
        <div class="empty-icon"><i class="fas fa-building"></i></div>
        <h3>Aucune organisation trouvée</h3>
        <p>Ajustez vos filtres ou termes de recherche.</p>
      </div>

      <table v-else class="table-premium">
        <thead>
          <tr>
            <th>Organisation</th>
            <th>Contact</th>
            <th>Pays</th>
            <th>Plan & Statut</th>
            <th>Compte</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="org in paginatedOrganizations" :key="org.id" :class="{ 'row-suspended': org.isActive === false }">
            <td>
              <div class="client-cell">
                <div class="org-icon-avatar bg-slate-100 text-slate-700">
                  {{ org.name?.[0]?.toUpperCase() || 'O' }}
                </div>
                <div class="client-details">
                  <span class="client-name font-bold">{{ org.name }}</span>
                  <span class="client-sub">{{ org.legalForm || 'Non Spécifié' }} · RCCM: {{ org.taxId || 'Aucun' }}</span>
                </div>
              </div>
            </td>
            <td>
              <div class="contact-cell">
                <span class="contact-phone font-mono">{{ org.phone || '—' }}</span>
                <span class="contact-email text-muted">{{ org.email || '—' }}</span>
              </div>
            </td>
            <td>
              <span class="country-badge">{{ org.country || 'CI' }}</span>
            </td>
            <td>
              <div class="plan-cell flex flex-col">
                <span class="plan-name font-bold text-sky-600">{{ org.activePlanName }}</span>
                <span class="plan-status text-[10px] text-muted">{{ org.activeSubscriptionStatus }}</span>
              </div>
            </td>
            <td>
              <span :class="['account-badge', org.isActive !== false ? 'account-active' : 'account-suspended']">
                <i :class="org.isActive !== false ? 'fas fa-check-circle' : 'fas fa-ban'"></i>
                {{ org.isActive !== false ? 'Actif' : 'Suspendu' }}
              </span>
              <div v-if="org.suspendedReason" class="suspend-reason" :title="org.suspendedReason">{{ org.suspendedReason }}</div>
            </td>
            <td>
              <div class="actions-cell">
                <button
                  class="action-btn btn-view-finances"
                  @click="openFinanceModal(org)"
                  title="Voir états financiers & score de crédit"
                >
                  <i class="fas fa-chart-pie"></i>
                </button>
                <button
                  v-if="org.isActive !== false"
                  class="action-btn btn-suspend"
                  @click="openSuspendModal(org)"
                  :disabled="actionLoading === org.id"
                  title="Suspendre cette organisation"
                >
                  <i class="fas fa-ban"></i>
                </button>
                <button
                  v-else
                  class="action-btn btn-activate"
                  @click="handleActivateOrganization(org)"
                  :disabled="actionLoading === org.id"
                  title="Réactiver cette organisation"
                >
                  <i class="fas fa-check-circle"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Client-Side Pagination -->
    <div v-if="totalElements > pageSize" class="pagination-premium-container mt-12">
      <div class="pagination-info">
        Affichage de <strong>{{ pagedFrom }} - {{ pagedTo }}</strong> sur <strong>{{ totalElements }}</strong> organisations
      </div>
      <div class="pagination-controls">
        <button 
          class="btn-page-step" 
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        
        <div class="page-numbers">
          <button 
            v-for="p in totalPages" 
            :key="p"
            :class="['btn-page-num', { active: currentPage === p }]"
            @click="currentPage = p"
          >
            {{ p }}
          </button>
        </div>

        <button 
          class="btn-page-step" 
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- Suspend Modal -->
    <div v-if="suspendModal.show" class="modal-backdrop" @click.self="suspendModal.show = false">
      <div class="modal-box premium-modal animate-slide-up">
        <div class="modal-header">
          <i class="fas fa-ban text-red-500 mr-2"></i>
          <h3>Suspendre l'organisation</h3>
        </div>
        <p class="modal-desc">
          Vous allez suspendre l'organisation <strong>{{ suspendModal.target?.name }}</strong>. 
          Les utilisateurs de cette organisation ne pourront plus se connecter à ONDA.
        </p>
        <div class="modal-field">
          <label>Raison de la suspension (optionnel)</label>
          <textarea v-model="suspendModal.reason" placeholder="Ex: Non-payment, violation des CGU..." rows="3"></textarea>
        </div>
        <div class="modal-actions">
          <button class="btn-ghost" @click="suspendModal.show = false">Annuler</button>
          <button class="btn-danger" @click="handleConfirmSuspend" :disabled="actionLoading">Confirmer la suspension</button>
        </div>
      </div>
    </div>

    <!-- Finance & Score Modal -->
    <div v-if="financeModal.show" class="modal-backdrop" @click.self="financeModal.show = false">
      <div class="premium-modal-large finance-modal animate-slide-up">
        <div class="finance-modal-header">
          <div>
            <h3>{{ financeModal.org?.name }}</h3>
            <p class="text-muted text-sm mt-1">États financiers OHADA (année en cours) & score de crédit</p>
          </div>
          <button class="btn-close" @click="financeModal.show = false"><i class="fas fa-times"></i></button>
        </div>

        <div v-if="financeModal.loading" class="loading-state">
          <div class="spinner-elite"></div>
          <p class="text-muted mt-4">Chargement des données financières...</p>
        </div>

        <div v-else class="finance-modal-body">
          <div v-if="financeModal.error" class="finance-error">
            <i class="fas fa-triangle-exclamation"></i> {{ financeModal.error }}
          </div>

          <template v-else>
            <!-- Score de crédit -->
            <section class="finance-section" v-if="financeModal.score">
              <div class="score-header">
                <div class="score-badge">
                  <span class="score-value">{{ financeModal.score.totalScore }}</span>
                  <span class="score-max">/ {{ financeModal.score.maxScore }}</span>
                </div>
                <div class="score-meta">
                  <span class="score-label">{{ financeModal.score.labelFr }}</span>
                  <span class="score-tier">Tier {{ financeModal.score.tierLabel }}</span>
                </div>
                <div v-if="financeModal.score.hasLoanDelinquency" class="score-delinquency">
                  <i class="fas fa-triangle-exclamation"></i> Retard de remboursement détecté
                </div>
              </div>
              <div class="score-stats-grid">
                <div class="score-stat">
                  <span class="stat-label">CA moyen mensuel</span>
                  <span class="stat-value">{{ formatAmount(financeModal.score.avgMonthlyRevenue) }}</span>
                </div>
                <div class="score-stat">
                  <span class="stat-label">Patrimoine net certifié</span>
                  <span class="stat-value">{{ formatAmount(financeModal.score.netPatrimonyValue) }}</span>
                </div>
                <div class="score-stat">
                  <span class="stat-label">Jours actifs (30j)</span>
                  <span class="stat-value">{{ financeModal.score.activeDaysLast30 }}</span>
                </div>
                <div class="score-stat">
                  <span class="stat-label">Déclarations vérifiées (12M)</span>
                  <span class="stat-value">{{ financeModal.score.verifiedDeclarationsLast12M }}/{{ financeModal.score.dueDeclarationsLast12M }}</span>
                </div>
              </div>
            </section>

            <!-- Bilan -->
            <section class="finance-section" v-if="financeModal.statements">
              <h4 class="finance-section-title"><i class="fas fa-scale-balanced"></i> Bilan ({{ financeModal.statements.period }})</h4>
              <div class="finance-columns">
                <div class="finance-column">
                  <h5>Actif</h5>
                  <div class="finance-row"><span>Immobilisations</span><strong>{{ formatAmount(financeModal.statements.balanceSheet.immobilisations) }}</strong></div>
                  <div class="finance-row"><span>Stocks</span><strong>{{ formatAmount(financeModal.statements.balanceSheet.stocks) }}</strong></div>
                  <div class="finance-row"><span>Créances clients</span><strong>{{ formatAmount(financeModal.statements.balanceSheet.receivables) }}</strong></div>
                  <div class="finance-row"><span>Trésorerie</span><strong>{{ formatAmount(financeModal.statements.balanceSheet.cashAndBank) }}</strong></div>
                  <div class="finance-row finance-row-total"><span>Total Actif</span><strong>{{ formatAmount(financeModal.statements.balanceSheet.totalAssets) }}</strong></div>
                </div>
                <div class="finance-column">
                  <h5>Passif</h5>
                  <div class="finance-row"><span>Capitaux propres</span><strong>{{ formatAmount(financeModal.statements.balanceSheet.equity) }}</strong></div>
                  <div class="finance-row"><span>Dettes financières</span><strong>{{ formatAmount(financeModal.statements.balanceSheet.financialDebts) }}</strong></div>
                  <div class="finance-row"><span>Fournisseurs</span><strong>{{ formatAmount(financeModal.statements.balanceSheet.payables) }}</strong></div>
                  <div class="finance-row"><span>Dettes fiscales & sociales</span><strong>{{ formatAmount(financeModal.statements.balanceSheet.taxLiabilities) }}</strong></div>
                  <div class="finance-row"><span>Autres dettes</span><strong>{{ formatAmount(financeModal.statements.balanceSheet.otherLiabilities) }}</strong></div>
                  <div class="finance-row finance-row-total"><span>Total Passif</span><strong>{{ formatAmount(financeModal.statements.balanceSheet.totalLiabilities) }}</strong></div>
                </div>
              </div>
            </section>

            <!-- Compte de Résultat -->
            <section class="finance-section" v-if="financeModal.statements">
              <h4 class="finance-section-title"><i class="fas fa-file-invoice-dollar"></i> Compte de Résultat</h4>
              <div class="finance-columns">
                <div class="finance-column">
                  <h5>Produits</h5>
                  <div class="finance-row"><span>Ventes de marchandises</span><strong>{{ formatAmount(financeModal.statements.incomeStatement.salesRevenue) }}</strong></div>
                  <div class="finance-row"><span>Prestations de services</span><strong>{{ formatAmount(financeModal.statements.incomeStatement.servicesRevenue) }}</strong></div>
                  <div class="finance-row"><span>Autres produits</span><strong>{{ formatAmount(financeModal.statements.incomeStatement.otherRevenue) }}</strong></div>
                  <div class="finance-row finance-row-total"><span>Total Produits</span><strong>{{ formatAmount(financeModal.statements.incomeStatement.totalRevenue) }}</strong></div>
                </div>
                <div class="finance-column">
                  <h5>Charges</h5>
                  <div class="finance-row"><span>Achats de marchandises</span><strong>{{ formatAmount(financeModal.statements.incomeStatement.costOfGoodsSold) }}</strong></div>
                  <div class="finance-row"><span>Services extérieurs</span><strong>{{ formatAmount(financeModal.statements.incomeStatement.externalServices) }}</strong></div>
                  <div class="finance-row"><span>Charges de personnel</span><strong>{{ formatAmount(financeModal.statements.incomeStatement.personnelExpenses) }}</strong></div>
                  <div class="finance-row"><span>Impôts et taxes</span><strong>{{ formatAmount(financeModal.statements.incomeStatement.taxesAndDuties) }}</strong></div>
                  <div class="finance-row"><span>Charges financières</span><strong>{{ formatAmount(financeModal.statements.incomeStatement.financialExpenses) }}</strong></div>
                  <div class="finance-row"><span>Autres charges</span><strong>{{ formatAmount(financeModal.statements.incomeStatement.otherExpenses) }}</strong></div>
                  <div class="finance-row finance-row-total"><span>Total Charges</span><strong>{{ formatAmount(financeModal.statements.incomeStatement.totalExpense) }}</strong></div>
                </div>
              </div>
              <div class="finance-results">
                <div class="finance-result-item"><span>Marge brute</span><strong>{{ formatAmount(financeModal.statements.incomeStatement.grossProfit) }}</strong></div>
                <div class="finance-result-item"><span>Résultat d'exploitation</span><strong>{{ formatAmount(financeModal.statements.incomeStatement.operatingIncome) }}</strong></div>
                <div class="finance-result-item finance-result-net"><span>Résultat net</span><strong>{{ formatAmount(financeModal.statements.incomeStatement.netIncome) }}</strong></div>
              </div>
            </section>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import adminApi from '../../services/adminApi';

export default {
  name: 'PartnerOrgsManager',
  setup() {
    const route = useRoute();
    const partnerId = route.params.id;

    const partnerName = ref('');
    const organizations = ref([]);
    const isLoading = ref(true);
    const searchQuery = ref('');
    const selectedCountry = ref('ALL');
    const actionLoading = ref(null);

    // Suspend Modal state
    const suspendModal = ref({ show: false, target: null, reason: '' });

    // Finance & Score Modal state — chargé à la demande (pas au chargement de la liste)
    const financeModal = ref({ show: false, org: null, loading: false, error: null, score: null, statements: null });

    // Pagination State
    const currentPage = ref(1);
    const pageSize = ref(10);

    const fetchPartnerDetails = async () => {
      try {
        const res = await adminApi.getPartners({ size: 100 });
        if (res.success && res.data) {
          const list = Array.isArray(res.data) ? res.data : (res.data.content || []);
          const partner = list.find(p => p.id === partnerId);
          if (partner) {
            partnerName.value = partner.name;
          }
        }
      } catch (e) {
        console.error('Error fetching partner details:', e);
      }
    };

    const fetchOrganizations = async () => {
      isLoading.value = true;
      try {
        const res = await adminApi.getPartnerOrganizations(partnerId);
        if (res.success && res.data) {
          organizations.value = res.data;
        }
      } catch (e) {
        console.error('Error fetching partner organizations:', e);
      } finally {
        isLoading.value = false;
      }
    };

    const onFilterChange = () => {
      currentPage.value = 1;
    };

    const filteredOrganizations = computed(() => {
      return organizations.value.filter(org => {
        const nameQuery = searchQuery.value.toLowerCase().trim();
        const matchesSearch = nameQuery === '' || org.name.toLowerCase().includes(nameQuery);
        const matchesCountry = selectedCountry.value === 'ALL' || org.country === selectedCountry.value;
        return matchesSearch && matchesCountry;
      });
    });

    const paginatedOrganizations = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value;
      const end = start + pageSize.value;
      return filteredOrganizations.value.slice(start, end);
    });

    const totalElements = computed(() => filteredOrganizations.value.length);
    const totalPages = computed(() => Math.ceil(totalElements.value / pageSize.value) || 1);

    const pagedFrom = computed(() => (currentPage.value - 1) * pageSize.value + 1);
    const pagedTo = computed(() => Math.min(currentPage.value * pageSize.value, totalElements.value));

    const openSuspendModal = (org) => {
      suspendModal.value = { show: true, target: org, reason: '' };
    };

    const handleConfirmSuspend = async () => {
      const { target, reason } = suspendModal.value;
      if (!target) return;
      actionLoading.value = target.id;
      try {
        await adminApi.suspendClient(target.id, reason);
        const idx = organizations.value.findIndex(o => o.id === target.id);
        if (idx !== -1) {
          organizations.value[idx] = { 
            ...organizations.value[idx], 
            isActive: false, 
            suspendedReason: reason || "Suspendu par l'administrateur" 
          };
        }
        suspendModal.value.show = false;
      } catch (e) {
        console.error('Error suspending organization:', e);
      } finally {
        actionLoading.value = null;
      }
    };

    const handleActivateOrganization = async (org) => {
      actionLoading.value = org.id;
      try {
        await adminApi.activateClient(org.id);
        const idx = organizations.value.findIndex(o => o.id === org.id);
        if (idx !== -1) {
          organizations.value[idx] = { 
            ...organizations.value[idx], 
            isActive: true, 
            suspendedReason: null 
          };
        }
      } catch (e) {
        console.error('Error activating organization:', e);
      } finally {
        actionLoading.value = null;
      }
    };

    const formatAmount = (value) => {
      if (value === null || value === undefined) return '—';
      return new Intl.NumberFormat('fr-FR').format(value) + ' XOF';
    };

    const openFinanceModal = async (org) => {
      financeModal.value = { show: true, org, loading: true, error: null, score: null, statements: null };
      try {
        const [scoreRes, statementsRes] = await Promise.all([
          adminApi.getClientScore(org.id),
          adminApi.getClientFinancialStatements(org.id)
        ]);
        financeModal.value.score = scoreRes.data || scoreRes;
        financeModal.value.statements = statementsRes.data || statementsRes;
      } catch (e) {
        console.error('Error fetching org financial data:', e);
        financeModal.value.error = e.message || 'Impossible de charger les données financières.';
      } finally {
        financeModal.value.loading = false;
      }
    };

    onMounted(() => {
      fetchPartnerDetails();
      fetchOrganizations();
    });

    return {
      partnerName,
      isLoading,
      searchQuery,
      selectedCountry,
      actionLoading,
      suspendModal,
      financeModal,
      currentPage,
      pageSize,
      totalPages,
      totalElements,
      pagedFrom,
      pagedTo,
      filteredOrganizations,
      paginatedOrganizations,
      onFilterChange,
      openSuspendModal,
      handleConfirmSuspend,
      handleActivateOrganization,
      openFinanceModal,
      formatAmount
    };
  }
};
</script>

<style scoped>
.partner-orgs-manager-viewport {
  width: 100%;
  min-height: 100%;
  padding-bottom: 5rem;
}

.btn-back {
  font-size: 0.95rem;
  color: var(--accent);
  text-decoration: none;
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

/* Client Cell */
.client-cell {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.org-icon-avatar {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: #f1f5f9;
  border: 1px solid var(--border-subtle);
  color: var(--text-muted);
  font-weight: 800;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.client-details {
  display: flex;
  flex-direction: column;
}

.client-name {
  font-weight: 800;
  color: var(--text-main);
  font-size: 0.95rem;
}

.client-sub {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 600;
  margin-top: 0.15rem;
}

/* Contact Cell */
.contact-cell {
  display: flex;
  flex-direction: column;
}

.contact-phone {
  font-weight: 700;
  color: var(--text-main);
}

.contact-email {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 600;
  margin-top: 0.15rem;
}

/* Country badge */
.country-badge {
  background: #f8fafc;
  border: 1px solid var(--border-subtle);
  color: var(--text-main);
  font-size: 0.75rem;
  font-weight: 800;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  display: inline-block;
}

/* Account status badge */
.account-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.65rem;
  border-radius: 99rem;
  font-size: 0.65rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.account-active {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.account-suspended {
  background: rgba(244, 63, 94, 0.1);
  color: #f43f5e;
}

.suspend-reason {
  font-size: 0.7rem;
  color: var(--text-muted);
  font-style: italic;
  margin-top: 0.25rem;
  max-width: 140px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Actions */
.actions-cell {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  transition: all 0.15s ease;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-suspend {
  background: rgba(244, 63, 94, 0.1);
  color: #f43f5e;
}

.btn-suspend:hover:not(:disabled) {
  background: rgba(244, 63, 94, 0.2);
  transform: scale(1.05);
}

.btn-activate {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.btn-activate:hover:not(:disabled) {
  background: rgba(16, 185, 129, 0.2);
  transform: scale(1.05);
}

.btn-view-finances {
  background: rgba(14, 165, 233, 0.1);
  color: #0284c7;
}

.btn-view-finances:hover {
  background: rgba(14, 165, 233, 0.2);
  transform: scale(1.05);
}

/* Row suspended style */
.row-suspended td {
  opacity: 0.65;
  background: #fff8f8;
}

/* Pagination Premium */
.pagination-premium-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2.5rem;
  background: white;
  border-radius: 1.5rem;
  border: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-sm);
}

.pagination-info { font-size: 0.9rem; color: var(--text-muted); }
.pagination-info strong { color: var(--text-main); }

.pagination-controls { display: flex; align-items: center; gap: 1rem; }
.page-numbers { display: flex; gap: 0.5rem; }

.btn-page-step, .btn-page-num {
  width: 38px; height: 38px;
  display: flex; align-items: center; justify-content: center;
  background: var(--bg-surface-dim);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s;
  color: var(--text-muted);
}

.btn-page-step:hover:not(:disabled), .btn-page-num:hover {
  background: white;
  border-color: var(--accent);
  color: var(--accent);
  transform: translateY(-2px);
}

.btn-page-num.active {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
}

.btn-page-step:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-box {
  background: white;
  border-radius: 1.5rem;
  padding: 2rem;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.15);
  animation: modal-in 0.2s ease;
}

@keyframes modal-in {
  from { opacity: 0; transform: translateY(16px) scale(0.97); }
  to { opacity: 1; transform: none; }
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.modal-header i {
  font-size: 1.5rem;
}

.modal-header h3 {
  font-size: 1.2rem;
  font-weight: 800;
}

.modal-desc {
  font-size: 0.9rem;
  color: var(--text-muted);
  line-height: 1.5;
  margin-bottom: 1.25rem;
}

.modal-field label {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
  color: var(--text-main);
}

.modal-field textarea {
  width: 100%;
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  padding: 0.75rem;
  font-size: 0.9rem;
  resize: none;
  outline: none;
  box-sizing: border-box;
}

.modal-field textarea:focus {
  border-color: #f43f5e;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.btn-ghost {
  padding: 0.6rem 1.25rem;
  border-radius: 10px;
  border: 1px solid var(--border-subtle);
  background: transparent;
  font-weight: 700;
  cursor: pointer;
  font-size: 0.875rem;
}

.btn-ghost:hover {
  background: #f8fafc;
}

.btn-danger {
  padding: 0.6rem 1.25rem;
  border-radius: 10px;
  border: none;
  background: #f43f5e;
  color: white;
  font-weight: 800;
  cursor: pointer;
  font-size: 0.875rem;
}

.btn-danger:hover:not(:disabled) {
  background: #e11d48;
}

.btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

/* Finance & Score Modal */
.premium-modal-large {
  background: white;
  border-radius: 1.5rem;
  padding: 2rem;
  width: 95%;
  max-width: 900px;
  max-height: 88vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0,0,0,0.15);
  animation: modal-in 0.2s ease;
}

.finance-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid var(--border-subtle);
  padding-bottom: 1.25rem;
  margin-bottom: 1.5rem;
}

.finance-modal-header h3 {
  font-size: 1.4rem;
  font-weight: 900;
  color: var(--text-main);
}

.finance-modal-body {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.finance-error {
  background: rgba(244, 63, 94, 0.08);
  color: #be123c;
  padding: 1rem 1.25rem;
  border-radius: 0.75rem;
  font-weight: 700;
  font-size: 0.9rem;
}

.finance-section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 800;
  color: var(--text-main);
  margin-bottom: 1rem;
}

.finance-section-title i {
  color: var(--accent);
}

/* Score */
.score-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
}

.score-badge {
  background: var(--bg-surface-inverse);
  color: white;
  border-radius: 1rem;
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
}

.score-value {
  font-size: 1.75rem;
  font-weight: 900;
}

.score-max {
  font-size: 0.9rem;
  opacity: 0.7;
  font-weight: 700;
}

.score-meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.score-label {
  font-weight: 800;
  font-size: 1rem;
  color: var(--text-main);
}

.score-tier {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.score-delinquency {
  background: rgba(244, 63, 94, 0.1);
  color: #be123c;
  font-size: 0.8rem;
  font-weight: 800;
  padding: 0.5rem 0.85rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.score-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
}

.score-stat {
  background: var(--bg-surface-dim);
  border-radius: 0.75rem;
  padding: 0.85rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.score-stat .stat-label {
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
}

.score-stat .stat-value {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--text-main);
}

/* Bilan / Compte de résultat */
.finance-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.finance-column h5 {
  font-size: 0.75rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  margin-bottom: 0.75rem;
}

.finance-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-subtle);
  font-size: 0.85rem;
}

.finance-row span {
  color: var(--text-muted);
}

.finance-row strong {
  color: var(--text-main);
  font-weight: 800;
}

.finance-row-total {
  border-bottom: none;
  border-top: 2px solid var(--border-strong);
  margin-top: 0.25rem;
  padding-top: 0.65rem;
}

.finance-row-total span,
.finance-row-total strong {
  color: var(--text-main);
  font-weight: 900;
}

.finance-results {
  display: flex;
  gap: 1.5rem;
  margin-top: 1.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--border-subtle);
  flex-wrap: wrap;
}

.finance-result-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.finance-result-item span {
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
}

.finance-result-item strong {
  font-size: 1.1rem;
  font-weight: 900;
  color: var(--text-main);
}

.finance-result-net strong {
  color: #10b981;
}

@media (max-width: 640px) {
  .finance-columns {
    grid-template-columns: 1fr;
  }
}
</style>
