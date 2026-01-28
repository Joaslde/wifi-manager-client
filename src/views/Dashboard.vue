<template>
  <div class="min-h-screen bg-slate-50 font-sans pb-20">
    <Navbar 
      :zoneName="zoneInfo.nom_wifi" 
      :isSubscriber="zoneInfo.statut_abonnement"
      @logout="handleLogout" 
    />

    <main class="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <transition name="fade">
        <div v-if="missedCount > 0" class="mb-8 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl shadow-sm flex items-center gap-4">
          <div class="bg-amber-500 p-2 rounded-full text-white">
              <AlertCircle class="w-6 h-6" />
          </div>
          <div class="flex-1">
            <p class="text-amber-800 font-bold text-sm">Attention : Données verrouillées</p>
            <p class="text-amber-700 text-xs">
              Vous avez <span class="font-black underline">{{ missedCount }}</span> clients non identifiés lors de votre période de non-abonnement. 
            </p>
          </div>
          <button class="bg-amber-200 hover:bg-amber-300 text-amber-900 px-4 py-2 rounded-lg text-xs font-bold transition-all">
             RÉCUPÉRER
          </button>
        </div>
      </transition>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard 
          title="Total Inscrits" 
          :value="totalCount" 
          :icon="Users" 
          iconColor="text-blue-600" 
          bgColor="bg-blue-50"
        />
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 class="text-lg font-bold text-slate-800">Registre des Identités</h2>
            <p class="text-sm text-slate-500 italic">Conformité ARCEP - GMT+1 (Bénin)</p>
          </div>
          <button @click="refreshData" :class="{'animate-spin': loading}" class="p-2 text-slate-400 hover:text-blue-600">
             <RefreshCw class="w-5 h-5" />
          </button>
        </div>
        
        <div class="p-6">
          <UserTable 
            :data="identities" 
            :zoneName="zoneInfo.nom_wifi"
            :totalItems="totalCount"
            v-model:searchTerm="filters.searchTerm"
            v-model:dateRange="filters.dateRange"
            v-model:currentPage="currentPage"
            @update:searchTerm="debounceSearch"
            @update:dateRange="refreshData"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
  import { ref, reactive, onMounted, watch } from 'vue';
  import { useAuthStore } from '../store/auth';
  import { useRouter } from 'vue-router';
  import { dataService } from '../services/dataService';
  import { Users, RefreshCw, AlertCircle } from 'lucide-vue-next';
  import Navbar from '../components/Navbar.vue';
  import StatsCard from '../components/StatsCard.vue';
  import UserTable from '../components/UserTable.vue';
  
  // 1. DÉCLARATION DES VARIABLES (Toujours en premier)
  const auth = useAuthStore();
  const router = useRouter();
  
  const zoneInfo = ref({ nom_wifi: '', statut_abonnement: false });
  const identities = ref([]);
  const totalCount = ref(0);
  const missedCount = ref(0);
  const loading = ref(true);
  const currentPage = ref(1);
  const pageSize = 10;
  
  const filters = reactive({
    searchTerm: '',
    dateRange: 'all'
  });
  
  // 2. LOGIQUE DE SÉCURITÉ
  const checkAccess = (status) => {
    if (status === false) {
      auth.logout(); 
      router.push('/login?error=expired');
    }
  };
  
  // 3. FONCTIONS DE DONNÉES
  const refreshData = async () => {
    if (!auth.client) return;
    loading.value = true;
    try {
      const { data, count } = await dataService.getIdentities(auth.client.client_id_public, {
        searchTerm: filters.searchTerm,
        dateRange: filters.dateRange,
        page: currentPage.value,
        pageSize: pageSize
      });
      identities.value = data;
      totalCount.value = count;
      
      // On met à jour le compteur "business"
      missedCount.value = await dataService.getMissedCount(auth.client.client_id_public);
    } catch (err) {
      console.error(err);
    } finally {
      loading.value = false;
    }
  };
  
  let searchTimeout;
  const debounceSearch = () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(refreshData, 500);
  };
  
  // 4. WATCHERS (Surveillants)
  watch(() => zoneInfo.value.statut_abonnement, (newStatus) => {
    checkAccess(newStatus);
  });
  
  watch([() => filters.searchTerm, () => filters.dateRange], () => {
    currentPage.value = 1;
    refreshData();
  });
  
  watch(currentPage, () => {
    refreshData();
  });
  
  // 5. CYCLE DE VIE (Une seule fois onMounted à la fin)
  onMounted(async () => {
    if (!auth.client) return;
  
    try {
      // Récupérer les infos de la zone
      const info = await dataService.getZoneInfo(auth.client.client_id_public);
      zoneInfo.value = info;
  
      // Vérifier l'accès immédiatement
      checkAccess(info.statut_abonnement);
  
      // Charger les données de la table
      await refreshData();
    } catch (e) {
      console.error("Erreur onMounted:", e);
    }
  });
  
  const handleLogout = () => {
    auth.logout();
    router.push('/login');
  };
  </script>