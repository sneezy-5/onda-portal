<template>
  <div class="dashboard reveal">
    <!-- Header: The Command Center Hero -->
    <header class="dashboard-hero mb-12">
      <div class="hero-content">
        <h1 class="dashboard-title">
          Console <span class="text-gradient">Infrastructure</span>
        </h1>
        <p class="hero-subtitle">Mise à l'échelle de vos services financiers ONDA.</p>
      </div>
      <div class="hero-actions">
        <div class="system-status">
          <span class="status-dot pulse"></span>
          <span class="status-text">Infrastructure Opérationnelle</span>
        </div>
        <button class="btn btn-primary" @click="$emit('navigate', 'organizations')">
          <span>+ Provisionner un client</span>
        </button>
      </div>
    </header>

    <!-- Metrics Strip -->
    <div class="metrics-grid mb-10">
      <div class="card-premium metric-card p-8">
        <div class="metric-icon-box">
          <i class="fas fa-building text-primary"></i>
        </div>
        <div class="metric-info">
          <p class="text-dim mb-1">Organisations</p>
          <h3 class="metric-value">{{ stats.organizationsCount || 0 }}</h3>
        </div>
      </div>

      <div class="card-premium metric-card p-8">
        <div class="metric-icon-box accent">
          <i class="fas fa-microchip text-accent"></i>
        </div>
        <div class="metric-info">
          <p class="text-dim mb-1">Consommation</p>
          <h3 class="metric-value">{{ stats.apiCalls || 0 }} <span class="unit">Req</span></h3>
        </div>
      </div>

      <div class="card-premium metric-card p-8">
        <div class="metric-icon-box primary">
          <i class="fas fa-chart-line text-primary"></i>
        </div>
        <div class="metric-info">
          <p class="text-dim mb-1">Quota Mensuel</p>
          <h3 class="metric-value">{{ stats.monthlyQuota || 0 }} <span class="unit">Req</span></h3>
        </div>
      </div>

      <div class="card-premium metric-card p-8">
        <div class="metric-icon-box success">
          <i class="fas fa-gem text-success"></i>
        </div>
        <div class="metric-info">
          <p class="text-dim mb-1">Plan Actuel</p>
          <h3 class="metric-value">
            <span class="plan-badge" :class="stats.plan?.toLowerCase()">{{ stats.plan || 'FREE' }}</span>
          </h3>
        </div>
      </div>
    </div>

    <!-- Main Grid Content -->
    <div class="dash-layout">
      <div class="col-span-8">
        <!-- API Vault Section -->
        <div class="card-premium vault-card p-8 mb-8">
          <div class="vault-header mb-6">
            <div class="vault-title-group">
              <div class="vault-icon"><i class="fas fa-key"></i></div>
              <div>
                <h3 class="vault-title">Vault API ONDA</h3>
                <p class="text-dim text-sm">Votre clé maître partenaire est sécurisée</p>
              </div>
            </div>
          </div>

          <div class="vault-entries">
            <!-- Production Key Entry -->
            <div class="key-display-elite mb-4">
              <div class="key-info-tag">PRODUCTION</div>
              <div class="key-shield">
                <i class="fas fa-lock-open text-primary"></i>
                <code>{{ stats.masterApiKeyPrefix }}••••••••••••••••</code>
              </div>
              <div class="flex gap-4">
                <button @click="regenerateSpecificKey('production')" class="copy-button-elite text-danger border-danger" title="Rotation Clé Live">
                  <i class="fas fa-sync-alt"></i>
                </button>
                <button @click="copyKey('production')" class="copy-button-elite" title="Copier la Clé Live">
                  <i class="fas fa-copy"></i>
                  <span>Copier</span>
                </button>
              </div>
            </div>

            <!-- Sandbox Key Entry -->
            <div class="key-display-elite sandbox">
              <div class="key-info-tag sandbox">SANDBOX</div>
              <div class="key-shield">
                <i class="fas fa-flask text-accent"></i>
                <code>{{ stats.sandboxApiKeyPrefix }}••••••••••••••••</code>
              </div>
              <div class="flex gap-4">
                <button @click="regenerateSpecificKey('sandbox')" class="copy-button-elite text-danger border-danger" title="Rotation Clé Test">
                  <i class="fas fa-sync-alt"></i>
                </button>
                <button @click="copyKey('sandbox')" class="copy-button-elite" title="Copier la Clé Test">
                  <i class="fas fa-copy"></i>
                  <span>Copier</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Webhook Section -->
        <div class="card-premium p-8">
          <div class="section-header mb-6">
            <div class="flex items-center gap-3">
              <div class="icon-circle primary"><i class="fas fa-link"></i></div>
              <div>
                <h3 class="m-0">Webhooks & Connectivité</h3>
                <p class="text-dim text-sm">Recevez des alertes en temps réel sur votre serveur</p>
              </div>
            </div>
          </div>

          <div class="webhook-input-group">
            <input 
              type="url" 
              v-model="stats.webhookUrl" 
              placeholder="https://votre-serveur.com/api/onda-webhook"
              class="form-control-premium flex-1"
            />
            <button 
              class="btn btn-primary" 
              :disabled="isUpdatingWebhook"
              @click="saveWebhook"
            >
              <i v-if="isUpdatingWebhook" class="fas fa-spinner fa-spin mr-2"></i>
              <span>{{ isUpdatingWebhook ? 'Mise à jour...' : 'Sauvegarder' }}</span>
            </button>
          </div>
          
          <div class="webhook-info mt-6 p-4 bg-surface-dim rounded-xl border border-strong">
              <p class="text-xs text-muted leading-relaxed">
                Les webhooks permettent à ONDA de notifier votre système lors d'événements critiques (Seuil de cash, rapport généré, quota API). 
                Consultez la <a href="#" @click.prevent="$emit('navigate', 'api-docs')" class="text-primary font-bold">documentation</a> pour la liste des événements.
              </p>
          </div>
        </div>

        <!-- Activity Section -->
        <div class="card-premium p-8 mt-8">
          <h3 class="mb-6">Activité Quotidienne</h3>
          <div class="usage-chart-placeholder">
            <div v-for="(val, day) in stats.dailyUsage" :key="day" class="chart-bar-group">
              <div class="bar-label">{{ day }}</div>
              <div class="bar-track">
                <div class="bar-fill" :style="{ width: (val / 1000) + '%' }"></div>
              </div>
              <div class="bar-value">{{ val }}</div>
            </div>
            <div v-if="!stats.dailyUsage || Object.keys(stats.dailyUsage).length === 0" class="text-center py-12 text-dim">
              <i class="fas fa-chart-area mb-4" style="font-size: 2rem; opacity: 0.3;"></i>
              <p>Aucune donnée d'utilisation disponible.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="col-span-4">
        <div class="card-premium p-8 h-full bg-surface-dim">
          <div class="flex justify-between items-center mb-8">
            <h3 class="m-0">Flux d'Alertes</h3>
            <span class="badge-alert-count">{{ stats.recentEvents?.filter(e => e.type === 'CRITICAL').length || 0 }} Critiques</span>
          </div>
          <div class="timeline-container">
            <div v-for="(event, idx) in stats.recentEvents" :key="idx" class="timeline-item" :class="event.type?.toLowerCase()">
              <div class="timeline-dot" :class="{ 'bg-danger pulse-danger': event.type === 'CRITICAL' }"></div>
              <div class="timeline-content">
                <div class="flex justify-between items-start mb-1">
                  <p class="event-msg font-bold" :class="{ 'text-danger': event.type === 'CRITICAL' }">{{ event.message }}</p>
                  <i v-if="event.type === 'CRITICAL'" class="fas fa-exclamation-triangle text-danger text-xs"></i>
                </div>
                <div class="flex items-center gap-2">
                  <span class="event-time text-[10px] text-dim font-black uppercase tracking-tighter">{{ event.time }}</span>
                  <span v-if="event.org" class="text-[10px] bg-white px-2 py-0.5 rounded border border-gray-100">{{ event.org }}</span>
                </div>
              </div>
            </div>
            
            <div v-if="!stats.recentEvents || stats.recentEvents.length === 0" class="text-center py-12 text-dim">
              <i class="fas fa-bell-slash mb-4 opacity-20" style="font-size: 3rem;"></i>
              <p>Aucune alerte active pour le moment.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

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

