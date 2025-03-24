// auth.js
// Auth functions for the Animal Husbandry System

// Login user
async function loginUser(email, password) {
  try {
    console.log("Attempting login for:", email);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      console.error("Login error:", error.message);
      return { user: null, error: error.message };
    }

    if (!data.user) {
      return { user: null, error: "No user returned from login" };
    }

    // Fetch user role after login
    const userDataResponse = await getCurrentUserData();
    
    if (userDataResponse.error) {
      console.error("Error fetching user data after login:", userDataResponse.error);
      return { user: data.user, error: null, role: null };
    }

    return { 
      user: data.user, 
      error: null, 
      role: userDataResponse.userData?.role || null 
    };
  } catch (err) {
    console.error("Unexpected login error:", err);
    return { user: null, error: err.message };
  }
}

// Register user
async function registerUser(email, password, role) {
  try {
    console.log("Attempting registration for:", email, "with role:", role);

    // First, check if the email is already registered
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .limit(1);
    
    if (checkError) {
      console.error("Error checking existing user:", checkError.message);
    } else if (existingUsers && existingUsers.length > 0) {
      return { user: null, error: "Email is already registered" };
    }

    // Proceed with registration
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          role: role
        }
      }
    });
    
    if (error) {
      console.error("Registration error:", error.message);
      return { user: null, error: error.message };
    }

    if (!data.user) {
      return { user: null, error: "No user returned from registration" };
    }

    console.log("User registered successfully, creating profile...");

    // Create user profile in the database
    const { error: profileError } = await supabase.from('users').insert({
      id: data.user.id,
      email: email,
      role: role,
      profile_completed: false
    });

    if (profileError) {
      console.error("Error creating user profile:", profileError.message);
      return { user: data.user, error: profileError.message };
    }

    console.log("User profile created successfully");
    return { user: data.user, error: null };
  } catch (err) {
    console.error("Unexpected registration error:", err);
    return { user: null, error: err.message };
  }
}

// Sign out user
async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Sign out error:", error.message);
      return { error: error.message };
    }

    console.log("User signed out successfully.");
    return { error: null };
  } catch (err) {
    console.error("Unexpected sign out error:", err);
    return { error: err.message };
  }
}

// Get current user data
async function getCurrentUserData(retryCount = 3) {
  try {
    console.log("Fetching current user data...");

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("Session error:", sessionError.message);
      return { userData: null, error: sessionError.message };
    }

    if (!sessionData || !sessionData.session || !sessionData.session.user) {
      return { userData: null, error: "No active session or user data" };
    }

    const userId = sessionData.session.user.id;
    console.log("Session found for user ID:", userId);

    // Try direct fetch first
    try {
      const apiUrl = `${SUPABASE_CONFIG.url}/rest/v1/users?id=eq.${userId}&select=*`;
      console.log("Fetching user data from:", apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_CONFIG.anonKey,
          'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
          'Prefer': 'return=representation'
        },
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error(`API response error: ${response.status} ${response.statusText}`);
      }
      
      const userData = await response.json();
      
      if (Array.isArray(userData) && userData.length > 0) {
        console.log("User data fetched successfully:", userData[0]);
        return { userData: userData[0], error: null };
      } else {
        console.error("User data not found in response:", userData);
        throw new Error("User data not found");
      }
    } catch (fetchError) {
      console.error("Error fetching user data with direct fetch:", fetchError);
      
      // Fall back to using Supabase client
      console.log("Falling back to Supabase client for user data");
    }

    // Use Supabase client as fallback
    const { data, error } = await supabase.from("users").select("*").eq("id", userId).single();

    if (error) {
      console.error("Error fetching user data:", error.message);

      // If user does not exist in DB, create a new entry
      if (error?.code === "PGRST116" && retryCount > 0) {
        console.log("User not found, creating a new user record...");

        const { error: insertError } = await supabase.from("users").insert({
          id: userId,
          email: sessionData.session.user.email,
          role: "farmer", // Default role
          profile_completed: false,
        });

        if (insertError) {
          console.error("Error creating user record:", insertError.message);
          return { userData: null, error: insertError.message };
        }

        console.log("User record created successfully. Retrying fetch...");
        return getCurrentUserData(retryCount - 1);
      }

      return { userData: null, error: error.message };
    }

    console.log("User data retrieved successfully:", data);
    return { userData: data, error: null };
  } catch (err) {
    console.error("Unexpected error in getCurrentUserData:", err);
    return { userData: null, error: err.message };
  }
}

// Check if user is authenticated
async function isAuthenticated() {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error("Auth check error:", error.message);
      return { authenticated: false, error: error.message };
    }

    return { authenticated: !!data.session, error: null };
  } catch (err) {
    console.error("Unexpected auth check error:", err);
    return { authenticated: false, error: err.message };
  }
}

// Refresh session
async function refreshSession() {
  try {
    const { error } = await supabase.auth.refreshSession();

    if (error) {
      console.error("Session refresh error:", error.message);
      return { success: false, error: error.message };
    }

    console.log("Session refreshed successfully.");
    return { success: true, error: null };
  } catch (err) {
    console.error("Unexpected session refresh error:", err);
    return { success: false, error: err.message };
  }
}

// Check authentication and redirect if needed
async function checkAuthAndRedirect() {
  const { authenticated, error } = await isAuthenticated();
  
  if (error) {
    console.error("Auth check error:", error);
  }
  
  const currentPath = window.location.pathname;
  
  // Pages that don't require authentication
  const publicPages = ['/login.html', '/register.html', '/index.html', '/', '/setup/diagnostics.html'];
  const isPublicPage = publicPages.some(page => currentPath.endsWith(page));
  
  if (!authenticated && !isPublicPage) {
    // Redirect to login if not authenticated and not on a public page
    window.location.href = '/login.html';
    return false;
  } else if (authenticated && isPublicPage && !currentPath.includes('/setup')) {
    // Redirect to dashboard if authenticated and on a public page (except setup pages)
    const { userData } = await getCurrentUserData();
    if (userData && userData.role) {
      window.location.href = `/dashboard.html?role=${userData.role}`;
      return false;
    }
  }
  
  return true;
}

// Validate Supabase URL format
function validateSupabaseUrl(url) {
  if (!url) {
    return { valid: false, message: "URL is empty" };
  }
  
  try {
    const urlObj = new URL(url);
    if (!urlObj.hostname.includes('supabase.co')) {
      return { valid: false, message: "URL does not appear to be a Supabase URL" };
    }
    return { valid: true, message: "" };
  } catch (error) {
    return { valid: false, message: "Invalid URL format" };
  }
}

// Test Supabase connection
async function testSupabaseConnection() {
  try {
    console.log("Testing connection to Supabase:", SUPABASE_CONFIG.url);
    
    // Simple health check
    const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_CONFIG.anonKey
      }
    });
    
    if (!response.ok) {
      return { 
        success: false, 
        message: `API response error: ${response.status} ${response.statusText}` 
      };
    }
    
    // Try to get the current session as another test
    const { error } = await supabase.auth.getSession();
    
    if (error) {
      return { 
        success: false, 
        message: `Session error: ${error.message}` 
      };
    }
    
    return { success: true, message: "Connection successful" };
  } catch (error) {
    console.error("Connection test error:", error);
    return { 
      success: false, 
      message: `Connection error: ${error.message}` 
    };
  }
}
