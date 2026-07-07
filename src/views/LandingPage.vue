<template>
  <div class="landing-root">
    <!-- Ambient Background -->
    <div class="ambient-bg">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
    </div>

    <!-- Navigation -->
    <nav class="lp-nav">
      <div class="lp-container nav-inner">
        <div class="lp-logo">
          <img src="/logo.png" alt="ONDA" class="logo-img-lp" />
          <span class="logo-text">ONDA</span>
        </div>
        <div class="nav-center">
          <a href="#features" class="lp-nav-link">Fonctionnalités</a>
          <a href="#why" class="lp-nav-link">Pourquoi ONDA ?</a>
          <a href="#testimonials" class="lp-nav-link">Avis</a>
          <a href="#download" class="lp-nav-link">Télécharger</a>
        </div>
        <div class="nav-actions">
          <a href="#download" class="btn-nav-primary">
            <i class="fas fa-download"></i> Télécharger
          </a>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="lp-hero" id="hero">
      <div class="lp-container hero-inner">
        <!-- Left: Text Content -->
        <div class="hero-text reveal">
          <div class="hero-eyebrow">
            <span class="pulse-dot"></span>
            Disponible sur iOS &amp; Android · 100% Gratuit
          </div>
          <h1 class="hero-title">
            Gérez votre argent.<br/>
            <span class="hero-highlight">Développez</span><br/>
            votre activité.
          </h1>
          <p class="hero-sub">
            ONDA vous aide à suivre vos ventes et dépenses au quotidien, gérer votre caisse simplement et faire grandir votre commerce — sans calculs compliqués.
          </p>
          <div class="hero-cta-group">
            <a href="#download" class="btn-store btn-appstore">
              <i class="fab fa-apple"></i>
              <div class="btn-store-text">
                <span class="btn-store-small">Télécharger sur</span>
                <span class="btn-store-big">App Store</span>
              </div>
            </a>
            <a href="#download" class="btn-store btn-playstore">
              <i class="fab fa-google-play"></i>
              <div class="btn-store-text">
                <span class="btn-store-small">Disponible sur</span>
                <span class="btn-store-big">Google Play</span>
              </div>
            </a>
          </div>
          <div class="hero-stats">
            <div class="stat-item">
              <span class="stat-value">100+</span>
              <span class="stat-label">Utilisateurs</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-value">4.8<i class="fas fa-star" style="font-size:0.9rem; color:#F59E0B; margin-left:2px;"></i></span>
              <span class="stat-label">Note moyenne</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-value">100%</span>
              <span class="stat-label">Gratuit</span>
            </div>
          </div>
        </div>

        <!-- Right: Phone Mockup -->
        <div class="hero-visual reveal" style="animation-delay:0.2s">
          <div class="phone-frame-wrap">
            <!-- Floating notification cards -->
            <div class="float-card float-card-top glass-card">
              <div class="float-card-icon success-icon"><i class="fas fa-check"></i></div>
              <div>
                <div class="float-card-title">Virement reçu</div>
                <div class="float-card-sub">+XOF 250,000</div>
              </div>
            </div>

            <!-- Phone -->
            <div class="phone-frame-image">
              <img src="/mockup.png" alt="ONDA Mobile App Mockup" class="mockup-img" />
            </div>

            <!-- Floating bottom card -->
            <div class="float-card float-card-bottom glass-card">
              <div class="float-card-icon primary-icon"><i class="fas fa-chart-line"></i></div>
              <div>
                <div class="float-card-title">Résumé du mois</div>
                <div class="float-card-sub">Prêt à consulter</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Trusted By Banner -->
    <section class="trusted-banner">
      <div class="lp-container">
        <p class="trusted-label">Ils gèrent leur activité avec ONDA chaque jour</p>
        <div class="trusted-logos">
          <div class="trusted-logo-item"><i class="fas fa-scissors"></i> Salon de coiffure</div>
          <div class="trusted-logo-item"><i class="fas fa-store"></i> Épicerie du quartier</div>
          <div class="trusted-logo-item"><i class="fas fa-car"></i> Garage automobile</div>
          <div class="trusted-logo-item"><i class="fas fa-tshirt"></i> Atelier couture</div>
          <div class="trusted-logo-item"><i class="fas fa-utensils"></i> Maquis &amp; Restaurant</div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="lp-section">
      <div class="lp-container">
        <div class="section-header text-center reveal">
          <div class="section-eyebrow">Ce que fait ONDA pour vous</div>
          <h2 class="section-title">Simple à utiliser, <span class="text-logo-gradient">puissant</span> pour votre commerce</h2>
          <p class="section-sub">Des outils simples et concrets pour suivre vos ventes et dépenses au quotidien et faire grandir votre activité.</p>
        </div>

        <div class="features-grid">
          <div class="feature-card reveal" style="animation-delay:0s">
            <div class="feature-icon feature-icon-blue">
              <i class="fas fa-cash-register"></i>
            </div>
            <h3>Enregistrez vos ventes</h3>
            <p>Notez chaque vente en quelques secondes depuis votre téléphone. Onda calcule tout automatiquement pour vous.</p>
            <div class="feature-badge">Rapide</div>
          </div>
          <div class="feature-card reveal" style="animation-delay:0.1s">
            <div class="feature-icon feature-icon-purple">
              <i class="fas fa-chart-pie"></i>
            </div>
            <h3>Savoir où va votre argent</h3>
            <p>Visualisez vos revenus et dépenses du mois en un coup d'œil. Fini les surprises en fin de mois.</p>
            <div class="feature-badge feature-badge-purple">Clair</div>
          </div>
          <div class="feature-card reveal" style="animation-delay:0.2s">
            <div class="feature-icon feature-icon-rose">
              <i class="fas fa-university"></i>
            </div>
            <h3>Facilitez vos crédits bancaires</h3>
            <p>Partagez un rapport d'activité fiable et structuré avec les banques pour prouver la santé de votre commerce et obtenir des prêts plus facilement.</p>
            <div class="feature-badge feature-badge-rose">Crédit</div>
          </div>
          <div class="feature-card reveal" style="animation-delay:0.3s">
            <div class="feature-icon feature-icon-green">
              <i class="fas fa-bell"></i>
            </div>
            <h3>Alertes intelligentes</h3>
            <p>Soyez prévenu quand votre caisse baisse, quand une dépense est inhabituellement élevée, ou quand c'est le bon moment pour investir.</p>
            <div class="feature-badge feature-badge-green">Smart</div>
          </div>
          <div class="feature-card reveal" style="animation-delay:0.4s">
            <div class="feature-icon feature-icon-orange">
              <i class="fas fa-shield-alt"></i>
            </div>
            <h3>Vos données en sécurité</h3>
            <p>Vos informations sont protégées et sauvegardées automatiquement. Même si vous perdez votre téléphone, rien ne disparaît.</p>
            <div class="feature-badge feature-badge-orange">Sécurisé</div>
          </div>
          <div class="feature-card reveal" style="animation-delay:0.5s">
            <div class="feature-icon feature-icon-blue">
              <i class="fas fa-id-card"></i>
            </div>
            <h3>Devenez une entreprise officielle</h3>
            <p>ONDA vous guide pas à pas pour formaliser votre activité et accéder à plus d'opportunités de financement.</p>
            <div class="feature-badge">Formalisation</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Why ONDA Section -->
    <section id="why" class="lp-section lp-section-dark">
      <div class="lp-container">
        <div class="why-inner">
          <div class="why-text reveal">
            <div class="section-eyebrow eyebrow-light">Pourquoi ONDA ?</div>
            <h2 class="section-title section-title-light">
              Faite pour vous,<br/> <span class="text-logo-gradient">simple et sans jargon.</span>
            </h2>
            <p class="section-sub section-sub-light">
              Beaucoup de commerçants perdent de l'argent parce qu'ils ne savent pas exactement combien ils gagnent ou dépensent. ONDA vous donne une vision claire de votre activité, avec un simple téléphone.
            </p>
            <div class="why-points">
              <div class="why-point">
                <div class="why-point-icon"><i class="fas fa-check"></i></div>
                <span>Juste un téléphone — rien d'autre</span>
              </div>
              <div class="why-point">
                <div class="why-point-icon"><i class="fas fa-check"></i></div>
                <span>Support en français, disponible 7j/7</span>
              </div>
              <div class="why-point">
                <div class="why-point-icon"><i class="fas fa-check"></i></div>
                <span>Gratuit, sans surprise ni frais cachés</span>
              </div>
            </div>
          </div>
          <div class="why-visual reveal" style="animation-delay:0.15s">
            <div class="metrics-stack">
              <div class="metric-card">
                <div class="metric-icon"><i class="fas fa-mobile-alt"></i></div>
                <div class="metric-body">
                  <div class="metric-value">2<span>min</span></div>
                  <div class="metric-label">Pour créer votre compte</div>
                  <div class="metric-bar"><div class="metric-fill" style="width:95%"></div></div>
                </div>
              </div>
              <div class="metric-card">
                <div class="metric-icon metric-green"><i class="fas fa-smile"></i></div>
                <div class="metric-body">
                  <div class="metric-value">4.8<span>★</span></div>
                  <div class="metric-label">Satisfaction utilisateurs</div>
                  <div class="metric-bar"><div class="metric-fill metric-fill-green" style="width:96%"></div></div>
                </div>
              </div>
              <div class="metric-card">
                <div class="metric-icon metric-purple"><i class="fas fa-users"></i></div>
                <div class="metric-body">
                  <div class="metric-value">100<span>+</span></div>
                  <div class="metric-label">Utilisateurs actifs</div>
                  <div class="metric-bar"><div class="metric-fill metric-fill-purple" style="width:75%"></div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials -->
    <section id="testimonials" class="lp-section">
      <div class="lp-container">
        <div class="section-header text-center reveal">
          <div class="section-eyebrow">Témoignages</div>
          <h2 class="section-title">Ce qu'ils en <span class="text-logo-gradient">disent</span></h2>
        </div>
        <div class="testimonials-grid">
          <div class="testi-card reveal" style="animation-delay:0s">
            <div class="testi-stars">
              <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
            </div>
            <p class="testi-quote">"Avant ONDA, je comptais tout dans un cahier. Maintenant je sais exactement combien j'ai gagné cette semaine et où est parti mon argent. C'est trop pratique !"</p>
            <div class="testi-author">
              <div class="testi-avatar testi-av-1">A</div>
              <div>
                <div class="testi-name">Aya Kouamé</div>
                <div class="testi-role">Vendeuse, Marché d'Adjamé</div>
              </div>
            </div>
          </div>
          <div class="testi-card reveal" style="animation-delay:0.1s">
            <div class="testi-stars">
              <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
            </div>
            <p class="testi-quote">"Mon garage tourne mieux depuis que j'utilise ONDA. Je vois tout ce que je dépense pour les pièces et ce que je gagne sur les réparations. Simple et efficace."</p>
            <div class="testi-author">
              <div class="testi-avatar testi-av-2">M</div>
              <div>
                <div class="testi-name">Mamadou Diallo</div>
                <div class="testi-role">Garagiste, Yopougon</div>
              </div>
            </div>
          </div>
          <div class="testi-card reveal" style="animation-delay:0.2s">
            <div class="testi-stars">
              <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star-half-alt"></i>
            </div>
            <p class="testi-quote">"Grâce à ONDA j'ai pu montrer mes revenus à la banque pour avoir un prêt. Ils ont été impressionnés par mes rapports. J'ai eu mon financement !"</p>
            <div class="testi-author">
              <div class="testi-avatar testi-av-3">F</div>
              <div>
                <div class="testi-name">Fatou Ndiaye</div>
                <div class="testi-role">Couturière, Treichville</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Download CTA Section -->
    <section id="download" class="lp-section lp-section-cta">
      <div class="lp-container">
        <div class="cta-box reveal">
          <div class="cta-glow"></div>
          <div class="cta-content">
            <div class="section-eyebrow eyebrow-light">Disponible maintenant</div>
            <h2 class="cta-title">Téléchargez <span class="text-logo-gradient">ONDA</span>.<br/>C'est gratuit.</h2>
            <p class="cta-sub">Rejoignez plus de 100 commerçants et artisans qui gèrent leur activité avec ONDA. Aucun frais, aucune formation requise.</p>
            <div class="cta-store-row">
              <a href="#" class="btn-store-lg">
                <i class="fab fa-apple btn-store-icon"></i>
                <div class="btn-store-text">
                  <span class="btn-store-small">Télécharger sur</span>
                  <span class="btn-store-big">App Store</span>
                </div>
              </a>
              <a href="#" class="btn-store-lg">
                <i class="fab fa-google-play btn-store-icon"></i>
                <div class="btn-store-text">
                  <span class="btn-store-small">Disponible sur</span>
                  <span class="btn-store-big">Google Play</span>
                </div>
              </a>
            </div>
            <div class="cta-note"><i class="fas fa-mobile-alt" style="margin-right:6px; color:#0EA5E9;"></i>Gratuit · Simple d'utilisation · Aucune formation requise</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="lp-footer">
      <div class="lp-container">
        <div class="footer-top">
          <div class="footer-brand">
            <div class="lp-logo mb-4">
              <img src="/logo.png" alt="ONDA" class="logo-img-lp" />
              <span class="logo-text">ONDA</span>
            </div>
            <p class="footer-tagline">L'infrastructure financière de l'Afrique de demain.</p>
            <div class="footer-socials">
              <a href="#" class="social-link"><i class="fab fa-twitter"></i></a>
              <a href="#" class="social-link"><i class="fab fa-linkedin"></i></a>
              <a href="#" class="social-link"><i class="fab fa-instagram"></i></a>
            </div>
          </div>
          <div class="footer-cols">
            <div class="footer-col">
              <strong>Produit</strong>
              <a href="#">Fonctionnalités</a>
              <a href="#">API Publique</a>
              <a href="#">Changelog</a>
            </div>
            <div class="footer-col">
              <strong>Ressources</strong>
              <a href="#">Documentation</a>
              <a href="#">Blog</a>
              <a href="#">Tutoriels</a>
              <a href="#">Status API</a>
            </div>
            <div class="footer-col">
              <strong>Entreprise</strong>
              <a href="#">À propos</a>
              <a href="#">Carrières</a>
              <a href="#">Presse</a>
              <a href="#">Contact</a>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© 2025 ONDA Financial Technologies. Tous droits réservés.</span>
          <div class="footer-legal">
            <a href="#">CGU</a>
            <a href="#">Confidentialité</a>
            <a href="#">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import { useRouter } from 'vue-router';
