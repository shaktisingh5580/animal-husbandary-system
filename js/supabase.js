import { createClient } from "@supabase/supabase-js"

// Assuming SUPABASE_CONFIG is defined elsewhere, e.g., in a config file or environment variables
// Example:
// const SUPABASE_CONFIG = {
//   url: 'YOUR_SUPABASE_URL',
//   anonKey: 'YOUR_SUPABASE_ANON_KEY',
//   serviceRoleKey: 'YOUR_SUPABASE_SERVICE_ROLE_KEY'
// };

// Initialize Supabase client
const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  // Disable realtime subscriptions by default to reduce connection issues
  realtime: {
    params: {
      eventsPerSecond: 1,
    },
  },
  global: {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  },
})

// Create admin client with service role key
const adminSupabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  },
})

// Test Supabase connection
async function testSupabaseConnection() {
  try {
    console.log("Testing Supabase connection to:", SUPABASE_CONFIG.url)

    // First, try a simple health check
    const healthCheck = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_CONFIG.anonKey,
      },
    })

    console.log("Health check status:", healthCheck.status)

    if (!healthCheck.ok) {
      return {
        success: false,
        message: `Supabase API returned status ${healthCheck.status}`,
        details: {
          status: healthCheck.status,
          statusText: healthCheck.statusText,
        },
      }
    }

    // Then try an actual API call
    const { data, error } = await supabase.from("users").select("count").limit(1)

    if (error) throw error

    return {
      success: true,
      message: `Connection successful`,
      details: { data },
    }
  } catch (error) {
    console.error("Supabase connection test failed:", error)

    return {
      success: false,
      message: error.message,
      details: {
        url: SUPABASE_CONFIG.url,
        error: error.message,
        code: error.code,
      },
    }
  }
}

// Validate Supabase URL format
function validateSupabaseUrl(url) {
  if (!url) return { valid: false, message: "URL is empty" }

  try {
    const parsedUrl = new URL(url)
    const isHttps = parsedUrl.protocol === "https:"

    if (!isHttps && !parsedUrl.hostname.includes("localhost")) {
      return { valid: false, message: "Supabase URL must use HTTPS protocol" }
    }

    return { valid: true, message: "URL format is valid" }
  } catch (error) {
    return { valid: false, message: `Invalid URL format: ${error.message}` }
  }
}

