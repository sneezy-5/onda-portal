<template>
  <div class="login-page">
    <div class="login-decoration-bg"></div>
    
    <!-- Branding -->
    <header class="login-brand reveal">
      <div class="logo" @click="resetFlow" style="cursor: pointer">
        <img src="/logo.png" alt="ONDA" class="logo-img" />
        <span class="logo-type">ONDA</span>
      </div>
    </header>

    <main class="login-main">
      <div class="login-card-container reveal" style="animation-delay: 0.1s">
        <!-- Auth Selector -->
        <div v-if="!isOtpMode" class="auth-mode-selector mb-10">
          <button 
            :class="['mode-btn', { active: isLogin }]" 
            @click="isLogin = true; clearMessages()"
          >
            Accès Console
          </button>
          <button 
            :class="['mode-btn', { active: !isLogin }]" 
            @click="isLogin = false; clearMessages()"
          >
            Nouveau Partenaire
          </button>
        </div>

        <div class="card-premium login-card p-12">
          <!-- OTP Mode View -->
          <div v-if="isOtpMode" class="otp-view">
            <h2 class="mb-2">Vérification de sécurité</h2>
            <p class="text-muted mb-10">
              Un code de vérification a été envoyé à <strong>{{ otpEmail }}</strong>. Saisissez-le pour activer votre accès.
            </p>

            <form @submit.prevent="handleOtpSubmit" class="auth-form">
              <div class="form-group mb-10">
                <label>CODE DE VÉRIFICATION (6 CHIFFRES)</label>
                <div class="otp-input-container">
                  <input 
                    v-model="otpValue" 
                    type="text" 
                    maxlength="6" 
                    placeholder="000000" 
                    class="input-premium otp-field" 
                    required 
                  />
                </div>
              </div>

              <button type="submit" class="btn btn-primary w-full py-5" :disabled="loading">
                <span v-if="loading" class="spinner-sm"></span>
                <span>
                  {{ loading ? 'Vérification...' : 'Vérifier & Accéder à la Console' }}
                  <i class="fas fa-arrow-right ml-2" v-if="!loading"></i>
                </span>
              </button>

              <div class="resend-container mt-6 text-center">
                <p class="text-dim text-sm">Vous n'avez rien reçu ?</p>
                <button 
                  type="button" 
                  class="btn-link" 
                  @click="handleResendOtp" 
                  :disabled="loading || resendCooldown > 0"
                >
                  {{ resendCooldown > 0 ? `Renvoyer dans ${resendCooldown}s` : 'Renvoyer le code' }}
                </button>
              </div>
            </form>
          </div>

          <!-- Login/Register Mode View -->
          <div v-else>
            <h2 class="mb-2">{{ isLogin ? 'Bienvenue' : 'Créer un compte' }}</h2>
            <p class="text-muted mb-10">
              {{ isLogin ? 'Connectez-vous à votre infrastructure de provisioning.' : 'Rejoignez l\'infrastructure financière ONDA.' }}
            </p>

            <transition name="fade-slide" mode="out-in">
              <!-- Login Form -->
              <form v-if="isLogin" key="login" @submit.prevent="handleLoginSubmit" class="auth-form">
                <div class="form-group mb-6">
                  <label>EMAIL PROFESSIONNEL</label>
                  <input 
                    v-model="loginData.email" 
                    type="email" 
                    placeholder="nom@entreprise.com" 
                    class="input-premium" 
                    required 
                  />
                </div>
                <div class="form-group mb-12">
                  <label>MOT DE PASSE</label>
                  <input 
                    v-model="loginData.password" 
                    type="password" 
                    placeholder="••••••••••••" 
                    class="input-premium" 
                    required 
                  />
                </div>

                <button type="submit" class="btn btn-primary w-full py-5" :disabled="loading">
                  <span v-if="loading" class="spinner-sm"></span>
                  <span>
                    {{ loading ? 'Authentification...' : 'Entrer dans la Console' }}
                    <i class="fas fa-arrow-right ml-2" v-if="!loading"></i>
                  </span>
                </button>
              </form>

              <!-- Register Form (Expanded) -->
              <form v-else key="register" @submit.prevent="handleRegisterSubmit" class="auth-form registration-scroll">
                <div class="form-grid">
                  <div class="form-group">
                    <label>NOM DE L'ORGANISATION</label>
                    <input v-model="reg.name" type="text" placeholder="Coopérative Espoir" class="input-premium" required />
                  </div>
                  <div class="form-group">
                    <label>TYPE D'ORGANISATION</label>
                    <select v-model="reg.organizationType" class="input-premium">
                      <option value="COOPERATIVE">Coopérative</option>
                      <option value="FORMAL">Entreprise Formelle</option>
                      <option value="INFORMAL">Auto-entrepreneur / Informal</option>
                      <option value="NGO">Association / ONG</option>
                    </select>
                  </div>
                </div>

                <div class="form-grid">
                  <div class="form-group">
                    <label>PRÉNOM DE L'ADMIN</label>
                    <input v-model="reg.firstName" type="text" placeholder="Jean" class="input-premium" required />
                  </div>
                  <div class="form-group">
                    <label>NOM DE L'ADMIN</label>
                    <input v-model="reg.lastName" type="text" placeholder="Kouassi" class="input-premium" required />
                  </div>
                </div>

                <div class="form-group">
                  <label>EMAIL DE CONTACT (IDENTIFIANT)</label>
                  <input v-model="reg.contactEmail" type="email" placeholder="contact@espoir.ci" class="input-premium" required />
                </div>

                <div class="form-group">
                  <label>TÉLÉPHONE</label>
                  <div class="phone-input-combined">
                    <!-- Custom Prefix Selector -->
                    <div class="custom-prefix-wrapper" v-click-outside="() => showPrefixes = false">
                      <div class="prefix-trigger" @click="showPrefixes = !showPrefixes">
                        <img :src="`https://flagcdn.com/w40/${currentCountry.iso}.png`" :alt="currentCountry.name" class="flag-icon" />
                        <span class="prefix-text">{{ currentCountry.prefix }}</span>
                        <span class="chevron" :class="{ open: showPrefixes }">▾</span>
                      </div>
                      
                      <transition name="pop">
                        <div v-if="showPrefixes" class="prefix-dropdown glass">
                          <div 
                            v-for="c in countries" 
                            :key="c.iso" 
                            class="prefix-option"
                            @click="selectCountry(c)"
                          >
                            <img :src="`https://flagcdn.com/w40/${c.iso}.png`" :alt="c.name" class="flag-icon-sm" />
                            <span class="option-name">{{ c.name }}</span>
                            <span class="option-prefix">{{ c.prefix }}</span>
                          </div>
                        </div>
                      </transition>
                    </div>

                    <input v-model="phoneOnly" type="tel" placeholder="Ex: 0707070707" class="input-premium" required />
                  </div>
                </div>

                <div class="form-group">
                  <label>MOT DE PASSE</label>
                  <input v-model="reg.password" type="password" placeholder="••••••••••••" class="input-premium" required />
                </div>

                <div class="form-group">
                  <label>ADRESSE SIÈGE</label>
                  <input v-model="reg.address" type="text" placeholder="Abidjan, Cocody" class="input-premium" required />
                </div>

                <button type="submit" class="btn btn-primary w-full py-5" :disabled="loading">
                  <span v-if="loading" class="spinner-sm"></span>
                  <span>
                    {{ loading ? 'Envoi de l\'OTP...' : 'S\'inscrire & Recevoir mon code' }}
                    <i class="fas fa-arrow-right ml-2" v-if="!loading"></i>
                  </span>
                </button>
              </form>
            </transition>
          </div>

          <!-- Toasts -->
          <div v-if="successMessage" class="success-toast mt-8 reveal">
            <span class="icon">
              <i class="fas fa-check-circle"></i>
            </span>
            {{ successMessage }}
          </div>

          <div v-if="error" class="error-toast mt-8 reveal">
            <span class="icon"><i class="fas fa-exclamation-triangle"></i></span>
            {{ error }}
          </div>
        </div>
      </div>

      <!-- Side Context: Value Prop -->
      <aside class="login-side-prop reveal" style="animation-delay: 0.3s">
        <div class="prop-item">
          <div class="prop-icon">
            <i class="fas fa-broadcast-tower"></i>
          </div>
          <div class="prop-text">
            <strong>API High-Availability</strong>
            <p>99.9% d'uptime certifié pour vos clients finaux.</p>
          </div>
        </div>
        <div class="prop-item">
          <div class="prop-icon">
            <i class="fas fa-shield-alt"></i>
          </div>
          <div class="prop-text">
            <strong>Sécurité Bancaire</strong>
            <p>Chiffrement AES-256 et isolation des données OHADA.</p>
          </div>
        </div>
      </aside>
    </main>
  </div>
