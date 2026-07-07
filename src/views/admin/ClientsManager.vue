<template>
  <div class="clients-manager-viewport reveal">
    <!-- Page Header -->
    <div class="bo-page-header mb-10">
      <div class="header-left">
        <h2 class="text-4xl font-black tracking-tight">Gestion des <span class="text-accent">Partenaires</span></h2>
        <p class="text-muted mt-2">Suivi et administration des partenaires intégrateurs B2B et de leurs organisations rattachées.</p>
      </div>
    </div>

    <!-- Stats Cards Grid -->
    <div class="stats-grid mb-10">
      <div class="stat-card">
        <div class="stat-icon"><i class="fas fa-handshake"></i></div>
        <div class="stat-info">
          <span class="stat-label">Total Partenaires</span>
          <span class="stat-value">{{ stats.total }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon active"><i class="fas fa-check-circle"></i></div>
        <div class="stat-info">
          <span class="stat-label">Partenaires Actifs</span>
          <span class="stat-value text-success">{{ stats.active }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon suspend"><i class="fas fa-ban"></i></div>
        <div class="stat-info">
          <span class="stat-label">Partenaires Suspendus</span>
          <span class="stat-value text-danger">{{ stats.suspended }}</span>
        </div>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="filter-bar mb-6">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input v-model="searchQuery" type="text" placeholder="Rechercher par nom, email..." @input="onFilterChange" />
      </div>
      <div class="filters-group">
        <div class="select-wrapper">
          <i class="fas fa-toggle-on"></i>
          <select v-model="selectedStatus" @change="onFilterChange">
            <option value="ALL">Tous les statuts</option>
            <option value="ACTIVE">Actifs</option>
            <option value="SUSPENDED">Suspendus</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner-elite"></div>
      <p class="text-muted mt-4">Chargement des partenaires...</p>
    </div>

    <!-- Partners Table -->
    <div v-else class="table-wrapper-premium">
      <div v-if="partners.length === 0" class="empty-state-premium">
        <div class="empty-icon"><i class="fas fa-user-friends"></i></div>
        <h3>Aucun partenaire trouvé</h3>
        <p>Ajustez vos filtres ou termes de recherche.</p>
      </div>

      <table v-else class="table-premium">
        <thead>
          <tr>
            <th>Partenaire</th>
            <th>Préfixe API Key</th>
            <th>Webhook / IPs</th>
            <th>Organisations Gérées</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="partner in partners" :key="partner.id" :class="{ 'row-suspended': partner.isActive === false }">
            <td>
              <div class="client-cell">
                <div :class="['avatar-square', partner.isActive === false && 'avatar-suspended']">
                  {{ partner.name?.[0]?.toUpperCase() || 'P' }}
                </div>
                <div class="client-details">
                  <span class="client-name font-bold">{{ partner.name }}</span>
                  <span class="client-sub">{{ partner.contactEmail || 'Pas d\'email' }}</span>
                </div>
              </div>
            </td>
            <td>
              <span class="api-key-badge font-mono">{{ partner.apiKeyPrefix || '—' }}</span>
            </td>
            <td>
              <div class="webhook-cell">
                <span class="webhook-url text-xs font-mono" :title="partner.webhookUrl">{{ partner.webhookUrl || 'Pas de webhook' }}</span>
                <span class="allowed-ips text-xs text-muted" :title="partner.allowedIps">IPs: {{ partner.allowedIps || 'Toutes' }}</span>
              </div>
            </td>
            <td>
              <button class="btn-org-count" @click="openOrganizationsModal(partner)" title="Voir les organisations gérées">
                <i class="fas fa-building text-sky-500 mr-2"></i>
                <span class="underline font-bold">{{ partner.organizationCount || 0 }} organisation(s)</span>
              </button>
            </td>
            <td>
              <span :class="['account-badge', partner.isActive !== false ? 'account-active' : 'account-suspended']">
                <i :class="partner.isActive !== false ? 'fas fa-check-circle' : 'fas fa-ban'"></i>
                {{ partner.isActive !== false ? 'Actif' : 'Suspendu' }}
              </span>
            </td>
            <td>
              <div class="actions-cell">
                <button
                  class="action-btn btn-view-orgs"
                  @click="openOrganizationsModal(partner)"
                  title="Voir les organisations"
                >
                  <i class="fas fa-eye"></i>
                </button>
                <button
                  v-if="partner.isActive !== false"
                  class="action-btn btn-suspend"
                  @click="openSuspendModal(partner, 'partner')"
                  :disabled="actionLoading === partner.id"
                  title="Suspendre ce partenaire"
                >
                  <i class="fas fa-ban"></i>
                </button>
                <button
                  v-else
                  class="action-btn btn-activate"
                  @click="handleActivatePartner(partner)"
                  :disabled="actionLoading === partner.id"
                  title="Réactiver ce partenaire"
                >
                  <i class="fas fa-check-circle"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination Premium -->
    <div v-if="totalElements > pageSize" class="pagination-premium-container mt-12">
      <div class="pagination-info">
        Affichage de <strong>{{ pagedFrom }} - {{ pagedTo }}</strong> sur <strong>{{ totalElements }}</strong> partenaires
      </div>
      <div class="pagination-controls">
        <button 
          class="btn-page-step" 
          :disabled="currentPage === 1"
          @click="currentPage--; fetchPartners()"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        
        <div class="page-numbers">
          <button 
            v-for="p in totalPages" 
            :key="p"
            :class="['btn-page-num', { active: currentPage === p }]"
            @click="currentPage = p; fetchPartners()"
          >
            {{ p }}
          </button>
        </div>

        <button 
          class="btn-page-step" 
          :disabled="currentPage === totalPages"
          @click="currentPage++; fetchPartners()"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- Partner Organizations Modal -->
    <div v-if="orgsModal.show" class="modal-backdrop" @click.self="orgsModal.show = false">
      <div class="modal-box premium-modal-large animate-slide-up">
        <div class="modal-header">
          <h3>Organisations de {{ orgsModal.partner?.name }}</h3>
          <button class="btn-close" @click="orgsModal.show = false"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
          <div class="organizations-filter mb-4 flex justify-between items-center gap-4">
            <p class="modal-desc mb-0">Ce partenaire gère <strong>{{ orgsModal.organizations.length }}</strong> organisation(s) :</p>
            <div class="select-wrapper">
              <i class="fas fa-globe"></i>
              <select v-model="orgsModal.selectedCountryFilter">
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

          <div v-if="orgsModal.isLoading" class="modal-loading py-8 flex flex-col items-center">
            <div class="spinner-elite"></div>
            <p class="text-muted mt-2">Chargement des organisations...</p>
          </div>

          <div v-else class="modal-table-container">
            <div v-if="filteredModalOrganizations.length === 0" class="empty-state-modal text-center py-8">
              <i class="fas fa-building text-slate-300 text-3xl mb-2"></i>
              <p class="text-muted">Aucune organisation correspondante</p>
            </div>
            
            <table v-else class="table-premium table-modal">
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
                <tr v-for="org in filteredModalOrganizations" :key="org.id" :class="{ 'row-suspended': org.isActive === false }">
                  <td>
                    <div class="client-cell">
                      <div class="org-icon-avatar bg-slate-100 text-slate-700">
                        {{ org.name?.[0]?.toUpperCase() || 'O' }}
                      </div>
                      <div class="client-details">
                        <span class="client-name font-semibold text-sm">{{ org.name }}</span>
                        <span class="client-sub text-xs">{{ org.legalForm || 'Non Spécifié' }} · RCCM: {{ org.taxId || 'Aucun' }}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="contact-cell">
                      <span class="contact-phone text-xs font-mono">{{ org.phone || '—' }}</span>
                      <span class="contact-email text-xs text-muted">{{ org.email || '—' }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="country-badge text-xs">
                      {{ org.country || 'CI' }}
                    </span>
                  </td>
                  <td>
                    <div class="plan-cell flex flex-col">
                      <span class="plan-name text-xs font-bold text-sky-600">{{ org.activePlanName }}</span>
                      <span class="plan-status text-[10px] text-muted">{{ org.activeSubscriptionStatus }}</span>
                    </div>
                  </td>
                  <td>
                    <span :class="['account-badge text-xs', org.isActive !== false ? 'account-active' : 'account-suspended']">
                      {{ org.isActive !== false ? 'Actif' : 'Suspendu' }}
                    </span>
                    <div v-if="org.suspendedReason" class="suspend-reason text-[10px] text-red-500">{{ org.suspendedReason }}</div>
                  </td>
                  <td>
                    <div class="actions-cell">
                      <button
                        v-if="org.isActive !== false"
                        class="action-btn btn-suspend text-xs"
                        @click="openSuspendModal(org, 'organization')"
                        :disabled="actionLoading === org.id"
                        title="Suspendre cette organisation"
                      >
                        <i class="fas fa-ban"></i>
                      </button>
                      <button
                        v-else
                        class="action-btn btn-activate text-xs"
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
        </div>
        <div class="modal-actions">
          <button class="btn-ghost" @click="orgsModal.show = false">Fermer</button>
        </div>
      </div>
    </div>

    <!-- Suspend Modal -->
    <div v-if="suspendModal.show" class="modal-backdrop" @click.self="suspendModal.show = false">
      <div class="modal-box premium-modal animate-slide-up">
        <div class="modal-header">
          <i class="fas fa-ban text-red-500"></i>
          <h3>Suspendre le compte</h3>
        </div>
        <p class="modal-desc">
          Vous allez suspendre le compte de <strong>{{ suspendModal.target?.name }}</strong>. 
          <span v-if="suspendModal.type === 'partner'">Toutes les organisations rattachées et leurs utilisateurs ne pourront plus accéder aux services.</span>
          <span v-else>Les utilisateurs de cette organisation ne pourront plus se connecter.</span>
        </p>
        <div class="modal-field">
          <label>Raison de la suspension (optionnel)</label>
          <textarea v-model="suspendModal.reason" placeholder="Ex: Non-paiement de facture, violation des CGU..." rows="3"></textarea>
        </div>
        <div class="modal-actions">
          <button class="btn-ghost" @click="suspendModal.show = false">Annuler</button>
          <button class="btn-danger" @click="handleConfirmSuspend" :disabled="actionLoading">Confirmer la suspension</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import adminApi from '../../services/adminApi';

const MOCK_PARTNERS = [
  {
    id: "p1",
    name: "Onda Global Partner",
    contactEmail: "contact@ondaglobal.com",
    apiKeyPrefix: "api_onda_glob",
    webhookUrl: "https://api.ondaglobal.com/webhook",
    allowedIps: "192.168.1.1, 10.0.0.1",
    isActive: true,
    organizationCount: 3
  },
  {
    id: "p2",
    name: "Sneezy Integrator",
    contactEmail: "dev@sneezy.ci",
    apiKeyPrefix: "api_sneezy_int",
    webhookUrl: "https://webhook.sneezy.ci/onda",
    allowedIps: "196.200.1.1",
    isActive: true,
    organizationCount: 1
  }
];

export default {
  name: 'ClientsManager',
  setup() {
    const partners = ref([]);
    const isLoading = ref(true);
    const searchQuery = ref('');
    const selectedStatus = ref('ALL');
    const actionLoading = ref(null);

    // Suspend Modal state (can target partner or organization)
    const suspendModal = ref({ show: false, type: 'partner', target: null, reason: '' });

    // Organizations Modal state
    const orgsModal = ref({
      show: false,
      partner: null,
      organizations: [],
      isLoading: false,
      selectedCountryFilter: 'ALL'
    });

    // Pagination State
    const currentPage = ref(1);
    const pageSize = ref(10);
    const totalPages = ref(1);
    const totalElements = ref(0);

    const pagedFrom = computed(() => (currentPage.value - 1) * pageSize.value + 1);
    const pagedTo = computed(() => Math.min(currentPage.value * pageSize.value, totalElements.value));

    const fetchPartners = async () => {
      isLoading.value = true;
      try {
        const params = {
          page: currentPage.value - 1,
          size: pageSize.value,
          search: searchQuery.value,
          isActive: selectedStatus.value === 'ALL' ? '' : (selectedStatus.value === 'ACTIVE' ? 'true' : 'false')
        };
        const res = await adminApi.getPartners(params);
        if (res.success && res.data) {
          if (Array.isArray(res.data)) {
            // Raw array
            const filtered = res.data.filter(p => {
              const nameQuery = searchQuery.value.toLowerCase().trim();
              const matchesSearch = nameQuery === '' ||
                p.name.toLowerCase().includes(nameQuery) ||
                (p.contactEmail || '').toLowerCase().includes(nameQuery);
              
              const matchesStatus = selectedStatus.value === 'ALL' || 
                (selectedStatus.value === 'ACTIVE' ? p.isActive !== false : p.isActive === false);
              
              return matchesSearch && matchesStatus;
            });
            partners.value = filtered.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value);
            totalElements.value = filtered.length;
            totalPages.value = Math.ceil(filtered.length / pageSize.value) || 1;
          } else {
            // Page object
            partners.value = res.data.content || [];
            totalPages.value = res.data.totalPages || 1;
            totalElements.value = res.data.totalElements || 0;
          }
        } else {
          // Fallback to Mock
          const filtered = MOCK_PARTNERS.filter(p => {
            const nameQuery = searchQuery.value.toLowerCase().trim();
            const matchesSearch = nameQuery === '' || p.name.toLowerCase().includes(nameQuery);
            return matchesSearch;
          });
          partners.value = filtered.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value);
          totalElements.value = filtered.length;
          totalPages.value = Math.ceil(filtered.length / pageSize.value) || 1;
        }
      } catch (error) {
        console.error('Error fetching partners, using mock data...', error);
        const filtered = MOCK_PARTNERS.filter(p => {
          const nameQuery = searchQuery.value.toLowerCase().trim();
          return nameQuery === '' || p.name.toLowerCase().includes(nameQuery);
        });
        partners.value = filtered.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value);
        totalElements.value = filtered.length;
        totalPages.value = Math.ceil(filtered.length / pageSize.value) || 1;
      } finally {
        isLoading.value = false;
      }
    };

    const onFilterChange = () => {
      currentPage.value = 1;
      fetchPartners();
    };

    // Open Suspend modal for partner or organization
    const openSuspendModal = (target, type) => {
      suspendModal.value = { show: true, type, target, reason: '' };
    };

    const handleConfirmSuspend = async () => {
      const { type, target, reason } = suspendModal.value;
      if (!target) return;
      actionLoading.value = target.id;
      try {
        if (type === 'partner') {
          // Suspend Partner
          await adminApi.togglePartnerActive(target.id); // Toggle active/inactive
          const idx = partners.value.findIndex(p => p.id === target.id);
          if (idx !== -1) {
            partners.value[idx] = { ...partners.value[idx], isActive: false };
          }
        } else {
          // Suspend Organization
          await adminApi.suspendClient(target.id, reason);
          const idx = orgsModal.value.organizations.findIndex(o => o.id === target.id);
          if (idx !== -1) {
            orgsModal.value.organizations[idx] = { 
              ...orgsModal.value.organizations[idx], 
              isActive: false, 
              suspendedReason: reason || "Suspendu par l'administrateur" 
            };
          }
        }
        suspendModal.value.show = false;
      } catch (e) {
        console.error('Erreur de suspension:', e);
      } finally {
        actionLoading.value = null;
      }
    };

    const handleActivatePartner = async (partner) => {
      actionLoading.value = partner.id;
      try {
        await adminApi.togglePartnerActive(partner.id);
        const idx = partners.value.findIndex(p => p.id === partner.id);
        if (idx !== -1) {
          partners.value[idx] = { ...partners.value[idx], isActive: true };
        }
      } catch (e) {
        console.error('Erreur activation partenaire:', e);
      } finally {
        actionLoading.value = null;
      }
    };

    const handleActivateOrganization = async (org) => {
      actionLoading.value = org.id;
      try {
        await adminApi.activateClient(org.id);
        const idx = orgsModal.value.organizations.findIndex(o => o.id === org.id);
        if (idx !== -1) {
          orgsModal.value.organizations[idx] = { 
            ...orgsModal.value.organizations[idx], 
            isActive: true, 
            suspendedReason: null 
          };
        }
      } catch (e) {
        console.error('Erreur activation organisation:', e);
      } finally {
        actionLoading.value = null;
      }
    };

    const openOrganizationsModal = async (partner) => {
      orgsModal.value.show = true;
      orgsModal.value.partner = partner;
      orgsModal.value.organizations = [];
      orgsModal.value.isLoading = true;
      orgsModal.value.selectedCountryFilter = 'ALL';
      try {
        const res = await adminApi.getPartnerOrganizations(partner.id);
        if (res.success && res.data) {
          orgsModal.value.organizations = res.data;
        }
      } catch (e) {
        console.error('Erreur chargement organisations partenaire:', e);
      } finally {
        orgsModal.value.isLoading = false;
      }
    };

    const filteredModalOrganizations = computed(() => {
      const filter = orgsModal.value.selectedCountryFilter;
      if (filter === 'ALL') {
        return orgsModal.value.organizations;
      }
      return orgsModal.value.organizations.filter(o => o.country === filter);
    });

    const stats = computed(() => {
      return {
        total: totalElements.value || partners.value.length,
        active: partners.value.filter(p => p.isActive !== false).length,
        suspended: partners.value.filter(p => p.isActive === false).length
      };
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

    onMounted(fetchPartners);

    return {
      partners, isLoading, searchQuery, selectedStatus,
      stats, formatDate, formatActivityDate, currentPage, pageSize, totalPages, totalElements,
      pagedFrom, pagedTo, onFilterChange, fetchPartners,
      actionLoading, suspendModal, openSuspendModal, handleConfirmSuspend, handleActivatePartner,
      orgsModal, openOrganizationsModal, filteredModalOrganizations, handleActivateOrganization
    };
  }
};
</script>

<style scoped>
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

.input-inline {
  background: transparent;
  border: none;
  outline: none;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-main);
  width: 100px;
}

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
.api-key-badge {
  background: #f1f5f9;
  border: 1px solid var(--border-subtle);
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  color: #0f172a;
  font-size: 0.8rem;
}

.webhook-cell {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  max-width: 200px;
}

.webhook-url {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  color: var(--text-main);
}

.btn-org-count {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  font-family: inherit;
  outline: none;
}

.btn-org-count span {
  color: var(--accent);
  transition: opacity 0.2s;
}

.btn-org-count:hover span {
  opacity: 0.8;
}

.btn-view-orgs {
  background: rgba(14, 165, 233, 0.1);
  color: #0284c7;
}

.btn-view-orgs:hover {
  background: rgba(14, 165, 233, 0.2);
  transform: scale(1.05);
}

/* Large Modal */
.premium-modal-large {
  background: white;
  border-radius: 1.5rem;
  padding: 2rem;
  width: 95%;
  max-width: 860px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.15);
  animation: modal-in 0.2s ease;
}

.table-modal {
  margin-top: 1rem;
}

.table-modal th {
  padding: 0.75rem 1rem;
  font-size: 0.65rem;
}

.table-modal td {
  padding: 0.75rem 1rem;
  font-size: 0.8rem;
}

.org-icon-avatar {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
}

.btn-close {
  background: transparent;
  border: none;
  font-size: 1.2rem;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  color: var(--text-main);
}
</style>
