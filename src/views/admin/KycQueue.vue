<template>
  <div class="admin-kyc-viewport reveal">
    <!-- Page Header (clean, concise) -->
    <div class="bo-page-header mb-8">
      <h2 class="text-3xl font-black tracking-tight">Validation <span class="text-accent">KYC</span></h2>
      <p class="text-muted mt-1 text-sm">Certification d'identité de Niveau 2 et examen des dossiers d'organisations.</p>
    </div>

    <!-- Workspace Container (Split-Screen) -->
    <div class="kyc-workspace">
      <!-- Left Column: Search, Filters & Queue List -->
      <aside class="kyc-sidebar">
        <!-- Search & Filter Controls -->
        <div class="sidebar-controls">
          <div class="search-wrapper">
            <i class="fas fa-search search-icon"></i>
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Rechercher un dossier..." 
              class="search-input"
            />
          </div>
          
          <div class="filter-tabs">
            <button 
              v-for="filter in filters" 
              :key="filter.value"
              :class="['filter-tab-btn', { active: activeFilter === filter.value }]"
              @click="activeFilter = filter.value"
            >
              <span>{{ filter.label }}</span>
              <span class="filter-count" v-if="getFilterCount(filter.value) > 0">
                {{ getFilterCount(filter.value) }}
              </span>
            </button>
          </div>
        </div>

        <!-- Queue List -->
        <div class="queue-list-container">
          <div v-if="filteredKyc.length === 0" class="empty-queue-state">
            <i class="fas fa-inbox empty-icon"></i>
            <p>Aucun dossier KYC en attente</p>
          </div>
          
          <div 
            v-else
            v-for="item in filteredKyc" 
            :key="item.id"
            :class="['queue-card', { active: selectedKycId === item.id }]"
            @click="selectKyc(item.id)"
          >
            <div class="queue-card-top">
              <span class="company-name">{{ item.organizationName }}</span>
              <span class="submitted-date">{{ formatDate(item.submittedAt) }}</span>
            </div>
            
            <div class="queue-card-meta">
              <span class="client-name">{{ item.fullName }}</span>
              <span class="level-tag">LEVEL 2</span>
            </div>
            
            <div class="queue-card-indicators">
              <!-- Document number info -->
              <span class="doc-num-info">
                ID: {{ item.documentNumber }}
              </span>
              
              <!-- Expiry Alert Badge -->
              <span 
                v-if="isExpired(item.documentExpiryDate)"
                class="expired-badge"
              >
                <i class="fas fa-calendar-times"></i> Expiré
              </span>
            </div>
          </div>
        </div>
      </aside>

      <!-- Right Column: KYC Review Workspace Detail View -->
      <main class="kyc-workspace-detail">
        <div v-if="selectedKyc" class="detail-container">
          <!-- Top Sticky Header of Details Pane -->
          <div class="detail-header">
            <div class="header-client-info">
              <span class="status-tag">
                <span class="pulse-dot warning"></span>
                EXAMEN KYC EN COURS
              </span>
              <h3>{{ selectedKyc.fullName }}</h3>
              <p class="client-sub-meta">
                <span>Organisation: <strong>{{ selectedKyc.organizationName }}</strong></span>
                <span class="divider">•</span>
                <span>N° Document: <strong>{{ selectedKyc.documentNumber }}</strong></span>
              </p>
            </div>
            
            <div class="header-actions">
              <button @click="rejectKyc(selectedKyc)" class="btn-workspace-secondary">
                <i class="fas fa-times"></i> Rejeter le dossier
              </button>
              <button @click="approveKyc(selectedKyc)" class="btn-workspace-primary" :disabled="!isChecklistComplete">
                <i class="fas fa-check-double"></i> Approuver & Libérer
              </button>
            </div>
          </div>

          <!-- Document Examiner Grid & Info Side-panel -->
          <div class="detail-workspace-grid">
            
            <!-- Left Grid Column: Document Viewer 2x2 Grid -->
            <div class="grid-col-viewer">
              <h5 class="workspace-section-title">Pièces Justificatives (Recto, Verso, Selfie)</h5>
              
              <div class="kyc-visual-grid">
                <div v-for="doc in docs(selectedKyc)" :key="doc.label" class="doc-premium-frame" @click="openImage(doc.url)">
                  <!-- Image OK -->
                  <template v-if="!hasImageError(doc.url)">
                    <div class="doc-overlay">
                      <i class="fas fa-search-plus"></i>
                      <span>AGRANDIR LA PIÈCE</span>
                    </div>
                    <img 
                      :src="doc.url" 
                      :alt="doc.label"
                      @error="setImageError(doc.url)"
                    />
                  </template>
                  <!-- Fallback si CORS/erreur -->
                  <template v-else>
                    <div class="doc-error-state">
                      <i class="fas fa-eye"></i>
                      <span>Aperçu indisponible</span>
                      <button @click.stop="openImage(doc.url)" class="doc-open-link">
                        Visualiser la pièce
                      </button>
                    </div>
                  </template>
                  <div class="doc-tag">{{ doc.label }}</div>
                </div>
              </div>
            </div>

            <!-- Right Grid Column: Verification Checklist & Meta Details -->
            <div class="grid-col-data">
              <h5 class="workspace-section-title">Fiche d'identité et critères réglementaires</h5>

              <!-- Metadata Panel -->
              <div class="meta-card">
                <div class="meta-row">
                  <div class="meta-item">
                    <label>Nom complet client</label>
                    <span class="font-bold text-main">{{ selectedKyc.fullName }}</span>
                  </div>
                  <div class="meta-item">
                    <label>Date de naissance</label>
                    <span>{{ selectedKyc.dateOfBirth }}</span>
                  </div>
                </div>

                <div class="meta-row">
                  <div class="meta-item">
                    <label>Type / N° Pièce d'identité</label>
                    <span class="font-mono font-bold">{{ selectedKyc.documentNumber }}</span>
                  </div>
                  <div class="meta-item">
                    <label>Date d'expiration</label>
                    <span :class="['expiry-val font-bold', { 'expired-text': isExpired(selectedKyc.documentExpiryDate) }]">
                      {{ selectedKyc.documentExpiryDate }}
                      <span class="expiry-warning-chip" v-if="isExpired(selectedKyc.documentExpiryDate)">
                        <i class="fas fa-exclamation-triangle"></i> Expiré
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <!-- Interactive Compliance Checklist -->
              <div class="checklist-card mt-6">
                <h5 class="workspace-section-title mb-3">CHECKLIST D'AUDIT OBLIGATOIRE</h5>
                <div class="checklist-rows">
                  <label class="check-item">
                    <input type="checkbox" v-model="checklist.nameMatch" />
                    <span class="checkbox-box"><i class="fas fa-check"></i></span>
                    <span class="check-label">Nom et Prénom identiques à la pièce d'identité</span>
                  </label>
                  
                  <label class="check-item">
                    <input type="checkbox" v-model="checklist.selfieMatch" />
                    <span class="checkbox-box"><i class="fas fa-check"></i></span>
                    <span class="check-label">Selfie correspondant au visage sur la pièce (CNI)</span>
                  </label>
                  
                  <label class="check-item">
                    <input type="checkbox" v-model="checklist.cniLegible" />
                    <span class="checkbox-box"><i class="fas fa-check"></i></span>
                    <span class="check-label">Les pièces fournies sont lisibles, claires et non rognées</span>
                  </label>
                  
                  <label class="check-item">
                    <input type="checkbox" v-model="checklist.cniValid" />
                    <span class="checkbox-box"><i class="fas fa-check"></i></span>
                    <span class="check-label">Document valide (la date de validité a été contrôlée)</span>
                  </label>
                </div>
                <p class="checklist-help-text mt-3">
                  <i class="fas fa-info-circle"></i> Cochez toutes les cases pour débloquer le bouton d'approbation.
                </p>
              </div>

              <!-- Audit notes -->
              <div class="decision-card mt-6">
                <label class="workspace-section-title mb-2">Motifs d'observations ou de rejet</label>
                <textarea 
                  v-model="kycNotes[selectedKyc.id]" 
                  placeholder="Saisissez des observations internes ou justifiez le rejet du dossier..."
                  class="decision-textarea"
                ></textarea>
              </div>

            </div>

          </div>
        </div>

        <!-- Empty state when no KYC is selected -->
        <div v-else class="empty-workspace-state">
          <div class="empty-graphic">
            <i class="fas fa-user-shield"></i>
          </div>
          <h4>Aucun dossier KYC sélectionné</h4>
          <p class="text-muted">Sélectionnez une demande dans la file d'attente à gauche pour commencer la validation réglementaire de Niveau 2.</p>
        </div>
      </main>
    </div>

    <!-- Image Modal -->
    <div v-if="selectedImage" class="modal-overlay" @click="selectedImage = null">
      <div class="modal-content modal-content-large" @click.stop>
        <iframe :src="selectedImage" class="modal-iframe"></iframe>
        <div class="modal-iframe-actions">
          <a :href="selectedImage" target="_blank" rel="noopener noreferrer" class="modal-open-link">
            <i class="fas fa-external-link-alt"></i> Ouvrir dans un onglet externe
          </a>
        </div>
        <button class="modal-close" @click="selectedImage = null"><i class="fas fa-times"></i></button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed, watch } from 'vue';
