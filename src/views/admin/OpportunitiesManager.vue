<template>
  <div class="opp-manager-viewport reveal">
    <!-- Page Header -->
    <div class="bo-page-header mb-10">
      <div class="header-left">
        <h2 class="text-4xl font-black tracking-tight">Gestion des <span class="text-accent">Opportunités</span></h2>
        <p class="text-muted mt-2">Appels d'offres, marchés publics, formations et partenariats.</p>
      </div>
      <button @click="openDrawer(null)" class="btn-bo-primary">
        <i class="fas fa-plus"></i> Nouvelle Opportunité
      </button>
    </div>

    <!-- Category Filter Bar -->
    <div class="filter-bar mb-8">
      <button
        v-for="cat in categories"
        :key="cat.value"
        @click="activeCategory = cat.value"
        :class="['filter-chip', { active: activeCategory === cat.value }]"
      >
        <i :class="cat.icon"></i>
        {{ cat.label }}
        <span class="chip-count">{{ countByCategory(cat.value) }}</span>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner-elite"></div>
      <p class="text-muted mt-4">Chargement des opportunités...</p>
    </div>

    <!-- Opportunities Grid -->
    <div v-else>
      <div v-if="filteredOpportunities.length === 0" class="empty-state-premium">
        <div class="empty-icon"><i class="fas fa-briefcase"></i></div>
        <h3>Aucune opportunité</h3>
        <p>Créez votre première opportunité pour la communauté Onda.</p>
        <button @click="openDrawer(null)" class="btn-bo-primary mt-6">
          <i class="fas fa-plus"></i> Créer une opportunité
        </button>
      </div>

      <div v-else class="opp-grid">
        <div v-for="opp in filteredOpportunities" :key="opp.id" class="opp-card">
          <!-- Card Accent Strip -->
          <div class="opp-accent-strip" :style="{ background: opp.accentColor || '#6366f1' }"></div>

          <div class="opp-card-body">
            <div class="opp-card-top">
              <div class="opp-badges">
                <span class="cat-badge" :class="'cat-' + opp.category?.toLowerCase()">
                  {{ categoryLabel(opp.category) }}
                </span>
                <span v-if="opp.isFeatured" class="featured-badge">
                  <i class="fas fa-star"></i> À la une
                </span>
              </div>
              <div class="opp-card-actions">
                <div :class="['status-badge', opp.isActive ? 'status-active' : 'status-inactive']">
                  {{ opp.isActive ? 'Actif' : 'Inactif' }}
                </div>
                <button @click="openDrawer(opp)" class="action-icon-btn edit-btn" title="Modifier">
                  <i class="fas fa-pen"></i>
                </button>
                <button @click="confirmDelete(opp)" class="action-icon-btn delete-btn" title="Supprimer">
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>

            <h4 class="opp-title">{{ opp.title }}</h4>
            <p class="opp-short-desc">{{ opp.shortDescription }}</p>

            <div class="opp-meta-row">
              <div class="meta-item" v-if="opp.organizer">
                <i class="fas fa-building"></i>
                <span>{{ opp.organizer }}</span>
              </div>
              <div class="meta-item" v-if="opp.location">
                <i class="fas fa-map-marker-alt"></i>
                <span>{{ opp.location }}</span>
              </div>
            </div>

            <div class="opp-footer">
              <div class="opp-amount" v-if="opp.amount">
                <span class="amount-val">{{ formatAmount(opp.amount) }}</span>
              </div>
              <div class="opp-deadline" :class="{ 'deadline-urgent': isUrgent(opp.deadline) }">
                <i class="fas fa-clock"></i>
                {{ formatDeadline(opp.deadline) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================
         SLIDE-OVER DRAWER
         ============================ -->
    <transition name="drawer">
      <div v-if="showDrawer" class="drawer-overlay" @click.self="closeDrawer">
        <div class="drawer-panel">
          <div class="drawer-header">
            <h3>{{ editingOpp ? 'Modifier l\'opportunité' : 'Nouvelle opportunité' }}</h3>
            <button @click="closeDrawer" class="drawer-close-btn"><i class="fas fa-times"></i></button>
          </div>

          <div class="drawer-body">
            <form @submit.prevent="saveOpportunity" class="form-elite">

              <div class="form-grid-2">
                <div class="field-group">
                  <label>Catégorie <span class="required">*</span></label>
                  <select v-model="form.category" required>
                    <option value="">-- Sélectionner --</option>
                    <option value="PUBLIC_MARKET">Marché Public</option>
                    <option value="FORMATION">Formation</option>
                    <option value="PARTENARIAT">Partenariat</option>
                    <option value="APPEL_OFFRES">Appel d'Offres</option>
                    <option value="SUBVENTION">Subvention</option>
                    <option value="OTHER">Autre</option>
                  </select>
                </div>
                <div class="field-group">
                  <label>Ordre d'affichage</label>
                  <input v-model.number="form.sortOrder" type="number" min="0" placeholder="1" />
                </div>
              </div>

              <div class="field-group">
                <label>Titre <span class="required">*</span></label>
                <input v-model="form.title" type="text" placeholder="ex: Aménagement des espaces verts - Plateau" required />
              </div>

              <div class="field-group">
                <label>Accroche courte <span class="required">*</span></label>
                <input v-model="form.shortDescription" type="text" placeholder="Description brève visible dans la liste..." required />
              </div>

              <div class="field-group">
                <label>Description complète</label>
                <textarea v-model="form.description" rows="4" placeholder="Description détaillée de l'opportunité..."></textarea>
              </div>

              <div class="form-grid-2">
                <div class="field-group">
                  <label>Organisateur</label>
                  <input v-model="form.organizer" type="text" placeholder="ex: Mairie du Plateau" />
                </div>
                <div class="field-group">
                  <label>Localisation</label>
                  <input v-model="form.location" type="text" placeholder="ex: Abidjan, Côte d'Ivoire" />
                </div>
              </div>

              <div class="field-group">
                <label>Secteurs cibles (séparés par des virgules)</label>
                <input v-model="form.targetSectors" type="text" placeholder="ex: COMMERCE,SERVICES,AGRICULTURE" />
              </div>

              <div class="form-grid-2">
                <div class="field-group">
                  <label>Montant (XOF)</label>
                  <input v-model.number="form.amount" type="number" min="0" step="1000" placeholder="25000000" />
                </div>
                <div class="field-group">
                  <label>Date limite <span class="required">*</span></label>
                  <input v-model="form.deadline" type="date" required />
                </div>
              </div>

              <div class="form-grid-2">
                <div class="field-group">
                  <label>Libellé du CTA</label>
                  <input v-model="form.ctaLabel" type="text" placeholder="Postuler" />
                </div>
                <div class="field-group">
                  <label>URL du CTA</label>
                  <input v-model="form.ctaUrl" type="url" placeholder="https://..." />
                </div>
              </div>

              <div class="form-grid-2">
                <div class="field-group">
                  <label>Téléphone de contact</label>
                  <input v-model="form.contactPhone" type="text" placeholder="+225..." />
                </div>
                <div class="field-group">
                  <label>Email de contact</label>
                  <input v-model="form.contactEmail" type="email" placeholder="contact@..." />
                </div>
              </div>

              <div class="field-group">
                <label>URL de l'image</label>
                <input v-model="form.imageUrl" type="text" placeholder="/images/opportunity.png" />
              </div>

              <div class="form-grid-2">
                <div class="field-group">
                  <label>Icône (Ionic)</label>
                  <input v-model="form.icon" type="text" placeholder="construct-outline" />
                </div>
                <div class="field-group">
                  <label>Couleur d'accentuation</label>
                  <div class="color-input-group">
                    <input type="color" v-model="form.accentColor" class="color-picker" />
                    <input v-model="form.accentColor" type="text" placeholder="#0d9488" class="color-text" />
                  </div>
                </div>
              </div>

              <div class="field-group">
                <label>Date de publication</label>
                <input v-model="form.publishedAt" type="datetime-local" />
              </div>

              <div class="form-toggles">
                <label class="toggle-label">
                  <span>Opportunité active</span>
                  <div class="toggle-switch" @click="form.isActive = !form.isActive" :class="{ on: form.isActive }">
                    <div class="toggle-knob"></div>
                  </div>
                </label>
                <label class="toggle-label">
                  <span>Mettre à la une</span>
                  <div class="toggle-switch" @click="form.isFeatured = !form.isFeatured" :class="{ on: form.isFeatured }">
                    <div class="toggle-knob"></div>
                  </div>
                </label>
              </div>

              <div v-if="formError" class="form-error-banner">
                <i class="fas fa-exclamation-circle"></i> {{ formError }}
              </div>

              <div class="drawer-footer">
                <button type="button" @click="closeDrawer" class="btn-bo-secondary">Annuler</button>
                <button type="submit" class="btn-bo-primary" :disabled="isSaving">
                  <i class="fas" :class="isSaving ? 'fa-spinner fa-spin' : 'fa-save'"></i>
                  {{ isSaving ? 'Enregistrement...' : 'Enregistrer' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </transition>

    <!-- Delete Confirm Dialog -->
    <transition name="fade-scale">
      <div v-if="deleteConfirm.show" class="confirm-overlay" @click.self="deleteConfirm.show = false">
        <div class="confirm-dialog">
          <div class="confirm-icon danger"><i class="fas fa-exclamation-triangle"></i></div>
          <h4>Supprimer l'opportunité</h4>
          <p>Voulez-vous vraiment supprimer <strong>"{{ deleteConfirm.oppTitle }}"</strong> ? Cette action est irréversible.</p>
          <div class="confirm-actions">
            <button @click="deleteConfirm.show = false" class="btn-bo-secondary">Annuler</button>
            <button @click="executeDelete" class="btn-danger" :disabled="isSaving">
              <i class="fas" :class="isSaving ? 'fa-spinner fa-spin' : 'fa-trash-alt'"></i>
              {{ isSaving ? 'Suppression...' : 'Supprimer' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Toast -->
    <transition name="toast-slide">
      <div v-if="toast.show" :class="['toast-notification', 'toast-' + toast.type]">
        <i :class="['fas', toast.type === 'success' ? 'fa-check-circle' : 'fa-times-circle']"></i>
        {{ toast.message }}
      </div>
    </transition>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue';
import adminApi from '../../services/adminApi';

const CATEGORY_MAP = {
  ALL: { label: 'Toutes', icon: 'fas fa-th', value: 'ALL' },
  PUBLIC_MARKET: { label: 'Marchés Publics', icon: 'fas fa-gavel', value: 'PUBLIC_MARKET' },
  FORMATION: { label: 'Formations', icon: 'fas fa-graduation-cap', value: 'FORMATION' },
  PARTENARIAT: { label: 'Partenariats', icon: 'fas fa-handshake', value: 'PARTENARIAT' },
  APPEL_OFFRES: { label: 'Appels d\'Offres', icon: 'fas fa-file-contract', value: 'APPEL_OFFRES' },
  SUBVENTION: { label: 'Subventions', icon: 'fas fa-coins', value: 'SUBVENTION' },
  OTHER: { label: 'Autres', icon: 'fas fa-ellipsis-h', value: 'OTHER' }
};

const MOCK_OPPORTUNITIES = [
  {
    id: 'e4b6d41c-b715-4fa2-bf4f-8cf9e671d15c',
    category: 'PUBLIC_MARKET',
    title: 'Aménagement des espaces verts — Plateau',
    shortDescription: 'Marché de réhabilitation des jardins et espaces verts de la commune du Plateau.',
    description: 'Appel d\'offres ouvert pour la réhabilitation et l\'entretien des jardins publics.',
    organizer: 'Mairie du Plateau',
    location: 'Abidjan, Côte d\'Ivoire',
    amount: 25000000,
    deadline: '2026-08-30',
    ctaLabel: 'Postuler',
    ctaUrl: 'https://mairie-plateau.ci/marches',
    contactPhone: '+225 2720 00 00 00',
    contactEmail: 'marches@mairie-plateau.ci',
    imageUrl: '',
    icon: 'construct-outline',
    accentColor: '#0d9488',
    isFeatured: true,
    isActive: true,
    sortOrder: 1,
    publishedAt: '2026-06-23T09:00:00'
  },
  {
    id: 'f5c7e52d-c826-5gb3-cg5g-9dg0f782e26d',
    category: 'FORMATION',
    title: 'Masterclass Digitalisation PME',
    shortDescription: 'Formation intensive de 3 jours pour digitaliser vos ventes et opérations.',
    description: 'Formation organisée par Onda Academy pour accompagner les PME dans leur transformation numérique.',
    organizer: 'Onda Academy',
    location: 'En ligne (Zoom)',
    amount: 0,
    deadline: '2026-07-15',
    ctaLabel: 'S\'inscrire',
    ctaUrl: 'https://onda.ci/academy',
    contactPhone: '+225 0000000000',
    contactEmail: 'academy@onda.ci',
    imageUrl: '',
    icon: 'school-outline',
    accentColor: '#6366f1',
    isFeatured: false,
    isActive: true,
    sortOrder: 2,
    publishedAt: '2026-06-23T09:00:00'
  }
];

const emptyForm = () => ({
  category: '', title: '', shortDescription: '', description: '',
  organizer: '', location: '', targetSectors: '',
  amount: null, deadline: '',
  ctaLabel: '', ctaUrl: '',
  contactPhone: '', contactEmail: '',
  imageUrl: '', icon: '', accentColor: '#6366f1',
  isFeatured: false, isActive: true,
  sortOrder: 1, publishedAt: ''
});

export default {
  name: 'OpportunitiesManager',
  setup() {
    const opportunities = ref([]);
    const isLoading = ref(true);
    const isSaving = ref(false);
    const activeCategory = ref('ALL');
    const formError = ref('');

    const showDrawer = ref(false);
    const editingOpp = ref(null);
    const form = reactive(emptyForm());

    const deleteConfirm = reactive({ show: false, oppTitle: '', action: null });
    const toast = reactive({ show: false, message: '', type: 'success' });

    const categories = Object.values(CATEGORY_MAP);

    const filteredOpportunities = computed(() => {
      if (activeCategory.value === 'ALL') return opportunities.value;
      return opportunities.value.filter(o => o.category === activeCategory.value);
    });

    const countByCategory = (cat) => {
      if (cat === 'ALL') return opportunities.value.length;
      return opportunities.value.filter(o => o.category === cat).length;
    };

    const categoryLabel = (cat) => CATEGORY_MAP[cat]?.label || cat;

    const formatAmount = (val) => {
      if (!val) return '';
      return new Intl.NumberFormat('fr-CI', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(val);
    };

    const formatDeadline = (date) => {
      if (!date) return '—';
      const d = new Date(date);
      const now = new Date();
      const diffDays = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) return 'Expiré';
      if (diffDays === 0) return 'Aujourd\'hui';
      if (diffDays <= 7) return `J-${diffDays}`;
      return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const isUrgent = (date) => {
      if (!date) return false;
      const d = new Date(date);
      const now = new Date();
      return (d - now) / (1000 * 60 * 60 * 24) <= 7;
    };

    const showToast = (message, type = 'success') => {
      toast.message = message;
      toast.type = type;
      toast.show = true;
      setTimeout(() => { toast.show = false; }, 3500);
    };

    const fetchOpportunities = async () => {
      isLoading.value = true;
      try {
        const res = await adminApi.getOpportunities();
        opportunities.value = res.success ? res.data : MOCK_OPPORTUNITIES;
      } catch {
        opportunities.value = MOCK_OPPORTUNITIES;
      } finally {
        isLoading.value = false;
      }
    };

    const openDrawer = (opp) => {
      editingOpp.value = opp;
      Object.assign(form, emptyForm());
      formError.value = '';
      if (opp) {
        Object.assign(form, {
          category: opp.category, title: opp.title,
          shortDescription: opp.shortDescription || '',
          description: opp.description || '',
          organizer: opp.organizer || '', location: opp.location || '',
          targetSectors: opp.targetSectors || '',
          amount: opp.amount, deadline: opp.deadline || '',
          ctaLabel: opp.ctaLabel || '', ctaUrl: opp.ctaUrl || '',
          contactPhone: opp.contactPhone || '', contactEmail: opp.contactEmail || '',
          imageUrl: opp.imageUrl || '', icon: opp.icon || '',
          accentColor: opp.accentColor || '#6366f1',
          isFeatured: opp.isFeatured, isActive: opp.isActive,
          sortOrder: opp.sortOrder || 1,
          publishedAt: opp.publishedAt ? opp.publishedAt.replace('T', 'T').slice(0, 16) : ''
        });
      }
      showDrawer.value = true;
    };

    const closeDrawer = () => {
      showDrawer.value = false;
      editingOpp.value = null;
    };

    const saveOpportunity = async () => {
      isSaving.value = true;
      formError.value = '';
      const payload = { ...form };
      if (payload.publishedAt) payload.publishedAt = payload.publishedAt + ':00';

      try {
        let res;
        if (editingOpp.value) {
          res = await adminApi.updateOpportunity(editingOpp.value.id, payload);
        } else {
          res = await adminApi.createOpportunity(payload);
        }
        if (res.success) {
          await fetchOpportunities();
          closeDrawer();
          showToast(editingOpp.value ? 'Opportunité mise à jour.' : 'Opportunité créée avec succès.');
        } else {
          localSave(payload);
        }
      } catch {
        localSave(payload);
      } finally {
        isSaving.value = false;
      }
    };

    const localSave = (payload) => {
      if (editingOpp.value) {
        const idx = opportunities.value.findIndex(o => o.id === editingOpp.value.id);
        if (idx !== -1) opportunities.value[idx] = { ...opportunities.value[idx], ...payload };
        showToast('Opportunité mise à jour (local).');
      } else {
        opportunities.value.unshift({ id: crypto.randomUUID(), ...payload });
        showToast('Opportunité créée (local).');
      }
      closeDrawer();
    };

    const confirmDelete = (opp) => {
      deleteConfirm.oppTitle = opp.title;
      deleteConfirm.action = async () => {
        try {
          await adminApi.deleteOpportunity(opp.id);
        } catch { /* ignore */ }
        opportunities.value = opportunities.value.filter(o => o.id !== opp.id);
        showToast('Opportunité supprimée.');
      };
      deleteConfirm.show = true;
    };

    const executeDelete = async () => {
      isSaving.value = true;
      await deleteConfirm.action();
      deleteConfirm.show = false;
      isSaving.value = false;
    };

    onMounted(fetchOpportunities);

    return {
      opportunities, isLoading, isSaving, activeCategory,
      categories, filteredOpportunities, countByCategory, categoryLabel,
      showDrawer, editingOpp, form, formError,
      deleteConfirm, toast,
      openDrawer, closeDrawer, saveOpportunity, confirmDelete, executeDelete,
      formatAmount, formatDeadline, isUrgent
    };
  }
}
</script>

<style scoped>
.opp-manager-viewport {
  width: 100%;
  min-height: 100%;
  padding-bottom: 5rem;
}

.bo-page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

/* Filter Bar */
.filter-bar {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.filter-chip {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.6rem 1.1rem;
  border-radius: 99rem;
  background: white;
  border: 1.5px solid var(--border-subtle);
  color: var(--text-muted);
  font-size: 0.75rem; font-weight: 800;
  cursor: pointer; transition: all 0.2s;
  font-family: var(--font-heading);
}
.filter-chip:hover { border-color: var(--accent); color: var(--accent); }
.filter-chip.active { background: var(--accent); color: white; border-color: var(--accent); }

.chip-count {
  background: rgba(0,0,0,0.1);
  padding: 0.1rem 0.45rem;
  border-radius: 99rem;
  font-size: 0.65rem;
  font-weight: 900;
}
.filter-chip.active .chip-count { background: rgba(255,255,255,0.25); }

/* Loading */
.loading-state {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding: 6rem;
}
.spinner-elite {
  width: 48px; height: 48px;
  border: 4px solid var(--border-subtle);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Empty State */
.empty-state-premium {
  text-align: center; padding: 6rem 2rem;
  background: white; border-radius: 2rem;
  border: 2px dashed var(--border-strong);
}
.empty-icon { font-size: 3rem; color: var(--text-dim); margin-bottom: 1rem; }
.empty-state-premium h3 { font-size: 1.5rem; font-weight: 800; }
.empty-state-premium p { color: var(--text-muted); margin-top: 0.5rem; }

/* Opportunities Grid */
.opp-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 1.5rem;
}

.opp-card {
  background: white;
  border-radius: 1.5rem;
  border: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  display: flex; flex-direction: column;
  transition: all 0.35s var(--smooth);
}
.opp-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-premium);
}

.opp-accent-strip { height: 5px; width: 100%; flex-shrink: 0; }

.opp-card-body { padding: 1.75rem; display: flex; flex-direction: column; gap: 0.75rem; flex: 1; }

.opp-card-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; }
.opp-badges { display: flex; gap: 0.5rem; flex-wrap: wrap; }

.cat-badge {
  font-size: 0.6rem; font-weight: 900;
  padding: 0.3rem 0.7rem; border-radius: 0.5rem;
  text-transform: uppercase; letter-spacing: 0.05em;
}
.cat-public_market { background: #DBEAFE; color: #1D4ED8; }
.cat-formation { background: #EDE9FE; color: #5B21B6; }
.cat-partenariat { background: #D1FAE5; color: #065F46; }
.cat-appel_offres { background: #FEF3C7; color: #92400E; }
.cat-subvention { background: #FCE7F3; color: #9D174D; }
.cat-other { background: var(--bg-surface-dim); color: var(--text-muted); }

.featured-badge {
  background: linear-gradient(135deg, #F59E0B, #D97706);
  color: white;
  font-size: 0.6rem; font-weight: 900;
  padding: 0.3rem 0.7rem; border-radius: 0.5rem;
  display: flex; align-items: center; gap: 0.3rem;
}

.opp-card-actions { display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0; }

.status-badge {
  font-size: 0.6rem; font-weight: 900; padding: 0.25rem 0.65rem;
  border-radius: 99rem; text-transform: uppercase; letter-spacing: 0.05em;
}
.status-active { background: #DCFCE7; color: #166534; }
.status-inactive { background: #FEE2E2; color: #991B1B; }

.opp-title {
  font-size: 1rem; font-weight: 800;
  line-height: 1.4;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  overflow: hidden;
}
.opp-short-desc {
  font-size: 0.8rem; color: var(--text-muted); line-height: 1.5;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  overflow: hidden;
}

.opp-meta-row { display: flex; flex-direction: column; gap: 0.35rem; }
.meta-item {
  display: flex; align-items: center; gap: 0.5rem;
  font-size: 0.78rem; color: var(--text-dim); font-weight: 600;
}
.meta-item i { width: 14px; text-align: center; font-size: 0.7rem; color: var(--text-dim); }

.opp-footer {
  display: flex; justify-content: space-between; align-items: center;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-subtle);
  margin-top: auto;
}

.amount-val { font-size: 0.9rem; font-weight: 800; color: var(--text-main); }

.opp-deadline {
  display: flex; align-items: center; gap: 0.4rem;
  font-size: 0.75rem; font-weight: 700; color: var(--text-muted);
}
.deadline-urgent { color: #DC2626; }
.deadline-urgent i { animation: pulse 1.5s infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

.action-icon-btn {
  width: 32px; height: 32px; border-radius: 8px; border: none;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; font-size: 0.75rem; transition: all 0.2s;
}
.edit-btn { background: var(--bg-surface-dim); color: var(--text-muted); }
.edit-btn:hover { background: #DBEAFE; color: #1D4ED8; }
.delete-btn { background: var(--bg-surface-dim); color: var(--text-muted); }
.delete-btn:hover { background: #FEE2E2; color: var(--accent); }

/* ========================
   DRAWER
======================== */
.drawer-overlay {
  position: fixed; inset: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(8px);
  z-index: 5000;
  display: flex; align-items: stretch; justify-content: flex-end;
}
.drawer-panel {
  width: 600px; max-width: 90vw;
  background: white;
  display: flex; flex-direction: column;
  box-shadow: -20px 0 60px rgba(15, 23, 42, 0.2);
  overflow: hidden;
}

.drawer-header {
  padding: 2rem 2.5rem 1.5rem;
  border-bottom: 1px solid var(--border-subtle);
  display: flex; justify-content: space-between; align-items: center;
  flex-shrink: 0;
}
.drawer-header h3 { font-size: 1.25rem; font-weight: 800; }
.drawer-close-btn {
  width: 36px; height: 36px; border-radius: 10px;
  background: var(--bg-surface-dim); border: none;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--text-muted); font-size: 1rem; transition: all 0.2s;
}
.drawer-close-btn:hover { background: #FEE2E2; color: var(--accent); transform: rotate(90deg); }

.drawer-body {
  flex: 1; overflow-y: auto;
  padding: 2rem 2.5rem;
}

.form-elite { display: flex; flex-direction: column; gap: 1.25rem; }
.form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

.field-group { display: flex; flex-direction: column; gap: 0.5rem; }
.field-group label { font-size: 0.75rem; font-weight: 800; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.05em; }
.field-group input, .field-group textarea, .field-group select {
  background: var(--bg-surface-dim);
  border: 1.5px solid var(--border-subtle);
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  font-size: 0.9rem; font-weight: 600;
  color: var(--text-main); transition: border-color 0.2s;
  font-family: var(--font-heading); width: 100%;
}
.field-group input:focus, .field-group textarea:focus, .field-group select:focus {
  outline: none; border-color: var(--accent); background: white;
}
.field-group textarea { resize: vertical; min-height: 80px; }
.required { color: var(--accent); }

.color-input-group { display: flex; gap: 0.75rem; align-items: center; }
.color-picker { width: 48px; height: 44px; border-radius: 0.75rem; border: 1.5px solid var(--border-subtle); padding: 2px; cursor: pointer; flex-shrink: 0; }
.color-text { flex: 1; }

.form-toggles { display: flex; flex-direction: column; gap: 1rem; padding: 1rem; background: var(--bg-surface-dim); border-radius: 1rem; }
.toggle-label { display: flex; justify-content: space-between; align-items: center; cursor: pointer; }
.toggle-label > span { font-size: 0.85rem; font-weight: 700; color: var(--text-main); }
.toggle-switch {
  width: 48px; height: 26px; background: var(--border-strong);
  border-radius: 99px; position: relative; transition: background 0.3s; flex-shrink: 0;
}
.toggle-switch.on { background: #10B981; }
.toggle-knob {
  position: absolute; width: 20px; height: 20px;
  background: white; border-radius: 50%; top: 3px; left: 3px;
  transition: transform 0.3s; box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}
.toggle-switch.on .toggle-knob { transform: translateX(22px); }

.form-error-banner {
  background: #FEE2E2; color: #991B1B;
  padding: 0.75rem 1rem; border-radius: 0.75rem;
  font-size: 0.85rem; font-weight: 700;
  display: flex; align-items: center; gap: 0.5rem;
}

.drawer-footer {
  display: flex; gap: 1rem; justify-content: flex-end;
  padding-top: 1.5rem; border-top: 1px solid var(--border-subtle);
  margin-top: 0.5rem;
}

/* Buttons */
.btn-bo-primary {
  background: var(--accent); color: white;
  padding: 0.875rem 1.75rem; border-radius: 1rem; border: none;
  font-weight: 900; font-size: 0.85rem; letter-spacing: 0.05em;
  cursor: pointer; display: flex; align-items: center; gap: 0.75rem;
  box-shadow: 0 8px 20px -5px rgba(244, 63, 94, 0.4);
  transition: all 0.3s; font-family: var(--font-heading);
}
.btn-bo-primary:hover:not(:disabled) { transform: scale(1.03); background: #E11D48; }
.btn-bo-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-bo-secondary {
  background: var(--bg-surface-dim); color: var(--text-muted);
  padding: 0.875rem 1.75rem; border-radius: 1rem;
  border: 1px solid var(--border-strong); font-weight: 900;
  font-size: 0.85rem; cursor: pointer; display: flex;
  align-items: center; gap: 0.75rem; transition: all 0.3s;
  font-family: var(--font-heading);
}
.btn-bo-secondary:hover { background: white; color: var(--text-main); }

.btn-danger {
  background: #DC2626; color: white;
  padding: 0.875rem 1.75rem; border-radius: 1rem; border: none;
  font-weight: 900; font-size: 0.85rem; cursor: pointer;
  display: flex; align-items: center; gap: 0.75rem;
  transition: all 0.3s; font-family: var(--font-heading);
}
.btn-danger:hover:not(:disabled) { background: #B91C1C; }
.btn-danger:disabled { opacity: 0.6; cursor: not-allowed; }

/* Confirm Dialog */
.confirm-overlay {
  position: fixed; inset: 0;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(8px);
  z-index: 6000;
  display: flex; align-items: center; justify-content: center; padding: 2rem;
}
.confirm-dialog {
  background: white; border-radius: 2rem;
  padding: 3rem; max-width: 440px; width: 100%;
  text-align: center;
  box-shadow: 0 40px 80px -20px rgba(15, 23, 42, 0.3);
}
.confirm-icon {
  width: 72px; height: 72px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.75rem; margin: 0 auto 1.5rem;
}
.confirm-icon.danger { background: #FEE2E2; color: #DC2626; }
.confirm-dialog h4 { font-size: 1.25rem; font-weight: 800; margin-bottom: 0.75rem; }
.confirm-dialog p { color: var(--text-muted); font-size: 0.9rem; line-height: 1.6; margin-bottom: 2rem; }
.confirm-actions { display: flex; gap: 1rem; justify-content: center; }

/* Toast */
.toast-notification {
  position: fixed; bottom: 2rem; right: 2rem;
  padding: 1rem 1.5rem; border-radius: 1rem;
  font-weight: 700; font-size: 0.9rem;
  display: flex; align-items: center; gap: 0.75rem;
  z-index: 9000; box-shadow: 0 20px 40px -10px rgba(0,0,0,0.2);
}
.toast-success { background: #065F46; color: white; }
.toast-error { background: #991B1B; color: white; }

/* Transitions */
.drawer-enter-active { animation: drawerIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); }
.drawer-leave-active { animation: drawerOut 0.25s ease-in; }
@keyframes drawerIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
@keyframes drawerOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }

.fade-scale-enter-active { animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.fade-scale-leave-active { animation: scaleOut 0.2s ease-in; }
@keyframes scaleIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
@keyframes scaleOut { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.8); } }

.toast-slide-enter-active { animation: toastIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
.toast-slide-leave-active { animation: toastOut 0.3s ease-in; }
@keyframes toastIn { from { opacity: 0; transform: translateY(20px) scale(0.9); } to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes toastOut { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(10px); } }

@media (max-width: 1200px) {
  .opp-grid { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 768px) {
  .opp-grid { grid-template-columns: 1fr; }
  .form-grid-2 { grid-template-columns: 1fr; }
  .drawer-panel { width: 100%; max-width: 100%; }
}
</style>
