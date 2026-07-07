<template>
  <div class="admin-dashboard-viewport reveal">
    <div class="bo-page-header mb-12">
      <h2 class="text-4xl font-black tracking-tight">Console <span class="text-accent">Centrale</span></h2>
      <p class="text-muted mt-2">Indicateurs de performance globale de la plateforme Onda.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
      <div class="card-premium p-8 border-l-4 border-primary">
        <div class="text-muted text-sm font-bold mb-1 uppercase">Utilisateurs Totaux</div>
        <div class="text-4xl font-bold">{{ stats.totalUsers }}</div>
      </div>
      <div class="card-premium p-8 border-l-4 border-accent">
        <div class="text-muted text-sm font-bold mb-1 uppercase">Organisations</div>
        <div class="text-4xl font-bold">{{ stats.totalOrganizations }}</div>
      </div>
      <div class="card-premium p-8 border-l-4 border-success">
        <div class="text-muted text-sm font-bold mb-1 uppercase">GMV Total (XOF)</div>
        <div class="text-2xl font-bold text-success">{{ formatCurrency(stats.totalGmv) }}</div>
      </div>
      <div class="card-premium p-8 border-l-4 border-warning">
        <div class="text-muted text-sm font-bold mb-1 uppercase">Transactions</div>
        <div class="text-4xl font-bold">{{ stats.totalTransactions }}</div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div class="card-premium p-8">
        <h3 class="text-xl font-bold mb-6">Répartition par Type d'Organisation</h3>
        <div class="space-y-4">
          <div v-for="(count, type) in stats.orgsByType" :key="type" class="flex justify-between items-center">
            <span class="font-bold text-dim">{{ type }}</span>
            <div class="flex items-center gap-4 flex-1 mx-8">
              <div class="progress-bg h-2 flex-1">
                <div class="progress-bar h-2" :style="{ width: (count / stats.totalOrganizations * 100) + '%' }"></div>
              </div>
              <span class="text-sm font-bold w-8">{{ count }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="card-premium p-8">
         <h3 class="text-xl font-bold mb-6">Répartition par Rôle Utilisateur</h3>
         <div class="flex items-end justify-between h-48 gap-4 px-4">
            <div v-for="(count, role) in stats.usersByRole" :key="role" class="flex flex-col items-center flex-1">
               <div class="bar-chart-item" :style="{ height: Math.min(100, (count / (stats.totalUsers || 1) * 200)) + '%' }">
                 <span class="bar-val">{{ count }}</span>
               </div>
               <span class="text-xs font-bold mt-4">{{ formatRoleName(role) }}</span>
            </div>
         </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import adminApi from '../../services/adminApi';

export default {
  name: 'AdminDashboard',
  setup() {
    const stats = ref({
      totalUsers: 1420,
      totalOrganizations: 450,
      activeUsersLast7Days: 312,
      totalGmv: 128450000.50,
      totalTransactions: 18450,
      orgsByType: { TPE: 280, PME: 150, SYSTEM: 1, CORPORATE: 19 },
      usersByRole: { MERCHANT: 1350, PARTNER: 60, SUPER_ADMIN: 10 }
    });

    const formatCurrency = (val) => {
      return new Intl.NumberFormat('fr-CI', { style: 'currency', currency: 'XOF' }).format(val);
    };

    const formatRoleName = (role) => {
      const roles = {
        'SUPER_ADMIN': 'Admin',
        'ADMIN': 'Admin',
        'MERCHANT': 'Marchand',
        'PARTNER': 'Partenaire API',
        'USER': 'Utilisateur'
      };
      return roles[role] || role;
    };

    onMounted(async () => {
        try {
            const response = await adminApi.getPlatformStats();
            if (response.success) {
                stats.value = response.data;
            }
        } catch (e) {
            console.warn('Using mock stats', e);
        }
    });

    return { stats, formatCurrency, formatRoleName };
  }
}
</script>

<style scoped>
.admin-dashboard-viewport {
  width: 100%;
  min-height: 100%;
}

.progress-bg { background: #F1F5F9; border-radius: 4px; overflow: hidden; }
.progress-bar { background: var(--primary-gradient); border-radius: 4px; }
.bar-chart-item {
  background: var(--accent-gradient);
  width: 100%;
  border-radius: 6px 6px 0 0;
  position: relative;
  transition: height 1s ease-out;
}
.bar-val {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--text-muted);
}
</style>
