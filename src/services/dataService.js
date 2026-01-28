import { supabase } from '../lib/supabase';
import { startOfDay, subDays } from 'date-fns';

export const dataService = {
  async getIdentities(clientId, { searchTerm = '', dateRange = 'all', page = 1, pageSize = 10 }) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('identites_arcep')
      .select('*', { count: 'exact' })
      .eq('client_id_public', clientId)
      .eq('statut_abonnement', true)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (searchTerm) {
      query = query.or(`nom.ilike.%${searchTerm}%,prenom.ilike.%${searchTerm}%`);
    }

    const today = new Date();
    if (dateRange === 'today') {
      query = query.gte('created_at', startOfDay(today).toISOString());
    } else if (dateRange === '7days') {
      query = query.gte('created_at', subDays(today, 7).toISOString());
    } else if (dateRange === '30days') {
      query = query.gte('created_at', subDays(today, 30).toISOString());
    }

    const { data, count, error } = await query;
    if (error) throw error;
    return { data, count };
  },

  async getZoneInfo(clientId) {
    const { data, error } = await supabase
      .from('zones_admin')
      .select('nom_wifi, statut_abonnement')
      .eq('client_id_public', clientId)
      .single();
    if (error) throw error;
    return data;
  },

  async getMissedCount(clientId) {
    const { count, error } = await supabase
      .from('identites_arcep')
      .select('*', { count: 'exact', head: true })
      .eq('client_id_public', clientId)
      .eq('statut_abonnement', false);
    if (error) throw error;
    return count || 0;
  },

  // NOUVELLE FONCTION DE VÉRIFICATION PRÉALABLE
  async checkSubscriptionStatus(clientId) {
    const { data, error } = await supabase
      .from('zones_admin')
      .select('statut_abonnement')
      .eq('client_id_public', clientId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') throw new Error("Identifiant inconnu.");
      throw error;
    }
    
    return data.statut_abonnement;
  },


};