<script setup>
import { ref, onMounted } from 'vue';
import apiService from '../services/api.js';
import ActionDialog from '../components/ActionDialog.vue';

const stats = ref({
  organizationsCount: 0,
  apiCalls: 0,
  monthlyQuota: 0,
  plan: 'FREE',
  masterApiKeyPrefix: 'sk_live_',
  sandboxApiKeyPrefix: 'sk_test_',
  webhookUrl: '',
  dailyUsage: {},
  recentEvents: []
});

const isUpdatingWebhook = ref(false);

const saveWebhook = async () => {
  if (!stats.value.webhookUrl) return;
  
  isUpdatingWebhook.value = true;
  try {
    await apiService.updateWebhook(stats.value.webhookUrl);
    await openDialog('INFO', { 
      title: 'Configuration Mise à Jour', 
      message: 'Votre URL de Webhook a été enregistrée avec succès. Vous recevrez désormais les notifications à cette adresse.' 
    });
  } catch (error) {
    await openDialog('INFO', { title: 'Erreur', message: error.message });
  } finally {
    isUpdatingWebhook.value = false;
  }
};

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

const copyKey = async (env = 'production') => {
  const fullKey = env === 'production' 
    ? (localStorage.getItem('apiKey') || 'sk_live_...') 
    : (localStorage.getItem('sandboxApiKey') || 'sk_test_...');
  
  navigator.clipboard.writeText(fullKey);
  await openDialog('INFO', { 
    title: 'Clé Copiée', 
    message: `La clé API ${env.toUpperCase()} a été copiée dans votre presse-papiers.` 
  });
};

