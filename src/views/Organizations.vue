<template>
  <div class="organizations-portal reveal">
    <!-- Header: Infrastructure Management -->
    <header class="page-header mb-12">
      <div class="header-main">
        <h1 class="page-title">Gestion des <span class="text-gradient">Environnements</span></h1>
        <p class="text-muted">Gérez les infrastructures isolées pour chacun de vos clients finaux.</p>
      </div>
      <button class="btn btn-primary" @click="showModal = true">
        <span>+ Déployer une Instance Org</span>
      </button>
    </header>

    <!-- Grid: Organizations as Nodes -->
    <div class="nodes-grid">
      <!-- Loading State -->
      <div v-if="loading" class="loading-overlay p-20 text-center">
        <div class="spinner-premium"></div>
        <p class="mt-4 text-dim">Synchronisation des instances...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="organizations.length === 0" class="card-premium empty-node py-20 text-center">
        <div class="empty-node-icon">
          <i class="fas fa-satellite fa-3x text-dim opacity-20"></i>
        </div>
        <h3 class="mt-6">Aucun environnement actif</h3>
        <p class="text-muted mb-8">Déployez votre première organisation pour générer des clés API opérationnelles.</p>
        <button class="btn btn-outline" @click="showModal = true">Commencer le Déploiement</button>
      </div>

      <!-- Active Nodes -->
      <template v-else>
        <div 
          v-for="org in paginatedOrganizations" 
          :key="org.id"
          class="card-premium node-card p-8"
        >
          <div class="node-header">
            <div class="node-icon-box">
              <i :class="getOrgIcon(org.type)"></i>
            </div>
            <div class="node-identity">
              <h4>{{ org.name }}</h4>
              <div class="node-id-tag">
                <code>ID: {{ org.id }}</code>
                <button class="btn-copy-mini" @click="copyId(org.id)">
                  <i class="fas fa-copy"></i>
                </button>
              </div>
            </div>
            <div class="node-status">
              <span class="status-indicator live"></span>
              LIVE
            </div>
          </div>

          <div class="node-stats mt-8">
            <div class="node-stat-item">
              <span class="l">Type</span>
              <span class="v">{{ org.type || 'Non spécifié' }}</span>
            </div>
            <div class="node-stat-item">
              <span class="l">Statut Juridique</span>
              <span class="v">{{ org.legalForm || 'N/A' }}</span>
            </div>
            <div v-if="org.parentId || (org.parent && org.parent.id)" class="node-stat-item">
              <span class="l">Siège</span>
              <span class="v">Lié</span>
            </div>
            <div v-else class="node-stat-item">
              <span class="l">Uptime 24h</span>
              <span class="v text-success">100.0%</span>
            </div>
          </div>

          <div class="node-footer mt-8">
            <button class="btn btn-pill-outline w-full" @click="regenerateClientKey(org)">
              <i class="fas fa-key mr-2"></i> Régénérer Clé API
            </button>
            <button class="btn-action-premium btn-action-delete" @click="deleteOrg(org.id)" title="Supprimer">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
      </template>
    </div>

    <!-- Pagination Premium -->
    <div v-if="organizations.length > pageSize" class="pagination-premium-container mt-12">
      <div class="pagination-info">
        Affichage de <strong>{{ pagedFrom }} - {{ pagedTo }}</strong> sur <strong>{{ organizations.length }}</strong> environnements
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

    <!-- Provisioning Modal Upgrade -->
    <transition name="fade">
      <div v-if="showModal" class="modal-overlay glass" @click="showModal = false">
        <div class="modal-card card-premium reveal p-12" @click.stop>
          <header class="modal-header mb-10">
            <div>
              <h3 class="mb-2">Provisionner une Instance</h3>
              <p class="text-dim">Configuration de l'environnement client isolé.</p>
            </div>
            <button class="btn-close" @click="showModal = false">
              <i class="fas fa-times"></i>
            </button>
          </header>

          <form @submit.prevent="createOrganization" class="deployment-form">
            <div class="form-group mb-8">
              <label>NOM DE L'ORGANISATION CLIENTE</label>
              <input 
                v-model="newOrg.name" 
                type="text" 
                placeholder="Ex: Boutique Mode Alpha" 
                required 
                class="input-premium" 
              />
            </div>

            <div class="form-group mb-8">
                <label>TYPE D'ORGANISATION</label>
                <select v-model="newOrg.type" class="input-premium">
                  <option value="INFORMAL">Informel / Auto-entrepreneur</option>
                  <option value="FORMAL">Entreprise Formelle</option>
                  <option value="COOPERATIVE">Coopérative</option>
                  <option value="NGO">ONG / Association</option>
                </select>
            </div>

            <div class="form-group mb-8">
              <label>EMAIL DE L'ADMINISTRATEUR</label>
              <input 
                v-model="newOrg.contactEmail" 
                type="email" 
                placeholder="gerant@modealpha.ci" 
                required 
                class="input-premium" 
              />
            </div>

            <div class="form-row-deployment mb-8">
              <div class="form-group">
                <label>TÉLÉPHONE</label>
                <input 
                  v-model="newOrg.phone" 
                  type="tel" 
                  placeholder="+225..." 
                  required 
                  class="input-premium" 
                />
              </div>
              <div class="form-group">
                <label>PAYS</label>
                <select v-model="newOrg.country" class="input-premium">
                  <option value="CI">Côte d’Ivoire</option>
                  <option value="SN">Sénégal</option>
                  <option value="ML">Mali</option>
                  <option value="BF">Burkina Faso</option>
                </select>
              </div>
            </div>

            <div class="form-row-deployment mb-8">
              <div class="form-group">
                <label>FORME JURIDIQUE</label>
                <select v-model="newOrg.legalForm" class="input-premium">
                  <option value="INDIVIDUAL">Entreprise Individuelle</option>
                  <option value="SARL">SARL</option>
                  <option value="SA">SA</option>
                  <option value="SAS">SAS</option>
                  <option value="GIE">GIE</option>
                  <option value="OTHER">Autre</option>
                </select>
              </div>
              <div class="form-group">
                <label>ORGANISATION PARENTE (OPTIONNEL)</label>
                <input 
                  v-model="newOrg.parentId" 
                  type="text" 
                  placeholder="UUID du Siège" 
                  class="input-premium" 
                />
              </div>
            </div>

            <div class="form-group mb-12">
              <label>ADRESSE PHYSIQUE / SIÈGE</label>
              <input 
                v-model="newOrg.address" 
                type="text" 
                placeholder="Abidjan, Treichville" 
                required 
                class="input-premium" 
              />
            </div>

            <div v-if="error" class="error-msg mb-6">
              <i class="fas fa-exclamation-triangle mr-2"></i> {{ error }}
            </div>

            <div class="modal-footer-provision">
              <button type="submit" class="btn btn-primary w-full py-5" :disabled="creating">
                <span v-if="creating" class="spinner-sm"></span>
                <span>
                  {{ creating ? 'Déploiement en cours...' : 'Lancer l\'Infrastructure client' }}
                  <i class="fas fa-arrow-right ml-2" v-if="!creating"></i>
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <ActionDialog 
      v-model:isOpen="dialog.isOpen"
      :mode="dialog.mode"
      :title="dialog.title"
      :message="dialog.message"
      :confirmText="dialog.confirmText"
      :placeholder="dialog.placeholder"
      :prefillValue="dialog.prefill"
      @confirm="handleDialogConfirm"
      @cancel="handleDialogCancel"
    />
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue';
import apiService from '../services/api.js';
import ActionDialog from '../components/ActionDialog.vue';

