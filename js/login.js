document.addEventListener("DOMContentLoaded", async () => {
  // Elements
  const loginForm = document.getElementById("login-form")
  const emailInput = document.getElementById("email")
  const passwordInput = document.getElementById("password")
  const loginButton = document.getElementById("login-button")
  const loginText = document.getElementById("login-text")
  const loginLoading = document.getElementById("login-loading")
  const errorAlert = document.getElementById("error-alert")
  const errorMessage = document.getElementById("error-message")
  const connectionAlert = document.getElementById("connection-alert")
  const connectionMessage = document.getElementById("connection-message")
  const retryConnectionButton = document.getElementById("retry-connection")

  // Mock functions and variables (replace with actual implementations)
  async function checkAuthAndRedirect() {
    // Replace with actual authentication check and redirect logic
    return true // Or false, depending on the authentication status
  }

  function validateSupabaseUrl(url) {
    // Replace with actual Supabase URL validation logic
    return { valid: true, message: "" }
  }

  const SUPABASE_CONFIG = {
    url: "https://your-supabase-url.com", // Replace with your Supabase URL
    apikey: "your-supabase-apikey", // Replace with your Supabase API key
  }

  async function testSupabaseConnection() {
    // Replace with actual Supabase connection test logic
    return { success: true, message: "" }
  }

  async function loginUser(email, password) {
    // Replace with actual login logic using Supabase or your authentication system
    return { user: { email: email }, error: null, role: "admin" }
  }

  // Check if already logged in
  const authCheck = await checkAuthAndRedirect()
  if (!authCheck) return

  // Check connection to Supabase
  checkConnection()

  // Event listeners
  loginForm.addEventListener("submit", handleLogin)
  retryConnectionButton.addEventListener("click", checkConnection)

  // Function to check connection
  async function checkConnection() {
    try {
      setRetryLoading(true)

      // First, validate the Supabase URL format
      const urlValidation = validateSupabaseUrl(SUPABASE_CONFIG.url)

      if (!urlValidation.valid) {
        showConnectionError(`Invalid Supabase URL: ${urlValidation.message}`)
        return
      }

      // Test the actual connection
      const connectionTest = await testSupabaseConnection()
      console.log("Connection test result:", connectionTest)

      if (!connectionTest.success) {
        showConnectionError(`Connection error: ${connectionTest.message}`)
      } else {
        hideConnectionError()
      }
    } catch (error) {
      console.error("Connection check error:", error)
      showConnectionError(`Unexpected error: ${error.message}`)
    } finally {
      setRetryLoading(false)
    }
  }

  // Function to handle login
  async function handleLogin(e) {
    e.preventDefault()

    // Get form values
    const email = emailInput.value.trim()
    const password = passwordInput.value

    // Validate inputs
    if (!email || !password) {
      showError("Please enter both email and password")
      return
    }

    // Check if connection is available
    if (connectionAlert.classList.contains("hidden") === false) {
      showError("Cannot login: Database connection issue")
      return
    }

    // Start loading state
    setLoading(true)
    hideError()

    try {
      // Set timeout for login request
      const loginPromise = loginUser(email, password)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Login request timed out")), 15000),
      )

      const { user, error, role } = await Promise.race([loginPromise, timeoutPromise])

      if (error) {
        showError(error)
        return
      }

      if (user) {
        // Redirect based on user role
        if (role) {
          redirectToDashboard(role)
        } else {
          // Default redirect if role is not available
          window.location.href = "/dashboard.html"
        }
      } else {
        showError("Login failed. Please try again.")
      }
    } catch (err) {
      console.error("Login error:", err)

      // Provide more helpful error messages based on the error type
      if (err.message.includes("timeout")) {
        showError("Login request timed out. The server might be slow or unreachable.")
      } else if (!navigator.onLine) {
        showError("You appear to be offline. Please check your internet connection.")
      } else if (err.message.includes("fetch")) {
        showError("Network error. Unable to connect to the authentication service.")
      } else {
        showError(`Login failed: ${err.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  // Function to redirect to appropriate dashboard based on role
  function redirectToDashboard(role) {
    window.location.href = `/dashboard.html?role=${role}`
  }

  // Helper functions
  function setLoading(isLoading) {
    if (isLoading) {
      loginButton.disabled = true
      loginText.classList.add("hidden")
      loginLoading.classList.remove("hidden")
    } else {
      loginButton.disabled = false
      loginText.classList.remove("hidden")
      loginLoading.classList.add("hidden")
    }
  }

  function setRetryLoading(isLoading) {
    if (isLoading) {
      retryConnectionButton.disabled = true
      retryConnectionButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...'
    } else {
      retryConnectionButton.disabled = false
      retryConnectionButton.innerHTML = '<i class="fas fa-sync-alt"></i> Retry Connection'
    }
  }

  function showError(message) {
    errorMessage.textContent = message
    errorAlert.classList.remove("hidden")
  }

  function hideError() {
    errorAlert.classList.add("hidden")
  }

  function showConnectionError(message) {
    connectionMessage.textContent = message
    connectionAlert.classList.remove("hidden")
    loginButton.disabled = true
  }

  function hideConnectionError() {
    connectionAlert.classList.add("hidden")
    loginButton.disabled = false
  }
})

