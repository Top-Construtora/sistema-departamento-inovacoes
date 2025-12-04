import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env.js';

let supabaseInstance: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (!env.supabaseUrl || !env.supabaseKey) {
    throw new Error(
      'Variáveis SUPABASE_URL e SUPABASE_ANON_KEY não configuradas. ' +
      'Configure o arquivo .env com suas credenciais do Supabase.'
    );
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient(env.supabaseUrl, env.supabaseKey);
  }

  return supabaseInstance;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    const client = getSupabaseClient();
    const value = client[prop as keyof SupabaseClient];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});