export default {
  name: 'Organizations',
  components: { ActionDialog },
  setup() {
    const organizations = ref([]);
    const loading = ref(false);
    const showModal = ref(false);
    const creating = ref(false);
    const error = ref('');
    
    // Pagination State
    const currentPage = ref(1);
    const pageSize = ref(6);
    const totalPages = ref(1);
    const totalElements = ref(0);

    const pagedFrom = computed(() => (currentPage.value - 1) * pageSize.value + 1);
    const pagedTo = computed(() => Math.min(currentPage.value * pageSize.value, totalElements.value));
    
    // In Array mode, we need to slice on frontend. 
    // In Page mode, the backend already sliced it.
    const isArrayMode = ref(false);

    const paginatedOrganizations = computed(() => {
      if (isArrayMode.value) {
        const start = (currentPage.value - 1) * pageSize.value;
        const end = start + pageSize.value;
        return organizations.value.slice(start, end);
      }
      return organizations.value; // Server-side already paginated
    });

    const newOrg = ref({ 
      name: '', 
      contactEmail: '', 
      phone: '', 
      country: 'CI', 
      address: '',
      type: 'INFORMAL',
      legalForm: 'SARL',
      parentId: ''
    });

    // Dialog State
    const dialog = ref({
      isOpen: false,
      mode: 'INFO',
      title: '',
      message: '',
      confirmText: 'Confirmer',
      placeholder: '',
      prefill: '',
      resolve: null
    });

    const openDialog = (mode, { title, message, confirmText, placeholder, prefill } = {}) => {
      return new Promise((resolve) => {
        dialog.value = {
          isOpen: true,
          mode,
          title,
          message,
          confirmText,
          placeholder,
          prefill,
          resolve
        };
      });
    };

    const handleDialogConfirm = (value) => {
      if (dialog.value.resolve) dialog.value.resolve(value || true);
      dialog.value.isOpen = false;
    };

    const handleDialogCancel = () => {
      if (dialog.value.resolve) dialog.value.resolve(false);
      dialog.value.isOpen = false;
    };

    const getOrgIcon = (type) => {
      const icons = { 
        FORMAL: 'fas fa-building', 
        INFORMAL: 'fas fa-store-alt', 
        NGO: 'fas fa-hand-holding-heart', 
        COOPERATIVE: 'fas fa-users' 
      };
      return icons[type] || 'fas fa-store';
    };

    const load = async () => {
      loading.value = true;
      try {
        console.log('Fetching organizations...', { page: currentPage.value - 1, size: pageSize.value });
        const res = await apiService.getOrganizations(currentPage.value - 1, pageSize.value);
        console.log('API Response:', res);
        
        if (res.success && res.data) {
          if (Array.isArray(res.data)) {
            isArrayMode.value = true;
            organizations.value = res.data;
            totalElements.value = res.data.length;
            totalPages.value = Math.ceil(res.data.length / pageSize.value) || 1;
          } else {
            isArrayMode.value = false;
            organizations.value = res.data.content || [];
            totalPages.value = res.data.totalPages || 1;
            totalElements.value = res.data.totalElements || 0;
          }
        } else {
            organizations.value = [];
        }
      } catch (e) {
        organizations.value = [];
        console.error('Erreur lors du chargement des organisations:', e);
      } finally { 
        loading.value = false; 
        console.log('Load finished. Organizations count:', organizations.value.length);
      }
    };

    // Reload on page change
    watch(currentPage, load);
    // Reload on page size change
    watch(pageSize, () => {
      currentPage.value = 1;
      load();
    });

    const createOrganization = async () => {
      creating.value = true;
      error.value = '';
      try {
        const res = await apiService.createOrganization(newOrg.value);
        if (res.success) {
          await load(); 
          showModal.value = false;
          newOrg.value = { 
            name: '', 
            contactEmail: '', 
            phone: '', 
            country: 'CI', 
            address: '', 
            type: 'INFORMAL',
            legalForm: 'SARL',
            parentId: ''
          };
        }
      } catch (err) { error.value = err.message; }
      finally { creating.value = false; }
    };

    const copyId = async (id) => {
      navigator.clipboard.writeText(id);
      await openDialog('INFO', { title: 'ID Copié', message: 'L\'identifiant a été copié dans le presse-papiers.' });
    };

    const deleteOrg = async (id) => {
      const confirmed = await openDialog('DANGER', {
        title: 'Confirmer la suppression',
        message: 'Voulez-vous vraiment supprimer cette organisation ? Cette action est irréversible et supprimera toutes les données liées.',
        confirmText: 'Supprimer'
      });
      
      if(confirmed) {
        try {
          await apiService.deleteOrganization(id);
          await load();
        } catch (e) {
          await openDialog('INFO', { title: 'Erreur', message: e.message });
        }
      }
    };

    const regenerateClientKey = async (org) => {
      const environment = await openDialog('ENV_SELECT', {
        title: 'Sélection de l\'Environnement',
        message: `Pour quel environnement souhaitez-vous générer une clé pour ${org.name} ?`,
        prefill: 'production',
        confirmText: 'Générer la Clé'
      });

      if (environment) {
        try {
          const res = await apiService.regenerateApiKey(org.id, environment);
          if (res.success) {
            await openDialog('KEY_DISPLAY', {
              title: `Nouvelle Clé ${environment === 'sandbox' ? 'Test' : 'Live'}`,
              message: `Clé API générée pour ${org.name}. Copiez-la pour transmission sécurisée.`,
              prefill: res.data,
              confirmText: 'Fermer'
            });
          }
        } catch (err) {
          await openDialog('INFO', { title: 'Erreur', message: err.message });
        }
      }
    };

    onMounted(load);

    return { 
      organizations, loading, showModal, creating, error, newOrg, 
      currentPage, pageSize, totalPages, paginatedOrganizations, pagedFrom, pagedTo,
      dialog, getOrgIcon, load, createOrganization, copyId, deleteOrg, regenerateClientKey,
      handleDialogConfirm, handleDialogCancel
    };
  }
}
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-end; }
.page-title { font-size: 3rem; margin-bottom: 0.5rem; }

