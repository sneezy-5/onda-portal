<template>
  <div class="banks-manager-viewport reveal">
    <!-- Page Header -->
    <div class="bo-page-header mb-10">
      <div class="header-left">
        <h2 class="text-4xl font-black tracking-tight">Offres <span class="text-accent">Bancaires</span></h2>
        <p class="text-muted mt-2">Gestion des établissements partenaires et de leurs produits financiers.</p>
      </div>
      <button @click="openBankDrawer(null)" class="btn-bo-primary">
        <i class="fas fa-plus"></i> Nouvel Établissement
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner-elite"></div>
      <p class="text-muted mt-4">Chargement des établissements...</p>
    </div>

    <!-- Banks Table -->
    <div v-else class="banks-table-wrapper">
      <div v-if="banks.length === 0" class="empty-state-premium">
        <div class="empty-icon"><i class="fas fa-university"></i></div>
        <h3>Aucun établissement</h3>
        <p>Ajoutez votre premier partenaire bancaire pour commencer.</p>
        <button @click="openBankDrawer(null)" class="btn-bo-primary mt-6">
          <i class="fas fa-plus"></i> Créer un établissement
        </button>
      </div>

      <div v-else class="banks-list">
        <div v-for="bank in banks" :key="bank.id" class="bank-card-row">
          <!-- Bank Row Header -->
          <div class="bank-row-main">
            <div class="bank-identity">
              <div class="bank-color-dot" :style="{ background: bank.primaryColor || '#ccc' }"></div>
              <div class="bank-logo-box">
                <img v-if="bank.logoUrl" :src="bank.logoUrl" :alt="bank.name" />
                <i v-else class="fas fa-university"></i>
              </div>
              <div class="bank-info">
                <h4 class="bank-name">{{ bank.name }}</h4>
                <div class="bank-meta">
                  <span class="meta-chip">{{ bank.slug }}</span>
                  <span class="meta-chip">{{ bank.country }}</span>
                  <span class="meta-chip-products">
                    <i class="fas fa-cube"></i> {{ bank.products?.length || 0 }} produit(s)
                  </span>
                </div>
              </div>
            </div>

            <div class="bank-row-actions">
              <div :class="['status-badge', bank.isActive ? 'status-active' : 'status-inactive']">
                {{ bank.isActive ? 'Actif' : 'Inactif' }}
              </div>
              <button @click="toggleExpand(bank.id)" class="expand-btn" :class="{ 'expanded': expandedBankId === bank.id }">
                <i class="fas fa-chevron-down"></i>
              </button>
              <button @click="openBankDrawer(bank)" class="action-icon-btn edit-btn" title="Modifier">
                <i class="fas fa-pen"></i>
              </button>
              <button @click="confirmDeleteBank(bank)" class="action-icon-btn delete-btn" title="Supprimer">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </div>

          <!-- Expandable Products Section -->
          <div v-if="expandedBankId === bank.id" class="products-panel">
            <div class="products-panel-header">
              <h5><i class="fas fa-layer-group"></i> Produits de {{ bank.name }}</h5>
              <button @click="openProductDrawer(bank, null)" class="btn-add-product">
                <i class="fas fa-plus"></i> Ajouter un produit
              </button>
            </div>

            <div v-if="!bank.products || bank.products.length === 0" class="products-empty">
              <i class="fas fa-inbox opacity-30"></i>
              <span>Aucun produit financier pour cet établissement.</span>
            </div>

            <div v-else class="products-table">
              <div v-for="product in bank.products" :key="product.id" class="product-row">
                <div class="product-type-badge" :class="'type-' + product.productType?.toLowerCase()">
                  {{ product.productType }}
                </div>
                <div class="product-main-info">
                  <span class="product-title">{{ product.title }}</span>
                  <span class="product-desc">{{ product.description }}</span>
                </div>
                <div class="product-financials">
                  <div class="fin-pill">
                    <label>Taux</label>
                    <span>{{ product.indicativeRateMin }}% – {{ product.indicativeRateMax }}%</span>
                  </div>
                  <div class="fin-pill">
                    <label>Montant max</label>
                    <span>{{ formatAmount(product.maxAmount) }}</span>
                  </div>
                  <div class="fin-pill">
                    <label>Durée</label>
                    <span>{{ product.durationMonthsMin }}–{{ product.durationMonthsMax }} mois</span>
                  </div>
                </div>
                <div class="product-actions">
                  <button @click="openProductDrawer(bank, product)" class="action-icon-btn edit-btn" title="Modifier">
                    <i class="fas fa-pen"></i>
                  </button>
                  <button @click="confirmDeleteProduct(bank, product)" class="action-icon-btn delete-btn" title="Supprimer">
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================
         BANK SLIDE-OVER DRAWER
         ============================ -->
    <transition name="drawer">
      <div v-if="showBankDrawer" class="drawer-overlay" @click.self="closeDrawer">
        <div class="drawer-panel">
          <div class="drawer-header">
            <h3>{{ editingBank ? 'Modifier l\'établissement' : 'Nouvel établissement' }}</h3>
            <button @click="closeDrawer" class="drawer-close-btn"><i class="fas fa-times"></i></button>
          </div>

          <div class="drawer-body">
            <form @submit.prevent="saveBank" class="form-elite">
              <div class="form-grid-2">
                <div class="field-group">
                  <label>Slug <span class="required">*</span></label>
                  <input v-model="bankForm.slug" type="text" placeholder="ex: sgci" required />
                </div>
                <div class="field-group">
                  <label>Pays <span class="required">*</span></label>
                  <input v-model="bankForm.country" type="text" placeholder="CI" maxlength="2" required />
                </div>
              </div>

              <div class="field-group">
                <label>Nom de l'établissement <span class="required">*</span></label>
                <input v-model="bankForm.name" type="text" placeholder="ex: Société Générale CI" required />
              </div>

              <div class="field-group">
                <label>Accroche courte</label>
                <input v-model="bankForm.shortPitch" type="text" placeholder="ex: Le partenaire historique des PME" />
              </div>

              <div class="field-group">
                <label>Description complète</label>
                <textarea v-model="bankForm.description" rows="4" placeholder="Description détaillée de l'établissement..."></textarea>
              </div>

              <div class="field-group">
                <label>URL du logo</label>
                <input v-model="bankForm.logoUrl" type="text" placeholder="/images/bank-logo.png" />
              </div>

              <div class="form-grid-2">
                <div class="field-group">
                  <label>Couleur principale</label>
                  <div class="color-input-group">
                    <input type="color" v-model="bankForm.primaryColor" class="color-picker" />
                    <input v-model="bankForm.primaryColor" type="text" placeholder="#e03131" class="color-text" />
                  </div>
                </div>
                <div class="field-group">
                  <label>Ordre d'affichage</label>
                  <input v-model.number="bankForm.sortOrder" type="number" min="0" placeholder="1" />
                </div>
              </div>

              <div class="form-grid-2">
                <div class="field-group">
                  <label>Site web</label>
                  <input v-model="bankForm.website" type="url" placeholder="https://..." />
                </div>
                <div class="field-group">
                  <label>Téléphone</label>
                  <input v-model="bankForm.phone" type="text" placeholder="+225..." />
                </div>
              </div>

              <div class="field-group">
                <label class="toggle-label">
                  <span>Établissement actif</span>
                  <div class="toggle-switch" @click="bankForm.isActive = !bankForm.isActive" :class="{ on: bankForm.isActive }">
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

    <!-- ============================
         PRODUCT SLIDE-OVER DRAWER
         ============================ -->
    <transition name="drawer">
      <div v-if="showProductDrawer" class="drawer-overlay" @click.self="closeProductDrawer">
        <div class="drawer-panel drawer-panel-wide">
          <div class="drawer-header">
            <div>
              <h3>{{ editingProduct ? 'Modifier le produit' : 'Nouveau produit' }}</h3>
              <p class="drawer-sub">{{ productTargetBank?.name }}</p>
            </div>
            <button @click="closeProductDrawer" class="drawer-close-btn"><i class="fas fa-times"></i></button>
          </div>

          <div class="drawer-body">
            <form @submit.prevent="saveProduct" class="form-elite">
              <div class="form-grid-2">
                <div class="field-group">
                  <label>Type de produit <span class="required">*</span></label>
                  <select v-model="productForm.productType" required>
                    <option value="">-- Sélectionner --</option>
                    <option value="LOAN">LOAN — Crédit</option>
                    <option value="LEASING">LEASING — Crédit-bail</option>
                    <option value="GUARANTEE">GUARANTEE — Garantie</option>
                    <option value="SAVINGS">SAVINGS — Épargne</option>
                    <option value="INSURANCE">INSURANCE — Assurance</option>
                    <option value="OTHER">OTHER — Autre</option>
                  </select>
                </div>
                <div class="field-group">
                  <label>Score minimum requis</label>
                  <input v-model.number="productForm.minScoreRequired" type="number" min="0" placeholder="500" />
                </div>
              </div>

              <div class="field-group">
                <label>Titre du produit <span class="required">*</span></label>
                <input v-model="productForm.title" type="text" placeholder="ex: Crédit Court Terme Trésorerie" required />
              </div>

              <div class="field-group">
                <label>Description</label>
                <textarea v-model="productForm.description" rows="3" placeholder="Financer vos besoins de fonds de roulement..."></textarea>
              </div>

              <div class="form-grid-2">
                <div class="field-group">
                  <label>Taux indicatif min (%)</label>
                  <input v-model.number="productForm.indicativeRateMin" type="number" step="0.01" placeholder="7.50" />
                </div>
                <div class="field-group">
                  <label>Taux indicatif max (%)</label>
                  <input v-model.number="productForm.indicativeRateMax" type="number" step="0.01" placeholder="9.00" />
                </div>
              </div>

              <div class="form-grid-2">
                <div class="field-group">
                  <label>Durée min (mois)</label>
                  <input v-model.number="productForm.durationMonthsMin" type="number" min="1" placeholder="3" />
                </div>
                <div class="field-group">
                  <label>Durée max (mois)</label>
                  <input v-model.number="productForm.durationMonthsMax" type="number" min="1" placeholder="12" />
                </div>
              </div>

              <div class="field-group">
                <label>Montant maximum (XOF)</label>
                <input v-model.number="productForm.maxAmount" type="number" min="0" step="1000" placeholder="15000000" />
              </div>

              <div class="form-grid-2">
                <div class="field-group">
                  <label>Libellé du CTA</label>
                  <input v-model="productForm.ctaLabel" type="text" placeholder="Demander ce crédit" />
                </div>
                <div class="field-group">
                  <label>URL du CTA</label>
                  <input v-model="productForm.ctaUrl" type="url" placeholder="https://..." />
                </div>
              </div>

              <div class="form-grid-2">
                <div class="field-group">
                  <label>Icône (Ionic)</label>
                  <input v-model="productForm.icon" type="text" placeholder="cash-outline" />
                </div>
                <div class="field-group">
                  <label>Valable jusqu'au</label>
                  <input v-model="productForm.validUntil" type="date" />
                </div>
              </div>

              <div class="form-grid-2">
                <div class="field-group">
                  <label>Ordre d'affichage</label>
                  <input v-model.number="productForm.sortOrder" type="number" min="0" placeholder="1" />
                </div>
                <div class="field-group" style="display:flex; align-items:center; padding-top:1.5rem;">
                  <label class="toggle-label">
                    <span>Produit actif</span>
                    <div class="toggle-switch ml-4" @click="productForm.isActive = !productForm.isActive" :class="{ on: productForm.isActive }">
                      <div class="toggle-knob"></div>
                    </div>
                  </label>
                </div>
              </div>

              <div v-if="formError" class="form-error-banner">
                <i class="fas fa-exclamation-circle"></i> {{ formError }}
              </div>

              <div class="drawer-footer">
                <button type="button" @click="closeProductDrawer" class="btn-bo-secondary">Annuler</button>
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
          <h4>{{ deleteConfirm.title }}</h4>
          <p>{{ deleteConfirm.message }}</p>
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

    <!-- Toast Notification -->
    <transition name="toast-slide">
      <div v-if="toast.show" :class="['toast-notification', 'toast-' + toast.type]">
        <i :class="['fas', toast.type === 'success' ? 'fa-check-circle' : 'fa-times-circle']"></i>
        {{ toast.message }}
      </div>
    </transition>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import adminApi from '../../services/adminApi';

