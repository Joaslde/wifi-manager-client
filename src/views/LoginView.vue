<template>
  <div class="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
    <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-black text-blue-600 uppercase tracking-tight">Espace Gérant WiFi</h1>
        <p class="text-slate-500 text-sm">Accédez à vos rapports ARCEP</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">ID Public du Compte</label>
          <input v-model="form.id" type="text" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Ex: AKT01" required>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Mot de passe</label>
          <input v-model="form.pass" type="password" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="••••••••" required>
        </div>

        <button :disabled="loading" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-50">
          {{ loading ? 'VÉRIFICATION...' : 'SE CONNECTER' }}
        </button>
        
        <div v-if="errorMsg" class="p-3 bg-red-50 border border-red-100 rounded-lg">
            <p class="text-red-600 text-xs text-center font-bold">{{ errorMsg }}</p>
        </div>
      </form>
    </div>

    <transition name="fade">
        <div v-if="showResetModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div class="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl border border-slate-100">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <span class="text-2xl">🔑</span>
            </div>
            <h3 class="text-xl font-bold text-center mb-2">Initialisation</h3>
            <p class="text-slate-600 text-center text-sm mb-8">
              Votre mot de passe actuel est vide. Voulez-vous que <span class="font-bold text-blue-600 italic">"{{ form.pass }}"</span> devienne votre mot de passe définitif ?
            </p>
            <div class="flex gap-3">
              <button @click="confirmNewPassword" class="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">OUI, VALIDER</button>
              <button @click="showResetModal = false" class="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors">NON</button>
            </div>
          </div>
        </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useAuthStore } from '../store/auth';
import { useRouter } from 'vue-router';
import { dataService } from '../services/dataService';

const auth = useAuthStore();
const router = useRouter();

const form = reactive({ id: '', pass: '' });
const loading = ref(false);
const errorMsg = ref('');
const showResetModal = ref(false);
const pendingZoneId = ref(null);

const handleLogin = async () => {
  loading.value = true;
  errorMsg.value = '';
  
  try {
    // ÉTAPE 1 : Vérification de l'abonnement AVANT le mot de passe
    const isSubscribed = await dataService.checkSubscriptionStatus(form.id);
    
    if (!isSubscribed) {
      errorMsg.value = "Accès refusé : Votre abonnement est inactif. Veuillez contacter le service client.";
      loading.value = false;
      return; // On arrête tout ici
    }

    // ÉTAPE 2 : Si True, on continue la logique normale (Mot de passe)
    const res = await auth.login(form.id, form.pass);
    
    if (res && res.status === 'NEED_PASSWORD_INIT') {
      pendingZoneId.value = res.zoneId;
      showResetModal.value = true;
    } else {
      router.push('/dashboard');
    }
  } catch (err) {
    // Si l'identifiant n'existe pas, l'erreur viendra de checkSubscriptionStatus
    errorMsg.value = err.message;
  } finally {
    loading.value = false;
  }
};

const confirmNewPassword = async () => {
  try {
    await auth.setFirstPassword(pendingZoneId.value, form.pass);
    alert("Succès ! Votre mot de passe est enregistré.");
    showResetModal.value = false;
    // On relance la connexion maintenant que le pass existe
    handleLogin();
  } catch (err) {
    alert("Erreur lors de l'enregistrement. Vérifiez vos permissions Supabase (RLS).");
  }
};
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>