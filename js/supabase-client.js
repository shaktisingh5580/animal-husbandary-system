// supabase-client.js
// Initialize the Supabase client

// This script assumes config.js is loaded before it
// and defines SUPABASE_CONFIG

// Create and export the Supabase client
const supabase = supabaseJs.createClient(
  SUPABASE_CONFIG.url,
  SUPABASE_CONFIG.anonKey
);

// Log initialization for debugging
console.log("Supabase client initialized with URL:", SUPABASE_CONFIG.url);
