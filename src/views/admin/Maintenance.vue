<template>
  <div class="admin-maintenance-viewport reveal">
    <!-- Page Header -->
    <div class="bo-page-header mb-8">
      <h2 class="text-3xl font-black tracking-tight">Maintenance <span class="text-accent">Système</span></h2>
      <p class="text-muted mt-1 text-sm">Console DevOps : surveillance des crons et logs de l'infrastructure financière.</p>
    </div>

    <!-- Server Metrics Strip -->
    <div class="system-metrics-grid mb-8">
      <div class="metric-card-bo">
        <div class="metric-icon-wrapper cpu"><i class="fas fa-microchip"></i></div>
        <div class="metric-details">
          <span class="metric-label">Charge CPU</span>
          <span class="metric-value">{{ metrics.cpuLoad }}%</span>
          <span class="metric-status online"><span class="status-pulse-small green"></span> Normal</span>
        </div>
      </div>

      <div class="metric-card-bo">
        <div class="metric-icon-wrapper ram"><i class="fas fa-memory"></i></div>
        <div class="metric-details">
          <span class="metric-label">Mémoire RAM</span>
          <span class="metric-value">{{ formatMemory(metrics.memoryUsedBytes) }} / {{ formatMemory(metrics.memoryMaxBytes) }}</span>
          <span class="metric-status online"><span class="status-pulse-small green"></span> Optimisé</span>
        </div>
      </div>

      <div class="metric-card-bo">
        <div class="metric-icon-wrapper queue"><i class="fas fa-exchange-alt"></i></div>
        <div class="metric-details">
          <span class="metric-label">Latence Queue</span>
          <span class="metric-value">{{ metrics.queueLatencyMs }} ms</span>
          <span class="metric-status online"><span class="status-pulse-small green"></span> Excellente</span>
        </div>
      </div>

      <div class="metric-card-bo">
        <div class="metric-icon-wrapper jobs"><i class="fas fa-tasks"></i></div>
        <div class="metric-details">
          <span class="metric-label">Tâches Crons</span>
          <span class="metric-value">{{ metrics.activeCronsCount }} Actives / {{ metrics.failedCronsCount }} Erreurs</span>
          <span class="metric-status online"><span class="status-pulse-small green"></span> Actif</span>
        </div>
      </div>
    </div>

    <!-- Main Workspace Grid (Cron list on Left, Live Console on Right) -->
    <div class="maintenance-grid">
      
      <!-- Cron Jobs control card -->
      <section class="maintenance-card card-premium">
        <div class="card-header-bo">
          <i class="fas fa-cogs text-accent-gradient"></i>
          <div>
            <h4>Moteur Fiscal & Planifications</h4>
            <p>Déclenchement manuel des tâches planifiées.</p>
          </div>
        </div>

        <div class="cron-jobs-list mt-6">
          <div v-for="job in cronJobs" :key="job.path" class="cron-item-card">
            <div class="cron-item-icon">
              <i :class="job.icon"></i>
            </div>
            
            <div class="cron-item-body">
              <div class="cron-item-header-info">
                <h5>{{ job.label }}</h5>
                <span class="cron-schedule-tag"><i class="fas fa-history"></i> {{ job.schedule }}</span>
              </div>
              <p class="cron-item-desc">{{ job.description }}</p>
            </div>
            
            <button 
              @click="triggerCron(job.path, job.label)" 
              class="btn-trigger-cron"
              :disabled="loadingJobs[job.path]"
            >
              <i v-if="loadingJobs[job.path]" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-play"></i>
              <span>{{ loadingJobs[job.path] ? 'Lancement...' : 'Exécuter' }}</span>
            </button>
          </div>
        </div>
      </section>

      <!-- System Logs terminal terminal-style -->
      <section class="maintenance-card terminal-card">
        <div class="terminal-header-panel">
          <div class="terminal-branding">
            <span class="terminal-dot red"></span>
            <span class="terminal-dot yellow"></span>
            <span class="terminal-dot green"></span>
            <span class="terminal-title">ONDA SYSTEM SHELL</span>
          </div>
          
          <div class="terminal-actions">
            <button @click="togglePause" :class="['terminal-btn', { active: isPaused }]">
              <i :class="isPaused ? 'fas fa-play' : 'fas fa-pause'"></i>
              <span>{{ isPaused ? 'Reprendre' : 'Pause' }}</span>
            </button>
            <button @click="copyLogs" class="terminal-btn">
              <i class="fas fa-copy"></i>
              <span>Copier</span>
            </button>
            <button @click="clearLogs" class="terminal-btn">
              <i class="fas fa-trash-alt"></i>
              <span>Effacer</span>
            </button>
          </div>
        </div>

        <div class="terminal-console" ref="consoleContainer">
          <div v-if="systemLogs.length === 0" class="empty-terminal-state">
            <p>La console est vide. Déclenchez une tâche cron pour générer de nouveaux logs.</p>
          </div>
          <div 
            v-else
            v-for="log in systemLogs" 
            :key="log.time + log.message" 
            class="terminal-line"
          >
            <span class="log-time">[{{ log.time }}]</span>
            <span :class="['log-service', getServiceClass(log.service)]">{{ log.service }}</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
        </div>
      </section>

    </div>

    <!-- Rattrapage Comptable : Solde d'Ouverture -->
    <section class="maintenance-card card-premium mt-8">
      <div class="card-header-bo">
        <i class="fas fa-scale-balanced text-accent-gradient"></i>
        <div>
          <h4>Rattrapage Comptable — Solde d'Ouverture</h4>
          <p>Corrige les comptes de trésorerie créés avant le fix : leur solde initial n'a jamais généré d'écritures au grand livre (Trésorerie faussée dans le Bilan).</p>
        </div>
      </div>

      <div class="backfill-actions mt-6">
        <button @click="runPreview" class="btn-trigger-cron" :disabled="backfillLoading">
          <i v-if="backfillLoading === 'preview'" class="fas fa-spinner fa-spin"></i>
          <i v-else class="fas fa-magnifying-glass"></i>
          <span>{{ backfillLoading === 'preview' ? 'Analyse...' : "Lancer l'aperçu" }}</span>
        </button>
        <button
          v-if="backfillResult"
          @click="confirmApply"
          class="btn-trigger-cron btn-apply-backfill"
          :disabled="backfillLoading || backfillResult.matchedCount === 0"
        >
          <i v-if="backfillLoading === 'apply'" class="fas fa-spinner fa-spin"></i>
          <i v-else class="fas fa-check"></i>
          <span>{{ backfillLoading === 'apply' ? 'Application...' : `Appliquer (${backfillResult.matchedCount})` }}</span>
        </button>
      </div>

      <div v-if="backfillResult" class="backfill-summary mt-6">
        <div class="backfill-badge matched">{{ backfillResult.matchedCount }} corrigeables</div>
        <div class="backfill-badge ambiguous">{{ backfillResult.ambiguousCount }} ambigus</div>
        <div class="backfill-badge not-found">{{ backfillResult.noTransactionFoundCount }} sans transaction</div>
        <div class="backfill-badge applied">{{ backfillResult.alreadyAppliedCount }} déjà à jour</div>
        <div v-if="backfillResult.periodClosedCount" class="backfill-badge period-closed">{{ backfillResult.periodClosedCount }} période clôturée</div>
        <div v-if="backfillResult.errorCount" class="backfill-badge error">{{ backfillResult.errorCount }} en erreur</div>
        <div v-if="backfillResult.appliedCount" class="backfill-badge done">{{ backfillResult.appliedCount }} appliqués</div>
      </div>

      <div v-if="backfillResult && backfillResult.items.length" class="backfill-table-wrapper mt-4">
        <table class="backfill-table">
          <thead>
            <tr>
              <th>Organisation</th>
              <th>Compte</th>
              <th>Solde déclaré</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in backfillResult.items" :key="item.accountId">
              <td>{{ item.organizationName }}</td>
              <td>{{ item.accountLabel }}</td>
              <td>{{ formatAmount(item.openingBalance) }}</td>
              <td>
                <span :class="['backfill-status-tag', statusClass(item.status)]">{{ statusLabel(item.status) }}</span>
                <div v-if="item.note" class="backfill-status-note" :title="item.note">{{ item.note }}</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else-if="backfillResult" class="empty-terminal-state">
        <p>Aucun compte à solde d'ouverture non nul n'a été trouvé.</p>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import adminApi from '../../services/adminApi';

