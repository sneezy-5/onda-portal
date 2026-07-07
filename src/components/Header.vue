<template>
  <header class="header-elite glass">
    <div class="header-inner-elite">
      <!-- Dynamic Breadcrumbs -->
      <div class="header-context reveal">
        <div class="context-pill">
          <span class="ctx-root">ONDA INFRA</span>
          <span class="ctx-sep">/</span>
          <span class="ctx-active">{{ activeViewLabel }}</span>
        </div>
      </div>

      <!-- System Telemetry & Actions -->
      <div class="header-actions-elite reveal">
        <div class="telemetry-box">
          <div class="telemetry-item">
            <span class="t-label">API LATENCY</span>
            <span class="t-value">12ms</span>
          </div>
          <div class="telemetry-item divider"></div>
          <div class="telemetry-item">
            <span class="t-label">REGION</span>
            <span class="t-value">WA-1</span>
          </div>
        </div>

        <button class="btn-logout-elite" @click="logout">
          <span class="logout-lb">Déconnexion</span>
          <span class="logout-ic"><i class="fas fa-sign-out-alt"></i></span>
        </button>
      </div>
    </div>
  </header>
</template>

<script>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

export default {
  name: 'Header',
  setup() {
    const route = useRoute();
    const router = useRouter();

    const activeViewLabel = computed(() => {
      const labels = {
        Dashboard: 'CONSOLE MONITOR',
        Organizations: 'GESTION CLIENTS',
        AIConnectors: 'IA CONNECTEURS',
        ApiDocs: 'DOCUMENTATION API',
        Billing: 'FACTURATION & QUOTAS'
      };
      return labels[route.name] || 'PARTNER CONSOLE';
    });

    const logout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('apiKey');
      router.push({ name: 'Landing' });
    };

    return { activeViewLabel, logout };
  }
}
</script>

<style scoped>
.header-elite {
  position: sticky;
  top: 0;
  z-index: 900;
  padding: 1.5rem 3rem;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(16px) saturate(180%);
  border-bottom: 1px solid rgba(226, 232, 240, 0.6);
}

.header-inner-elite { display: flex; justify-content: space-between; align-items: center; }

.context-pill { display: flex; align-items: center; gap: 0.75rem; background: var(--bg-surface-dim); padding: 0.5rem 1.25rem; border-radius: 99rem; border: 1px solid var(--border-strong); }
.ctx-root { font-size: 0.7rem; font-weight: 900; color: var(--text-dim); letter-spacing: 0.1em; }
.ctx-sep { color: var(--border-strong); font-weight: 300; }
.ctx-active { font-size: 0.75rem; font-weight: 800; color: var(--text-main); }

.header-actions-elite { display: flex; align-items: center; gap: 2.5rem; }

.telemetry-box { display: flex; align-items: center; gap: 1.5rem; background: white; padding: 0.5rem 1.5rem; border-radius: 12px; border: 1px solid var(--border-strong); box-shadow: var(--shadow-sm); }
.telemetry-item { display: flex; flex-direction: column; align-items: center; }
.telemetry-item.divider { width: 1px; height: 20px; background: var(--border-strong); }
.t-label { font-size: 0.55rem; font-weight: 900; color: var(--text-dim); letter-spacing: 0.05em; margin-bottom: 0.1rem; }
.t-value { font-size: 0.8rem; font-weight: 800; color: var(--primary-dark); font-family: 'JetBrains Mono', monospace; }

.btn-logout-elite {
  background: white; border: 1px solid #FECDD3; color: #E11D48;
  padding: 0.6rem 1.25rem; border-radius: 10px; cursor: pointer;
  font-family: var(--font-heading); font-weight: 800; font-size: 0.85rem;
  display: flex; align-items: center; gap: 0.75rem; transition: all 0.3s;
}

.btn-logout-elite:hover { background: #BE123C; color: white; border-color: #BE123C; transform: scale(1.05); }

@media (max-width: 768px) {
  .telemetry-box { display: none; }
  .header-elite { padding: 1.5rem; }
}
</style>