const MOCK_BANKS = [
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    slug: 'sgci',
    name: 'Société Générale CI',
    shortPitch: 'Le partenaire historique des PME',
    description: 'Banque de référence en Côte d\'Ivoire depuis plus de 50 ans.',
    logoUrl: '',
    primaryColor: '#e03131',
    country: 'CI',
    website: 'https://societegenerale.ci',
    phone: '+225 2720 25 00 00',
    isActive: true,
    sortOrder: 1,
    products: [
      {
        id: 'prod-1',
        productType: 'LOAN',
        title: 'Crédit Court Terme Trésorerie',
        description: 'Financer vos besoins de fonds de roulement instantanément.',
        minScoreRequired: 500,
        maxAmount: 15000000,
        indicativeRateMin: 7.5,
        indicativeRateMax: 9.0,
        durationMonthsMin: 3,
        durationMonthsMax: 12,
        ctaLabel: 'Demander ce crédit',
        ctaUrl: 'https://societegenerale.ci/credit',
        icon: 'cash-outline',
        isActive: true,
        sortOrder: 1,
        validUntil: '2027-12-31'
      }
    ]
  },
  {
    id: 'b1eebc88-9c0b-4ef8-bb6d-7cc0bd380b22',
    slug: 'ecobank-ci',
    name: 'Ecobank Côte d\'Ivoire',
    shortPitch: 'La banque panafricaine',
    description: 'Présente dans 36 pays africains, Ecobank accompagne les PME dans leur croissance.',
    logoUrl: '',
    primaryColor: '#005b82',
    country: 'CI',
    website: 'https://ecobank.com',
    phone: '+225 2720 31 15 00',
    isActive: true,
    sortOrder: 2,
    products: []
  }
];