import adminApi from '../../services/adminApi';
import { API_BASE_URL } from '../../services/api';

export default {
  name: 'AdminKyc',
  setup() {
    const kycPending = ref([]);
    const selectedImage = ref(null);
    const modalImageError = ref(false);
    const selectedKycId = ref(null);
    const searchQuery = ref('');
    const activeFilter = ref('ALL');
    const kycNotes = reactive({});
    
    const checklist = reactive({
      nameMatch: false,
      selfieMatch: false,
      cniLegible: false,
      cniValid: false
    });

    const filters = [
      { label: 'Tous', value: 'ALL' },
      { label: 'Expirés', value: 'EXPIRED' },
      { label: 'À Valider', value: 'VALID' }
    ];

    const openImage = (url) => { 
      selectedImage.value = url;
      modalImageError.value = false;
    };
    const openInNewTab = (url) => { window.open(url, '_blank', 'noopener,noreferrer'); };

    const resolveUrl = (path) => {
      if (!path) return '';
      if (typeof path !== 'string') return '';
      if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('http')) return path;
      return `${API_BASE_URL}${path}`;
    };

    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      return new Date(dateStr).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
      });
    };

    // Reactive map to track image load errors by URL
    const imageErrors = reactive({});

    const setImageError = (url) => {
      if (url) imageErrors[url] = true;
    };

    const hasImageError = (url) => !!imageErrors[url];

    const docs = (item) => [
      { label: 'CNI Recto', url: resolveUrl(item.documentFrontUrl) },
      { label: 'CNI Verso', url: resolveUrl(item.documentBackUrl) },
      { label: 'Selfie', url: resolveUrl(item.selfieUrl) },
      { label: 'Selfie avec ID', url: resolveUrl(item.selfieWithIdUrl) }
    ];

    const isExpired = (dateStr) => {
      if (!dateStr) return false;
      return new Date(dateStr) < new Date();
    };

    const selectKyc = (id) => {
      selectedKycId.value = id;
    };

    // Reset verification checklist checkboxes when selected client changes
    watch(selectedKycId, () => {
      checklist.nameMatch = false;
      checklist.selfieMatch = false;
      checklist.cniLegible = false;
      checklist.cniValid = false;
    });

    const filteredKyc = computed(() => {
      return kycPending.value.filter(item => {
        // Search filter
        const matchesSearch = searchQuery.value === '' || 
          item.organizationName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          item.fullName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          (item.documentNumber || '').toLowerCase().includes(searchQuery.value.toLowerCase());

        if (!matchesSearch) return false;

        // Status Filter
        const expired = isExpired(item.documentExpiryDate);
        if (activeFilter.value === 'EXPIRED') return expired;
        if (activeFilter.value === 'VALID') return !expired;
        return true;
      });
    });

    const getFilterCount = (filterValue) => {
      if (filterValue === 'ALL') return kycPending.value.length;
      return kycPending.value.filter(item => {
        const expired = isExpired(item.documentExpiryDate);
        return filterValue === 'EXPIRED' ? expired : !expired;
      }).length;
    };

    const selectedKyc = computed(() => {
      return kycPending.value.find(i => i.id === selectedKycId.value) || null;
    });

    const isChecklistComplete = computed(() => {
      return checklist.nameMatch && checklist.selfieMatch && checklist.cniLegible && checklist.cniValid;
    });

    // Auto-select first item when filtered list changes
    watch(filteredKyc, (newVal) => {
      if (newVal.length > 0) {
        const exists = newVal.some(i => i.id === selectedKycId.value);
        if (!exists) {
          selectedKycId.value = newVal[0].id;
        }
      } else {
        selectedKycId.value = null;
      }
    }, { immediate: true });

    const fetchKyc = async () => {
        try {
            const response = await adminApi.getPendingKyc();
            if (response.success) {
                kycPending.value = response.data;
                window.dispatchEvent(new CustomEvent('admin-data-changed', { detail: { type: 'kyc', count: response.data.length } }));
            }
        } catch (e) {
            // Mock data fallback for demo
            kycPending.value = [
              {
                id: "e2e69888-c70a-428a-8be8-2e0227bb3093",
                organizationName: "Koffi & Fils SARL",
                documentNumber: "C012345678",
                fullName: "Jean Koffi",
                dateOfBirth: "1985-05-15",
                documentExpiryDate: "2030-10-31",
                documentFrontUrl: "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2000",
                documentBackUrl: "https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=2000",
                selfieUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2000",
                selfieWithIdUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=2000",
                submittedAt: "2026-06-15T12:00:00"
              },
              {
                id: "f3f70999-d81b-539b-9cf9-3f1338cc4104",
                organizationName: "Global Trade CI",
                documentNumber: "A00998811",
                fullName: "Awa Touré",
                dateOfBirth: "1992-09-24",
                documentExpiryDate: "2025-02-15", // EXPIRED PIECE!
                documentFrontUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000",
                documentBackUrl: "https://images.unsplash.com/photo-1618005198143-e528346d9a9f?q=80&w=2000",
                selfieUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=2000",
                selfieWithIdUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=2000",
                submittedAt: "2026-06-21T09:30:00"
              }
            ];
            
            if (filteredKyc.value.length > 0) {
              selectedKycId.value = filteredKyc.value[0].id;
            }
            window.dispatchEvent(new CustomEvent('admin-data-changed', { detail: { type: 'kyc', count: kycPending.value.length } }));
        }
    };

    const approveKyc = async (item) => {
      if (confirm(`Approuver le KYC pour ${item.fullName} (${item.organizationName})?`)) {
        try {
          await adminApi.approveKyc(item.id);
        } catch (e) {
          // Silent catch for demo environment
        }
        kycPending.value = kycPending.value.filter(i => i.id !== item.id);
        window.dispatchEvent(new CustomEvent('admin-data-changed', { detail: { type: 'kyc', count: kycPending.value.length } }));
      }
    };

    const rejectKyc = async (item) => {
      const reason = kycNotes[item.id] || prompt("Motif du rejet (Requis) :");
      if (reason) {
        try {
          await adminApi.rejectKyc(item.id, reason);
        } catch (e) {
          // Silent catch for demo environment
        }
        kycPending.value = kycPending.value.filter(i => i.id !== item.id);
        window.dispatchEvent(new CustomEvent('admin-data-changed', { detail: { type: 'kyc', count: kycPending.value.length } }));
      }
    };

    onMounted(fetchKyc);

    return { 
      kycPending, 
      selectedImage,
      modalImageError,
      formatDate, 
      docs,
      hasImageError,
      setImageError,
      openImage,
      openInNewTab,
      approveKyc, 
      rejectKyc, 
      isExpired,
      selectedKycId,
      searchQuery,
      activeFilter,
      filters,
      filteredKyc,
      getFilterCount,
      selectedKyc,
      selectKyc,
      checklist,
      isChecklistComplete,
      kycNotes
    };
  }
}
</script>

