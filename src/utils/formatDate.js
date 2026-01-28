// src/utils/formatDate.js
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export const formatBeninDate = (isoString) => {
  if (!isoString) return "-";
  
  // Supabase envoie de l'UTC. Le navigateur convertit localement.
  // Pour le Bénin (GMT+1), on s'assure d'un format lisible.
  const date = parseISO(isoString);
  
  return format(date, "eeee d MMMM yyyy 'à' HH:mm", { locale: fr });
};