export default {
  name: 'BanksManager',
  setup() {
    const banks = ref([]);
    const isLoading = ref(true);
    const isSaving = ref(false);
    const expandedBankId = ref(null);
    const formError = ref('');

    // Bank drawer state
    const showBankDrawer = ref(false);
    const editingBank = ref(null);
    const bankForm = reactive({
      slug: '', name: '', shortPitch: '', description: '',
      logoUrl: '', primaryColor: '#3b82f6', country: 'CI',
      website: '', phone: '', isActive: true, sortOrder: 1
    });

    // Product drawer state
    const showProductDrawer = ref(false);
    const editingProduct = ref(null);
    const productTargetBank = ref(null);
    const productForm = reactive({
      productType: '', title: '', description: '',
      minScoreRequired: null, maxAmount: null,
      indicativeRateMin: null, indicativeRateMax: null,
      durationMonthsMin: null, durationMonthsMax: null,
      ctaLabel: '', ctaUrl: '', icon: '', isActive: true,
      sortOrder: 1, validUntil: ''
    });

    // Delete confirm
    const deleteConfirm = reactive({
      show: false, title: '', message: '',
      action: null
    });

    // Toast
    const toast = reactive({ show: false, message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
      toast.message = message;
      toast.type = type;
      toast.show = true;
      setTimeout(() => { toast.show = false; }, 3500);
    };

    const formatAmount = (val) => {
      if (!val) return '—';
      return new Intl.NumberFormat('fr-CI', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(val);
    };

    const fetchBanks = async () => {
      isLoading.value = true;
      try {
        const res = await adminApi.getBanks();
        if (res.success) {
          banks.value = res.data;
        } else {
          banks.value = MOCK_BANKS;
        }
      } catch {
        banks.value = MOCK_BANKS;
      } finally {
        isLoading.value = false;
      }
    };

    const toggleExpand = (id) => {
      expandedBankId.value = expandedBankId.value === id ? null : id;
    };

    // ---- Bank Drawer ----
    const resetBankForm = () => {
      Object.assign(bankForm, {
        slug: '', name: '', shortPitch: '', description: '',
        logoUrl: '', primaryColor: '#3b82f6', country: 'CI',
        website: '', phone: '', isActive: true, sortOrder: 1
      });
      formError.value = '';
    };

    const openBankDrawer = (bank) => {
      editingBank.value = bank;
      resetBankForm();
      if (bank) {
        Object.assign(bankForm, {
          slug: bank.slug, name: bank.name, shortPitch: bank.shortPitch || '',
          description: bank.description || '', logoUrl: bank.logoUrl || '',
          primaryColor: bank.primaryColor || '#3b82f6', country: bank.country || 'CI',
          website: bank.website || '', phone: bank.phone || '',
          isActive: bank.isActive, sortOrder: bank.sortOrder || 1
        });
      }
      showBankDrawer.value = true;
    };

    const closeDrawer = () => {
      showBankDrawer.value = false;
      editingBank.value = null;
    };

    const saveBank = async () => {
      isSaving.value = true;
      formError.value = '';
      try {
        let res;
        if (editingBank.value) {
          res = await adminApi.updateBank(editingBank.value.id, { ...bankForm });
        } else {
          res = await adminApi.createBank({ ...bankForm });
        }
        if (res.success) {
          await fetchBanks();
          closeDrawer();
          showToast(editingBank.value ? 'Établissement mis à jour.' : 'Établissement créé avec succès.');
        } else {
          // Mock fallback: update local state
          if (editingBank.value) {
            const idx = banks.value.findIndex(b => b.id === editingBank.value.id);
            if (idx !== -1) banks.value[idx] = { ...banks.value[idx], ...bankForm };
          } else {
            banks.value.push({ id: crypto.randomUUID(), ...bankForm, products: [] });
          }
          closeDrawer();
          showToast(editingBank.value ? 'Établissement mis à jour (local).' : 'Établissement créé (local).');
        }
      } catch {
        // Optimistic local update
        if (editingBank.value) {
          const idx = banks.value.findIndex(b => b.id === editingBank.value.id);
          if (idx !== -1) banks.value[idx] = { ...banks.value[idx], ...bankForm };
        } else {
          banks.value.push({ id: crypto.randomUUID(), ...bankForm, products: [] });
        }
        closeDrawer();
        showToast(editingBank.value ? 'Établissement mis à jour (hors ligne).' : 'Établissement créé (hors ligne).');
      } finally {
        isSaving.value = false;
      }
    };

    // ---- Delete Bank ----
    const confirmDeleteBank = (bank) => {
      deleteConfirm.title = 'Supprimer l\'établissement';
      deleteConfirm.message = `Voulez-vous vraiment supprimer "${bank.name}" et tous ses produits ? Cette action est irréversible.`;
      deleteConfirm.action = async () => {
        try {
          await adminApi.deleteBank(bank.id);
        } catch { /* ignore */ }
        banks.value = banks.value.filter(b => b.id !== bank.id);
        showToast('Établissement supprimé.');
      };
      deleteConfirm.show = true;
    };

    // ---- Product Drawer ----
    const resetProductForm = () => {
      Object.assign(productForm, {
        productType: '', title: '', description: '',
        minScoreRequired: null, maxAmount: null,
        indicativeRateMin: null, indicativeRateMax: null,
        durationMonthsMin: null, durationMonthsMax: null,
        ctaLabel: '', ctaUrl: '', icon: '', isActive: true,
        sortOrder: 1, validUntil: ''
      });
      formError.value = '';
    };

    const openProductDrawer = (bank, product) => {
      productTargetBank.value = bank;
      editingProduct.value = product;
      resetProductForm();
      if (product) {
        Object.assign(productForm, {
          productType: product.productType, title: product.title,
          description: product.description || '',
          minScoreRequired: product.minScoreRequired,
          maxAmount: product.maxAmount,
          indicativeRateMin: product.indicativeRateMin,
          indicativeRateMax: product.indicativeRateMax,
          durationMonthsMin: product.durationMonthsMin,
          durationMonthsMax: product.durationMonthsMax,
          ctaLabel: product.ctaLabel || '', ctaUrl: product.ctaUrl || '',
          icon: product.icon || '', isActive: product.isActive,
          sortOrder: product.sortOrder || 1,
          validUntil: product.validUntil || ''
        });
      }
      showProductDrawer.value = true;
    };

    const closeProductDrawer = () => {
      showProductDrawer.value = false;
      editingProduct.value = null;
      productTargetBank.value = null;
    };

    const saveProduct = async () => {
      isSaving.value = true;
      formError.value = '';
      const bankId = productTargetBank.value.id;
      const payload = { ...productForm };
      const bank = banks.value.find(b => b.id === bankId);

      try {
        let res;
        if (editingProduct.value) {
          res = await adminApi.updateBankProduct(bankId, editingProduct.value.id, payload);
        } else {
          res = await adminApi.createBankProduct(bankId, payload);
        }
        if (res.success) {
          await fetchBanks();
          closeProductDrawer();
          showToast(editingProduct.value ? 'Produit mis à jour.' : 'Produit ajouté.');
        } else {
          localSaveProduct(bank, payload);
        }
      } catch {
        localSaveProduct(bank, payload);
      } finally {
        isSaving.value = false;
      }
    };

    const localSaveProduct = (bank, payload) => {
      if (!bank.products) bank.products = [];
      if (editingProduct.value) {
        const idx = bank.products.findIndex(p => p.id === editingProduct.value.id);
        if (idx !== -1) bank.products[idx] = { ...bank.products[idx], ...payload };
      } else {
        bank.products.push({ id: crypto.randomUUID(), ...payload });
      }
      closeProductDrawer();
      showToast(editingProduct.value ? 'Produit mis à jour (local).' : 'Produit ajouté (local).');
    };

    // ---- Delete Product ----
    const confirmDeleteProduct = (bank, product) => {
      deleteConfirm.title = 'Supprimer le produit';
      deleteConfirm.message = `Voulez-vous vraiment supprimer "${product.title}" ?`;
      deleteConfirm.action = async () => {
        try {
          await adminApi.deleteBankProduct(bank.id, product.id);
        } catch { /* ignore */ }
        bank.products = bank.products.filter(p => p.id !== product.id);
        showToast('Produit supprimé.');
      };
      deleteConfirm.show = true;
    };

    const executeDelete = async () => {
      isSaving.value = true;
      await deleteConfirm.action();
      deleteConfirm.show = false;
      isSaving.value = false;
    };

    onMounted(fetchBanks);

    return {
      banks, isLoading, isSaving, expandedBankId, formError,
      showBankDrawer, editingBank, bankForm,
      showProductDrawer, editingProduct, productTargetBank, productForm,
      deleteConfirm, toast,
      toggleExpand, openBankDrawer, closeDrawer, saveBank, confirmDeleteBank,
      openProductDrawer, closeProductDrawer, saveProduct, confirmDeleteProduct,
      executeDelete, formatAmount
    };
  }
}
</script>

<style scoped>
.banks-manager-viewport {
  width: 100%;
  min-height: 100%;
  padding-bottom: 5rem;
}

.bo-page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6rem;
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
  text-align: center;
  padding: 6rem 2rem;
  background: white;
  border-radius: 2rem;
  border: 2px dashed var(--border-strong);
}
.empty-icon {
  font-size: 3rem;
  color: var(--text-dim);
  margin-bottom: 1rem;
}
.empty-state-premium h3 { font-size: 1.5rem; font-weight: 800; }
.empty-state-premium p { color: var(--text-muted); margin-top: 0.5rem; }

/* Banks List */
.banks-list { display: flex; flex-direction: column; gap: 1.25rem; }

.bank-card-row {
  background: white;
  border-radius: 1.5rem;
  border: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: box-shadow 0.3s;
}
.bank-card-row:hover { box-shadow: var(--shadow-premium); }

.bank-row-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  gap: 1.5rem;
}

