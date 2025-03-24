// Import the Supabase client library (if using ES module)
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// Ensure `SUPABASE_CONFIG` is defined before using it
const SUPABASE_CONFIG = {
  url: "https://talqdxageqbvsavscyqt.supabase.co", // Replace with your Supabase URL
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhbHFkeGFnZXFidnNhdnNjeXF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3Mjc0OTAsImV4cCI6MjA1ODMwMzQ5MH0.YBMSv0YClLrGSM16M5-GXNefh-5MbPQwjh-CBET0shU", // Replace with your actual anon key
};

// Initialize Supabase client
const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

// Log initialization for debugging
console.log("Supabase client initialized with URL:", SUPABASE_CONFIG.url);

// Example: Test the connection by fetching data from a table
async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from("users").select("*").limit(1);
    if (error) throw error;
    console.log("✅ Supabase connection successful:", data);
  } catch (error) {
    console.error("❌ Supabase connection failed:", error.message);
  }
}

// Run the test
testSupabaseConnection();
