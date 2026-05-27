import { useEffect } from 'react';
import { supabase } from '../services/supabase';

export const useMealRealtime = (onCommentAdded: (payload: any) => void, onStatusChanged: (payload: any) => void) => {
  useEffect(() => {
    const channelName = `mobile-meals-${Math.random().toString(36).substring(7)}`;
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'MealComment' }, (payload) => {
        onCommentAdded(payload.new);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'Meal' }, (payload) => {
        onStatusChanged(payload.new);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onCommentAdded, onStatusChanged]);
};
