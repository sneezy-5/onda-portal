<template>
  <div class="landing-page">
    <!-- Premium Navigation -->
    <nav class="nav glass">
      <div class="container nav-inner">
        <div class="logo">
          <img src="/logo.png" alt="ONDA" class="logo-img" />
          <span class="logo-type">ONDA</span>
        </div>
        <div class="nav-links">
          <a href="#solutions" class="nav-link">Solutions</a>
          <a href="#infra" class="nav-link">Infrastructure</a>
          <a href="#pricing" class="nav-link">Tarification</a>
          <div class="nav-divider"></div>
          <button class="btn btn-outline" @click="$emit('navigate', 'login')">Connexion</button>
          <button class="btn btn-primary" @click="$emit('navigate', 'login')">Démarrer</button>
        </div>
      </div>
    </nav>

    <!-- Cinematic Hero Section -->
    <section class="hero-cinematic">
      <div class="hero-bg-accent"></div>
      <div class="container hero-container">
        <div class="hero-text-content reveal">
          <div class="hero-badge mb-6">
            <span class="pulse-dot"></span>
            Disponible pour ERP & Fintech
          </div>
          <h1 class="hero-big-title mb-8">
            L'infrastructure <br />
            <span class="text-gradient">Financière Africaine.</span>
          </h1>
          <p class="hero-subtitle mb-12">
            Incorporez une comptabilité OHADA automatisée et une gestion de trésorerie <br /> 
            en temps réel directement dans vos applications via une API robuste.
          </p>
          <div class="hero-actions">
            <button class="btn btn-primary btn-xl" @click="$emit('navigate', 'login')">
              Obtenir mes accès API <i class="fas fa-arrow-right ml-2"></i>
            </button>
            <button class="btn btn-outline btn-xl">Explorer la documentation</button>
          </div>
        </div>

        <!-- High-Impact Code Visual -->
        <div class="hero-visual-wrapper reveal" style="animation-delay: 0.2s">
          <div class="terminal-premium card-premium">
            <div class="terminal-header">
              <div class="dots"><span></span><span></span><span></span></div>
              <div class="terminal-tab">POST /api/public/transactions</div>
            </div>
            <div class="terminal-body">
              <pre><code><span class="c-k">const</span> onda = <span class="c-k">require</span>(<span class="c-s">'onda-sdk'</span>);

<span class="c-k">await</span> onda.transactions.create({
  amount: <span class="c-n">250000</span>,
  currency: <span class="c-s">'XOF'</span>,
  type: <span class="c-s">'INCOME'</span>,
  category: <span class="c-s">'VENTE_RETAIL'</span>
});

<span class="c-c">// <i class="fas fa-check mr-1"></i> Transaction synchronisée OHADA</span></code></pre>
            </div>
          </div>
          <!-- Floating elements for "depth" -->
          <div class="floating-card glass card-premium">
            <div class="flex-between mb-4">
              <strong>Statut Sync</strong>
              <span class="badge-pill badge-success">Live</span>
            </div>
            <div class="stat-mini">14.2ms latency</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Architecture Section -->
    <section id="infra" class="section infra-overview">
      <div class="container">
        <div class="text-center mb-16 reveal">
          <h2 class="section-title mb-4">Deux APIs. Une seule plateforme.</h2>
          <p class="text-muted">Une séparation nette entre la gestion de vos clients et les flux financiers.</p>
        </div>

        <div class="infra-grid">
          <div class="card-premium infra-card p-10 reveal">
            <div class="infra-icon-box">
              <i class="fas fa-handshake"></i>
            </div>
            <h3>API Partenaire</h3>
            <p>Le centre de contrôle pour les éditeurs de logiciels. Provisionnez des comptes clients instantanément et surveillez votre infrastructure.</p>
            <ul class="infra-list">
              <li><i class="fas fa-check text-success mr-2"></i> Provisioning en temps réel</li>
              <li><i class="fas fa-check text-success mr-2"></i> Gestion des sous-clés API</li>
              <li><i class="fas fa-check text-success mr-2"></i> Monitoring des consommations</li>
            </ul>
          </div>

          <div class="card-premium infra-card p-10 reveal" style="animation-delay: 0.1s">
            <div class="infra-icon-box blue">
              <i class="fas fa-bolt"></i>
            </div>
            <h3>API Publique</h3>
            <p>L'interface opérationnelle pour vos clients. Injectez des données et récupérez des états financiers certifiés en quelques millisecondes.</p>
            <ul class="infra-list">
              <li><i class="fas fa-check text-primary mr-2"></i> Transactions OHADA-ready</li>
              <li><i class="fas fa-check text-primary mr-2"></i> Bilan & Résultats auto-générés</li>
              <li><i class="fas fa-check text-primary mr-2"></i> Prévisions de trésorerie IA</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer-premium">
      <div class="container">
        <div class="footer-top mb-12">
          <div class="footer-brand">
            <div class="logo mb-6">
              <img src="/logo.png" alt="ONDA" class="logo-img" />
              <span class="logo-type">ONDA</span>
            </div>
            <p class="text-dim">Bâtir le futur système financier de l'Afrique, ligne par ligne.</p>
          </div>
          <div class="footer-links">
            <div class="link-group">
              <strong>Produit</strong>
              <a href="#">Dashboard</a>
              <a href="#">Compte Partenaire</a>
              <a href="#">Sécurité</a>
            </div>
            <div class="link-group">
              <strong>Développeurs</strong>
              <a href="#">Documentation</a>
              <a href="#">API Status</a>
              <a href="#">Guides Intégration</a>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <p>© 2024 ONDA Infrastructure. Tous droits réservés.</p>
          <div class="legal-links">
            <a href="#">CGU</a>
            <a href="#">Confidentialité</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'LandingPage',
  emits: ['navigate']
}
</script>

