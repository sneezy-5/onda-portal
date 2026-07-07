<template>
  <div class="admin-audit-viewport reveal">
    <!-- Page Header (clean, concise) -->
    <div class="bo-page-header mb-8">
      <h2 class="text-3xl font-black tracking-tight">Audit des <span class="text-accent">Preuves Fiscales</span></h2>
      <p class="text-muted mt-1 text-sm">Vérification réglementaire et analyse anti-fraude des quittances DGI signalées.</p>
    </div>

    <!-- Workspace Container (Split-Screen) -->
    <div class="audit-workspace">
      <!-- Left Column: Search, Filters & Queue List -->
      <aside class="audit-sidebar">
        <!-- Search & Filter Controls -->
        <div class="sidebar-controls">
          <div class="search-wrapper">
            <i class="fas fa-search search-icon"></i>
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Rechercher une entité..." 
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
          <div v-if="filteredAudits.length === 0" class="empty-queue-state">
            <i class="fas fa-inbox empty-icon"></i>
            <p>Aucune quittance en attente</p>
          </div>
          
          <div 
            v-else
            v-for="audit in filteredAudits" 
            :key="audit.id"
            :class="['queue-card', { active: selectedAuditId === audit.id }]"
            @click="selectAudit(audit.id)"
          >
            <div class="queue-card-top">
              <span class="company-name">{{ audit.organizationName }}</span>
              <span class="period-badge">{{ audit.period }}</span>
            </div>
            
            <div class="queue-card-meta">
              <span class="tax-type-tag">{{ audit.taxType }}</span>
              <span class="amount-val">{{ formatCurrency(audit.declaredAmount) }}</span>
            </div>
            
            <div class="queue-card-indicators">
              <!-- AI Confidence indicator -->
              <span 
                :class="['confidence-indicator', getConfidenceClass(audit.proofs[0]?.extractedData.confidence)]"
              >
                Confiance: {{ (audit.proofs[0]?.extractedData.confidence * 100).toFixed(0) }}%
              </span>
              
              <!-- Warnings Count Badge -->
              <span 
                v-if="audit.proofs[0]?.extractedData.exifSuspiciousSignals?.length > 0"
                class="warning-badge"
              >
                <i class="fas fa-exclamation-triangle"></i>
                {{ audit.proofs[0]?.extractedData.exifSuspiciousSignals.length }}
              </span>
            </div>
          </div>
        </div>
      </aside>

      <!-- Right Column: Audit Workspace Detail View -->
      <main class="audit-workspace-detail">
        <div v-if="selectedAudit" class="detail-container">
          <!-- Top Sticky Header of Details Pane -->
          <div class="detail-header">
            <div class="header-company-info">
              <span class="status-tag">
                <span class="pulse-dot warning"></span>
                AUDIT REGLEMENTAIRE EN COURS
              </span>
              <h3>{{ selectedAudit.organizationName }}</h3>
              <p class="company-sub-meta">
                <span>NCC: <strong>{{ selectedAudit.proofs[0]?.extractedData.ncc || 'N/A' }}</strong></span>
                <span class="divider">•</span>
                <span>Période: <strong>{{ selectedAudit.period }}</strong></span>
                <span class="divider">•</span>
                <span>Impôt: <strong>{{ selectedAudit.taxType }}</strong></span>
              </p>
            </div>
            
            <div class="header-actions">
              <button @click="rejectAudit(selectedAudit)" class="btn-workspace-secondary">
                <i class="fas fa-times"></i> Rejeter la preuve
              </button>
              <button @click="approveAudit(selectedAudit)" class="btn-workspace-primary">
                <i class="fas fa-check"></i> Valider & Libérer
              </button>
            </div>
          </div>

          <!-- Document Examiner & Comparison Data Grid -->
          <div class="detail-workspace-grid">
            
            <!-- Left Workspace Grid Column: Document Viewer & AI signals -->
            <div class="grid-col-viewer">
              <h5 class="workspace-section-title">Visualisation de la quittance</h5>
              
              <div class="document-viewer-card">
                <div 
                  v-for="proof in selectedAudit.proofs" 
                  :key="proof.fileId" 
                  class="proof-premium-container"
                >
                  <div class="proof-frame" @click="openImage(resolveUrl(proof.url))">
                    <template v-if="!hasImageError(resolveUrl(proof.url))">
                      <div class="proof-overlay">
                        <i class="fas fa-search-plus"></i>
                        <span>AGRANDIR LE DOCUMENT (HAUTE DEF)</span>
                      </div>
                      <img :src="resolveUrl(proof.url)" class="proof-img" @error="setImageError(resolveUrl(proof.url))" />
                    </template>
                    <template v-else>
                      <div class="doc-error-state">
                        <i class="fas fa-eye"></i>
                        <span>Aperçu de quittance indisponible</span>
                        <button @click.stop="openImage(resolveUrl(proof.url))" class="doc-open-link">
                          Visualiser le document
                        </button>
                      </div>
                    </template>
                  </div>
                  
                  <!-- AI Fraud Box (dark theme) -->
                  <div class="ia-signals-box mt-4">
                    <div class="ia-header">
                      <i class="fas fa-robot"></i>
                      <span>ANALYSE MÉTADONNÉES ONDA-IA</span>
                    </div>
                    <div class="signals-list">
                      <div 
                        v-if="proof.extractedData.exifSuspiciousSignals?.length === 0" 
                        class="signal-item ok"
                      >
                        <i class="fas fa-check-circle"></i>
                        Aucune altération EXIF suspecte détectée.
                      </div>
                      <div 
                        v-else
                        v-for="signal in proof.extractedData.exifSuspiciousSignals" 
                        :key="signal" 
                        class="signal-item warning"
                      >
                        <i class="fas fa-exclamation-triangle"></i>
                        {{ signal }}
                      </div>
                    </div>
                    <div class="ia-footer">
                      <span>Logiciel d'édition détecté :</span>
                      <strong :class="{ 'highlight-software': proof.extractedData.exifSoftware?.toLowerCase().includes('photoshop') }">
                        {{ proof.extractedData.exifSoftware || 'Aucun' }}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Workspace Grid Column: Data comparison and verification checklist -->
            <div class="grid-col-data">
              <h5 class="workspace-section-title">Contrôle de concordance des données</h5>

              <!-- Side-by-Side Verification Panel -->
              <div class="comparison-card">
                <div class="comparison-header">
                  <div class="comp-col-header">Propriété</div>
                  <div class="comp-col-header text-right">Déclaré</div>
                  <div class="comp-col-header text-right">Extrait (OCR)</div>
                </div>
                
                <div class="comparison-rows">
                  <!-- Row 1: Montant -->
                  <div :class="['comparison-row', { 'mismatch': isAmountMismatch }]">
                    <div class="comp-field">
                      <span class="field-name">Montant Quittance</span>
                      <span class="field-desc">Montant total de la preuve</span>
                    </div>
                    <div class="comp-val declared text-right">
                      {{ formatCurrency(selectedAudit.declaredAmount) }}
                    </div>
                    <div class="comp-val ocr text-right font-bold">
                      {{ formatCurrency(selectedAudit.proofs[0]?.extractedData.amount) }}
                      <div class="mismatch-badge" v-if="isAmountMismatch">
                        <i class="fas fa-exclamation-circle"></i> Discordance
                      </div>
                      <div class="match-badge" v-else>
                        <i class="fas fa-check-circle"></i> Conforme
                      </div>
                    </div>
                  </div>

                  <!-- Row 2: NCC -->
                  <div class="comparison-row">
                    <div class="comp-field">
                      <span class="field-name">Numéro NCC</span>
                      <span class="field-desc">Compte Contribuable</span>
                    </div>
                    <div class="comp-val declared text-right text-muted">
                      N/A
                    </div>
                    <div class="comp-val ocr text-right font-mono font-bold">
                      {{ selectedAudit.proofs[0]?.extractedData.ncc || 'N/A' }}
                    </div>
                  </div>

                  <!-- Row 3: Emetteur -->
                  <div class="comparison-row">
                    <div class="comp-field">
                      <span class="field-name">Émetteur</span>
                      <span class="field-desc">Administration émettrice</span>
                    </div>
                    <div class="comp-val declared text-right text-muted">
                      DGI CI
                    </div>
                    <div class="comp-val ocr text-right">
                      {{ selectedAudit.proofs[0]?.extractedData.issuer || 'N/A' }}
                    </div>
                  </div>

                  <!-- Row 4: Quittance Number -->
                  <div class="comparison-row">
                    <div class="comp-field">
                      <span class="field-name">N° Quittance</span>
                      <span class="field-desc">Numéro d'enregistrement</span>
                    </div>
                    <div class="comp-val declared text-right text-muted">
                      -
                    </div>
                    <div class="comp-val ocr text-right font-mono">
                      {{ selectedAudit.proofs[0]?.extractedData.quittanceNumber || 'N/A' }}
                    </div>
                  </div>
                </div>

                <!-- OCR Confidence Level Box -->
                <div class="confidence-box mt-6">
                  <div class="confidence-title">
                    <span>Score de confiance OCR</span>
                    <strong :class="getConfidenceClass(selectedAudit.proofs[0]?.extractedData.confidence)">
                      {{ (selectedAudit.proofs[0]?.extractedData.confidence * 100).toFixed(1) }}%
                    </strong>
                  </div>
                  <div class="confidence-meter-bg">
                    <div 
                      :class="['confidence-meter-bar', getConfidenceClass(selectedAudit.proofs[0]?.extractedData.confidence)]"
                      :style="{ width: (selectedAudit.proofs[0]?.extractedData.confidence * 100) + '%' }"
                    ></div>
                  </div>
                </div>
              </div>

              <!-- Internal Decisions Notes -->
              <div class="decision-card mt-6">
                <label class="workspace-section-title mb-2">Observations de l'auditeur</label>
                <textarea 
                  v-model="auditNotes[selectedAudit.id]" 
                  placeholder="Écrivez vos notes de vérification ou la raison du rejet si nécessaire..."
                  class="decision-textarea"
                ></textarea>
                <p class="decision-help-text mt-2">
                  Ces notes seront notifiées au partenaire et tracées dans son dossier réglementaire.
                </p>
              </div>

            </div>

          </div>
        </div>

        <!-- Empty state when no audit is selected -->
        <div v-else class="empty-workspace-state">
          <div class="empty-graphic">
            <i class="fas fa-clipboard-check"></i>
          </div>
          <h4>Aucun dossier d'audit sélectionné</h4>
          <p class="text-muted">Sélectionnez une preuve fiscale dans la file d'attente à gauche pour commencer l'examen réglementaire.</p>
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
  name: 'AdminAudit',
  setup() {
    const auditDeclarations = ref([]);
    const auditNotes = reactive({});
    const selectedImage = ref(null);
    const selectedAuditId = ref(null);
    const searchQuery = ref('');
    const activeFilter = ref('ALL');

    const imageErrors = reactive({});

    const setImageError = (url) => {
      if (url) imageErrors[url] = true;
    };

    const hasImageError = (url) => !!imageErrors[url];

    const filters = [
      { label: 'Tous', value: 'ALL' },
      { label: 'Suspects (IA)', value: 'SUSPICIOUS' },
      { label: 'Réguliers', value: 'REGULAR' }
    ];

    const openImage = (url) => { selectedImage.value = url; };

    const resolveUrl = (path) => {
      if (!path) return '';
      if (typeof path !== 'string') return '';
      if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('http')) return path;
      return `${API_BASE_URL}${path}`;
    };

    const formatCurrency = (val) => {
      if (val === undefined || val === null) return '0 F CFA';
      return new Intl.NumberFormat('fr-CI', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(val);
    };

    const getConfidenceClass = (score) => {
      if (!score) return 'low-conf';
      if (score >= 0.90) return 'high-conf';
      if (score >= 0.75) return 'medium-conf';
      return 'low-conf';
    };

    const isSuspicious = (audit) => {
      const proof = audit.proofs?.[0];
      if (!proof) return false;
      const confidence = proof.extractedData?.confidence || 1;
      const signals = proof.extractedData?.exifSuspiciousSignals || [];
      return confidence < 0.85 || signals.length > 0;
    };

    const filteredAudits = computed(() => {
      return auditDeclarations.value.filter(audit => {
        // Search filter
        const matchesSearch = searchQuery.value === '' || 
          audit.organizationName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          audit.taxType.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          audit.period.includes(searchQuery.value) ||
          (audit.proofs?.[0]?.extractedData?.quittanceNumber || '').toLowerCase().includes(searchQuery.value.toLowerCase());

        if (!matchesSearch) return false;

        // Status filter
        if (activeFilter.value === 'SUSPICIOUS') {
          return isSuspicious(audit);
        } else if (activeFilter.value === 'REGULAR') {
          return !isSuspicious(audit);
        }
        return true;
      });
    });

    const getFilterCount = (filterValue) => {
      if (filterValue === 'ALL') return auditDeclarations.value.length;
      return auditDeclarations.value.filter(audit => {
        const suspicious = isSuspicious(audit);
        return filterValue === 'SUSPICIOUS' ? suspicious : !suspicious;
      }).length;
    };

    const selectedAudit = computed(() => {
      return auditDeclarations.value.find(a => a.id === selectedAuditId.value) || null;
    });

    const isAmountMismatch = computed(() => {
      const audit = selectedAudit.value;
      if (!audit || !audit.proofs?.[0]) return false;
      const declared = Number(audit.declaredAmount) || 0;
      const extracted = Number(audit.proofs[0].extractedData?.amount) || 0;
      return Math.abs(declared - extracted) > 1.0;
    });

    const selectAudit = (id) => {
      selectedAuditId.value = id;
    };

    // Watch filtered audits: if selected audit is no longer in filtered list or null, auto-select first
    watch(filteredAudits, (newVal) => {
      if (newVal.length > 0) {
        const exists = newVal.some(a => a.id === selectedAuditId.value);
        if (!exists) {
          selectedAuditId.value = newVal[0].id;
        }
      } else {
        selectedAuditId.value = null;
      }
    }, { immediate: true });

    const fetchAudit = async () => {
        try {
            const response = await adminApi.getAuditDeclarations();
            if (response.success) {
                auditDeclarations.value = response.data;
                window.dispatchEvent(new CustomEvent('admin-data-changed', { detail: { type: 'audit', count: response.data.length } }));
            }
        } catch (e) {
            // Mock data for demo/fallback
            auditDeclarations.value = [
            ];
            
            // Set initial selected audit if exists
            if (filteredAudits.value.length > 0) {
              selectedAuditId.value = filteredAudits.value[0].id;
            }
            window.dispatchEvent(new CustomEvent('admin-data-changed', { detail: { type: 'audit', count: auditDeclarations.value.length } }));
        }
    };

    const approveAudit = async (audit) => {
        if (confirm(`Valider la déclaration pour ${audit.organizationName}?`)) {
            try {
                await adminApi.approveAudit(audit.id, auditNotes[audit.id]);
            } catch (e) {
                // Fail silently in mock demo
            }
            auditDeclarations.value = auditDeclarations.value.filter(a => a.id !== audit.id);
            window.dispatchEvent(new CustomEvent('admin-data-changed', { detail: { type: 'audit', count: auditDeclarations.value.length } }));
        }
    };

    const rejectAudit = async (audit) => {
        const notes = auditNotes[audit.id] || prompt("Motif du rejet (Requis) :");
        if (notes) {
            try {
                await adminApi.rejectAudit(audit.id, notes);
            } catch (e) {
                // Fail silently in mock demo
            }
            auditDeclarations.value = auditDeclarations.value.filter(a => a.id !== audit.id);
            window.dispatchEvent(new CustomEvent('admin-data-changed', { detail: { type: 'audit', count: auditDeclarations.value.length } }));
        }
    };

    onMounted(fetchAudit);

    return { 
      auditDeclarations, 
      auditNotes, 
      formatCurrency, 
      approveAudit, 
      rejectAudit, 
      resolveUrl, 
      openImage, 
      selectedImage,
      selectedAuditId,
      searchQuery,
      activeFilter,
      filters,
      filteredAudits,
      getFilterCount,
      selectedAudit,
      isAmountMismatch,
      getConfidenceClass,
      selectAudit,
      hasImageError,
      setImageError
    };
  }
}
</script>