export default {
  name: 'AdminMaintenance',
  setup() {
    const loadingJobs = reactive({});
    const isPaused = ref(false);
    const consoleContainer = ref(null);

    const metrics = ref({
      cpuLoad: 0.0,
      memoryUsedBytes: 0,
      memoryMaxBytes: 0,
      queueLatencyMs: 0,
      activeCronsCount: 0,
      failedCronsCount: 0
    });

    const systemLogs = ref([]);
    let intervalId = null;

    const parseLogLine = (line) => {
      // Ex: 2026-06-23 10:14:30.005 [thread] INFO  com.package.Class - My message
      const timeMatch = line.match(/\d{2}:\d{2}:\d{2}/);
      const time = timeMatch ? timeMatch[0] : '';
      
      let service = 'SYSTEM';
      const upperLine = line.toUpperCase();
      if (upperLine.includes('ERROR') || upperLine.includes('EXCEPTION')) {
        service = 'ERROR';
      } else if (upperLine.includes('AUTH') || upperLine.includes('SECURITY') || upperLine.includes('JWT') || upperLine.includes('LOGIN')) {
        service = 'AUTH';
      } else if (upperLine.includes('AI-ENGINE') || upperLine.includes('ML-ENGINE') || upperLine.includes('AI') || upperLine.includes('ML')) {
        service = 'IA-ENGINE';
      } else if (upperLine.includes('SCHEDULER') || upperLine.includes('CRON') || upperLine.includes('ALERT')) {
        service = 'SCHEDULER';
      }
      
      let message = line;
      const separatorIdx = line.indexOf(' - ');
      if (separatorIdx !== -1) {
        message = line.substring(separatorIdx + 3);
      } else {
        message = line.replace(/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}\.\d{3}\s+\[[^\]]+\]\s+[A-Z]+\s+[^\s]+\s+-\s+/, '');
      }
      
      return { time, service, message };
    };

    const fetchMetrics = async () => {
      try {
        const response = await adminApi.getSystemMetrics();
        if (response && response.data) {
          metrics.value = response.data;
        }
      } catch (error) {
        console.error('Failed to fetch system metrics', error);
      }
    };

    const fetchLogs = async () => {
      if (isPaused.value) return;
      try {
        const response = await adminApi.getServerLogs();
        if (response && response.data) {
          systemLogs.value = response.data.map(line => parseLogLine(line));
        }
      } catch (error) {
        console.error('Failed to fetch server logs', error);
      }
    };

    onMounted(() => {
      fetchMetrics();
      fetchLogs();
      intervalId = setInterval(() => {
        fetchMetrics();
        fetchLogs();
      }, 5000); // Rafraîchissement toutes les 5 secondes
    });

    onUnmounted(() => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    });

    const formatMemory = (bytes) => {
      if (!bytes) return '0 MB';
      const mb = bytes / (1024 * 1024);
      if (mb > 1024) {
        return (mb / 1024).toFixed(1) + ' GB';
      }
      return Math.round(mb) + ' MB';
    };

    const cronJobs = [
      { path: 'tax/generate-monthly', label: 'Déclarations Mensuelles', description: 'Génération automatique TVA / TPS - Tous les marchands', schedule: '0 0 1 * *', icon: 'fas fa-database' },
      { path: 'tax/generate-annual', label: 'Déclarations Annuelles', description: 'Génération bilans annuels - Patente / IS', schedule: '0 0 1 1 *', icon: 'fas fa-calculator' },
      { path: 'tax/mark-overdue', label: 'Vérification Échéances', description: 'Contrôle des retards de paiement et pénalités', schedule: '0 12 * * *', icon: 'fas fa-clock' },
      { path: 'tax/send-reminders', label: 'Rappels de Paiement', description: 'Envoi relances Push & Email (J-7 à J+1)', schedule: '0 9 * * *', icon: 'fas fa-paper-plane' }
    ];

    const getServiceClass = (service) => {
      const s = (service || '').toUpperCase();
      if (s === 'AUTH') return 'service-auth';
      if (s === 'IA-ENGINE') return 'service-ia';
      if (s === 'SCHEDULER') return 'service-scheduler';
      if (s === 'MANUAL-TRIGGER') return 'service-manual';
      if (s === 'ERROR') return 'service-error';
      return 'service-default';
    };

    const triggerCron = async (path, label) => {
      loadingJobs[path] = true;
      
      if (!isPaused.value) {
        systemLogs.value.unshift({
          time: new Date().toLocaleTimeString('fr-FR'),
          service: 'MANUAL-TRIGGER',
          message: `Démarrage manuel : ${label} (${path})`
        });
      }

      try {
        await adminApi.triggerCron(path);
        
        if (!isPaused.value) {
          systemLogs.value.unshift({
            time: new Date().toLocaleTimeString('fr-FR'),
            service: 'SCHEDULER',
            message: `Succès : ${label} exécuté avec succès.`
          });
        }
      } catch (e) {
        if (!isPaused.value) {
          systemLogs.value.unshift({
            time: new Date().toLocaleTimeString('fr-FR'),
            service: 'ERROR',
            message: `Échec : Erreur lors de l'exécution de '${label}' (${e.message || 'Serveur indisponible'})`
          });
        }
      } finally {
        loadingJobs[path] = false;
      }
    };

    const clearLogs = () => {
      systemLogs.value = [];
    };

    // --- Rattrapage comptable : Solde d'Ouverture ---
    const backfillResult = ref(null);
    const backfillLoading = ref(false);

    const statusLabel = (status) => ({
      MATCHED: 'Corrigeable',
      AMBIGUOUS: 'Ambigu — revue manuelle',
      NO_TRANSACTION_FOUND: 'Aucune transaction trouvée',
      ALREADY_APPLIED: 'Déjà à jour',
      PERIOD_CLOSED: 'Période comptable clôturée',
      ERROR: 'Erreur'
    }[status] || status);

    const statusClass = (status) => ({
      MATCHED: 'status-matched',
      AMBIGUOUS: 'status-ambiguous',
      NO_TRANSACTION_FOUND: 'status-not-found',
      ALREADY_APPLIED: 'status-applied',
      PERIOD_CLOSED: 'status-period-closed',
      ERROR: 'status-error'
    }[status] || '');

    const formatAmount = (value) => {
      if (value === null || value === undefined) return '—';
      return new Intl.NumberFormat('fr-FR').format(value) + ' XOF';
    };

    const runPreview = async () => {
      backfillLoading.value = 'preview';
      try {
        const response = await adminApi.previewOpeningBalanceBackfill();
        backfillResult.value = response.data || response;
      } catch (error) {
        console.error('Échec de l\'aperçu du rattrapage', error);
        alert(`Échec de l'aperçu : ${error.message || 'Serveur indisponible'}`);
      } finally {
        backfillLoading.value = false;
      }
    };

    const confirmApply = async () => {
      if (!backfillResult.value || backfillResult.value.matchedCount === 0) return;
      const ok = confirm(
        `Cela va comptabiliser le solde d'ouverture de ${backfillResult.value.matchedCount} compte(s) ` +
        `(création d'écritures au grand livre, compte 101 Capital). Les comptes ambigus ou sans transaction ne seront pas touchés. Continuer ?`
      );
      if (!ok) return;

      backfillLoading.value = 'apply';
      try {
        const response = await adminApi.applyOpeningBalanceBackfill();
        backfillResult.value = response.data || response;
        alert(`Rattrapage appliqué : ${backfillResult.value.appliedCount} compte(s) corrigé(s).`);
      } catch (error) {
        console.error('Échec de l\'application du rattrapage', error);
        alert(`Échec de l'application : ${error.message || 'Serveur indisponible'}`);
      } finally {
        backfillLoading.value = false;
      }
    };

    const togglePause = () => {
      isPaused.value = !isPaused.value;
      if (!isPaused.value) {
        systemLogs.value.unshift({
          time: new Date().toLocaleTimeString('fr-FR'),
          service: 'SCHEDULER',
          message: `Flux console repris par l'administrateur.`
        });
      }
    };

    const copyLogs = async () => {
      if (systemLogs.value.length === 0) return;
      const text = systemLogs.value.map(l => `[${l.time}] [${l.service}] ${l.message}`).join('\n');
      try {
        await navigator.clipboard.writeText(text);
        alert('Logs copiés dans le presse-papiers.');
      } catch (err) {
        alert('Impossible de copier les logs.');
      }
    };

    return { 
      cronJobs, 
      loadingJobs, 
      systemLogs, 
      metrics,
      formatMemory,
      triggerCron, 
      getServiceClass, 
      clearLogs, 
      togglePause, 
      isPaused,
      copyLogs,
      consoleContainer,
      backfillResult,
      backfillLoading,
      statusLabel,
      statusClass,
      formatAmount,
      runPreview,
      confirmApply
    };
  }
}
</script>

