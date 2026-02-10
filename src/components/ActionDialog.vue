<template>
  <transition name="fade">
    <div v-if="isOpen" class="dialog-overlay glass" @click="handleBackdropClick">
      <div class="dialog-card card-premium reveal" :class="mode.toLowerCase()" @click.stop>
        
        <!-- Iconography -->
        <div class="dialog-icon-wrapper">
          <div class="dialog-icon-box" :class="mode.toLowerCase()">
            <i :class="iconClass"></i>
          </div>
        </div>

        <!-- Content -->
        <div class="dialog-content">
          <h3 class="dialog-title">{{ title }}</h3>
          <p class="dialog-message">{{ message }}</p>

          <!-- PROMPT Mode: Input -->
          <div v-if="mode === 'PROMPT'" class="mt-6 w-full">
            <input 
              ref="promptInput"
              v-model="inputValue" 
              :placeholder="placeholder"
              type="text" 
              class="input-premium w-full text-center"
              @keyup.enter="handleConfirm"
            />
          </div>

          <!-- ENV_SELECT Mode: Choice between Sandbox and Production -->
          <div v-if="mode === 'ENV_SELECT'" class="mt-8 w-full flex flex-col gap-4">
            <div 
              class="env-option" 
              :class="{ active: inputValue === 'production' }"
              @click="inputValue = 'production'"
            >
              <div class="env-radio"></div>
              <div class="env-info text-left">
                <strong>Environnement Production</strong>
                <span>Génère une clé réelle (sk_live_...)</span>
              </div>
            </div>
            <div 
              class="env-option" 
              :class="{ active: inputValue === 'sandbox' }"
              @click="inputValue = 'sandbox'"
            >
              <div class="env-radio"></div>
              <div class="env-info text-left">
                <strong>Environnement Sandbox (Test)</strong>
                <span>Génère une clé de test (sk_test_...)</span>
              </div>
            </div>
          </div>

          <!-- KEY_DISPLAY Mode: Show Key -->
          <div v-if="mode === 'KEY_DISPLAY'" class="key-reveal-box mt-6">
            <code class="key-text">{{ inputValue }}</code>
            <button class="btn-copy-action" @click="copyToClipboard">
              <i class="fas" :class="copied ? 'fa-check' : 'fa-copy'"></i>
            </button>
          </div>
        </div>

        <!-- Actions -->
        <div class="dialog-actions">
          <button 
            v-if="['CONFIRM', 'DANGER', 'PROMPT'].includes(mode)" 
            class="btn btn-ghost" 
            @click="handleCancel"
          >
            Annuler
          </button>
          
          <button 
            class="btn" 
            :class="confirmBtnClass"
            @click="handleConfirm"
          >
            {{ confirmText || 'Confirmer' }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { computed, ref, nextTick, watch } from 'vue';

export default {
  name: 'ActionDialog',
  props: {
    isOpen: Boolean,
    mode: {
      type: String,
      default: 'INFO', // INFO, CONFIRM, DANGER, PROMPT, KEY_DISPLAY, ENV_SELECT
      validator: (v) => ['INFO', 'CONFIRM', 'DANGER', 'PROMPT', 'KEY_DISPLAY', 'ENV_SELECT'].includes(v)
    },
    title: String,
    message: String,
    placeholder: String,
    confirmText: String,
    prefillValue: String
  },
  emits: ['update:isOpen', 'confirm', 'cancel'],
  setup(props, { emit }) {
    const inputValue = ref('');
    const copied = ref(false);
    const promptInput = ref(null);

    watch(() => props.isOpen, (newVal) => {
      if (newVal) {
        inputValue.value = props.prefillValue || '';
        copied.value = false;
        if (props.mode === 'PROMPT') {
          nextTick(() => promptInput.value?.focus());
        }
      }
    });

    const iconClass = computed(() => {
      switch (props.mode) {
        case 'DANGER': return 'fas fa-exclamation-triangle';
        case 'CONFIRM': return 'fas fa-question';
        case 'PROMPT': return 'fas fa-pen';
        case 'KEY_DISPLAY': return 'fas fa-key';
        case 'ENV_SELECT': return 'fas fa-server';
        default: return 'fas fa-info';
      }
    });

    const confirmBtnClass = computed(() => {
      switch (props.mode) {
        case 'DANGER': return 'btn-danger';
        case 'KEY_DISPLAY': return 'btn-primary';
        default: return 'btn-primary';
      }
    });

    const handleConfirm = () => {
      emit('confirm', inputValue.value);
    };

    const handleCancel = () => {
      emit('update:isOpen', false);
      emit('cancel');
    };

    const handleBackdropClick = () => {
      // Optional: close on backdrop, usually safer to force button click for critical actions
      if (props.mode === 'INFO' || props.mode === 'KEY_DISPLAY') {
        handleCancel();
      }
    };

    const copyToClipboard = () => {
      navigator.clipboard.writeText(props.prefillValue || inputValue.value);
      copied.value = true;
      setTimeout(() => copied.value = false, 2000);
    };

    return { 
      inputValue, 
      copied, 
      promptInput, 
      iconClass, 
      confirmBtnClass, 
      handleConfirm, 
      handleCancel, 
      handleBackdropClick,
      copyToClipboard
    };
  }
}
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(8px);
}