</template>

<script>
import { ref } from 'vue';
import apiService from '../services/api.js';

export default {
  name: 'Login',
  emits: ['login'],
  directives: {
    'click-outside': {
      mounted(el, binding) {
        el.clickOutsideEvent = (event) => {
          if (!(el === event.target || el.contains(event.target))) {
            binding.value();
          }
        };
        document.body.addEventListener('click', el.clickOutsideEvent);
      },
      unmounted(el) {
        document.body.removeEventListener('click', el.clickOutsideEvent);
      }
    }
  },
  setup(props, { emit }) {
    const isLogin = ref(true);
    const isOtpMode = ref(false);
    const loading = ref(false);
    const error = ref('');
    const successMessage = ref('');
    
    const loginData = ref({ email: '', password: '' });
    const reg = ref({ 
      name: '', 
      organizationType: 'COOPERATIVE',
      legalForm: '',
      firstName: '',
      lastName: '',
      contactEmail: '', 
      phone: '',
      password: '',
      address: '',
      country: 'CI',
      currency: 'XOF'
    });

    const countries = [
      { iso: 'ci', name: 'Côte d’Ivoire', prefix: '+225' },
      { iso: 'sn', name: 'Sénégal', prefix: '+221' },
      { iso: 'ml', name: 'Mali', prefix: '+223' },
      { iso: 'bf', name: 'Burkina Faso', prefix: '+226' },
      { iso: 'bj', name: 'Bénin', prefix: '+229' },
      { iso: 'tg', name: 'Togo', prefix: '+228' },
      { iso: 'gn', name: 'Guinée', prefix: '+224' },
      { iso: 'ne', name: 'Niger', prefix: '+227' },
      { iso: 'gh', name: 'Ghana', prefix: '+233' },
      { iso: 'ng', name: 'Nigéria', prefix: '+234' }
    ];

    const currentCountry = ref(countries[0]);
    const showPrefixes = ref(false);
    const otpEmail = ref('');
    const otpValue = ref('');
    const phoneOnly = ref('');
    const resendCooldown = ref(0);

    const selectCountry = (c) => {
      currentCountry.value = c;
      showPrefixes.value = false;
    };

    const clearMessages = () => {
      error.value = '';
      successMessage.value = '';
    };

    const resetFlow = () => {
      isOtpMode.value = false;
      isLogin.value = true;
      clearMessages();
    };

    const handleLoginSubmit = async () => {
      loading.value = true;
      error.value = '';
      successMessage.value = '';
      try {
        const res = await apiService.login(loginData.value.email, loginData.value.password);
        if (res.success) {
          emit('login');
        } else {
          error.value = res.message || 'Identifiants incorrects';
        }
      } catch (err) {
        if (err.message && err.message.toLowerCase().includes('not verified')) {
          otpEmail.value = loginData.value.email;
          isOtpMode.value = true;
          error.value = "Email non vérifié. Veuillez saisir le code OTP reçu.";
          await apiService.sendOtp(otpEmail.value).catch(() => {});
        } else {
          error.value = err.message || 'Identifiants incorrects';
        }
      } finally {
        loading.value = false;
      }
    };

    const handleRegisterSubmit = async () => {
      loading.value = true;
      error.value = '';
      successMessage.value = '';
      
      reg.value.phone = `${currentCountry.value.prefix}${phoneOnly.value}`;

      try {
        const res = await apiService.registerPartner(reg.value);
        if (res.success) {
          otpEmail.value = reg.value.contactEmail;
          isOtpMode.value = true;
          successMessage.value = "Inscription réussie ! Un code OTP vous a été envoyé.";
        } else {
          error.value = res.message || 'Erreur lors de l\'inscription';
        }
      } catch (err) {
        error.value = err.message || 'Erreur technique';
      } finally {
        loading.value = false;
      }
    };

    const handleOtpSubmit = async () => {
      loading.value = true;
      error.value = '';
      try {
        const res = await apiService.verifyOtp(otpEmail.value, otpValue.value);
        if (res.success) {
          emit('login');
        } else {
          error.value = res.message || 'Code invalide ou expiré';
        }
      } catch (err) {
        error.value = err.message || 'Code invalide ou expiré';
      } finally {
        loading.value = false;
      }
    };

    const handleResendOtp = async () => {
      loading.value = true;
      error.value = '';
      try {
        await apiService.sendOtp(otpEmail.value);
        successMessage.value = "Un nouveau code OTP a été envoyé.";
        resendCooldown.value = 60;
        const timer = setInterval(() => {
          resendCooldown.value--;
          if (resendCooldown.value <= 0) clearInterval(timer);
        }, 1000);
      } catch (err) {
        error.value = err.message;
      } finally {
        loading.value = false;
      }
    };

    return { 
      isLogin, isOtpMode, loading, error, successMessage, 
      loginData, reg, otpEmail, otpValue, resendCooldown,
      countries, currentCountry, showPrefixes, phoneOnly,
      selectCountry, handleLoginSubmit, handleRegisterSubmit, handleOtpSubmit, handleResendOtp, 
      clearMessages, resetFlow 
    };
  }
}
</script>

