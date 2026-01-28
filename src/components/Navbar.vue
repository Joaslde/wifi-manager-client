<template>
    <nav class="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto flex justify-between items-center">
        <div class="flex items-center gap-3">
          <div class="bg-blue-600 p-2 rounded-lg">
            <Wifi class="text-white w-6 h-6" />
          </div>
          <div>
            <h1 class="font-bold text-slate-800 leading-none">{{ zoneName || 'Chargement...' }}</h1>
            <div class="flex items-center gap-1.5 mt-1">
              <span :class="`w-2 h-2 rounded-full ${isSubscriber ? 'bg-green-500' : 'bg-red-500'}`"></span>
              <span class="text-[10px] font-bold uppercase text-slate-500">
                {{ isSubscriber ? 'Abonnement Actif' : 'Abonnement Expire' }}
              </span>
            </div>
          </div>
        </div>
  
        <button @click="$emit('logout')" class="flex items-center gap-2 text-slate-500 hover:text-red-600 transition-colors font-medium text-sm">
          <LogOut class="w-5 h-5" />
          <span class="hidden sm:inline">Déconnexion</span>
        </button>
      </div>
    </nav>
  </template>
  
  <script setup>
  import { Wifi, LogOut } from 'lucide-vue-next';
  defineProps(['zoneName', 'isSubscriber']);
  defineEmits(['logout']);
  </script>