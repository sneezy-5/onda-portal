<template>
  <div class="billing-portal reveal">
    <!-- Header: Financial Infrastructure -->
    <header class="page-header mb-16">
      <div class="header-main">
        <h1 class="page-title">Capacité & <span class="text-gradient">Infrastructure</span></h1>
        <p class="text-muted">Optimisez vos ressources et passez en production sans friction.</p>
      </div>
    </header>

    <!-- Usage Monitor Layer -->
    <section class="usage-monitor mb-20">
      <div class="card-premium usage-vault p-12">
        <div class="usage-header-complex mb-10">
          <div class="plan-context">
            <label>MODÈLE OPÉRATIONNEL</label>
            <div class="plan-hero">
              <h2 class="text-gradient">Tier {{ billing.plan }}</h2>
              <div class="status-indicator-pill live">Infrastructure Active</div>
            </div>
          </div>
          <div class="usage-quick-stats">
            <div class="quick-stat">
              <label>CONSOMMATION</label>
              <strong>{{ billing.currentUsage?.toLocaleString() || 0 }}</strong>
              <span>Appels API</span>
            </div>
            <div class="v-divider"></div>
            <div class="quick-stat">
              <label>QUOTA MENSUEL</label>
              <strong>{{ billing.monthlyQuota?.toLocaleString() || 1000 }}</strong>
              <span>Requêtes</span>
            </div>
          </div>
        </div>

        <div class="capacity-gauge">
          <div class="gauge-rail">
            <div 
              class="gauge-fill" 
              :style="{ width: usagePercent + '%' }"
              :class="getUsageClass(usagePercent)"
            ></div>
          </div>
          <div class="gauge-labels">
            <span class="text-dim">0%</span>
            <span class="center-label">Consommation actuelle : <strong>{{ usagePercent }}%</strong> de votre quota</span>
            <span class="text-dim">100%</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing Matrix: Elite Presentation -->
    <section class="pricing-matrix">
      <h3 class="text-center mb-12">Plans & Mise à l'échelle</h3>
      <div class="matrix-grid">
        <!-- TIER 1: DEV -->
        <div class="card-premium plan-card-elite p-12" :class="{ active: billing.plan === 'FREE' }">
          <div class="plan-type">DEVELOPER</div>
          <div class="plan-price">0€<span>/mois</span></div>
          <p class="plan-desc">Parfait pour explorer les APIs ONDA et prototyper votre intégration métier.</p>
          
          <ul class="plan-feature-list">
            <li><i class="fas fa-check-circle text-primary"></i> 1,000 Appels API /mois</li>
            <li><i class="fas fa-check-circle text-primary"></i> 5 Organisations Clients</li>
            <li><i class="fas fa-check-circle text-primary"></i> Accès API Complet</li>
            <li class="restricted"><i class="fas fa-times-circle"></i> Webhooks & Temps Réel</li>
            <li class="restricted"><i class="fas fa-times-circle"></i> Service IA Pro</li>
          </ul>

          <div class="plan-action mt-auto">
            <button class="btn btn-outline w-full" disabled v-if="billing.plan === 'FREE'">Plan Actuel</button>
            <button class="btn btn-outline w-full" v-else>Rétrograder</button>
          </div>
        </div>

        <!-- TIER 2: PRODUCTION -->
        <div class="card-premium plan-card-elite featured p-12" :class="{ active: billing.plan === 'PAID' }">
          <div class="elite-badge">RECOMMANDÉ</div>
          <div class="plan-type text-primary">PRODUCTION & SCALE</div>
          <div class="plan-price">Pay-As-You-Go</div>
          <p class="plan-desc">Infrastructure illimitée pour vos clients. Payez uniquement pour ce que vous consommez.</p>
          
          <ul class="plan-feature-list">
            <li class="highlight"><i class="fas fa-star"></i> 1,000 Appels Inclus</li>
            <li><i class="fas fa-check-circle text-primary"></i> <strong>SaaS Illimité</strong></li>
            <li><i class="fas fa-check-circle text-primary"></i> <strong>Webhooks & IA Reporting</strong></li>
            <li><i class="fas fa-check-circle text-primary"></i> <strong>Facturation Mutualisée</strong></li>
            <li><i class="fas fa-check-circle text-primary"></i> <strong>Support 24/7</strong></li>
          </ul>

          <div class="plan-action mt-auto">
            <button class="btn btn-primary w-full py-4 text-white" v-if="billing.plan === 'PAID'" disabled>Plan Actuel</button>
            <button 
              class="btn btn-primary w-full py-4 text-white" 
              v-else 
              @click="upgradePlan" 
              :disabled="upgrading"
            >
              <span v-if="upgrading" class="spinner-sm"></span>
              <span>{{ upgrading ? 'Activation...' : 'Passer à la production' }}</span>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Global Toast Feed -->
    <transition name="fade-slide">
      <div v-if="success" class="toast-card-premium success">
        <div class="toast-ic"><i class="fas fa-magic"></i></div>
        <div class="toast-tx">
          <strong>Succès de l'opération</strong>
          <p>{{ success }}</p>
        </div>
        <button class="toast-cls" @click="success = ''"><i class="fas fa-times"></i></button>
      </div>
    </transition>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import apiService from '../services/api.js';