import { onMounted, onUnmounted } from 'vue';

export default {
  name: 'LandingPage',
  setup() {
    const router = useRouter();

    const goToAdmin = () => router.push('/system-admin-portal');

    // Intersection Observer for reveal animations
    let observer = null;
    onMounted(() => {
      const elements = document.querySelectorAll('.reveal');
      observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      elements.forEach(el => observer.observe(el));
    });
    onUnmounted(() => { if (observer) observer.disconnect(); });

    return { goToAdmin };
  }
}
</script>

<style scoped>
/* ============================================================
   LANDING PAGE - LIGHT PREMIUM MOBILE APP FOCUS
   ============================================================ */

/* Root & Background */
.landing-root {
  background: #F8FAFC;
  color: #0F172A;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  overflow-x: hidden;
  position: relative;
}

/* Ambient orbs */
.ambient-bg { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
.orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.12; }
.orb-1 { width: 600px; height: 600px; background: radial-gradient(circle, #0EA5E9, transparent); top: -200px; right: -100px; animation: float1 12s ease-in-out infinite; }
.orb-2 { width: 500px; height: 500px; background: radial-gradient(circle, #2563EB, transparent); bottom: 10%; left: -150px; animation: float2 15s ease-in-out infinite; }
.orb-3 { width: 400px; height: 400px; background: radial-gradient(circle, #F43F5E22, transparent); top: 50%; left: 40%; animation: float1 10s ease-in-out infinite reverse; }
@keyframes float1 { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-30px) scale(1.05); } }
@keyframes float2 { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(20px) scale(0.95); } }

/* Container */
.lp-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 1;
}

/* ============================================================
   NAVIGATION
   ============================================================ */
.lp-nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 1000;
  padding: 1.25rem 0;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
  transition: all 0.3s;
}
.nav-inner { display: flex; align-items: center; justify-content: space-between; }
.lp-logo { display: flex; align-items: center; gap: 0.75rem; }
.logo-img-lp { width: 34px; height: 34px; object-fit: contain; }
.logo-text { font-size: 1.5rem; font-weight: 900; letter-spacing: -0.04em; color: #2563EB; }
.text-logo-gradient {
  background: linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%);
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
}
.nav-center { display: flex; gap: 2rem; }
.lp-nav-link { color: #475569; text-decoration: none; font-size: 0.9rem; font-weight: 600; transition: color 0.2s; }
.lp-nav-link:hover { color: #0F172A; }
.nav-actions { display: flex; align-items: center; gap: 1rem; }
.btn-nav-outline {
  padding: 0.6rem 1.25rem; border-radius: 0.75rem;
  border: 1px solid rgba(15, 23, 42, 0.15);
  background: transparent; color: #475569;
  font-size: 0.85rem; font-weight: 600; cursor: pointer;
  transition: all 0.2s;
}
.btn-nav-outline:hover { border-color: #0F172A; color: #0F172A; background: rgba(0,0,0,0.02); }
.btn-nav-primary {
  padding: 0.6rem 1.4rem; border-radius: 0.75rem;
  background: linear-gradient(135deg, #0EA5E9, #2563EB);
  color: white; font-size: 0.85rem; font-weight: 700;
  text-decoration: none; display: flex; align-items: center; gap: 0.5rem;
  transition: all 0.3s; box-shadow: 0 4px 15px rgba(14, 165, 233, 0.3);
}
.btn-nav-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(14, 165, 233, 0.45); }

/* ============================================================
   HERO
   ============================================================ */
.lp-hero { padding: 9rem 0 6rem; }
.hero-inner { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 5rem; align-items: center; }

/* Hero Text */
.hero-eyebrow {
  display: inline-flex; align-items: center; gap: 0.75rem;
  background: rgba(14, 165, 233, 0.08); border: 1px solid rgba(14, 165, 233, 0.25);
  color: #0284C7; padding: 0.45rem 1rem; border-radius: 99rem;
  font-size: 0.8rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;
  margin-bottom: 1.75rem;
}
.pulse-dot {
  width: 7px; height: 7px; background: #22C55E; border-radius: 50%;
  box-shadow: 0 0 8px #22C55E; animation: pulse 2s infinite;
}
@keyframes pulse {
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(34,197,94,0.7); }
  70% { transform: scale(1.1); box-shadow: 0 0 0 8px rgba(34,197,94,0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(34,197,94,0); }
}
.hero-title {
  font-size: 4.5rem; line-height: 1.0; font-weight: 900;
  letter-spacing: -0.04em; color: #0F172A; margin-bottom: 1.5rem;
}
.hero-highlight {
  background: linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%);
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
}
.hero-sub { font-size: 1.1rem; color: #475569; line-height: 1.7; margin-bottom: 2.5rem; }

/* Store Buttons */
.hero-cta-group { display: flex; gap: 1rem; margin-bottom: 2.5rem; flex-wrap: wrap; }
.btn-store {
  display: flex; align-items: center; gap: 0.875rem;
  padding: 0.875rem 1.5rem; border-radius: 1rem;
  font-family: 'Inter', sans-serif; cursor: pointer; text-decoration: none;
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.btn-store i { font-size: 1.6rem; }
.btn-store-text { display: flex; flex-direction: column; }
.btn-store-small { font-size: 0.68rem; font-weight: 500; opacity: 0.7; }
.btn-store-big { font-size: 1rem; font-weight: 800; line-height: 1.2; }
.btn-appstore { background: #0F172A; color: white; }
.btn-appstore:hover { transform: translateY(-3px) scale(1.03); box-shadow: 0 12px 30px rgba(15, 23, 42, 0.15); }
.btn-playstore { background: white; border: 1px solid rgba(15, 23, 42, 0.15); color: #0F172A; }
.btn-playstore:hover { transform: translateY(-3px) scale(1.03); background: #F1F5F9; }

/* Hero Stats */
.hero-stats { display: flex; align-items: center; gap: 1.5rem; }
.stat-item { display: flex; flex-direction: column; }
.stat-value { font-size: 1.5rem; font-weight: 900; color: #0F172A; letter-spacing: -0.02em; }
.stat-label { font-size: 0.75rem; font-weight: 600; color: #64748B; }
.stat-divider { width: 1px; height: 36px; background: rgba(15, 23, 42, 0.1); }

/* ============================================================
   PHONE MOCKUP
   ============================================================ */
.hero-visual { display: flex; justify-content: center; }
.phone-frame-wrap { position: relative; width: 280px; }

.phone-frame-image {
  width: 280px;
  border-radius: 40px;
  overflow: hidden;
  box-shadow: 0 30px 60px rgba(15, 23, 42, 0.15);
  animation: phoneBob 4s ease-in-out infinite;
}
.mockup-img {
  width: 100%;
  height: auto;
  display: block;
}
@keyframes phoneBob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
.phone-notch { width: 100px; height: 28px; background: #0F172A; border-radius: 0 0 20px 20px; margin: 0 auto; position: relative; z-index: 2; }
.phone-screen { padding: 0; background: #0A1628; }
.phone-home-bar { height: 28px; display: flex; align-items: center; justify-content: center; }
.phone-home-bar::after { content: ''; width: 80px; height: 4px; background: rgba(255,255,255,0.2); border-radius: 2px; }

/* App Screen Content */
.app-screen { padding: 1rem; }
.app-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
.app-user { display: flex; align-items: center; gap: 0.6rem; }
.app-avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #0EA5E9, #2563EB); display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 900; color: white; }
.app-greeting { font-size: 0.6rem; color: rgba(255,255,255,0.4); }
.app-name { font-size: 0.7rem; font-weight: 700; color: white; }
.app-notif-icon { width: 28px; height: 28px; border-radius: 8px; background: rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center; font-size: 0.6rem; color: rgba(255,255,255,0.5); }

.app-balance-card { background: linear-gradient(135deg, #0EA5E9 0%, #1D4ED8 100%); border-radius: 16px; padding: 1rem; margin-bottom: 1rem; }
.app-balance-label { font-size: 0.6rem; color: rgba(255,255,255,0.6); margin-bottom: 0.25rem; }
.app-balance-value { font-size: 1.05rem; font-weight: 900; color: white; letter-spacing: -0.03em; }
.app-balance-change { font-size: 0.55rem; color: rgba(255,255,255,0.7); margin-top: 0.2rem; margin-bottom: 0.75rem; }
.app-balance-change i { color: #4ADE80; margin-right: 2px; }
.app-balance-actions { display: flex; gap: 0.5rem; }
.app-bal-btn { display: flex; flex-direction: column; align-items: center; gap: 3px; flex: 1; background: rgba(255,255,255,0.15); border-radius: 10px; padding: 6px 4px; }
.app-bal-btn i { font-size: 0.7rem; color: white; }
.app-bal-btn span { font-size: 0.5rem; color: rgba(255,255,255,0.8); font-weight: 600; }

.app-section-title { font-size: 0.65rem; font-weight: 800; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.6rem; }
.app-tx { display: flex; align-items: center; gap: 0.6rem; padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
.app-tx:last-child { border-bottom: none; }
.app-tx-icon { width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 0.6rem; flex-shrink: 0; }
.app-tx-in { background: rgba(34,197,94,0.15); color: #4ADE80; }
.app-tx-out { background: rgba(244,63,94,0.15); color: #FB7185; }
.app-tx-info { flex: 1; min-width: 0; }
.app-tx-name { font-size: 0.65rem; font-weight: 700; color: rgba(255,255,255,0.85); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.app-tx-date { font-size: 0.55rem; color: rgba(255,255,255,0.3); }
.app-tx-amount { font-size: 0.65rem; font-weight: 800; white-space: nowrap; }
.app-tx-pos { color: #4ADE80; }
.app-tx-neg { color: #FB7185; }

/* Floating Cards */
.float-card { position: absolute; display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; border-radius: 1rem; z-index: 10; min-width: 180px; }
.float-card-top { top: 15%; right: -70px; animation: floatCard1 5s ease-in-out infinite; }
.float-card-bottom { bottom: 15%; left: -70px; animation: floatCard2 6s ease-in-out infinite; }
@keyframes floatCard1 { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
@keyframes floatCard2 { 0%,100% { transform: translateY(0); } 50% { transform: translateY(8px); } }
.glass-card {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(20px);
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
}
.float-card-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; flex-shrink: 0; }
.success-icon { background: rgba(34,197,94,0.15); color: #4ADE80; }
.primary-icon { background: rgba(14,165,233,0.15); color: #38BDF8; }
.float-card-title { font-size: 0.75rem; font-weight: 700; color: #0F172A; }
.float-card-sub { font-size: 0.65rem; color: #64748B; }

/* ============================================================
   TRUSTED BANNER
   ============================================================ */
.trusted-banner { padding: 2.5rem 0; border-top: 1px solid rgba(15, 23, 42, 0.06); border-bottom: 1px solid rgba(15, 23, 42, 0.06); }
.trusted-label { text-align: center; font-size: 0.75rem; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 1.5rem; }
.trusted-logos { display: flex; justify-content: center; gap: 3rem; flex-wrap: wrap; }
.trusted-logo-item { color: #64748B; font-size: 0.85rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem; transition: color 0.2s; }
.trusted-logo-item:hover { color: #0F172A; }

/* ============================================================
   SECTIONS & FEATURES
   ============================================================ */
.lp-section { padding: 7rem 0; }
.lp-section-dark { background: #F1F5F9; border-top: 1px solid rgba(15, 23, 42, 0.05); border-bottom: 1px solid rgba(15, 23, 42, 0.05); }

.section-header { margin-bottom: 4rem; }
.section-eyebrow { display: inline-block; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #0284C7; margin-bottom: 1rem; }
.eyebrow-light { color: #0284C7; }
.section-title { font-size: 2.8rem; font-weight: 900; letter-spacing: -0.04em; color: #0F172A; margin-bottom: 1rem; }
.section-title-light { color: #0F172A; }
.section-sub { font-size: 1.05rem; color: #475569; max-width: 560px; margin: 0 auto; line-height: 1.7; }
.section-sub-light { color: #475569; margin: 0 0 2.5rem; }

/* Features Grid */
.features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
.feature-card {
  background: white; border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 1.5rem; padding: 2rem;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative; overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02);
}
.feature-card::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(14,165,233,0.03) 0%, transparent 60%); opacity: 0; transition: opacity 0.3s; }
.feature-card:hover { border-color: rgba(14,165,233,0.3); transform: translateY(-4px); background: white; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02); }
.feature-card:hover::before { opacity: 1; }
.feature-icon { width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; margin-bottom: 1.25rem; }
.feature-icon-blue { background: rgba(14,165,233,0.15); color: #0284C7; }
.feature-icon-purple { background: rgba(139,92,246,0.15); color: #7C3AED; }
.feature-icon-rose { background: rgba(244,63,94,0.15); color: #E11D48; }
.feature-icon-green { background: rgba(34,197,94,0.15); color: #16A34A; }
.feature-icon-orange { background: rgba(245,158,11,0.15); color: #D97706; }
.feature-card h3 { font-size: 1.05rem; font-weight: 800; color: #0F172A; margin-bottom: 0.75rem; }
.feature-card p { font-size: 0.9rem; color: #475569; line-height: 1.6; margin-bottom: 1.25rem; }
.feature-badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 99rem; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; background: rgba(14,165,233,0.08); color: #0284C7; border: 1px solid rgba(14,165,233,0.15); }
.feature-badge-purple { background: rgba(139,92,246,0.08); color: #7C3AED; border-color: rgba(139,92,246,0.15); }
.feature-badge-rose { background: rgba(244,63,94,0.08); color: #E11D48; border-color: rgba(244,63,94,0.15); }
.feature-badge-green { background: rgba(34,197,94,0.08); color: #16A34A; border-color: rgba(34,197,94,0.15); }
.feature-badge-orange { background: rgba(245,158,11,0.08); color: #D97706; border-color: rgba(245,158,11,0.15); }

/* ============================================================
   WHY SECTION
   ============================================================ */
.why-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 5rem; align-items: center; }
.why-points { display: flex; flex-direction: column; gap: 0.875rem; }
.why-point { display: flex; align-items: center; gap: 0.875rem; }
.why-point-icon { width: 24px; height: 24px; border-radius: 8px; background: rgba(14,165,233,0.1); color: #0284C7; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; flex-shrink: 0; }
.why-point span { font-size: 0.95rem; font-weight: 600; color: #334155; }

/* Metrics Stack */
.metrics-stack { display: flex; flex-direction: column; gap: 1rem; }
.metric-card {
  display: flex; align-items: center; gap: 1.25rem;
  background: white; border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 1.25rem; padding: 1.25rem 1.5rem;
  transition: all 0.3s;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
}
.metric-card:hover { border-color: rgba(14,165,233,0.25); background: white; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); }
.metric-icon { width: 44px; height: 44px; border-radius: 12px; background: rgba(14,165,233,0.1); color: #0284C7; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0; }
.metric-icon.metric-green { background: rgba(34,197,94,0.1); color: #16A34A; }
.metric-icon.metric-purple { background: rgba(139,92,246,0.1); color: #7C3AED; }
.metric-body { flex: 1; }
.metric-value { font-size: 1.75rem; font-weight: 900; color: #0F172A; letter-spacing: -0.04em; line-height: 1; }
.metric-value span { font-size: 1rem; color: #64748B; }
.metric-label { font-size: 0.78rem; font-weight: 600; color: #64748B; margin: 0.25rem 0 0.6rem; }
.metric-bar { height: 4px; background: #E2E8F0; border-radius: 2px; overflow: hidden; }
.metric-fill { height: 100%; background: linear-gradient(90deg, #0EA5E9, #2563EB); border-radius: 2px; transition: width 1.5s ease; }
.metric-fill-green { background: linear-gradient(90deg, #22C55E, #16A34A); }
.metric-fill-purple { background: linear-gradient(90deg, #8B5CF6, #6D28D9); }

/* ============================================================
   TESTIMONIALS
   ============================================================ */
.testimonials-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
.testi-card {
  background: white; border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 1.5rem; padding: 2rem;
  transition: all 0.3s;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
}
.testi-card:hover { border-color: rgba(15,23,42,0.15); background: white; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); }
.testi-stars { color: #F59E0B; font-size: 0.8rem; margin-bottom: 1rem; display: flex; gap: 2px; }
.testi-quote { font-size: 0.9rem; color: #334155; line-height: 1.7; margin-bottom: 1.5rem; font-style: italic; }
.testi-author { display: flex; align-items: center; gap: 0.875rem; }
.testi-avatar { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 1rem; color: white; flex-shrink: 0; }
.testi-av-1 { background: linear-gradient(135deg, #0EA5E9, #2563EB); }
.testi-av-2 { background: linear-gradient(135deg, #8B5CF6, #6D28D9); }
.testi-av-3 { background: linear-gradient(135deg, #F43F5E, #DC2626); }
.testi-name { font-size: 0.85rem; font-weight: 800; color: #0F172A; }
.testi-role { font-size: 0.75rem; color: #64748B; }

/* ============================================================
   CTA SECTION
   ============================================================ */
.lp-section-cta { padding: 5rem 0 7rem; }
.cta-box {
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.06) 0%, rgba(37, 99, 235, 0.06) 100%);
  border: 1px solid rgba(14,165,233,0.18);
  border-radius: 2.5rem; padding: 5rem; text-align: center;
  position: relative; overflow: hidden;
}
.cta-glow { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 500px; height: 300px; background: radial-gradient(ellipse, rgba(14, 165, 233, 0.06) 0%, transparent 70%); pointer-events: none; }
.cta-content { position: relative; z-index: 1; }
.cta-title { font-size: 3rem; font-weight: 900; letter-spacing: -0.04em; color: #0F172A; margin: 1rem 0; }
.cta-sub { font-size: 1rem; color: #475569; max-width: 500px; margin: 0 auto 2.5rem; line-height: 1.7; }
.cta-store-row { display: flex; gap: 1rem; justify-content: center; margin-bottom: 1.5rem; flex-wrap: wrap; }
.btn-store-lg {
  display: flex; align-items: center; gap: 1rem;
  padding: 1rem 2rem; border-radius: 1.25rem;
  background: #0F172A; color: white;
  text-decoration: none; transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.btn-store-lg:hover { transform: translateY(-3px) scale(1.04); box-shadow: 0 15px 35px rgba(15, 23, 42, 0.15); }
.btn-store-icon { font-size: 1.75rem; }
.cta-note { font-size: 0.8rem; color: #64748B; font-weight: 600; }

/* ============================================================
   FOOTER
   ============================================================ */
.lp-footer { padding: 5rem 0 2.5rem; border-top: 1px solid rgba(15, 23, 42, 0.08); }
.footer-top { display: flex; justify-content: space-between; gap: 4rem; margin-bottom: 4rem; }
.footer-brand { max-width: 280px; }
.footer-tagline { font-size: 0.9rem; color: #64748B; line-height: 1.6; margin-bottom: 1.5rem; }
.footer-socials { display: flex; gap: 0.75rem; }
.social-link { width: 36px; height: 36px; border-radius: 10px; border: 1px solid rgba(15, 23, 42, 0.1); color: #64748B; display: flex; align-items: center; justify-content: center; text-decoration: none; font-size: 0.85rem; transition: all 0.2s; }
.social-link:hover { border-color: #0F172A; color: #0F172A; background: rgba(0,0,0,0.02); }
.footer-cols { display: flex; gap: 4rem; }
.footer-col { display: flex; flex-direction: column; gap: 0.875rem; }
.footer-col strong { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #64748B; margin-bottom: 0.5rem; }
.footer-col a { text-decoration: none; font-size: 0.9rem; font-weight: 600; color: #475569; transition: color 0.2s; }
.footer-col a:hover { color: #0F172A; }
.footer-bottom { display: flex; justify-content: space-between; align-items: center; padding-top: 2rem; border-top: 1px solid rgba(15, 23, 42, 0.06); font-size: 0.8rem; color: #64748B; font-weight: 600; }
.footer-legal { display: flex; gap: 1.5rem; }
.footer-legal a { text-decoration: none; color: #64748B; transition: color 0.2s; }
.footer-legal a:hover { color: #0F172A; }

/* ============================================================
   REVEAL ANIMATION
   ============================================================ */
.reveal { opacity: 0; transform: translateY(28px); transition: opacity 0.8s cubic-bezier(0.4,0,0.2,1), transform 0.8s cubic-bezier(0.4,0,0.2,1); }
.reveal.revealed { opacity: 1; transform: translateY(0); }

/* ============================================================
   RESPONSIVE
   ============================================================ */
@media (max-width: 1024px) {
  .hero-inner { grid-template-columns: 1fr; text-align: center; }
  .hero-eyebrow { justify-content: center; }
  .hero-cta-group { justify-content: center; }
  .hero-stats { justify-content: center; }
  .hero-visual { display: none; }
  .features-grid { grid-template-columns: 1fr 1fr; }
  .why-inner { grid-template-columns: 1fr; }
  .testimonials-grid { grid-template-columns: 1fr; }
  .footer-top { flex-direction: column; }
  .nav-center { display: none; }
}

@media (max-width: 640px) {
  .hero-title { font-size: 3rem; }
  .features-grid { grid-template-columns: 1fr; }
  .cta-title { font-size: 2rem; }
  .cta-box { padding: 3rem 1.5rem; }
  .footer-cols { flex-direction: column; gap: 2rem; }
}

.mb-4 { margin-bottom: 1rem; }
.text-center { text-align: center; }
</style>
