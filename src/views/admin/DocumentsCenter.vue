<template>
  <div class="documents-center">
    <div class="dc-header">
      <div>
        <h1>Centre de documents</h1>
        <p class="dc-sub">Toutes les preuves (KYC, conformité, équipement, banque) — partenaires &amp; mobile</p>
      </div>
      <button class="dc-refresh" @click="load" :disabled="loading">↻ Actualiser</button>
    </div>

    <!-- Filtres -->
    <div class="dc-filters">
      <select v-model="filters.category" @change="load">
        <option value="ALL">Toutes catégories</option>
        <option value="KYC">Identité (KYC)</option>
        <option value="CONFORMITE">Conformité fiscale</option>
        <option value="EQUIPEMENT">Équipement / patrimoine</option>
        <option value="BANQUE">Preuve bancaire</option>
      </select>
      <select v-model="filters.source" @change="load">
        <option value="ALL">Toutes sources</option>
        <option value="PARTENAIRE">Partenaires</option>
        <option value="MOBILE">Mobile (direct)</option>
      </select>
      <select v-model="filters.env" @change="load">
        <option value="all">Tous environnements</option>
        <option value="production">Production</option>
        <option value="sandbox">Sandbox (partenaires)</option>
      </select>
      <select v-model="filters.status" @change="load">
        <option value="ALL">Tous statuts</option>
        <option value="PENDING">En attente</option>
        <option value="PENDING_REVIEW">En revue</option>
        <option value="VERIFIED">Vérifié</option>
        <option value="CERTIFIED">Certifié</option>
        <option value="SUSPICIOUS">Suspect</option>
        <option value="REJECTED">Rejeté</option>
      </select>
      <span class="dc-count">{{ docs.length }} document(s)</span>
    </div>

    <div v-if="loading" class="dc-state">Chargement…</div>
    <div v-else-if="docs.length === 0" class="dc-state">Aucun document.</div>

    <div v-else class="dc-grid">
      <div v-for="d in docs" :key="d.fileId" class="dc-card" @click="preview(d)">
        <div class="dc-thumb">
          <img v-if="images[d.fileId]" :src="images[d.fileId]" alt="preuve" />
          <div v-else class="dc-thumb-ph">🖼️</div>
        </div>
        <div class="dc-meta">
          <div class="dc-badges">
            <span class="badge cat" :class="d.category">{{ d.categoryLabel }}</span>
            <span class="badge src" :class="d.source">{{ d.source }}</span>
            <span v-if="d.environment === 'sandbox'" class="badge env">SANDBOX</span>
          </div>
          <div class="dc-org">{{ d.organizationName || '—' }}</div>
          <div v-if="d.partnerName" class="dc-partner">via {{ d.partnerName }}</div>
          <div class="dc-status" :class="statusClass(d.verificationStatus)">{{ d.verificationStatus }}</div>
        </div>
      </div>
    </div>

    <!-- Aperçu -->
    <div v-if="selected" class="dc-modal" @click.self="selected = null">
      <div class="dc-modal-box">
        <button class="dc-close" @click="selected = null">✕</button>
        <img v-if="images[selected.fileId]" :src="images[selected.fileId]" class="dc-modal-img" />
        <div class="dc-modal-info">
          <p><b>{{ selected.categoryLabel }}</b> · {{ selected.source }}</p>
          <p>{{ selected.organizationName }}<span v-if="selected.partnerName"> — via {{ selected.partnerName }}</span></p>
          <p>Statut : {{ selected.verificationStatus }}</p>
          <p class="dc-file">{{ selected.filename }} · {{ selected.contentType }}</p>
          <div v-if="canAudit(selected)" class="dc-actions">
            <button class="btn ok" @click="approve(selected)" :disabled="busy === selected.fileId">✓ Approuver</button>
            <button class="btn ko" @click="reject(selected)" :disabled="busy === selected.fileId">✕ Rejeter</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue';
import adminApi from '../../services/adminApi';

const docs = ref([]);
const images = reactive({});   // fileId -> objectURL
const loading = ref(false);
const selected = ref(null);
const busy = ref(null);
const filters = reactive({ category: 'ALL', source: 'ALL', status: 'ALL', env: 'all' });

// Seules les preuves bancaires (BANQUE) sont câblées ici ; KYC/conformité/équipement
// ont déjà leur propre écran de revue dédié (KycQueue, PatrimonyQueue).
const canAudit = (d) => d && d.category === 'BANQUE' && !['VERIFIED', 'CERTIFIED', 'REJECTED'].includes(d.verificationStatus);

const statusClass = (s) => {
  if (!s) return '';
  if (['CERTIFIED', 'VERIFIED'].includes(s)) return 'ok';
  if (['REJECTED', 'SUSPICIOUS'].includes(s)) return 'ko';
  return 'wait';
};

const revokeAll = () => {
  Object.values(images).forEach(u => { try { URL.revokeObjectURL(u); } catch (e) { /* noop */ } });
  Object.keys(images).forEach(k => delete images[k]);
};