const regenerateSpecificKey = async (env) => {
  const envName = env === 'production' ? 'PRODUCTION (Live)' : 'SANDBOX (Test)';
  
  if (env === 'production') {
    const confirmed = await openDialog('DANGER', {
      title: 'Rotation de Clé CRITIQUE',
      message: "La régénération de la Clé Maître Production invalidera immédiatement l'ancienne. Vos intégrations LIVE seront interrompues. Continuer ?",
      confirmText: 'Oui, continuer'
    });
    if (!confirmed) return;
  }

  const inputVerification = await openDialog('PROMPT', {
    title: 'Confirmation de Sécurité',
    message: `Pour confirmer la génération d'une nouvelle clé ${envName}, tapez 'CONFIRMER' :`,
    placeholder: 'CONFIRMER',
    confirmText: 'Valider la rotation'
  });

  if (inputVerification === 'CONFIRMER') {
    try {
      const res = await apiService.regenerateApiKey(null, env);
      if (res.success) {
        const newKey = res.data;
        if (env === 'production') {
           localStorage.setItem('apiKey', newKey);
           stats.value.masterApiKeyPrefix = newKey.substring(0, 8);
        } else {
           localStorage.setItem('sandboxApiKey', newKey);
           stats.value.sandboxApiKeyPrefix = newKey.substring(0, 8);
        }
        
        await openDialog('KEY_DISPLAY', {
          title: `Nouvelle Clé Maître ${env.toUpperCase()}`,
          message: 'Voici votre nouvelle clé secrète. Copiez-la maintenant, elle ne sera plus visible.',
          prefill: newKey,
          confirmText: 'J\'ai copié la clé'
        });
      }
    } catch (e) {
      await openDialog('INFO', { title: 'Erreur', message: e.message });
    }
  }
};

onMounted(async () => {
  try {
    const res = await apiService.getBillingSummary();
    if (res.success) {
      const data = res.data;
      stats.value = {
        organizationsCount: data.provisionedOrganizationsCount || 0,
        apiCalls: data.currentUsage || 0,
        monthlyQuota: data.monthlyQuota || 0,
        plan: data.plan || 'FREE',
        masterApiKeyPrefix: data.masterApiKey?.substring(0, 10) || data.masterApiKeyPrefix || 'sk_live_',
        sandboxApiKeyPrefix: data.testApiKey?.substring(0, 10) || 'sk_test_',
        webhookUrl: data.webhookUrl || '',
        dailyUsage: data.dailyUsage || {},
        recentEvents: data.recentEvents?.length ? data.recentEvents : [
          { type: 'CRITICAL', message: 'Trésorerie Critique : Boutique Cocody', time: 'Aujourd\'hui, 14:15', org: 'O\'Sushi' },
          { type: 'INFO', message: 'Webhook délivré avec succès', time: 'Aujourd\'hui, 13:45', org: 'System' },
          { type: 'CRITICAL', message: 'Rupture de Stock : Coca-Cola 50cl', time: 'Hier, 18:22', org: 'Sup. Alpha' }
        ]
      };
    }
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
    stats.value.masterApiKeyPrefix = (localStorage.getItem('apiKey') || 'sk_xxxx_').substring(0, 10);
  }
});
</script>

