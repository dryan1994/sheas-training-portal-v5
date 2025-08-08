// scripts/supabase.js
const SUPABASE_URL = 'https://mznpixxegmalqkfjeiea.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16bnBpeHhlZ21hbHFrZmplaWVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2NDI4ODQsImV4cCI6MjA3MDIxODg4NH0.pvbLCRrwR1MFXoqgxFJ_he-EOR_pdXXz-TLWFvHKlT8';

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