.dialog-card {
  max-width: 480px;
  width: 100%;
  background: white;
  border-radius: 1.5rem;
  padding: 2.5rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: var(--shadow-2xl);
  border: 1px solid var(--border-subtle);
  transform-origin: center center;
}

.dialog-card.danger { border-color: #FECDD3; }

.dialog-icon-wrapper { margin-bottom: 1.5rem; }

.dialog-icon-box {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background: #F1F5F9;
  color: var(--text-dim);
}

.dialog-icon-box.danger { background: #FEF2F2; color: #DC2626; }
.dialog-icon-box.confirm { background: #E0F2FE; color: var(--primary); }
.dialog-icon-box.key_display { background: #ECFDF5; color: #059669; }
.dialog-icon-box.env_select { background: #F5F3FF; color: #7C3AED; }

.dialog-title { font-size: 1.25rem; margin-bottom: 0.5rem; color: var(--text-main); }
.dialog-message { color: var(--text-muted); line-height: 1.6; font-size: 0.95rem; }

/* Env Selection */
.env-option {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1rem 1.5rem;
  background: var(--bg-surface-dim);
  border: 2px solid transparent;
  border-radius: 1rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.env-option:hover {
  background: white;
  border-color: var(--border-strong);
}

.env-option.active {
  background: white;
  border-color: var(--primary);
  box-shadow: var(--shadow-md);
}

.env-radio {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-strong);
  border-radius: 50%;
  position: relative;
}

.env-option.active .env-radio {
  border-color: var(--primary);
}

.env-option.active .env-radio::after {
  content: '';
  position: absolute;
  inset: 3px;
  background: var(--primary);
  border-radius: 50%;
}

.env-info {
  display: flex;
  flex-direction: column;
}

.env-info strong {
  font-size: 0.95rem;
  color: var(--text-main);
}

.env-info span {
  font-size: 0.75rem;
  color: var(--text-dim);
}

.key-reveal-box {
  background: #1E293B;
  color: #F8FAFC;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  border: 1px solid #334155;
}

.key-text {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9rem;
  word-break: break-all;
  flex: 1;
  text-align: left;
}

.btn-copy-action {
  background: rgba(255,255,255,0.1);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.btn-copy-action:hover { background: rgba(255,255,255,0.2); }

.dialog-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  width: 100%;
  justify-content: center;
}

.btn { padding: 0.75rem 1.5rem; border-radius: 0.75rem; font-weight: 700; cursor: pointer; transition: all 0.2s; font-size: 0.95rem; }

.btn-primary { background: var(--primary); color: white; border: none; }
.btn-primary:hover { background: var(--primary-dark); transform: translateY(-1px); }

.btn-danger { background: #DC2626; color: white; border: none; }
.btn-danger:hover { background: #B91C1C; transform: translateY(-1px); }

.btn-ghost { background: transparent; color: var(--text-dim); border: none; }
.btn-ghost:hover { background: #F1F5F9; color: var(--text-main); }

.input-premium {
  padding: 0.75rem;
  border: 2px solid var(--border-strong);
  border-radius: 0.75rem;
  font-weight: 600;
  outline: none;
  transition: border-color 0.2s;
}
.input-premium:focus { border-color: var(--primary); }
</style>