const load = async () => {
  loading.value = true;
  revokeAll();
  try {
    const res = await adminApi.getDocuments({ ...filters, limit: 200 });
    docs.value = res.data || res || [];
    // Charge les vignettes (auth) en parallèle, sans bloquer l'affichage
    docs.value.forEach(async (d) => {
      try { images[d.fileId] = await adminApi.fetchImageObjectUrl(d.url); }
      catch (e) { /* image indisponible */ }
    });
  } catch (e) {
    console.error('Documents load failed', e);
    docs.value = [];
  } finally {
    loading.value = false;
  }
};

const preview = (d) => { selected.value = d; };

const approve = async (d) => {
  busy.value = d.fileId;
  try {
    await adminApi.approveDocument(d.fileId, 'Vérifié manuellement', d.environment);
    d.verificationStatus = 'VERIFIED';
    selected.value = null;
  } catch (e) { alert('Échec approbation : ' + e.message); }
  finally { busy.value = null; }
};

const reject = async (d) => {
  const reason = prompt('Motif du rejet ?', 'Preuve non conforme');
  if (reason === null) return;
  busy.value = d.fileId;
  try {
    await adminApi.rejectDocument(d.fileId, reason, d.environment);
    d.verificationStatus = 'REJECTED';
    selected.value = null;
  } catch (e) { alert('Échec rejet : ' + e.message); }
  finally { busy.value = null; }
};

onMounted(load);
onBeforeUnmount(revokeAll);
</script>

<style scoped>
.documents-center { padding: 24px; }
.dc-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 18px; }
.dc-header h1 { font-size: 22px; font-weight: 800; margin: 0; }
.dc-sub { color: #6b7280; font-size: 13px; margin-top: 4px; }
.dc-refresh { background: #111827; color: #fff; border: none; padding: 8px 14px; border-radius: 8px; cursor: pointer; font-weight: 600; }
.dc-filters { display: flex; gap: 10px; align-items: center; margin-bottom: 18px; flex-wrap: wrap; }
.dc-filters select { padding: 8px 12px; border-radius: 8px; border: 1px solid #d1d5db; background: #fff; font-size: 13px; }
.dc-count { color: #6b7280; font-size: 13px; margin-left: auto; }
.dc-state { padding: 60px; text-align: center; color: #6b7280; }

.dc-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
.dc-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; overflow: hidden; cursor: pointer; transition: box-shadow .15s, transform .15s; }
.dc-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,.1); transform: translateY(-2px); }
.dc-thumb { height: 150px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.dc-thumb img { width: 100%; height: 100%; object-fit: cover; }
.dc-thumb-ph { font-size: 40px; opacity: .4; }
.dc-meta { padding: 12px; }
.dc-badges { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px; }
.badge { font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 999px; letter-spacing: .3px; }
.badge.cat { background: #eef2ff; color: #4338ca; }
.badge.cat.KYC { background: #ede9fe; color: #6d28d9; }
.badge.cat.CONFORMITE { background: #fef3c7; color: #b45309; }
.badge.cat.EQUIPEMENT { background: #dcfce7; color: #15803d; }
.badge.cat.BANQUE { background: #dbeafe; color: #1d4ed8; }
.badge.src { background: #f3f4f6; color: #374151; }
.badge.src.PARTENAIRE { background: #fae8ff; color: #a21caf; }
.badge.env { background: #fef3c7; color: #b45309; }
.dc-org { font-weight: 700; font-size: 14px; color: #111827; }
.dc-partner { font-size: 11px; color: #6b7280; margin-top: 2px; }
.dc-status { margin-top: 8px; font-size: 11px; font-weight: 700; display: inline-block; padding: 2px 8px; border-radius: 6px; background: #f3f4f6; color: #374151; }
.dc-status.ok { background: #dcfce7; color: #15803d; }
.dc-status.ko { background: #fee2e2; color: #b91c1c; }
.dc-status.wait { background: #fef9c3; color: #a16207; }

.dc-modal { position: fixed; inset: 0; background: rgba(0,0,0,.7); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
.dc-modal-box { background: #fff; border-radius: 16px; max-width: 720px; width: 100%; max-height: 90vh; overflow: auto; position: relative; }
.dc-close { position: absolute; top: 12px; right: 12px; background: rgba(0,0,0,.5); color: #fff; border: none; width: 34px; height: 34px; border-radius: 50%; cursor: pointer; font-size: 16px; }
.dc-modal-img { width: 100%; max-height: 70vh; object-fit: contain; background: #111; }
.dc-modal-info { padding: 16px; }
.dc-modal-info p { margin: 4px 0; font-size: 14px; }
.dc-file { color: #6b7280; font-size: 12px; }
.dc-actions { display: flex; gap: 10px; margin-top: 14px; }
.dc-actions .btn { border: none; padding: 10px 18px; border-radius: 10px; cursor: pointer; font-weight: 800; font-size: 13px; }
.dc-actions .btn.ok { background: #16a34a; color: #fff; }
.dc-actions .btn.ko { background: #fee2e2; color: #b91c1c; }
.dc-actions .btn:disabled { opacity: .6; cursor: default; }
</style>
