<template>
    <div class="space-y-4">
        <div class="flex flex-col gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
  
  <div class="relative w-full">
    <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
    <input 
      :value="searchTerm" 
      @input="$emit('update:searchTerm', $event.target.value)"
      type="text" 
      placeholder="Rechercher par nom..." 
      class="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
    >
  </div>

  <div class="flex flex-wrap items-center gap-2">
    
    <select 
      :value="dateRange" 
      @change="$emit('update:dateRange', $event.target.value)"
      class="flex-1 min-w-[140px] p-2 rounded-lg border border-slate-200 bg-white text-sm font-medium outline-none h-10"
    >
      <option value="all">Toutes les dates</option>
      <option value="today">Aujourd'hui</option>
      <option value="7days">7 derniers jours</option>
      <option value="30days">30 derniers jours</option>
    </select>

    <div class="flex gap-2 w-full sm:w-auto">
      <button @click="exportCSV" class="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all h-10">
        <FileSpreadsheet class="w-4 h-4" /> CSV
      </button>
      <button @click="exportPDF" class="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all h-10">
        <FileText class="w-4 h-4" /> PDF
      </button>
    </div>

  </div>
</div>  
      <div class="overflow-x-auto border border-slate-200 rounded-xl">
        <table class="w-full text-left border-collapse bg-white">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] uppercase tracking-widest font-bold">
              <th class="p-4">Nom & Prénom</th>
              <th class="p-4">Contact</th>
              <th class="p-4">Date & Heure</th>
              <th class="p-4">Ticket</th>
              <th class="p-4">Adresse MAC</th>
              <th class="p-4">IP</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="user in data" :key="user.id" class="hover:bg-slate-50 transition-colors text-sm text-slate-700">
              <td class="p-4">
                <span class="font-bold text-slate-900">{{ user.nom }}</span> {{ user.prenom }}
              </td>
              <td class="p-4 font-mono text-blue-600">{{ user.telephone }}</td>
              <td class="p-4 text-xs">{{ formatDate(user.created_at) }}</td>
              <td class="p-4">
                <span class="bg-slate-100 px-2 py-1 rounded font-mono text-xs">{{ user.ticket_code || '---' }}</span>
              </td>
              <td class="p-4 font-mono text-[11px] text-slate-500">{{ user.adresse_mac }}</td>
              <td class="p-4 font-mono text-[11px] text-slate-500">{{ user.adresse_ip }}</td>
            </tr>
            <tr v-if="data.length === 0">
              <td colspan="6" class="p-10 text-center text-slate-400 italic font-medium">
                Aucun utilisateur trouvé pour cette période ou ce critère.
              </td>
            </tr>
          </tbody>
        </table>
        
        <div class="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
          <p class="text-xs text-slate-500 font-medium">
            Affichage de <span class="text-slate-900 font-bold">{{ rangeStart }}</span> à <span class="text-slate-900 font-bold">{{ rangeEnd }}</span> sur <span class="text-slate-900 font-bold">{{ totalItems }}</span> utilisateurs
          </p>
          
          <div class="flex items-center gap-2">
            <button 
              @click="$emit('update:currentPage', currentPage - 1)"
              :disabled="currentPage === 1"
              class="p-2 rounded-lg border border-slate-200 bg-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft class="w-5 h-5 text-slate-600" />
            </button>
            
            <span class="text-xs font-bold px-4 py-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100 uppercase tracking-tighter">
              Page {{ currentPage }}
            </span>
  
            <button 
              @click="$emit('update:currentPage', currentPage + 1)"
              :disabled="currentPage >= Math.ceil(totalItems / 10)"
              class="p-2 rounded-lg border border-slate-200 bg-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              <ChevronRight class="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
    import { computed } from 'vue';
    import { Search, FileSpreadsheet, FileText, ChevronLeft, ChevronRight } from 'lucide-vue-next';
    import { formatBeninDate } from '../utils/formatDate';
    import jsPDF from 'jspdf';
    import autoTable from 'jspdf-autotable'; // Import directl
    
    const props = defineProps(['data', 'searchTerm', 'dateRange', 'zoneName', 'totalItems', 'currentPage']);
    const emit = defineEmits(['update:searchTerm', 'update:dateRange', 'update:currentPage']);
    
    const rangeStart = computed(() => props.totalItems === 0 ? 0 : (props.currentPage - 1) * 10 + 1);
    const rangeEnd = computed(() => Math.min(props.currentPage * 10, props.totalItems));
    
    const formatDate = (date) => formatBeninDate(date);
    
    const exportCSV = () => {
      const headers = ["Nom", "Prenom", "Contact", "Date", "Ticket", "MAC", "IP"];
      const rows = props.data.map(u => [
        u.nom, u.prenom, u.telephone, formatDate(u.created_at), u.ticket_code, u.adresse_mac, u.adresse_ip
      ]);
      let csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csvContent));
      link.setAttribute("download", `Rapport_ARCEP_${props.zoneName}.csv`);
      link.click();
    };
    
    const exportPDF = () => {
  const doc = new jsPDF();
  
  // Titre du document
  doc.setFontSize(16);
  doc.text(`Registre ARCEP - ${props.zoneName}`, 14, 15);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Généré le : ${formatDate(new Date().toISOString())}`, 14, 22);

  // Préparation des données
  const tableRows = props.data.map(u => [
    u.nom, 
    u.prenom, 
    u.telephone, 
    formatDate(u.created_at), 
    u.ticket_code || '---', 
    u.adresse_mac
  ]);

  // Utilisation de la fonction autoTable importée directement
  autoTable(doc, {
    head: [['Nom', 'Prénom', 'Contact', 'Date/Heure', 'Ticket', 'MAC']],
    body: tableRows,
    startY: 30,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    margin: { top: 30 }
  });

  doc.save(`Rapport_ARCEP_${props.zoneName}.pdf`);
 };

</script>