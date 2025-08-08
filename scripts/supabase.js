// scripts/supabase.js
const SUPABASE_URL = window.localStorage.getItem('SUPABASE_URL') || 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = window.localStorage.getItem('SUPABASE_ANON_KEY') || 'YOUR_PUBLIC_ANON_KEY';
let supabaseClient = null;

async function initSupabase() {
  if (!window.createClient) {
    const s = document.createElement('script');
    s.type = 'module';
    s.innerHTML = `
      import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
      window.createClient = createClient;
      window.dispatchEvent(new Event('supabaseReady'));
    `;
    document.head.appendChild(s);
  }
  return new Promise((resolve) => {
    if (window.createClient) return resolve();
    window.addEventListener('supabaseReady', () => resolve());
  });
}

async function supabaseClientReady() {
  await initSupabase();
  supabaseClient = window.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return supabaseClient;
}