<style scoped>
.admin-kyc-viewport {
  width: 100%;
  height: calc(100vh - 170px);
  display: flex;
  flex-direction: column;
}

.kyc-workspace {
  display: flex;
  gap: 2rem;
  flex: 1;
  height: 100%;
  overflow: hidden;
}

/* Sidebar styling */
.kyc-sidebar {
  width: 350px;
  background: white;
  border-radius: 1.5rem;
  border: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex-shrink: 0;
  height: 100%;
  box-shadow: var(--shadow-sm);
}

.sidebar-controls {
  padding: 1.25rem;
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: var(--bg-surface-dim);
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 0.85rem;
  color: var(--text-dim);
  font-size: 0.85rem;
}

.search-input {
  width: 100%;
  padding: 0.65rem 0.85rem 0.65rem 2rem;
  border-radius: 0.75rem;
  border: 1px solid var(--border-strong);
  background: white;
  font-size: 0.85rem;
  font-weight: 600;
  font-family: var(--font-body);
  transition: all 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
}

.filter-tabs {
  display: flex;
  gap: 0.35rem;
}

.filter-tab-btn {
  flex: 1;
  padding: 0.5rem 0.5rem;
  font-size: 0.7rem;
  font-weight: 800;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s var(--smooth);
  background: white;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  border: 1px solid var(--border-strong);
}

