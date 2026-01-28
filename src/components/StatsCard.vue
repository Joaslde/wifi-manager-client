<template>
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
      <div :class="`p-4 rounded-xl ${bgColor}`">
        <component :is="icon" :class="`w-8 h-8 ${iconColor}`" />
      </div>
      <div>
        <p class="text-slate-500 text-sm font-medium uppercase tracking-wider">{{ title }}</p>
        <h3 class="text-3xl font-black text-slate-800">{{ value }}</h3>
      </div>
    </div>
  </template>
  
  <script setup>
  defineProps({
    title: String,
    value: [String, Number],
    icon: Object, // On passera une icône Lucide ici
    iconColor: String,
    bgColor: String
  })
  </script>