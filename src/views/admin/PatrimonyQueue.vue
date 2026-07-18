<template>
  <div class="patrimony-queue">
    <div class="pq-header">
      <div>
        <h1>Certification du patrimoine</h1>
        <p class="pq-sub">Stock · biens · capital · comptes bancaires en attente de preuve</p>
      </div>
      <button class="pq-refresh" @click="load" :disabled="loading">↻ Actualiser</button>
    </div>

    <div v-if="loading" class="pq-state">Chargement…</div>
    <div v-else-if="items.length === 0" class="pq-state">✅ Aucune preuve en attente.</div>

    <div v-else class="pq-list">
      <div v-for="it in items" :key="it.type + it.id" class="pq-card">
        <div class="pq-proof">
          <img v-if="proofs[it.id]" :src="proofs[it.id]" alt="preuve" @click="zoom = proofs[it.id]" />
          <div v-else class="pq-proof-ph">
            <span v-if="it.type === 'BANK'">Preuve dans le centre de documents (Banque)</span>
            <span v-else>Pas d'aperçu</span>
          </div>
        </div>
        <div class="pq-info">
          <span class="badge" :class="it.type">{{ typeLabel(it.type) }}</span>
          <div class="pq-label">{{ it.label }}</div>
          <div class="pq-amount">{{ formatAmount(it.amount) }}</div>
          <div class="pq-org">Org : {{ it.organizationId }}</div>
        </div>
        <div class="pq-actions">
          <button class="btn ok" @click="certify(it)" :disabled="busy === it.id">✓ Certifier</button>
          <button class="btn ko" @click="reject(it)" :disabled="busy === it.id">✕ Rejeter</button>
        </div>
      </div>
    </div>

    <div v-if="zoom" class="pq-modal" @click.self="zoom = null">
      <img :src="zoom" class="pq-modal-img" />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue';
import adminApi from '../../services/adminApi';

const items = ref([]);
const proofs = reactive({});  // itemId -> objectURL
const loading = ref(false);
const busy = ref(null);
const zoom = ref(null);

const typeLabel = (t) => ({ STOCK: 'Stock', ASSET: 'Bien', EQUITY: 'Capital', BANK: 'Compte bancaire' }[t] || t);
const formatAmount = (a) => a != null ? Number(a).toLocaleString('fr-FR') + ' FCFA' : '—';

const revokeAll = () => {
  Object.values(proofs).forEach(u => { try { URL.revokeObjectURL(u); } catch (e) { /* noop */ } });
  Object.keys(proofs).forEach(k => delete proofs[k]);
};

const load = async () => {
  loading.value = true;
  revokeAll();
  try {
    const res = await adminApi.getPendingPatrimony();
    items.value = res.data || res || [];
    items.value.forEach(async (it) => {
      if (!it.proofFileId) return;
      try { proofs[it.id] = await adminApi.fetchImageObjectUrl(`/api/storage/${it.proofFileId}`); }
      catch (e) { /* image indisponible */ }
    });
  } catch (e) {
    console.error('Patrimony queue load failed', e);
    items.value = [];
  } finally {
    loading.value = false;
  }
};

const typeKey = (t) => t.toLowerCase(); // STOCK -> stock

const certify = async (it) => {
  busy.value = it.id;
  try {
    await adminApi.certifyPatrimony(typeKey(it.type), it.id, 'Vérifié manuellement');
    items.value = items.value.filter(x => !(x.type === it.type && x.id === it.id));
  } catch (e) { alert('Échec certification : ' + e.message); }
  finally { busy.value = null; }
};

const reject = async (it) => {
  const reason = prompt('Motif du rejet ?', 'Preuve non conforme');
  if (reason === null) return;
  busy.value = it.id;
  try {
    await adminApi.rejectPatrimony(typeKey(it.type), it.id, reason);
    items.value = items.value.filter(x => !(x.type === it.type && x.id === it.id));
  } catch (e) { alert('Échec rejet : ' + e.message); }
  finally { busy.value = null; }
};

onMounted(load);
onBeforeUnmount(revokeAll);
</script>

<style scoped>
.patrimony-queue { padding: 24px; }
.pq-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 18px; }
.pq-header h1 { font-size: 22px; font-weight: 800; margin: 0; }
.pq-sub { color: #6b7280; font-size: 13px; margin-top: 4px; }
.pq-refresh { background: #111827; color: #fff; border: none; padding: 8px 14px; border-radius: 8px; cursor: pointer; font-weight: 600; }
.pq-state { padding: 60px; text-align: center; color: #6b7280; }

.pq-list { display: flex; flex-direction: column; gap: 14px; }
.pq-card { display: flex; gap: 16px; align-items: center; background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; padding: 14px; }
.pq-proof { width: 120px; height: 90px; border-radius: 10px; overflow: hidden; background: #f3f4f6; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
.pq-proof img { width: 100%; height: 100%; object-fit: cover; cursor: zoom-in; }
.pq-proof-ph { font-size: 11px; color: #9ca3af; text-align: center; padding: 6px; }
.pq-info { flex: 1; }
.badge { font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 999px; }
.badge.STOCK { background: #ffedd5; color: #c2410c; }
.badge.ASSET { background: #dcfce7; color: #15803d; }
.badge.EQUITY { background: #ede9fe; color: #6d28d9; }
.badge.BANK { background: #dbeafe; color: #1d4ed8; }
.pq-label { font-weight: 700; font-size: 15px; margin-top: 6px; }
.pq-amount { font-weight: 900; font-size: 18px; color: #111827; margin-top: 2px; }
.pq-org { font-size: 11px; color: #9ca3af; margin-top: 4px; }
.pq-actions { display: flex; flex-direction: column; gap: 8px; }
.btn { border: none; padding: 10px 18px; border-radius: 10px; cursor: pointer; font-weight: 800; font-size: 13px; }
.btn.ok { background: #16a34a; color: #fff; }
.btn.ko { background: #fee2e2; color: #b91c1c; }
.btn:disabled { opacity: .5; cursor: default; }

.pq-modal { position: fixed; inset: 0; background: rgba(0,0,0,.8); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
.pq-modal-img { max-width: 90vw; max-height: 90vh; object-fit: contain; }
</style>