<style scoped>
.admin-audit-viewport {
  width: 100%;
  height: calc(100vh - 170px);
  display: flex;
  flex-direction: column;
}

.audit-workspace {
  display: flex;
  gap: 2rem;
  flex: 1;
  height: 100%;
  overflow: hidden;
}

/* Sidebar Styling */
.audit-sidebar {
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

.period-badge {
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

.tax-type-tag {
  font-size: 0.7rem;
  font-weight: 900;
  color: var(--accent);
  text-transform: uppercase;
}

.amount-val {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-main);
}

.queue-card-indicators {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-top: 0.15rem;
}

.confidence-indicator {
  font-size: 0.65rem;
  font-weight: 800;
  padding: 0.15rem 0.45rem;
  border-radius: 0.35rem;
}

.high-conf {
  color: #166534;
  background: #dcfce7;
}

.medium-conf {
  color: #92400e;
  background: #fef3c7;
}

.low-conf {
  color: #991b1b;
  background: #fee2e2;
}

.warning-badge {
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

/* Right Detail View Area */
.audit-workspace-detail {
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

.header-company-info {
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

.header-company-info h3 {
  font-size: 1.5rem;
  font-weight: 900;
  color: var(--text-main);
  margin-bottom: 0.15rem;
}

.company-sub-meta {
  font-size: 0.75rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.company-sub-meta .divider {
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

.btn-workspace-primary:hover {
  transform: translateY(-1px);
  background: #e11d48;
  box-shadow: 0 6px 14px rgba(244, 63, 94, 0.3);
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
  grid-template-columns: 1.05fr 0.95fr;
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

/* Viewer Column */
.grid-col-viewer {
  display: flex;
  flex-direction: column;
}

.document-viewer-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.proof-frame {
  position: relative;
  border-radius: 1rem;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid var(--border-strong);
  box-shadow: var(--shadow-sm);
  aspect-ratio: 4/3;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.proof-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.4s var(--smooth);
}

.proof-frame:hover .proof-img {
  transform: scale(1.02);
}

.proof-overlay {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
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

.proof-frame:hover .proof-overlay {
  opacity: 1;
}

.proof-overlay i {
  font-size: 1.25rem;
}

.proof-overlay span {
  font-weight: 800;
  font-size: 0.7rem;
  letter-spacing: 0.05em;
}

.ia-signals-box {
  background: #0f172a;
  border-radius: 1rem;
  padding: 1.25rem;
  color: #94a3b8;
  text-align: left;
  box-shadow: var(--shadow-md);
}

.ia-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  color: #fda4af;
  font-weight: 800;
  font-size: 0.7rem;
  letter-spacing: 0.08em;
}

.signals-list {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.signal-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.4;
}

.signal-item.warning {
  color: #fca5a5;
}

.signal-item.ok {
  color: #4ade80;
}

.ia-footer {
  margin-top: 0.75rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 0.65rem;
  display: flex;
  justify-content: space-between;
}

.highlight-software {
  color: #fda4af;
  font-weight: 800;
}

/* Data & Comparison Column */
.grid-col-data {
  display: flex;
  flex-direction: column;
}

.comparison-card {
  background: white;
  border: 1px solid var(--border-subtle);
  border-radius: 1.25rem;
  padding: 1.25rem;
  box-shadow: var(--shadow-sm);
}

.comparison-header {
  display: grid;
  grid-template-columns: 1fr 1fr 1.2fr;
  gap: 0.75rem;
  border-bottom: 2px solid var(--border-strong);
  padding-bottom: 0.5rem;
  margin-bottom: 0.75rem;
}

.comp-col-header {
  font-size: 0.6rem;
  font-weight: 800;
  color: var(--text-dim);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.comparison-rows {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.comparison-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1.2fr;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  background: var(--bg-surface-dim);
  border: 1px solid var(--border-strong);
  align-items: center;
  transition: all 0.3s;
}

.comparison-row.mismatch {
  background: #fef2f2;
  border-color: #fee2e2;
}

.comp-field {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  text-align: left;
}

.field-name {
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--text-main);
}

.field-desc {
  font-size: 0.6rem;
  color: var(--text-dim);
}

.comp-val {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-main);
}

.comp-val.declared {
  color: var(--text-muted);
}

.comp-val.ocr {
  color: var(--text-main);
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.15rem;
}

.mismatch-badge {
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

.match-badge {
  font-size: 0.55rem;
  font-weight: 900;
  color: #166534;
  background: #dcfce7;
  padding: 0.1rem 0.4rem;
  border-radius: 99rem;
  display: inline-flex;
  align-items: center;
  gap: 0.15rem;
  border: 1px solid #bbf7d0;
  text-transform: uppercase;
}

.confidence-box {
  background: var(--bg-surface-dim);
  border: 1px solid var(--border-strong);
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.confidence-title {
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--text-muted);
}

.confidence-meter-bg {
  height: 6px;
  background: #e2e8f0;
  border-radius: 99rem;
  overflow: hidden;
}

.confidence-meter-bar {
  height: 100%;
  border-radius: 99rem;
  transition: width 0.8s var(--smooth);
}

.confidence-meter-bar.high-conf { background: #22c55e; }
.confidence-meter-bar.medium-conf { background: #f59e0b; }
.confidence-meter-bar.low-conf { background: #ef4444; }

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
  height: 90px;
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

.decision-help-text {
  font-size: 0.65rem;
  color: var(--text-dim);
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

/* Document Error Fallback styling */
.doc-error-state {
  width: 100%;
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: #f8fafc;
  border-radius: 0.75rem;
  color: var(--text-dim);
  padding: 1rem;
  text-align: center;
  border: 1px dashed var(--border-subtle);
}

.doc-error-state i {
  font-size: 1.5rem;
  color: #94a3b8;
}

.doc-error-state span {
  font-size: 0.75rem;
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
  .audit-workspace {
    flex-direction: column;
    height: auto;
    overflow: visible;
  }
  
  .audit-sidebar {
    width: 100%;
    height: 350px;
  }
  
  .detail-workspace-grid {
    grid-template-columns: 1fr;
  }
}
</style>