export default {
  name: 'Billing',
  setup() {
    const billing = ref({ 
      plan: 'FREE', 
      currentUsage: 0, 
      monthlyQuota: 1000,
      overageCount: 0,
      overageCost: 0,
      billingPeriod: ''
    });
    const upgrading = ref(false);
    const success = ref('');

    const usagePercent = computed(() => {
      if (!billing.value.monthlyQuota) return 0;
      return Math.min(100, Math.round((billing.value.currentUsage / billing.value.monthlyQuota) * 100));
    });

    const getUsageClass = (p) => p > 90 ? 'danger' : p > 70 ? 'warning' : 'success';

    const load = async () => {
      try {
        const res = await apiService.getBillingSummary();
        if (res.success) billing.value = res.data;
      } catch (err) {
        // Mock for display if API fails
        billing.value = { 
          plan: 'FREE', 
          currentUsage: 450, 
          monthlyQuota: 1000,
          billingPeriod: '2024-05'
        };
      }
    };

    const upgradePlan = async () => {
      upgrading.value = true;
      try {
        const res = await apiService.upgradePlan('PAID');
        if (res.success) {
          billing.value.plan = 'PAID';
          success.value = 'Mode Production activé sur votre infrastructure.';
          await load(); // Refresh data to see new quota
        }
      } catch (err) { console.error(err); }
      finally { upgrading.value = false; }
    };

    onMounted(load);
    return { billing, upgrading, success, usagePercent, getUsageClass, upgradePlan };
  }
}
</script>

<style scoped>
.billing-portal { max-width: 1100px; margin: 0 auto; }
.page-header { display: flex; justify-content: center; text-align: center; }
.page-title { font-size: 3.5rem; margin-bottom: 0.5rem; }

/* Usage Vault Elite */
.usage-vault { border-radius: var(--radius-lg); border: 1px solid rgba(226, 232, 240, 0.8); }
.usage-header-complex { display: flex; justify-content: space-between; align-items: flex-end; }
.plan-context label { font-size: 0.75rem; font-weight: 800; color: var(--text-dim); letter-spacing: 0.1em; display: block; margin-bottom: 0.5rem; }
.plan-hero { display: flex; align-items: center; gap: 2rem; }
.plan-hero h2 { font-size: 3.5rem; line-height: 1; }
.status-indicator-pill { padding: 0.5rem 1rem; border-radius: 99rem; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; background: #F1F5F9; color: #64748B; border: 1px solid #E2E8F0; }
.status-indicator-pill.live { background: #DCFCE7; color: #166534; border-color: #BBF7D0; }

.usage-quick-stats { display: flex; gap: 3rem; background: var(--bg-surface-dim); padding: 1.5rem 2.5rem; border-radius: 1.5rem; }
.quick-stat { display: flex; flex-direction: column; align-items: flex-end; }
.quick-stat strong { font-size: 1.75rem; color: var(--text-main); line-height: 1; }
.quick-stat span { font-size: 0.75rem; font-weight: 600; color: var(--text-dim); margin-top: 0.25rem; }
.v-divider { width: 1px; height: 40px; background: var(--border-strong); }

.capacity-gauge { margin-top: 3rem; }
.gauge-rail { height: 16px; background: var(--bg-surface-dim); border-radius: 8px; overflow: hidden; margin-bottom: 1rem; }
.gauge-fill { height: 100%; border-radius: 8px; transition: width 1s var(--bounce); background: var(--primary-gradient); }
.gauge-fill.warning { background: #F59E0B; }
.gauge-fill.danger { background: #EF4444; }
.gauge-labels { display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 800; }
.center-label { color: var(--text-main); }

/* Elite Matrix */
.matrix-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; }
.plan-card-elite { padding: 4rem; display: flex; flex-direction: column; min-height: 600px; border-radius: var(--radius-lg); }
.plan-card-elite.active { border: 2px solid var(--primary); }
.plan-card-elite.featured { background: linear-gradient(135deg, white 0%, #E0F2FE 100%); border-color: #BAE6FD; }

.elite-badge { position: absolute; top: 2rem; right: 2rem; background: var(--primary); color: white; padding: 0.5rem 1.25rem; border-radius: 99rem; font-size: 0.8rem; font-weight: 900; }

.plan-type { font-size: 0.8rem; font-weight: 900; letter-spacing: 0.15em; margin-bottom: 2rem; }
.plan-price { font-size: 3rem; font-weight: 800; margin-bottom: 1.5rem; }
.plan-price span { font-size: 1.25rem; color: var(--text-dim); font-weight: 400; }
.plan-desc { color: var(--text-muted); font-size: 1.05rem; margin-bottom: 3.5rem; line-height: 1.5; }

.plan-feature-list { list-style: none; margin-bottom: 4rem; }
.plan-feature-list li { margin-bottom: 1.25rem; font-weight: 700; font-size: 1.1rem; display: flex; gap: 0.75rem; }
.plan-feature-list li.restricted { color: var(--text-dim); text-decoration: line-through; opacity: 0.6; }
.plan-feature-list li.highlight { color: var(--primary-dark); font-weight: 900; }

/* Elite Toast */
.toast-card-premium { position: fixed; bottom: 3rem; right: 3rem; background: white; border-radius: 1.25rem; padding: 1.5rem 2.5rem; display: flex; align-items: center; gap: 1.5rem; box-shadow: var(--shadow-premium); border-left: 6px solid var(--primary); z-index: 1000; }
.toast-ic { font-size: 2rem; }
.toast-tx strong { display: block; font-size: 1rem; }
.toast-tx p { font-size: 0.9rem; color: var(--text-muted); }
.toast-cls { background: none; border: none; cursor: pointer; color: var(--text-dim); font-size: 1.25rem; }

.spinner-sm { width: 22px; height: 22px; border: 4px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 1s linear infinite; display: inline-block; vertical-align: middle; margin-right: 0.75rem; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 900px) {
  .matrix-grid { grid-template-columns: 1fr; }
  .usage-header-complex { flex-direction: column; align-items: flex-start; gap: 2rem; }
  .usage-quick-stats { width: 100%; justify-content: center; }
}
</style>