<style scoped>
.landing-page { background: white; }

.nav { position: fixed; top: 0; left: 0; right: 0; height: 5rem; display: flex; align-items: center; z-index: 1000; }
.nav-inner { display: flex; justify-content: space-between; align-items: center; width: 100%; }
.logo { display: flex; align-items: center; }
.logo-img { height: 90px; }
.logo-type { font-size: 1.5rem; font-weight: 800; letter-spacing: -0.04em; }

.nav-links { display: flex; align-items: center; gap: 1.5rem; }
.nav-link { text-decoration: none; color: var(--text-muted); font-weight: 700; font-size: 0.95rem; }
.nav-divider { width: 1px; height: 24px; background: var(--border-strong); margin: 0 0.5rem; }

/* Cinematic Hero */
.hero-cinematic { padding: 12rem 0 8rem; position: relative; overflow: hidden; }
.hero-bg-accent { position: absolute; top: -20%; right: -10%; width: 60%; height: 80%; background: radial-gradient(circle, rgba(14, 165, 233, 0.08) 0%, transparent 70%); z-index: 0; pointer-events: none; }
.hero-container { position: relative; z-index: 1; display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 4rem; align-items: center; }

.hero-badge { display: inline-flex; align-items: center; gap: 0.75rem; background: var(--bg-surface-inverse); color: white; padding: 0.5rem 1.25rem; border-radius: 99rem; font-size: 0.75rem; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; }
.pulse-dot { width: 8px; height: 8px; background: #22C55E; border-radius: 50%; box-shadow: 0 0 10px #22C55E; animation: pulse 2s infinite; }

.hero-big-title { font-size: 5rem; line-height: 0.95; color: var(--text-main); }
.hero-subtitle { font-size: 1.35rem; color: var(--text-muted); line-height: 1.5; }

.btn-xl { padding: 1.25rem 2.5rem; font-size: 1.1rem; border-radius: 1rem; }

/* Hero Visual */
.hero-visual-wrapper { position: relative; }
.terminal-premium { background: var(--bg-surface-inverse); border: 1px solid #1E293B; box-shadow: var(--shadow-premium); border-radius: 1.5rem; overflow: hidden; transform: perspective(1000px) rotateY(-5deg) rotateX(5deg); }
.terminal-header { padding: 1rem 1.5rem; background: #1E293B; display: flex; align-items: center; gap: 2rem; }
.dots { display: flex; gap: 0.5rem; }
.dots span { width: 12px; height: 12px; border-radius: 50%; background: #334155; }
.terminal-tab { font-family: monospace; font-size: 0.8rem; color: #94A3B8; font-weight: 600; }
.terminal-body { padding: 3rem; font-family: 'JetBrains Mono', monospace; font-size: 1.05rem; line-height: 1.8; color: #E2E8F0; }

.c-k { color: #818CF8; }
.c-s { color: #34D399; }
.c-n { color: #F472B6; }
.c-c { color: #64748B; }

.floating-card { position: absolute; bottom: -2rem; right: -2rem; padding: 1.5rem 2rem; width: 240px; box-shadow: var(--shadow-lg); z-index: 2; border: 1px solid rgba(255,255,255,0.2); }
.stat-mini { font-size: 0.75rem; font-weight: 800; color: var(--text-dim); text-transform: uppercase; }

/* Infra Grid */
.section { padding: 10rem 0; }
.section-title { font-size: 3rem; }
.infra-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; }
.infra-card { border-radius: var(--radius-lg); }
.infra-icon-box { width: 80px; height: 80px; background: #F1F5F9; border-radius: 1.5rem; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; margin-bottom: 2rem; }
.infra-icon-box.blue { background: #E0F2FE; color: var(--primary); }
.infra-card h3 { font-size: 2rem; margin-bottom: 1rem; }
.infra-list { list-style: none; margin-top: 2rem; }
.infra-list li { margin-bottom: 0.75rem; font-weight: 700; color: var(--text-main); }

/* Footer */
.footer-premium { padding: 8rem 0 4rem; border-top: 1px solid var(--border-strong); background: var(--bg-app); }
.footer-top { display: flex; justify-content: space-between; }
.footer-links { display: flex; gap: 6rem; }
.link-group { display: flex; flex-direction: column; gap: 1rem; }
.link-group strong { font-size: 0.9rem; letter-spacing: 0.05em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 1rem; }
.link-group a { text-decoration: none; color: var(--text-dim); font-weight: 600; transition: color 0.2s; }
.link-group a:hover { color: var(--primary); }

.footer-bottom { display: flex; justify-content: space-between; padding-top: 4rem; border-top: 1px solid var(--border-subtle); color: var(--text-dim); font-size: 0.9rem; font-weight: 600; }
.legal-links { display: flex; gap: 2rem; }
.legal-links a { text-decoration: none; color: inherit; }

@keyframes pulse {
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
  70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
}

@media (max-width: 1024px) {
  .hero-container { grid-template-columns: 1fr; text-align: center; }
  .hero-big-title { font-size: 3.5rem; }
  .hero-actions { justify-content: center; }
  .hero-visual-wrapper { display: none; }
  .infra-grid { grid-template-columns: 1fr; }
  .footer-top { flex-direction: column; gap: 4rem; }
}
</style>