.nodes-grid { 
  display: grid; 
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); 
  gap: 2.5rem; 
}

/* Node Card */
.node-card { 
  transition: all 0.4s var(--smooth);
}

.node-header { display: flex; align-items: center; gap: 1.5rem; }
.node-icon-box { 
  width: 64px; 
  height: 64px; 
  background: var(--bg-surface-dim); 
  border-radius: 1.25rem; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  font-size: 2rem; 
}
.node-identity { flex: 1; }
.node-identity h4 { font-size: 1.25rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.25rem; }
.node-id-tag { 
  display: flex; 
  align-items: center; 
  gap: 0.5rem; 
  background: var(--bg-surface-dim); 
  padding: 0.25rem 0.6rem; 
  border-radius: 6px; 
  width: fit-content; 
}
.node-id-tag code { font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; font-weight: 700; color: var(--text-dim); }
.btn-copy-mini { background: none; border: none; cursor: pointer; opacity: 0.5; transition: opacity 0.2s; }
.btn-copy-mini:hover { opacity: 1; }

.node-status { 
  font-size: 0.7rem; 
  font-weight: 900; 
  color: #166534; 
  background: #DCFCE7; 
  padding: 0.4rem 0.8rem; 
  border-radius: 2rem; 
  display: flex; 
  align-items: center; 
  gap: 0.5rem; 
}
.status-indicator { width: 6px; height: 6px; background: #22C55E; border-radius: 50%; }

.node-stats { 
  display: flex; 
  justify-content: space-between; 
  background: var(--bg-surface-dim); 
  padding: 1.5rem; 
  border-radius: 1rem; 
}
.node-stat-item { display: flex; flex-direction: column; gap: 0.25rem; }
.node-stat-item .l { font-size: 0.65rem; font-weight: 800; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.05em; }
.node-stat-item .v { font-size: 0.85rem; font-weight: 700; color: var(--text-main); }

.node-footer { display: flex; gap: 1rem; }
.btn-pill-outline { 
  background: white; 
  border: 1px solid var(--border-strong); 
  border-radius: 12px; 
  font-weight: 800; 
  font-size: 0.85rem; 
}
.btn-pill-outline:hover { background: var(--text-main); color: white; border-color: var(--text-main); }
.btn-icon-danger { 
  width: 48px; 
  height: 48px; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  border: 1px solid #FECDD3; 
  color: #E11D48; 
  border-radius: 12px; 
  cursor: pointer; 
  transition: all 0.2s; 
}
.btn-icon-danger:hover { background: #FFF1F2; transform: scale(1.05); }

/* Modal */
.modal-overlay { 
  position: fixed; 
  inset: 0; 
  z-index: 1000; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  padding: 2rem; 
}
.modal-card { 
  max-width: 650px; 
  width: 100%; 
  background: white; 
}
.modal-header { display: flex; justify-content: space-between; align-items: flex-start; }
.btn-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-dim); }