.filter-tab-btn:hover {
  background: var(--bg-surface-dim);
}

.filter-tab-btn.active {
  background: var(--bg-surface-inverse);
  color: white;
  border-color: var(--bg-surface-inverse);
}

.filter-count {
  font-size: 0.65rem;
  background: var(--accent);
  color: white;
  padding: 0.05rem 0.35rem;
  border-radius: 99rem;
  font-weight: 900;
}

.queue-list-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: white;
}

.empty-queue-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  color: var(--text-dim);
}

.empty-icon {
  font-size: 2rem;
  margin-bottom: 0.75rem;
  opacity: 0.5;
}

.queue-card {
  padding: 1.15rem;
  border-radius: 1rem;
  border: 1px solid var(--border-subtle);
  cursor: pointer;
  transition: all 0.3s var(--smooth);
  background: white;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: left;
}

.queue-card:hover {
  transform: translateY(-2px);
  border-color: var(--primary-light);
  box-shadow: var(--shadow-sm);
}

.queue-card.active {
  border-color: var(--accent);
  background: rgba(244, 63, 94, 0.02);
  box-shadow: 0 4px 12px rgba(244, 63, 94, 0.04);
}

.queue-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.company-name {
  font-size: 0.9rem;
  font-weight: 800;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 190px;
}

