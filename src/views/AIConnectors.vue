<template>
  <div class="ai-connectors-portal reveal">
    <!-- Header: The Brain Command -->
    <header class="page-header mb-12">
      <div class="header-main">
        <h1 class="page-title">IA <span class="text-gradient">Connecteurs</span></h1>
        <p class="text-muted">Configurez le cerveau d'ONDA en connectant vos propres APIs et Actions Métier.</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-premium-chat pulse" @click="openChatTest">
          <i class="fas fa-comment-dots mr-2"></i>
          <span>Tester l'IA Brain</span>
        </button>
      </div>
    </header>

    <!-- Navigation Tabs -->
    <div class="glass-tabs-container mb-10">
      <button 
        :class="['tab-btn', { active: activeTab === 'data-sources' }]" 
        @click="activeTab = 'data-sources'"
      >
        <i class="fas fa-database mr-2"></i> Sources de Données
      </button>
      <button 
        :class="['tab-btn', { active: activeTab === 'ai-actions' }]" 
        @click="activeTab = 'ai-actions'"
      >
        <i class="fas fa-bolt mr-2"></i> Actions IA (Webhooks)
      </button>
    </div>

    <!-- Main Content Area -->
    <div class="ai-content-view">
      
      <!-- TAB: DATA SOURCES -->
      <transition name="fade-slide" mode="out-in">
        <div v-if="activeTab === 'data-sources'" key="data-sources" class="tab-pane">
          <div class="section-actions mb-6">
            <h3 class="section-title-mini">Contextes de Données Connectés</h3>
            <button class="btn btn-primary btn-sm" @click="openDataSourceModal()">
              <i class="fas fa-plus mr-2"></i> Ajouter une Source
            </button>
          </div>

          <div class="table-premium-container">
            <table class="table-premium">
              <thead>
                <tr>
                  <th>NOM SOURCE</th>
                  <th>URL API</th>
                  <th>MÉTHODE</th>
                  <th>STATUT</th>
                  <th class="text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="source in dataSources" :key="source.id">
                  <td>
                    <div class="font-bold">{{ source.name }}</div>
                  </td>
                  <td>
                    <code class="text-xs text-dim">{{ source.url }}</code>
                  </td>
                  <td>
                    <span class="badge-method" :class="source.httpMethod?.toLowerCase()">{{ source.httpMethod }}</span>
                  </td>
                  <td>
                    <label class="switch">
                      <input type="checkbox" :checked="source.isActive" @change="toggleSourceStatus(source)">
                      <span class="slider round"></span>
                    </label>
                  </td>
                  <td class="text-right">
                    <div class="flex justify-end gap-4">
                      <button class="btn-action-premium btn-action-test" @click="testSource(source)" title="Tester la connexion">
                        <i class="fas fa-vial"></i>
                      </button>
                      <button class="btn-action-premium btn-action-edit" @click="openDataSourceModal(source)" title="Modifier">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="btn-action-premium btn-action-delete" @click="deleteDataSource(source.id)" title="Supprimer">
                        <i class="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="dataSources.length === 0">
                  <td colspan="5" class="empty-table-msg">
                    <div class="py-12 text-center text-dim">
                      <i class="fas fa-satellite-dish fa-3x mb-4 opacity-20"></i>
                      <p>Aucune source de données configurée.</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- TAB: AI ACTIONS -->
        <div v-else key="ai-actions" class="tab-pane">
          <div class="section-actions mb-6">
            <h3 class="section-title-mini">Capacités d'Action de l'IA</h3>
            <button class="btn btn-primary btn-sm" @click="openActionModal()">
              <i class="fas fa-plus mr-2"></i> Définir une Action
            </button>
          </div>

          <div class="table-premium-container">
            <table class="table-premium">
              <thead>
                <tr>
                  <th>ACTION KEY</th>
                  <th>NOM</th>
                  <th>WEBHOOK URL</th>
                  <th>MÉTHODE</th>
                  <th class="text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="aiAction in aiActions" :key="aiAction.id">
                  <td>
                    <code class="font-black text-primary">{{ aiAction.actionKey }}</code>
                  </td>
                  <td>
                    <div class="font-bold">{{ aiAction.name }}</div>
                  </td>
                  <td>
                    <code class="text-xs text-dim">{{ aiAction.webhookUrl }}</code>
                  </td>
                  <td>
                    <span class="badge-method" :class="aiAction.httpMethod?.toLowerCase() || 'post'">{{ aiAction.httpMethod || 'POST' }}</span>
                  </td>
                  <td class="text-right">
                    <div class="flex justify-end gap-4">
                      <button class="btn-action-premium btn-action-edit" @click="openActionModal(aiAction)" title="Modifier">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="btn-action-premium btn-action-delete" @click="deleteAIAction(aiAction.id)" title="Supprimer">
                        <i class="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="aiActions.length === 0">
                  <td colspan="4" class="empty-table-msg">
                    <div class="py-12 text-center text-dim">
                      <i class="fas fa-robot fa-3x mb-4 opacity-20"></i>
                      <p>Aucune action IA configurée.</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </transition>
    </div>

    <!-- MODAL: DATA SOURCE FORM -->
    <transition name="fade">
      <div v-if="showSourceModal" class="modal-overlay glass" @click="showSourceModal = false">
        <div class="modal-card card-premium reveal p-10" @click.stop>
          <header class="modal-header mb-8">
            <div>
              <h3 class="mb-1 text-2xl font-bold">{{ editingSource ? 'Modifier' : 'Connecter' }} une Source</h3>
              <p class="text-dim text-sm">Fournissez un contexte frais à l'intelligence ONDA.</p>
            </div>
            <button class="btn-close" @click="showSourceModal = false">
              <i class="fas fa-times"></i>
            </button>
          </header>

          <form @submit.prevent="saveDataSource" class="ai-form">
            <div class="form-row mb-6">
              <div class="form-group flex-1">
                <label>NOM DE LA SOURCE</label>
                <input v-model="sourceForm.name" type="text" placeholder="Ex: Catalogue Stock" required class="input-premium" />
              </div>
              <div class="form-group w-32">
                <label>MÉTHODE</label>
                <select v-model="sourceForm.httpMethod" class="input-premium">
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                </select>
              </div>
            </div>

            <div class="form-group mb-6">
              <label>URL DE L'API</label>
              <input v-model="sourceForm.url" type="url" placeholder="https://votre-erp.ci/api/items" required class="input-premium" />
            </div>

            <div class="form-group mb-6">
              <label>HEADER D'AUTHENTIFICATION</label>
              <input v-model="sourceForm.authHeader" type="text" placeholder="Authorization: Bearer key_..." class="input-premium" />
            </div>

            <div class="form-group mb-8">
              <label>INSTRUCTIONS IA (PROMPT CONTEXT)</label>
              <textarea 
                v-model="sourceForm.description" 
                rows="4" 
                placeholder="Ex: Utilise ces données pour connaître les prix et la disponibilité des produits en temps réel..."
                class="input-premium text-sm leading-relaxed"
              ></textarea>
              <p class="text-[10px] text-dim mt-2 uppercase font-bold tracking-wider">
                <i class="fas fa-info-circle mr-1"></i> Décrivez comment l'IA doit interpréter ces données JSON.
              </p>
            </div>

            <div class="modal-footer">
              <button type="submit" class="btn btn-primary w-full py-4 text-lg" :disabled="saving">
                <span v-if="saving" class="spinner-sm"></span>
                <span>{{ editingSource ? 'Mettre à jour' : 'Connecter la source' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <!-- MODAL: AI ACTION FORM -->
    <transition name="fade">
      <div v-if="showActionModal" class="modal-overlay glass" @click="showActionModal = false">
        <div class="modal-card card-premium reveal p-10" @click.stop>
          <header class="modal-header mb-8">
            <div>
              <h3 class="mb-1 text-2xl font-bold">{{ editingAction ? 'Modifier' : 'Définir' }} une Action IA</h3>
              <p class="text-dim text-sm">Permettez à l'IA d'interagir avec votre système.</p>
            </div>
            <button class="btn-close" @click="showActionModal = false">
              <i class="fas fa-times"></i>
            </button>
          </header>

          <form @submit.prevent="saveAIAction" class="ai-form">
            <div class="form-row mb-6">
              <div class="form-group flex-1">
                <label>NOM DE L'ACTION</label>
                <input v-model="actionForm.name" type="text" placeholder="Ex: Créer une vente" required class="input-premium" />
              </div>
              <div class="form-group flex-1">
                <label>
                  ACTION KEY 
                  <span class="tooltip-trigger" title="Identifiant unique envoyé dans le Webhook. Lettres et underscores (_) uniquement.">
                    <i class="fas fa-question-circle"></i>
                  </span>
                </label>
                <input v-model="actionForm.actionKey" type="text" placeholder="CREATE_SALE" required class="input-premium font-mono" @input="validateActionKey" />
              </div>
            </div>

            <div class="form-row mb-6">
              <div class="form-group flex-1">
                <label>WEBHOOK URL</label>
                <input v-model="actionForm.webhookUrl" type="url" placeholder="https://api.votre-erp.ci/hooks/onda" required class="input-premium" />
              </div>
              <div class="form-group w-32">
                <label>MÉTHODE</label>
                <select v-model="actionForm.httpMethod" class="input-premium">
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="PATCH">PATCH</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </div>
            </div>

            <div class="form-group mb-6">
              <label>DESCRIPTION DU DÉCLENCHEUR (TRIGGER)</label>
              <textarea 
                v-model="actionForm.triggerDescription" 
                rows="2" 
                placeholder="Ex: À déclencher quand l'utilisateur demande explicitement d'enregistrer une vente..."
                class="input-premium text-sm"
              ></textarea>
            </div>

            <div class="form-group mb-8">
              <label class="flex justify-between items-center">
                <span>PAYLOAD SCHEMA (JSON)</span>
                <span :class="['json-status', { error: !isJsonValid }]">{{ isJsonValid ? 'JSON VALIDE' : 'JSON INVALIDE' }}</span>
              </label>
              <textarea 
                v-model="actionForm.payloadSchema" 
                rows="6" 
                class="input-premium font-mono text-sm"
                placeholder='{ "product_id": "string", "quantity": "number" }'
              ></textarea>
              <p class="text-[10px] text-dim mt-2 uppercase font-bold tracking-wider">
                <i class="fas fa-code mr-1"></i> Structure JSON que l'IA devra remplir avant l'appel.
              </p>
            </div>

            <div class="modal-footer">
              <button type="submit" class="btn btn-primary w-full py-4 text-lg" :disabled="saving || !isJsonValid">
                <span v-if="saving" class="spinner-sm"></span>
                <span>{{ editingAction ? 'Mettre à jour' : 'Enregistrer l\'action' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <!-- MODAL: TEST RESULTS -->
    <transition name="fade">
      <div v-if="showTestResult" class="modal-overlay glass" @click="showTestResult = false">
        <div class="modal-card card-premium reveal p-10 max-w-4xl" @click.stop>
          <header class="modal-header mb-8">
            <div>
              <h3 class="mb-1 text-2xl font-bold">Résultat du Test API</h3>
              <p class="text-success text-sm font-bold"><i class="fas fa-check-circle mr-2"></i> Connexion réussie</p>
            </div>
            <button class="btn-close" @click="showTestResult = false">
              <i class="fas fa-times"></i>
            </button>
          </header>

          <div class="code-result-container bg-surface-dark p-8 rounded-2xl overflow-auto max-h-[500px]">
            <pre class="text-primary-light font-mono text-sm"><code>{{ JSON.stringify(testResultData, null, 2) }}</code></pre>
          </div>

          <div class="mt-8 flex justify-end">
            <button class="btn btn-outline" @click="showTestResult = false">Fermer</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Global Dialogs -->
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
  name: 'AIConnectors',
  components: { ActionDialog },
  setup() {
    const activeTab = ref('data-sources');
    const dataSources = ref([]);
    const aiActions = ref([]);
    const loading = ref(false);
    const saving = ref(false);

    // Form Modals
    const showSourceModal = ref(false);
    const editingSource = ref(null);
    const sourceForm = ref({
      name: '',
      url: '',
      httpMethod: 'GET',
      authHeader: '',
      description: '',
      isActive: true
    });

    const showActionModal = ref(false);
    const editingAction = ref(null);
    const actionForm = ref({
      name: '',
      actionKey: '',
      webhookUrl: '',
      httpMethod: 'POST',
      triggerDescription: '',
      payloadSchema: '{}'
    });

    const isJsonValid = computed(() => {
      try {
        JSON.parse(actionForm.value.payloadSchema);
        return true;
      } catch (e) {
        return false;
      }
    });

    // Test Modal
    const showTestResult = ref(false);
    const testResultData = ref(null);

    // Dialog State
    const dialog = ref({
      isOpen: false, mode: 'INFO', title: '', message: '', confirmText: 'Confirmer', resolve: null
    });

    const openDialog = (mode, data) => {
      return new Promise((res) => {
        dialog.value = { ...dialog.value, isOpen: true, mode, ...data, resolve: res };
      });
    };

    const handleDialogConfirm = (v) => {
      if (dialog.value.resolve) dialog.value.resolve(v || true);
      dialog.value.isOpen = false;
    };

    const handleDialogCancel = () => {
      if (dialog.value.resolve) dialog.value.resolve(false);
      dialog.value.isOpen = false;
    };

    // Data Management
    const loadAll = async () => {
      loading.value = true;
      try {
        const [sourcesRes, actionsRes] = await Promise.all([
          apiService.getAIDataSources(),
          apiService.getAIActions()
        ]);
        dataSources.value = sourcesRes.success ? sourcesRes.data : [];
        aiActions.value = actionsRes.success ? actionsRes.data : [];
      } catch (e) {
        console.error("Failed to load AI data:", e);
      } finally {
        loading.value = false;
      }
    };

    // Source Actions
    const openDataSourceModal = (source = null) => {
      editingSource.value = source;
      if (source) {
        sourceForm.value = { ...source };
      } else {
        sourceForm.value = { name: '', url: '', httpMethod: 'GET', authHeader: '', description: '', isActive: true };
      }
      showSourceModal.value = true;
    };

    const saveDataSource = async () => {
      saving.value = true;
      try {
        const res = await apiService.createAIDataSource(sourceForm.value);
        if (res.success) {
          await loadAll();
          showSourceModal.value = false;
        }
      } catch (e) {
        await openDialog('INFO', { title: 'Erreur', message: e.message });
      } finally {
        saving.value = false;
      }
    };

    const testSource = async (source) => {
      try {
        const res = await apiService.testAIDataSource(source.id);
        if (res.success) {
          testResultData.value = res.data;
          showTestResult.value = true;
        }
      } catch (e) {
        await openDialog('INFO', { title: 'Détails du Test', message: `Erreur: ${e.message}` });
      }
    };

    const deleteDataSource = async (id) => {
      const confirmed = await openDialog('DANGER', {
        title: 'Supprimer la source ?',
        message: 'L\'IA ne pourra plus accéder à ces données pour ses analyses.',
        confirmText: 'Supprimer'
      });
      if (confirmed) {
        await apiService.deleteAIDataSource(id);
        await loadAll();
      }
    };

    const toggleSourceStatus = async (source) => {
      source.isActive = !source.isActive;
      await apiService.createAIDataSource(source); // Update
    };

    // Action Actions
    const openActionModal = (action = null) => {
      editingAction.value = action;
      if (action) {
        actionForm.value = { ...action, httpMethod: action.httpMethod || 'POST' };
      } else {
        actionForm.value = { name: '', actionKey: '', webhookUrl: '', httpMethod: 'POST', triggerDescription: '', payloadSchema: '{\n  "param": "string"\n}' };
      }
      showActionModal.value = true;
    };

    const saveAIAction = async () => {
      saving.value = true;
      try {
        const res = await apiService.createAIAction(actionForm.value);
        if (res.success) {
          await loadAll();
          showActionModal.value = false;
        }
      } catch (e) {
        await openDialog('INFO', { title: 'Erreur', message: e.message });
      } finally {
        saving.value = false;
      }
    };

    const deleteAIAction = async (id) => {
      const confirmed = await openDialog('DANGER', {
        title: 'Supprimer l\'action ?',
        message: 'L\'IA ne pourra plus déclencher ce webhook en votre nom.',
        confirmText: 'Supprimer'
      });
      if (confirmed) {
        await apiService.deleteAIAction(id);
        await loadAll();
      }
    };

    const validateActionKey = () => {
      actionForm.value.actionKey = actionForm.value.actionKey.toUpperCase().replace(/[^A-Z0-9_]/g, '');
    };

    const openChatTest = async () => {
      await openDialog('INFO', {
        title: 'Interface de Test Brain',
        message: 'Cette fonctionnalité ouvrira bientôt une fenêtre de chat ONDA pour tester vos connecteurs en conditions réelles.'
      });
    };

    onMounted(loadAll);

    return {
      activeTab, dataSources, aiActions, loading, saving,
      showSourceModal, editingSource, sourceForm,
      showActionModal, editingAction, actionForm, isJsonValid,
      showTestResult, testResultData,
      dialog, handleDialogConfirm, handleDialogCancel,
      openDataSourceModal, saveDataSource, testSource, deleteDataSource, toggleSourceStatus,
      openActionModal, saveAIAction, deleteAIAction, validateActionKey,
      openChatTest
    };
  }
}
</script>

<style scoped>
.page-title { font-size: 3rem; margin-bottom: 0.5rem; }

/* Glass Tabs */
.glass-tabs-container {
  display: flex;
  gap: 1rem;
  background: var(--bg-surface-dim);
  padding: 0.6rem;
  border-radius: 1.25rem;
  width: fit-content;
  border: 1px solid var(--border-strong);
}

.tab-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.85rem;
  border: none;
  background: transparent;
  color: var(--text-dim);
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
}

.tab-btn:hover { color: var(--text-main); background: rgba(255,255,255,0.5); }
.tab-btn.active { background: white; color: var(--primary); box-shadow: var(--shadow-sm); }

/* Table Section */
.section-actions { display: flex; justify-content: space-between; align-items: center; }
.section-title-mini { font-size: 0.85rem; font-weight: 900; color: #64748B; letter-spacing: 0.1em; text-transform: uppercase; }

.table-premium-container { background: white; border-radius: 1.5rem; border: 1px solid var(--border-strong); overflow: hidden; box-shadow: var(--shadow-sm); }
.table-premium { width: 100%; border-collapse: collapse; }
.table-premium th { padding: 1.25rem 2rem; background: var(--bg-surface-dim); text-align: left; font-size: 0.7rem; font-weight: 900; color: #64748B; letter-spacing: 0.1em; border-bottom: 1px solid var(--border-strong); }
.table-premium td { padding: 1.5rem 2rem; border-bottom: 1px solid var(--border-strong); vertical-align: middle; }
.table-premium tr:last-child td { border-bottom: none; }

.badge-method { font-size: 0.65rem; font-weight: 900; padding: 0.25rem 0.6rem; border-radius: 4px; }
.badge-method.get { background: #DBEAFE; color: #1E40AF; }
.badge-method.post { background: #DCFCE7; color: #166534; }
.badge-method.put { background: #FEF3C7; color: #92400E; }
.badge-method.patch { background: #F3E8FF; color: #6B21A8; }
.badge-method.delete { background: #FFF1F2; color: #BE123C; }

/* Switch Slider */
.switch { position: relative; display: inline-block; width: 44px; height: 24px; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; inset: 0; background-color: #CBD5E1; transition: .4s; border-radius: 34px; }
.slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
input:checked + .slider { background-color: var(--primary); }
input:checked + .slider:before { transform: translateX(20px); }

/* Buttons Custom */
.btn-premium-chat { 
  background: var(--primary-gradient); 
  color: white; 
  border: none; 
  padding: 0.75rem 1.5rem; 
  border-radius: 1rem; 
  font-weight: 800; 
  display: flex; 
  align-items: center; 
  box-shadow: 0 8px 16px rgba(14, 165, 233, 0.25); 
}
.btn-premium-chat:hover { transform: translateY(-3px); box-shadow: 0 12px 20px rgba(14, 165, 233, 0.35); }

/* Form Styles */
.ai-form label { display: block; font-size: 0.7rem; font-weight: 900; color: #64748B; margin-bottom: 0.75rem; letter-spacing: 0.05em; }
.input-premium { 
  width: 100%; border: 2px solid var(--border-strong); background: #F8FAFC; 
  padding: 0.85rem 1.25rem; border-radius: 1rem; font-weight: 700; transition: all 0.3s; 
}
.input-premium:focus { border-color: var(--primary); background: white; box-shadow: var(--shadow-md); outline: none; }

.form-row { display: flex; gap: 1.5rem; }

.json-status { font-size: 0.65rem; font-weight: 900; color: #10B981; }
.json-status.error { color: #EF4444; }

.tooltip-trigger { color: var(--primary); cursor: help; margin-left: 0.25rem; }

@media (max-width: 768px) {
  .page-header { flex-direction: column; align-items: flex-start; gap: 2rem; }
  .form-row { flex-direction: column; }
}
</style>