<style scoped>
.login-page { 
  min-height: 100vh; 
  display: flex; 
  flex-direction: column; 
  background: var(--bg-app); 
  position: relative; 
  overflow-x: hidden; 
}

.login-decoration-bg { 
  position: absolute; 
  top: 0; 
  left: 0; 
  width: 100%; 
  height: 600px; 
  background: radial-gradient(circle at 50% 0%, rgba(14, 165, 233, 0.08) 0%, transparent 70%); 
  z-index: 0; 
}

.login-brand { 
  position: relative; 
  z-index: 1; 
  padding: 5rem 2rem 4rem; 
  display: flex; 
  justify-content: center; 
}

.logo { 
  display: flex; 
  flex-direction: column;
  align-items: center; 
  gap: 1.5rem; 
}

.logo-img { 
  height: 64px; /* Increased from 44px */
  filter: drop-shadow(0 4px 12px rgba(0,0,0,0.05));
}

.logo-type { 
  font-size: 2.25rem; /* Increased from 1.75rem */
  font-weight: 900; 
  letter-spacing: -0.05em; 
  color: var(--text-main);
}

.login-main { 
  position: relative; 
  z-index: 1; 
  flex: 1; 
  display: grid; 
  grid-template-columns: 540px 360px; /* Slightly wider */
  gap: 8rem; /* Increased gap */
  align-items: start; 
  justify-content: center; 
  padding: 0 2rem 8rem; 
}

