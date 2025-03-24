// register.js
document.addEventListener('DOMContentLoaded', async function() {
  // Elements
  const registerForm = document.getElementById('register-form');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirm-password');
  const roleSelect = document.getElementById('role');
  const registerButton = document.getElementById('register-button');
  const registerText = document.getElementById('register-text');
  const registerLoading = document.getElementById('register-loading');
  const errorAlert = document.getElementById('error-alert');
  const errorMessage = document.getElementById('error-message');
  const connectionAlert = document.getElementById('connection-alert');
  const connectionMessage = document.getElementById('connection-message');
  const retryConnectionButton = document.getElementById('retry-connection');

  console.log("Register page loaded, checking auth status...");

  // Check if already logged in
  const authCheck = await checkAuthAndRedirect();
  if (!authCheck) {
    console.log("User is already authenticated, redirecting...");
    return;
  }

  console.log("User is not authenticated, proceeding with registration page");

  // Check connection to Supabase
  await checkConnection();

  // Event listeners
  registerForm.addEventListener('submit', handleRegister);
  retryConnectionButton.addEventListener('click', checkConnection);

  // Function to check connection
  async function checkConnection() {
    try {
      setRetryLoading(true);
      
      // First, validate the Supabase URL format
      const urlValidation = validateSupabaseUrl(SUPABASE_CONFIG.url);
      
      if (!urlValidation.valid) {
        showConnectionError(`Invalid Supabase URL: ${urlValidation.message}`);
        return;
      }
      
      // Test the actual connection
      const connectionTest = await testSupabaseConnection();
      console.log("Connection test result:", connectionTest);
      
      if (!connectionTest.success) {
        showConnectionError(`Connection error: ${connectionTest.message}`);
      } else {
        hideConnectionError();
      }
    } catch (error) {
      console.error("Connection check error:", error);
      showConnectionError(`Unexpected error: ${error.message}`);
    } finally {
      setRetryLoading(false);
    }
  }

  // Function to handle registration
  async function handleRegister(e) {
    e.preventDefault();
    
    // Get form values
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const role = roleSelect.value;
    
    // Validate inputs
    if (!email || !password || !confirmPassword || !role) {
      showError("Please fill in all fields");
      return;
    }
    
    if (password !== confirmPassword) {
      showError("Passwords do not match");
      return;
    }
    
    if (password.length < 8) {
      showError("Password must be at least 8 characters long");
      return;
    }
    
    // Check if connection is available
    if (connectionAlert.classList.contains('hidden') === false) {
      showError("Cannot register: Database connection issue");
      return;
    }
    
    // Start loading state
    setLoading(true);
    hideError();
    
    try {
      console.log("Starting registration process for:", email);
      
      // Set timeout for registration request
      const registerPromise = registerUser(email, password, role);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Registration request timed out")), 15000)
      );
      
      const { user, error } = await Promise.race([registerPromise, timeoutPromise]);
      
      if (error) {
        console.error("Registration returned error:", error);
        showError(error);
        return;
      }
      
      if (user) {
        console.log("Registration successful for user:", user.email);
        // Show success message and redirect to login
        alert("Registration successful! Please login with your credentials.");
        window.location.href = '/login.html';
      } else {
        console.error("Registration failed: No user returned and no error");
        showError("Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      
      // Provide more helpful error messages based on the error type
      if (err.message.includes("timeout")) {
        showError("Registration request timed out. The server might be slow or unreachable.");
      } else if (!navigator.onLine) {
        showError("You appear to be offline. Please check your internet connection.");
      } else if (err.message.includes("fetch")) {
        showError("Network error. Unable to connect to the authentication service.");
      } else {
        showError(`Registration failed: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  }

  // Helper functions
  function setLoading(isLoading) {
    if (isLoading) {
      registerButton.disabled = true;
      registerText.classList.add('hidden');
      registerLoading.classList.remove('hidden');
    } else {
      registerButton.disabled = false;
      registerText.classList.remove('hidden');
      registerLoading.classList.add('hidden');
    }
  }
  
  function setRetryLoading(isLoading) {
    if (isLoading) {
      retryConnectionButton.disabled = true;
      retryConnectionButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';
    } else {
      retryConnectionButton.disabled = false;
      retryConnectionButton.innerHTML = '<i class="fas fa-sync-alt"></i> Retry Connection';
    }
  }
  
  function showError(message) {
    errorMessage.textContent = message;
    errorAlert.classList.remove('hidden');
  }
  
  function hideError() {
    errorAlert.classList.add('hidden');
  }
  
  function showConnectionError(message) {
    connectionMessage.textContent = message;
    connectionAlert.classList.remove('hidden');
    registerButton.disabled = true;
  }
  
  function hideConnectionError() {
    connectionAlert.classList.add('hidden');
    registerButton.disabled = false;
  }
});