.submitted-date {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--text-muted);
  background: var(--bg-surface-dim);
  padding: 0.15rem 0.4rem;
  border-radius: 0.35rem;
}

.queue-card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.client-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
}

.level-tag {
  font-size: 0.7rem;
  font-weight: 900;
  color: var(--accent);
}

.queue-card-indicators {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.15rem;
}

.doc-num-info {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--text-dim);
  font-family: var(--font-mono);
}

.expired-badge {
  font-size: 0.65rem;
  font-weight: 800;
  color: #991b1b;
  background: #fee2e2;
  padding: 0.15rem 0.45rem;
  border-radius: 0.35rem;
  display: flex;
  align-items: center;
  gap: 0.2rem;
  border: 1px solid #fecdd3;
}

/* Detail view styling */
.kyc-workspace-detail {
  flex: 1;
  background: white;
  border-radius: 1.5rem;
  border: 1px solid var(--border-subtle);
  overflow: hidden;
  height: 100%;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
}

.detail-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--border-subtle);
  background: white;
  flex-shrink: 0;
}

.header-client-info {
  text-align: left;
}

.status-tag {
  font-size: 0.6rem;
  font-weight: 900;
  color: #92400e;
  background: #fff7ed;
  border: 1px solid #ffedd5;
  padding: 0.2rem 0.6rem;
  border-radius: 99rem;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  margin-bottom: 0.35rem;
}

.pulse-dot.warning {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #d97706;
  box-shadow: 0 0 0 0 rgba(217, 119, 6, 0.7);
  animation: pulse-warn-light 2s infinite;
}