.auth-mode-selector { 
  display: flex; 
  gap: 1.25rem; 
  background: rgba(241, 245, 249, 0.8); 
  padding: 0.5rem; 
  border-radius: 1.25rem; 
  margin-bottom: 3rem;
}

.mode-btn { 
  flex: 1; 
  padding: 1rem; 
  border: none; 
  background: transparent; 
  cursor: pointer; 
  border-radius: 1rem; 
  font-family: var(--font-heading); 
  font-weight: 800; 
  font-size: 1rem; 
  color: var(--text-dim); 
  transition: all 0.4s var(--smooth); 
}

.mode-btn.active { 
  background: white; 
  color: var(--text-main); 
  box-shadow: var(--shadow-lg); 
}

.login-card { 
  border-radius: 2.5rem; 
  border: 1px solid rgba(226, 232, 240, 0.5); 
  padding: 4.5rem !important; /* Forces more padding */
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem; /* More space between groups */
}

.phone-input-combined {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border: 2px solid #f1f5f9;
  border-radius: 1.25rem;
  transition: all 0.3s var(--smooth);
  position: relative; /* Ensure relative positioning for dropdown */
}

.phone-input-combined:focus-within {
  border-color: var(--primary);
  background: white;
  box-shadow: 0 10px 20px -5px rgba(14, 165, 233, 0.1);
}

.custom-prefix-wrapper {
  position: relative;
  z-index: 10;
}

.prefix-trigger {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0 1.25rem;
  height: 56px;
  cursor: pointer;
  border-right: 2px solid #f1f5f9;
  transition: background 0.2s;
  min-width: 140px;
}

.prefix-trigger:hover {
  background: rgba(14, 165, 233, 0.04);
}

.flag-icon {
  width: 28px;
  height: auto;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.prefix-text {
  font-weight: 800;
  font-family: var(--font-heading);
  color: var(--text-main);
  font-size: 1.05rem;
}

.chevron {
  font-size: 0.8rem;
  color: var(--text-dim);
  transition: transform 0.3s;
}

.chevron.open {
  transform: rotate(180deg);
}

.prefix-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  width: 280px;
  max-height: 320px;
  overflow-y: auto;
  border-radius: 1.25rem;
  border: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: var(--shadow-xl);
  padding: 0.5rem;
  background: white; /* Solid background to prevent overlap issues */
  z-index: 100; /* Higher z-index to stay on top */
  animation: popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.prefix-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.prefix-option:hover {
  background: var(--bg-app);
  transform: translateX(4px);
}

.flag-icon-sm {
  width: 24px;
  height: auto;
  border-radius: 2px;
}

.option-name {
  flex: 1;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-main);
}

.option-prefix {
  font-weight: 800;
  color: var(--primary);
  font-size: 0.9rem;
}