.bank-identity { display: flex; align-items: center; gap: 1.25rem; flex: 1; min-width: 0; }

.bank-color-dot {
  width: 10px; height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.bank-logo-box {
  width: 52px; height: 52px;
  background: var(--bg-surface-dim);
  border-radius: 1rem;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden; flex-shrink: 0;
  border: 1px solid var(--border-subtle);
  font-size: 1.25rem; color: var(--text-dim);
}
.bank-logo-box img { width: 100%; height: 100%; object-fit: contain; padding: 4px; }

.bank-info { min-width: 0; }
.bank-name { font-size: 1.1rem; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.bank-meta { display: flex; gap: 0.5rem; margin-top: 0.4rem; flex-wrap: wrap; }

.meta-chip {
  background: var(--bg-surface-dim);
  color: var(--text-muted);
  font-size: 0.65rem; font-weight: 800;
  padding: 0.2rem 0.6rem; border-radius: 99rem;
  text-transform: uppercase; letter-spacing: 0.05em;
}

.meta-chip-products {
  background: #EEF2FF;
  color: #4F46E5;
  font-size: 0.65rem; font-weight: 800;
  padding: 0.2rem 0.6rem; border-radius: 99rem;
  display: flex; align-items: center; gap: 0.3rem;
}

.bank-row-actions { display: flex; align-items: center; gap: 0.75rem; flex-shrink: 0; }

.status-badge {
  font-size: 0.65rem; font-weight: 900; padding: 0.3rem 0.8rem;
  border-radius: 99rem; text-transform: uppercase; letter-spacing: 0.05em;
}
.status-active { background: #DCFCE7; color: #166534; }
.status-inactive { background: #FEE2E2; color: #991B1B; }

.action-icon-btn {
  width: 36px; height: 36px; border-radius: 10px; border: none;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; font-size: 0.85rem; transition: all 0.2s;
}
.edit-btn { background: var(--bg-surface-dim); color: var(--text-muted); }
.edit-btn:hover { background: #DBEAFE; color: #1D4ED8; }
.delete-btn { background: var(--bg-surface-dim); color: var(--text-muted); }
.delete-btn:hover { background: #FEE2E2; color: var(--accent); }

.expand-btn {
  width: 36px; height: 36px; border-radius: 10px;
  background: var(--bg-surface-dim); border: none;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--text-muted); transition: all 0.3s;
}
.expand-btn.expanded { background: #EEF2FF; color: #4F46E5; }
.expand-btn i { transition: transform 0.3s; }
.expand-btn.expanded i { transform: rotate(180deg); }

/* Products Panel */
.products-panel {
  border-top: 1px solid var(--border-subtle);
  background: #F8FAFC;
  padding: 1.5rem 2rem 2rem;
  animation: slideDown 0.3s ease-out;
}
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

.products-panel-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 1.25rem;
}
.products-panel-header h5 {
  font-size: 0.85rem; font-weight: 800; color: var(--text-main);
  display: flex; align-items: center; gap: 0.5rem;
}

.btn-add-product {
  background: white; border: 1.5px solid var(--border-strong);
  color: var(--text-muted); font-size: 0.75rem; font-weight: 800;
  padding: 0.5rem 1rem; border-radius: 0.75rem; cursor: pointer;
  display: flex; align-items: center; gap: 0.5rem; transition: all 0.2s;
}
.btn-add-product:hover { background: var(--accent); color: white; border-color: var(--accent); }

.products-empty {
  display: flex; align-items: center; justify-content: center;
  gap: 1rem; padding: 2rem; color: var(--text-dim);
  font-size: 0.9rem; font-weight: 600;
}

.products-table { display: flex; flex-direction: column; gap: 0.75rem; }

.product-row {
  background: white; border-radius: 1rem; padding: 1rem 1.5rem;
  display: flex; align-items: center; gap: 1.25rem;
  border: 1px solid var(--border-subtle); transition: all 0.2s;
}
.product-row:hover { box-shadow: var(--shadow-sm); }

.product-type-badge {
  font-size: 0.6rem; font-weight: 900; padding: 0.3rem 0.7rem;
  border-radius: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em;
  flex-shrink: 0;
}
.type-loan { background: #DBEAFE; color: #1D4ED8; }
.type-leasing { background: #FCE7F3; color: #9D174D; }
.type-guarantee { background: #D1FAE5; color: #065F46; }
.type-savings { background: #FEF3C7; color: #92400E; }
.type-insurance { background: #EDE9FE; color: #5B21B6; }
.type-other { background: var(--bg-surface-dim); color: var(--text-muted); }

.product-main-info { flex: 1; min-width: 0; }
.product-title { display: block; font-weight: 700; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.product-desc { display: block; font-size: 0.75rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.product-financials { display: flex; gap: 1.5rem; flex-shrink: 0; }
.fin-pill { display: flex; flex-direction: column; gap: 0.15rem; }
.fin-pill label { font-size: 0.6rem; font-weight: 900; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.05em; }
.fin-pill span { font-size: 0.8rem; font-weight: 700; }

.product-actions { display: flex; gap: 0.5rem; flex-shrink: 0; }

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
  width: 520px; max-width: 90vw;
  background: white;
  display: flex; flex-direction: column;
  box-shadow: -20px 0 60px rgba(15, 23, 42, 0.2);
  overflow: hidden;
}

.drawer-panel-wide { width: 640px; }

.drawer-header {
  padding: 2rem 2.5rem 1.5rem;
  border-bottom: 1px solid var(--border-subtle);
  display: flex; justify-content: space-between; align-items: flex-start;
  flex-shrink: 0;
}
.drawer-header h3 { font-size: 1.25rem; font-weight: 800; }
.drawer-sub { font-size: 0.8rem; color: var(--text-muted); margin-top: 0.2rem; }
.drawer-close-btn {
  width: 36px; height: 36px; border-radius: 10px;
  background: var(--bg-surface-dim); border: none;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--text-muted); font-size: 1rem; transition: all 0.2s;
  flex-shrink: 0;
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
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-main);
  transition: border-color 0.2s;
  font-family: var(--font-heading);
  width: 100%;
}
.field-group input:focus, .field-group textarea:focus, .field-group select:focus {
  outline: none;
  border-color: var(--accent);
  background: white;
}
.field-group textarea { resize: vertical; min-height: 80px; }

.required { color: var(--accent); }

/* Color Picker */
.color-input-group { display: flex; gap: 0.75rem; align-items: center; }
.color-picker { width: 48px; height: 44px; border-radius: 0.75rem; border: 1.5px solid var(--border-subtle); padding: 2px; cursor: pointer; flex-shrink: 0; }
.color-text { flex: 1; }

/* Toggle */
.toggle-label { display: flex; justify-content: space-between; align-items: center; cursor: pointer; }
.toggle-label > span { font-size: 0.75rem; font-weight: 800; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.05em; }
.toggle-switch {
  width: 48px; height: 26px; background: var(--border-strong);
  border-radius: 99px; position: relative; transition: background 0.3s;
  flex-shrink: 0;
}
.toggle-switch.on { background: #10B981; }
.toggle-knob {
  position: absolute; width: 20px; height: 20px;
  background: white; border-radius: 50%;
  top: 3px; left: 3px; transition: transform 0.3s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
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
.btn-bo-secondary:hover { background: white; border-color: var(--border-strong); color: var(--text-main); }

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
  display: flex; align-items: center; justify-content: center;
  padding: 2rem;
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

@media (max-width: 1024px) {
  .bank-row-main { flex-wrap: wrap; }
  .product-financials { display: none; }
  .form-grid-2 { grid-template-columns: 1fr; }
  .drawer-panel, .drawer-panel-wide { width: 100%; max-width: 100%; }
}
</style>
