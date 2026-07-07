<template>
  <div class="clients-manager-viewport reveal">
    <!-- Page Header -->
    <div class="bo-page-header mb-10">
      <div class="header-left">
        <h2 class="text-4xl font-black tracking-tight">Gestion des <span class="text-accent">Clients</span></h2>
        <p class="text-muted mt-2">Suivi et administration des organisations enregistrées et de leurs profils d'activité.</p>
      </div>
    </div>

    <!-- Stats Cards Grid -->
    <div class="stats-grid mb-10">
      <div class="stat-card">
        <div class="stat-icon"><i class="fas fa-building"></i></div>
        <div class="stat-info">
          <span class="stat-label">Total Clients</span>
          <span class="stat-value">{{ stats.total }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon formal"><i class="fas fa-file-signature"></i></div>
        <div class="stat-info">
          <span class="stat-label">Entreprises Formelles</span>
          <span class="stat-value">{{ stats.formal }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon track-stock"><i class="fas fa-cubes"></i></div>
        <div class="stat-info">
          <span class="stat-label">Suivi de Stock</span>
          <span class="stat-value">{{ stats.trackStock }}</span>
        </div>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="filter-bar mb-6">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input v-model="searchQuery" type="text" placeholder="Rechercher par nom d'entreprise, email, RCCM..." />
      </div>
      <div class="filters-group">
        <div class="select-wrapper">
          <i class="fas fa-globe"></i>
          <select v-model="selectedCountry">
            <option value="ALL">Tous les pays</option>
            <option value="CI">Côte d'Ivoire (CI)</option>
            <option value="SN">Sénégal (SN)</option>
            <option value="BF">Burkina Faso (BF)</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner-elite"></div>
      <p class="text-muted mt-4">Chargement des clients...</p>
    </div>

    <!-- Clients Table -->
    <div v-else class="table-wrapper-premium">
      <div v-if="filteredClients.length === 0" class="empty-state-premium">
        <div class="empty-icon"><i class="fas fa-store-slash"></i></div>
        <h3>Aucune organisation trouvée</h3>
        <p>Ajustez vos filtres ou termes de recherche.</p>
      </div>

      <table v-else class="table-premium">
        <thead>
          <tr>
            <th>Organisation</th>
            <th>Type / Secteur</th>
            <th>Contact</th>
            <th>Pays</th>
            <th>Dernière Activité</th>
            <th>Compte</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="client in filteredClients" :key="client.id" :class="{ 'row-suspended': !client.isActive }">
            <td>
              <div class="client-cell">
                <div :class="['avatar-square', !client.isActive && 'avatar-suspended']">
                  {{ client.name?.[0] || 'C' }}
                </div>
                <div class="client-details">
                  <span class="client-name">{{ client.name }}</span>
                  <span class="client-sub">{{ client.legalForm || 'Non Spécifié' }} · RCCM: {{ client.taxId || 'Aucun' }}</span>
                </div>
              </div>
            </td>
            <td>
              <div class="type-cell">
                <span class="type-text">{{ client.type || '—' }}</span>
                <span class="sector-text">Secteur: {{ client.activitySector || 'Général' }}</span>
              </div>
            </td>
            <td>
              <div class="contact-cell">
                <span class="contact-phone">{{ client.phone || '—' }}</span>
                <span class="contact-email">{{ client.email || '—' }}</span>
              </div>
            </td>
            <td>
              <span class="country-badge">
                {{ client.country || 'CI' }}
              </span>
            </td>
            <td><span class="date-text">{{ formatActivityDate(client.lastActivityAt) }}</span></td>
            <td>
              <span :class="['account-badge', client.isActive !== false ? 'account-active' : 'account-suspended']">
                <i :class="client.isActive !== false ? 'fas fa-check-circle' : 'fas fa-ban'"></i>
                {{ client.isActive !== false ? 'Actif' : 'Suspendu' }}
              </span>
              <div v-if="client.suspendedReason" class="suspend-reason">{{ client.suspendedReason }}</div>
            </td>
            <td>
              <div class="actions-cell">
                <button
                  v-if="client.isActive !== false"
                  class="action-btn btn-suspend"
                  @click="openSuspendModal(client)"
                  :disabled="actionLoading === client.id"
                  title="Suspendre ce compte"
                >
                  <i class="fas fa-ban"></i>
                </button>
                <button
                  v-else
                  class="action-btn btn-activate"
                  @click="handleActivate(client)"
                  :disabled="actionLoading === client.id"
                  title="Réactiver ce compte"
                >
                  <i class="fas fa-check-circle"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Suspend Modal -->
    <div v-if="suspendModal.show" class="modal-backdrop" @click.self="suspendModal.show = false">
      <div class="modal-box">
        <div class="modal-header">
          <i class="fas fa-ban text-red-500"></i>
          <h3>Suspendre le compte</h3>
        </div>
        <p class="modal-desc">Vous allez suspendre le compte de <strong>{{ suspendModal.client?.name }}</strong>. Les utilisateurs de cette organisation ne pourront plus se connecter.</p>
        <div class="modal-field">
          <label>Raison de la suspension (optionnel)</label>
          <textarea v-model="suspendModal.reason" placeholder="Ex: Non-paiement de facture, violation des CGU..." rows="3"></textarea>
        </div>
        <div class="modal-actions">
          <button class="btn-ghost" @click="suspendModal.show = false">Annuler</button>
          <button class="btn-danger" @click="handleSuspend" :disabled="actionLoading">Confirmer la suspension</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import adminApi from '../../services/adminApi';

const MOCK_CLIENTS = [
  {
    id: "org1",
    name: "Sneezy Shop",
    type: "FORMAL",
    legalForm: "SARL",
    taxId: "CNI00001",
    email: "contact@sneezyshop.com",
    phone: "+225 01020304",
    country: "CI",
    createdAt: "2026-06-23T10:32:35",
    lastActivityAt: "2026-06-23T10:33:00",
    activePlanName: "Onda Premium",
    activePlanType: "PREMIUM",
    activeSubscriptionStatus: "ACTIVE",
    activitySector: "GENERAL_TRADE",
    trackStock: true
  },
  {
    id: "org2",
    name: "Koffi & Fils SARL",
    type: "FORMAL",
    legalForm: "SARL",
    taxId: "RCCM-ABJ-12345",
    email: "contact@koffi.ci",
    phone: "+225 05050505",
    country: "CI",
    createdAt: "2026-06-15T12:00:00",
    lastActivityAt: "2026-06-20T18:45:00",
    activePlanName: "Plan Gratuit",
    activePlanType: "FREE",
    activeSubscriptionStatus: "ACTIVE",
    activitySector: "AGRICULTURE",
    trackStock: false
  },
  {
    id: "org3",
    name: "Global Trade CI",
    type: "FORMAL",
    legalForm: "SA",
    taxId: "RCCM-ABJ-98765",
    email: "info@globaltrade.ci",
    phone: "+225 08080808",
    country: "CI",
    createdAt: "2026-06-21T09:30:00",
    lastActivityAt: "2026-06-23T10:34:00",
    activePlanName: "Onda Pro",
    activePlanType: "PROFESSIONAL",
    activeSubscriptionStatus: "ACTIVE",
    activitySector: "SERVICES",
    trackStock: true
  }
];

export default {
  name: 'ClientsManager',
  setup() {
    const clients = ref([]);
    const isLoading = ref(true);
    const searchQuery = ref('');
    const selectedPlan = ref('ALL');
    const selectedCountry = ref('ALL');
    const actionLoading = ref(null);
    const suspendModal = ref({ show: false, client: null, reason: '' });

    const fetchClients = async () => {
      isLoading.value = true;
      try {
        const res = await adminApi.getClients();
        if (res.success) {
          clients.value = res.data;
        } else {
          clients.value = MOCK_CLIENTS;
        }
      } catch (error) {
        console.error('Error fetching clients, using mock data...', error);
        clients.value = MOCK_CLIENTS;
      } finally {
        isLoading.value = false;
      }
    };

    const openSuspendModal = (client) => {
      suspendModal.value = { show: true, client, reason: '' };
    };

    const handleSuspend = async () => {
      const client = suspendModal.value.client;
      if (!client) return;
      actionLoading.value = client.id;
      try {
        await adminApi.suspendClient(client.id, suspendModal.value.reason);
        const idx = clients.value.findIndex(c => c.id === client.id);
        if (idx !== -1) {
          clients.value[idx] = { ...clients.value[idx], isActive: false, suspendedReason: suspendModal.value.reason || "Suspendu par l'administrateur" };
        }
        suspendModal.value.show = false;
      } catch (e) {
        console.error('Erreur suspension:', e);
      } finally {
        actionLoading.value = null;
      }
    };

    const handleActivate = async (client) => {
      actionLoading.value = client.id;
      try {
        await adminApi.activateClient(client.id);
        const idx = clients.value.findIndex(c => c.id === client.id);
        if (idx !== -1) {
          clients.value[idx] = { ...clients.value[idx], isActive: true, suspendedReason: null };
        }
      } catch (e) {
        console.error('Erreur réactivation:', e);
      } finally {
        actionLoading.value = null;
      }
    };

    const stats = computed(() => {
      return {
        total: clients.value.length,
        formal: clients.value.filter(c => c.type === 'FORMAL').length,
        paying: clients.value.filter(c => c.activePlanType && c.activePlanType !== 'FREE').length,
        trackStock: clients.value.filter(c => c.trackStock).length
      };
    });

    const filteredClients = computed(() => {
      return clients.value.filter(c => {
        const nameQuery = searchQuery.value.toLowerCase().trim();
        const matchesSearch = nameQuery === '' ||
          c.name.toLowerCase().includes(nameQuery) ||
          (c.email || '').toLowerCase().includes(nameQuery) ||
          (c.taxId || '').toLowerCase().includes(nameQuery);

        const matchesPlan = selectedPlan.value === 'ALL' || c.activePlanType === selectedPlan.value;
        const matchesCountry = selectedCountry.value === 'ALL' || c.country === selectedCountry.value;

        return matchesSearch && matchesPlan && matchesCountry;
      });
    });

    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      return new Date(dateStr).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'short', year: 'numeric'
      });
    };

    const formatActivityDate = (dateStr) => {
      if (!dateStr) return 'Jamais';
      return new Date(dateStr).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    };

    onMounted(fetchClients);

    return {
      clients, isLoading, searchQuery, selectedPlan, selectedCountry,
      stats, filteredClients, formatDate, formatActivityDate,
      actionLoading, suspendModal, openSuspendModal, handleSuspend, handleActivate
    };
  }
};
</script>

<style scoped>
.clients-manager-viewport {
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

.stat-icon.formal {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.stat-icon.active-sub {
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
}

.stat-icon.track-stock {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
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

/* Client Cell */
.client-cell {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar-square {
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

/* Type Cell */
.type-cell {
  display: flex;
  flex-direction: column;
}

.type-text {
  font-weight: 800;
  color: var(--text-main);
  font-size: 0.85rem;
}

.sector-text {
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

.date-text {
  color: var(--text-muted);
  font-weight: 600;
  font-size: 0.8rem;
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

/* Row suspended style */
.row-suspended td {
  opacity: 0.65;
  background: #fff8f8;
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
</style>