@keyframes pulse-warn-light {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(217, 119, 6, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(217, 119, 6, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(217, 119, 6, 0); }
}

.header-client-info h3 {
  font-size: 1.5rem;
  font-weight: 900;
  color: var(--text-main);
  margin-bottom: 0.15rem;
}

.client-sub-meta {
  font-size: 0.75rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.client-sub-meta .divider {
  opacity: 0.3;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-workspace-primary {
  background: var(--accent);
  color: white;
  padding: 0.65rem 1.25rem;
  border-radius: 0.75rem;
  border: none;
  font-weight: 800;
  font-size: 0.8rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  box-shadow: 0 4px 10px rgba(244, 63, 94, 0.2);
  transition: all 0.3s;
}

.btn-workspace-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  background: #e11d48;
  box-shadow: 0 6px 14px rgba(244, 63, 94, 0.3);
}

.btn-workspace-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-workspace-secondary {
  background: var(--bg-surface-dim);
  color: var(--text-muted);
  padding: 0.65rem 1.25rem;
  border-radius: 0.75rem;
  border: 1px solid var(--border-strong);
  font-weight: 800;
  font-size: 0.8rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.3s;
}

.btn-workspace-secondary:hover {
  background: #fee2e2;
  color: var(--accent);
  border-color: #fca5a5;
}

/* Detail Grid Layout */
.detail-workspace-grid {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 2rem;
  padding: 1.75rem 2rem;
  overflow-y: auto;
  flex: 1;
  background: #f8fafc;
}

.workspace-section-title {
  font-size: 0.65rem;
  font-weight: 900;
  color: var(--text-dim);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-bottom: 0.75rem;
  display: block;
  text-align: left;
}

/* Documents Column */
.grid-col-viewer {
  display: flex;
  flex-direction: column;
}

.kyc-visual-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.doc-premium-frame {
  position: relative;
  border-radius: 1rem;
  overflow: hidden;
  cursor: pointer;
  aspect-ratio: 4/3;
  border: 1px solid var(--border-strong);
  box-shadow: var(--shadow-sm);
  background: white;
  transition: all 0.5s var(--smooth);
}

.doc-premium-frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.5s var(--smooth);
}

.doc-overlay {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: white;
  opacity: 0;
  transition: all 0.3s;
  z-index: 10;
}

.doc-overlay i { font-size: 1.25rem; }
.doc-overlay span { font-weight: 800; font-size: 0.7rem; letter-spacing: 0.05em; }

.doc-premium-frame:hover .doc-overlay { opacity: 1; }
.doc-premium-frame:hover img { transform: scale(1.05); }

.doc-tag {
  position: absolute;
  bottom: 0.85rem;
  left: 0.85rem;
  background: white;
  padding: 0.25rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.6rem;
  font-weight: 900;
  color: var(--text-main);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  box-shadow: var(--shadow-sm);
  z-index: 11;
  border: 1px solid var(--border-strong);
}

/* Checklist Column */
.grid-col-data {
  display: flex;
  flex-direction: column;
}

.meta-card {
  background: white;
  border: 1px solid var(--border-subtle);
  border-radius: 1.25rem;
  padding: 1.25rem;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.meta-row {
  display: flex;
  gap: 1.5rem;
}

.meta-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  text-align: left;
}

.meta-item label {
  font-size: 0.65rem;
  font-weight: 900;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.meta-item span {
  font-size: 0.85rem;
  color: var(--text-main);
}

.expiry-val {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.expired-text {
  color: #991b1b !important;
}

.expiry-warning-chip {
  font-size: 0.55rem;
  font-weight: 900;
  color: #991b1b;
  background: #fee2e2;
  padding: 0.1rem 0.4rem;
  border-radius: 99rem;
  display: inline-flex;
  align-items: center;
  gap: 0.15rem;
  border: 1px solid #fecdd3;
  text-transform: uppercase;
}

/* Checklist */
.checklist-card {
  background: white;
  border: 1px solid var(--border-subtle);
  border-radius: 1.25rem;
  padding: 1.25rem;
  box-shadow: var(--shadow-sm);
  text-align: left;
}

.checklist-rows {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.check-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-muted);
  user-select: none;
  padding: 0.25rem 0;
}

.check-item input[type="checkbox"] {
  display: none;
}

.checkbox-box {
  width: 20px;
  height: 20px;
  border-radius: 0.35rem;
  border: 2px solid var(--border-strong);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.65rem;
  transition: all 0.2s var(--smooth);
  flex-shrink: 0;
}

.check-item input[type="checkbox"]:checked + .checkbox-box {
  background: var(--accent);
  border-color: var(--accent);
}

.check-label {
  line-height: 1.2;
}

.checklist-help-text {
  font-size: 0.65rem;
  color: var(--text-dim);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

/* Decision Card */
.decision-card {
  background: white;
  border: 1px solid var(--border-subtle);
  border-radius: 1.25rem;
  padding: 1.25rem;
  text-align: left;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-sm);
}

.decision-textarea {
  width: 100%;
  height: 85px;
  border-radius: 0.75rem;
  border: 1px solid var(--border-strong);
  padding: 0.75rem 1rem;
  font-family: var(--font-body);
  font-size: 0.8rem;
  font-weight: 600;
  resize: none;
  transition: all 0.3s;
  background: var(--bg-surface-dim);
  color: var(--text-main);
}

.decision-textarea:focus {
  outline: none;
  border-color: var(--accent);
  background: white;
  box-shadow: 0 0 0 3px rgba(244, 63, 94, 0.1);
}

/* Empty workspace state */
.empty-workspace-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 4rem;
  text-align: center;
  color: var(--text-muted);
  background: #f8fafc;
}

.empty-graphic {
  width: 70px;
  height: 70px;
  background: white;
  border: 1px solid var(--border-subtle);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: var(--text-dim);
  margin-bottom: 1.25rem;
  box-shadow: var(--shadow-sm);
}

.empty-workspace-state h4 {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--text-main);
  margin-bottom: 0.35rem;
}