<style scoped>
.admin-maintenance-viewport {
  width: 100%;
  min-height: 100%;
}

/* System metrics strip */
.system-metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

.metric-card-bo {
  background: white;
  border: 1px solid var(--border-subtle);
  border-radius: 1.25rem;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  box-shadow: var(--shadow-sm);
}

.metric-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.metric-icon-wrapper.cpu { background: #eff6ff; color: #3b82f6; }
.metric-icon-wrapper.ram { background: #f0fdf4; color: #22c55e; }
.metric-icon-wrapper.queue { background: #faf5ff; color: #a855f7; }
.metric-icon-wrapper.jobs { background: #fff7ed; color: #f97316; }

.metric-details {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.metric-label {
  font-size: 0.7rem;
  font-weight: 900;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.metric-value {
  font-size: 1.1rem;
  font-weight: 900;
  color: var(--text-main);
  margin-top: 0.15rem;
}

.metric-status {
  font-size: 0.65rem;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.2rem;
}

.metric-status.online {
  color: #166534;
}

.status-pulse-small {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  display: inline-block;
}

.status-pulse-small.green {
  background: #22c55e;
  box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
  animation: pulse-green-small 2s infinite;
}

@keyframes pulse-green-small {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 4px rgba(34, 197, 94, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
}

/* Maintenance Grid */
.maintenance-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: start;
}

.maintenance-card {
  background: white;
  border-radius: 1.5rem;
  border: 1px solid var(--border-subtle);
  padding: 2rem;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
}

.card-header-bo {
  display: flex;
  align-items: center;
  gap: 1rem;
  text-align: left;
}

.card-header-bo i {
  font-size: 1.5rem;
  color: var(--accent);
}

.card-header-bo h4 {
  font-size: 1.25rem;
  font-weight: 900;
  color: var(--text-main);
}

.card-header-bo p {
  font-size: 0.8rem;
  color: var(--text-muted);
}

/* Cron list */
.cron-jobs-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cron-item-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.25rem;
  border-radius: 1rem;
  border: 1px solid var(--border-strong);
  background: var(--bg-surface-dim);
  transition: all 0.3s;
}

.cron-item-card:hover {
  border-color: var(--primary-light);
  background: white;
  box-shadow: var(--shadow-sm);
}

.cron-item-icon {
  width: 44px;
  height: 44px;
  border-radius: 0.75rem;
  background: var(--bg-surface-inverse);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.cron-item-body {
  flex: 1;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.cron-item-header-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cron-item-header-info h5 {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--text-main);
  margin: 0;
}

.cron-schedule-tag {
  font-size: 0.65rem;
  font-weight: 800;
  color: var(--accent);
  background: rgba(244, 63, 94, 0.08);
  padding: 0.15rem 0.45rem;
  border-radius: 0.35rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.cron-item-desc {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin: 0;
}

.btn-trigger-cron {
  background: var(--bg-surface-inverse);
  color: white;
  padding: 0.6rem 1rem;
  border-radius: 0.5rem;
  border: none;
  font-weight: 800;
  font-size: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  transition: all 0.3s var(--bounce);
  flex-shrink: 0;
}

.btn-trigger-cron:hover:not(:disabled) {
  transform: scale(1.03);
  background: #1e293b;
  box-shadow: 0 4px 10px rgba(15, 23, 42, 0.15);
}

.btn-trigger-cron:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Terminal Console Styling */
.terminal-card {
  background: #0f172a;
  border-color: rgba(255, 255, 255, 0.05);
  color: #94a3b8;
  padding: 1.5rem;
}

.terminal-header-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 1rem;
}

.terminal-branding {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.terminal-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.terminal-dot.red { background: #ef4444; }
.terminal-dot.yellow { background: #f59e0b; }
.terminal-dot.green { background: #22c55e; }

.terminal-title {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  font-weight: 800;
  color: #475569;
  letter-spacing: 0.1em;
  margin-left: 0.5rem;
}

.terminal-actions {
  display: flex;
  gap: 0.5rem;
}

.terminal-btn {
  background: rgba(255, 255, 255, 0.03);
  color: #64748b;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 0.35rem;
  padding: 0.35rem 0.65rem;
  font-size: 0.7rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.terminal-btn:hover {
  background: rgba(255, 255, 255, 0.06);
  color: white;
  border-color: rgba(255, 255, 255, 0.15);
}

.terminal-btn.active {
  background: rgba(244, 63, 94, 0.1);
  color: #fda4af;
  border-color: rgba(244, 63, 94, 0.2);
}

.terminal-console {
  height: 440px;
  overflow-y: auto;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  text-align: left;
  padding: 1.5rem 0 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.terminal-console::-webkit-scrollbar {
  width: 6px;
}
.terminal-console::-webkit-scrollbar-track {
  background: transparent;
}
.terminal-console::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.06);
  border-radius: 10px;
}
.terminal-console::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.12);
}

.empty-terminal-state {
  color: #475569;
  font-size: 0.8rem;
  margin: auto;
  max-width: 280px;
  text-align: center;
  line-height: 1.5;
  padding: 4rem 0;
}

.terminal-line {
  line-height: 1.6;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.log-time {
  color: #475569;
}

.log-service {
  font-weight: 800;
  text-transform: uppercase;
  padding: 0 0.25rem;
  border-radius: 0.2rem;
  font-size: 0.7rem;
}

.service-auth { color: #38bdf8; background: rgba(56, 189, 248, 0.08); }
.service-ia { color: #fb923c; background: rgba(251, 146, 60, 0.08); }
.service-scheduler { color: #c084fc; background: rgba(192, 132, 252, 0.08); }
.service-manual { color: #4ade80; background: rgba(74, 222, 128, 0.08); }
.service-error { color: #f87171; background: rgba(248, 113, 113, 0.08); }
.service-default { color: #94a3b8; }

.log-message {
  color: #cbd5e1;
}

/* Rattrapage comptable */
.backfill-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-apply-backfill {
  background: #166534;
}

.btn-apply-backfill:hover:not(:disabled) {
  background: #14532d;
}

.backfill-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.backfill-badge {
  font-size: 0.7rem;
  font-weight: 800;
  padding: 0.35rem 0.75rem;
  border-radius: 0.5rem;
}

.backfill-badge.matched { background: #f0fdf4; color: #166534; }
.backfill-badge.ambiguous { background: #fffbeb; color: #92400e; }
.backfill-badge.not-found { background: #f8fafc; color: #475569; }
.backfill-badge.applied { background: #eff6ff; color: #1e40af; }
.backfill-badge.period-closed { background: #fff7ed; color: #9a3412; }
.backfill-badge.error { background: rgba(244, 63, 94, 0.1); color: #be123c; }
.backfill-badge.done { background: #ecfdf5; color: #065f46; }

.backfill-table-wrapper {
  overflow-x: auto;
  border: 1px solid var(--border-subtle);
  border-radius: 0.75rem;
}

.backfill-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
  text-align: left;
}

.backfill-table th {
  background: var(--bg-surface-dim);
  padding: 0.65rem 1rem;
  font-size: 0.65rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-dim);
}

.backfill-table td {
  padding: 0.65rem 1rem;
  border-top: 1px solid var(--border-subtle);
  color: var(--text-main);
}

.backfill-status-tag {
  font-size: 0.65rem;
  font-weight: 800;
  padding: 0.2rem 0.5rem;
  border-radius: 0.35rem;
  white-space: nowrap;
}

.backfill-status-note {
  font-size: 0.7rem;
  color: var(--text-muted);
  margin-top: 0.3rem;
  max-width: 320px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-matched { background: #f0fdf4; color: #166534; }
.status-ambiguous { background: #fffbeb; color: #92400e; }
.status-not-found { background: #f8fafc; color: #475569; }
.status-applied { background: #eff6ff; color: #1e40af; }
.status-period-closed { background: #fff7ed; color: #9a3412; }
.status-error { background: rgba(244, 63, 94, 0.1); color: #be123c; }

@media (max-width: 1024px) {
  .system-metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .maintenance-grid {
    grid-template-columns: 1fr;
  }
}
</style>