/* Scrollbar for dropdown */
.prefix-dropdown::-webkit-scrollbar {
  width: 4px;
}
.prefix-dropdown::-webkit-scrollbar-thumb {
  background: var(--border-strong);
  border-radius: 10px;
}

/* Transitions */
.pop-enter-active {
  animation: popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.pop-leave-active {
  animation: popIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) reverse;
}

@keyframes popIn {
  from { opacity: 0; transform: translateY(-10px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.phone-input-combined .input-premium {
  flex: 1;
  background: transparent !important;
  border: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  font-size: 1.1rem;
  padding: 1.25rem 1.5rem;
}

.prefix-select:focus {
  border-color: var(--primary);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.registration-scroll {
  max-height: 500px;
  overflow-y: auto;
  padding-right: 1.5rem;
  margin-right: -1.5rem;
}

/* Custom scrollbar for premium look */
.registration-scroll::-webkit-scrollbar {
  width: 6px;
}
.registration-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.registration-scroll::-webkit-scrollbar-thumb {
  background: var(--border-strong);
  border-radius: 10px;
}

.otp-view {
  animation: fadeIn 0.5s ease;
}

.otp-input-container {
  display: flex;
  justify-content: center;
}

.otp-field {
  text-align: center;
  font-size: 2.5rem;
  letter-spacing: 0.5em;
  padding: 1.5rem !important;
  font-family: 'JetBrains Mono', monospace;
  width: 100%;
}

.btn-link {
  background: none;
  border: none;
  color: var(--primary);
  font-weight: 800;
  cursor: pointer;
  padding: 0.5rem;
  text-decoration: underline;
  transition: opacity 0.2s;
}

.btn-link:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  text-decoration: none;
}

.form-group label { 
  display: block; 
  font-size: 0.75rem; 
  font-weight: 800; 
  color: var(--text-dim); 
  letter-spacing: 0.12em; 
  margin-bottom: 1rem; 
}

.input-premium { 
  width: 100%; 
  padding: 1.25rem 1.5rem; 
  background: #f8fafc;
  border: 2px solid #f1f5f9; 
  border-radius: 1.25rem; 
  font-size: 1.05rem; 
  font-weight: 600; 
  font-family: var(--font-body); 
  transition: all 0.3s var(--smooth); 
}

.input-premium:focus { 
  outline: none; 
  border-color: var(--primary); 
  background: white; 
  box-shadow: 0 10px 20px -5px rgba(14, 165, 233, 0.1); 
}

.btn-primary.w-full {
  padding: 1.5rem;
  font-size: 1.15rem;
  border-radius: 1.25rem;
  margin-top: 1.5rem;
}

/* Side Prop */
.login-side-prop { 
  display: flex; 
  flex-direction: column; 
  gap: 4rem; 
  padding-top: 5rem;
}

.prop-item { 
  display: flex; 
  align-items: center; /* Centered icons look less cramped */
  gap: 2rem; 
}

.prop-icon { 
  width: 64px; 
  height: 64px; 
  background: white; 
  border-radius: 1.5rem; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  font-size: 1.75rem;
  box-shadow: var(--shadow-md);
  flex-shrink: 0;
}

.prop-text strong { 
  display: block; 
  font-size: 1.15rem; 
  margin-bottom: 0.5rem; 
  color: var(--text-main);
}

.prop-text p { 
  font-size: 1rem; 
  color: var(--text-muted); 
  line-height: 1.5; 
}

.error-toast { 
  background: #FFF1F2; 
  color: #BE123C; 
  padding: 1.5rem; 
  border-radius: 1.25rem; 
  display: flex; 
  gap: 1rem; 
  font-weight: 700; 
  font-size: 1rem; 
  border: 1px solid #FECDD3; 
  margin-top: 2rem;
}

.success-toast { 
  background: #DCFCE7; 
  color: #166534; 
  padding: 1.5rem; 
  border-radius: 1.25rem; 
  display: flex; 
  gap: 1rem; 
  font-weight: 700; 
  font-size: 1rem; 
  border: 1px solid #BBF7D0; 
  margin-top: 2rem;
}

@media (max-width: 1100px) {
  .login-main { 
    grid-template-columns: 1fr; 
    padding: 0 2rem 6rem; 
    gap: 4rem; 
  }
  .login-side-prop { 
    padding-top: 0;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.success-overlay { 
  position: fixed; 
  inset: 0; 
  z-index: 9999; /* Ultra high z-index */
  display: flex; 
  align-items: center; 
  justify-content: center; 
  padding: 2rem;
  background: rgba(15, 23, 42, 0.85); /* Darker backdrop ensures visibility */
  backdrop-filter: blur(8px);
}
</style>