.form-group label { 
  display: block; 
  font-size: 0.75rem; 
  font-weight: 800; 
  color: var(--text-dim); 
  letter-spacing: 0.1em; 
  margin-bottom: 0.8rem; 
}
.form-row-deployment { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }

.input-premium { 
  width: 100%; 
  padding: 1rem 1.25rem; 
  background: var(--bg-surface-dim); 
  border: 2px solid transparent; 
  border-radius: 1rem; 
  font-size: 1rem; 
  font-weight: 600; 
  font-family: var(--font-body); 
  transition: all 0.3s; 
}
.input-premium:focus { outline: none; border-color: var(--primary); background: white; box-shadow: var(--shadow-lg); }

.spinner-premium { 
  width: 50px; 
  height: 50px; 
  border: 4px solid #F1F5F9; 
  border-top-color: var(--primary); 
  border-radius: 50%; 
  animation: spin 1s linear infinite; 
  margin: 0 auto; 
}
@keyframes spin { to { transform: rotate(360deg); } }

.error-msg { 
  background: #FFF1F2; 
  color: #BE123C; 
  padding: 1.25rem; 
  border-radius: 1rem; 
  font-weight: 700; 
  border: 1px solid #FECDD3; 
}

@media (max-width: 768px) {
  .form-row-deployment { grid-template-columns: 1fr; }
  .node-header { flex-direction: column; align-items: flex-start; }
  .node-status { align-self: flex-start; }
}

/* Pagination Styling */
.pagination-premium-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2.5rem;
  background: white;
  border-radius: 1.5rem;
  border: 1px solid var(--border-strong);
  box-shadow: var(--shadow-sm);
}

.pagination-info { font-size: 0.9rem; color: var(--text-dim); }
.pagination-info strong { color: var(--text-main); }

.pagination-controls { display: flex; align-items: center; gap: 1rem; }
.page-numbers { display: flex; gap: 0.5rem; }

.btn-page-step, .btn-page-num {
  width: 42px; height: 42px;
  display: flex; align-items: center; justify-content: center;
  background: var(--bg-surface-dim);
  border: 1px solid var(--border-strong);
  border-radius: 10px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s;
  color: var(--text-dim);
}

.btn-page-step:hover:not(:disabled), .btn-page-num:hover {
  background: white;
  border-color: var(--primary);
  color: var(--primary);
  transform: translateY(-2px);
}

.btn-page-num.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
}

.btn-page-step:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

@media (max-width: 1024px) {
  .pagination-premium-container { flex-direction: column; gap: 1.5rem; text-align: center; }
}
</style>