.empty-workspace-state p {
  max-width: 300px;
  font-size: 0.8rem;
  line-height: 1.5;
}

/* Image Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(15px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  animation: fadeIn 0.3s ease-out;
}

.modal-content-large {
  width: 85vw;
  height: 85vh;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  background: transparent;
}

.modal-iframe {
  width: 100%;
  height: calc(100% - 60px);
  border: none;
  border-radius: 1rem;
  background: white;
  box-shadow: 0 25px 80px rgba(0,0,0,0.5);
}

.modal-iframe-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 50px;
}

.modal-open-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  color: white;
  font-weight: 800;
  font-size: 0.85rem;
  padding: 0.65rem 1.5rem;
  border-radius: 0.75rem;
  text-decoration: none;
  border: 1px solid rgba(255, 255, 255, 0.25);
  transition: all 0.3s;
}

.modal-open-link:hover {
  background: white;
  color: #0f172a;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.2);
}

.modal-close {
  position: fixed;
  top: 2rem;
  right: 2rem;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: white;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.modal-close:hover {
  transform: rotate(90deg);
  color: var(--accent);
}

/* Image error fallback */
.doc-error-state {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: #f8fafc;
  color: var(--text-dim);
  padding: 1rem;
  text-align: center;
}

.doc-error-state i {
  font-size: 1.5rem;
  color: #94a3b8;
}

.doc-error-state span {
  font-size: 0.7rem;
  font-weight: 700;
  color: #64748b;
}

.doc-open-link {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background: var(--primary, #0ea5e9);
  color: white;
  font-weight: 800;
  font-size: 0.65rem;
  padding: 0.4rem 0.75rem;
  border-radius: 0.5rem;
  text-decoration: none;
  transition: all 0.3s;
  border: none;
  cursor: pointer;
  margin-top: 0.25rem;
}

.doc-open-link:hover {
  background: #0284c7;
  transform: translateY(-1px);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@media (max-width: 1200px) {
  .kyc-workspace {
    flex-direction: column;
    height: auto;
    overflow: visible;
  }
  
  .kyc-sidebar {
    width: 100%;
    height: 350px;
  }
  
  .detail-workspace-grid {
    grid-template-columns: 1fr;
  }
  
  .kyc-visual-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
