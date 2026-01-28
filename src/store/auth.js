import { defineStore } from 'pinia';
import { supabase } from '../lib/supabase';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    client: JSON.parse(sessionStorage.getItem('client_session')) || null,
  }),
  actions: {
    async login(clientId, typedPassword) {
      // 1. Chercher le client
      const { data: zone, error } = await supabase
        .from('zones_admin')
        .select('*')
        .eq('client_id_public', clientId)
        .single();

      if (error || !zone) throw new Error("Identifiant inconnu");

      // 2. VERIFICATION : Le mot de passe dans la BD est-il vide ou null ?
      const isPasswordEmpty = !zone.password || zone.password.trim() === "";

      if (isPasswordEmpty) {
        // On s'arrête ici et on signale qu'il faut initialiser
        return { status: 'NEED_PASSWORD_INIT', zoneId: zone.id };
      }

      // 3. COMPARISON : Si le mot de passe existe, on compare
      if (zone.password !== typedPassword) {
        throw new Error("ID ou mot de passe erroné");
      }

      // 4. SUCCÈS
      this.client = zone;
      sessionStorage.setItem('client_session', JSON.stringify(zone));
      return { status: 'SUCCESS' };
    },

    async setFirstPassword(zoneId, newPassword) {
      // Note: On utilise l'ID pour être précis sur la ligne à modifier
      const { error } = await supabase
        .from('zones_admin')
        .update({ password: newPassword })
        .eq('id', zoneId);
      
      if (error) {
          console.error("Détails Erreur Supabase:", error);
          throw error;
      }
    },

    logout() {
      this.client = null;
      sessionStorage.removeItem('client_session');
    }
  }
});