<style scoped>
.webhook-input-group {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.form-control-premium {
  background: white;
  border: 1px solid var(--border-strong);
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9rem;
  width: 100%;
}

.icon-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-circle.primary {
  background: rgba(59, 130, 246, 0.1);
  color: var(--primary);
}
.dash-view {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.metric-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  min-height: 120px;
}

.metric-icon-box {
  width: 64px;
  height: 64px;
  border-radius: 1.25rem;
  background: rgba(14, 165, 233, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.metric-icon-box.accent {
  background: rgba(244, 63, 94, 0.1);
}

.metric-value {
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-main);
  line-height: 1.1;
}

.unit {
  font-size: 0.9rem;
  color: var(--text-dim);
  font-weight: 500;
}

.dash-layout {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 2.5rem;
}

/* Vault Elite Styling */
.vault-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.vault-title-group {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.vault-icon {
  width: 48px;
  height: 48px;
  background: var(--bg-surface-inverse);
  color: white;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.vault-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
}

.key-display-elite {
  background: var(--bg-surface-dim);
  border: 1px dashed var(--border-strong);
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.key-shield {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.key-shield code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 1.1rem;
  color: var(--text-main);
  letter-spacing: 0.05em;
}

.copy-button-elite {
  background: white;
  border: 1px solid var(--border-strong);
  padding: 0.75rem 1.25rem;
  border-radius: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
}

.copy-button-elite:hover {
  background: var(--bg-surface-inverse);
  color: white;
  transform: translateY(-2px);
}

.key-info-tag {
  font-size: 0.65rem;
  font-weight: 900;
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  background: rgba(59, 130, 246, 0.1);
  color: var(--primary);
  margin-right: 1rem;
  width: 80px;
  text-align: center;
}

.key-info-tag.sandbox {
  background: rgba(244, 63, 94, 0.1);
  color: var(--accent);
}

.key-display-elite.sandbox {
  border-color: rgba(244, 63, 94, 0.2);
}

/* Timeline Styling */
.timeline-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
}

.timeline-item {
  display: flex;
  gap: 1.25rem;
  position: relative;
}

.timeline-item:not(:last-child)::before {
  content: '';
  position: absolute;
  left: 6px;
  top: 20px;
  bottom: -20px;
  width: 2px;
  background: var(--border-strong);
  opacity: 0.5;
}

.timeline-dot {
  width: 14px;
  height: 14px;
  background: var(--primary);
  border: 3px solid white;
  border-radius: 50%;
  box-shadow: 0 0 0 2px var(--primary-light);
  z-index: 1;
  margin-top: 4px;
}

.timeline-content {
  flex: 1;
}

.event-msg {
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

/* Chart Bars */
.chart-bar-group {
  display: grid;
  grid-template-columns: 80px 1fr 60px;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.25rem;
}

.bar-track {
  height: 8px;
  background: var(--bg-surface-dim);
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: var(--primary);
  border-radius: 4px;
  transition: width 1s ease;
}

.bar-label {
  font-weight: 600;
  font-size: 0.85rem;
}

.bar-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85rem;
  font-weight: 700;
  text-align: right;
}

@media (max-width: 1100px) {
  .col-span-8, .col-span-4 {
    grid-column: span 12;
  }
}

.plan-badge {
  padding: 0.25rem 1rem;
  border-radius: 2rem;
  font-size: 0.8rem;
  font-weight: 800;
  text-transform: uppercase;
  background: var(--bg-surface-dim);
  border: 1px solid var(--border-strong);
  letter-spacing: 0.05em;
}

.plan-badge.premium {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
  border-color: rgba(139, 92, 246, 0.3);
  box-shadow: 0 0 15px rgba(139, 92, 246, 0.1);
}

.plan-badge.free {
  background: rgba(100, 116, 139, 0.1);
  color: #64748b;
  border-color: rgba(100, 116, 139, 0.3);
}

.metric-icon-box.success {
  background: rgba(16, 185, 129, 0.1);
}
.badge-alert-count {
  background: var(--bg-surface-inverse);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.65rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.timeline-item.critical {
  border-left: 2px solid #ef4444;
  padding-left: 1.5rem;
  margin-left: -1px;
}

.pulse-danger {
  animation: pulse-danger 2s infinite;
}

@keyframes pulse-danger {
  0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
  100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}

.text-danger {
  color: #ef4444 !important;
}

.bg-danger {
  background-color: #ef4444 !important;
}
</style>
