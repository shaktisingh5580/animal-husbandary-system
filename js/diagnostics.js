document.addEventListener("DOMContentLoaded", () => {
  // Mock SUPABASE_CONFIG for demonstration.  In a real application,
  // this would be loaded from a configuration file or environment variables.
  const SUPABASE_CONFIG = {
    url: "https://your-supabase-url.supabase.co",
    anonKey: "your-supabase-anon-key",
    serviceRoleKey: "your-supabase-service-role-key",
  }

  // Mock validateSupabaseUrl for demonstration.
  function validateSupabaseUrl(url) {
    if (!url) {
      return { valid: false, message: "URL is required." }
    }
    try {
      new URL(url)
      return { valid: true, message: "URL is valid." }
    } catch (error) {
      return { valid: false, message: "Invalid URL format." }
    }
  }

  // Mock testSupabaseConnection for demonstration.
  async function testSupabaseConnection() {
    try {
      const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/`, {
        method: "GET",
        headers: {
          apikey: SUPABASE_CONFIG.anonKey || "",
        },
        cache: "no-store",
      })

      if (response.ok) {
        return { success: true, message: "Successfully connected to Supabase." }
      } else {
        return { success: false, message: `Connection failed with status: ${response.status} ${response.statusText}` }
      }
    } catch (error) {
      return { success: false, message: `Connection error: ${error.message}` }
    }
  }

  // Elements
  const runDiagnosticsButton = document.getElementById("run-diagnostics")
  const diagnosticsText = document.getElementById("diagnostics-text")
  const diagnosticsLoading = document.getElementById("diagnostics-loading")
  const overallStatus = document.getElementById("overall-status")
  const statusIcon = document.getElementById("status-icon")
  const statusTitle = document.getElementById("status-title")
  const statusMessage = document.getElementById("status-message")
  const envStatus = document.getElementById("env-status")
  const envResults = document.getElementById("env-results")
  const urlStatus = document.getElementById("url-status")
  const urlResults = document.getElementById("url-results")
  const connectionStatus = document.getElementById("connection-status")
  const connectionResults = document.getElementById("connection-results")
  const manualTestUrl = document.getElementById("manual-test-url")
  const manualTestButton = document.getElementById("manual-test-button")
  const manualTestText = document.getElementById("manual-test-text")
  const manualTestLoading = document.getElementById("manual-test-loading")
  const manualTestResults = document.getElementById("manual-test-results")

  // Set initial manual test URL
  manualTestUrl.value = `${SUPABASE_CONFIG.url}/rest/v1/`

  // Run diagnostics on page load
  runDiagnostics()

  // Event listeners
  runDiagnosticsButton.addEventListener("click", runDiagnostics)
  manualTestButton.addEventListener("click", runManualTest)

  // Function to run diagnostics
  async function runDiagnostics() {
    setDiagnosticsLoading(true)
    resetResults()

    try {
      // Check configuration
      const configCheck = checkConfiguration()
      updateEnvResults(configCheck)

      // Validate Supabase URL format
      const urlValidation = validateSupabaseUrl(SUPABASE_CONFIG.url || "")
      updateUrlResults(urlValidation)

      // Test connection to Supabase
      const connectionTest = await testSupabaseConnection()
      updateConnectionResults(connectionTest)

      // Determine overall status
      const hasErrors = !configCheck.success || !urlValidation.valid || !connectionTest.success
      const hasWarnings = configCheck.warnings && configCheck.warnings.length > 0

      if (hasErrors) {
        updateOverallStatus(
          "error",
          "System configuration issues detected",
          "There are issues with your system configuration that need to be addressed.",
        )
      } else if (hasWarnings) {
        updateOverallStatus(
          "warning",
          "System operational with warnings",
          "Your system is working but some recommended configurations are missing.",
        )
      } else {
        updateOverallStatus(
          "success",
          "All systems operational",
          "Your system is properly configured and connected to Supabase.",
        )
      }
    } catch (error) {
      console.error("Diagnostics error:", error)
      updateOverallStatus("error", "Error running diagnostics", error.message)
    } finally {
      setDiagnosticsLoading(false)
    }
  }

  // Function to run manual connection test
  async function runManualTest() {
    if (!manualTestUrl.value) return

    setManualTestLoading(true)
    manualTestResults.innerHTML = ""
    manualTestResults.classList.add("hidden")

    try {
      console.log("Running manual test to:", manualTestUrl.value)

      const response = await fetch(manualTestUrl.value, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_CONFIG.anonKey || "",
        },
        cache: "no-store",
      })

      let responseData
      try {
        responseData = await response.json()
      } catch (e) {
        responseData = await response.text()
      }

      const result = {
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries([...response.headers.entries()]),
        data: responseData,
      }

      displayManualTestResults(result)
    } catch (error) {
      console.error("Manual test error:", error)
      displayManualTestResults({
        success: false,
        error: error.message,
        stack: error.stack,
      })
    } finally {
      setManualTestLoading(false)
    }
  }

  // Helper functions
  function checkConfiguration() {
    // Check if Supabase configuration is set
    const hasUrl = !!SUPABASE_CONFIG.url
    const hasAnonKey = !!SUPABASE_CONFIG.anonKey
    const hasServiceRoleKey = !!SUPABASE_CONFIG.serviceRoleKey

    const missing = []
    if (!hasUrl) missing.push("SUPABASE_URL")
    if (!hasAnonKey) missing.push("SUPABASE_ANON_KEY")

    const warnings = []
    if (!hasServiceRoleKey) warnings.push("SUPABASE_SERVICE_ROLE_KEY")

    return {
      success: hasUrl && hasAnonKey,
      missing,
      warnings,
      present: {
        required: [hasUrl ? "SUPABASE_URL" : null, hasAnonKey ? "SUPABASE_ANON_KEY" : null].filter(Boolean),
        recommended: [hasServiceRoleKey ? "SUPABASE_SERVICE_ROLE_KEY" : null].filter(Boolean),
      },
    }
  }

  function resetResults() {
    overallStatus.classList.add("hidden")

    envStatus.innerHTML = ""
    envResults.innerHTML = '<p class="text-muted">Checking configuration...</p>'

    urlStatus.innerHTML = ""
    urlResults.innerHTML = '<p class="text-muted">Validating Supabase URL...</p>'

    connectionStatus.innerHTML = ""
    connectionResults.innerHTML = '<p class="text-muted">Testing connection to Supabase...</p>'
  }

  function updateOverallStatus(type, title, message) {
    statusIcon.className = "alert-icon"
    overallStatus.className = "alert"

    if (type === "success") {
      statusIcon.className += " fas fa-check-circle status-success"
      overallStatus.classList.add("alert-success")
    } else if (type === "warning") {
      statusIcon.className += " fas fa-exclamation-triangle status-warning"
      overallStatus.classList.add("alert-warning")
    } else if (type === "error") {
      statusIcon.className += " fas fa-times-circle status-error"
      overallStatus.classList.add("alert-danger")
    }

    statusTitle.textContent = title
    statusMessage.textContent = message
    overallStatus.classList.remove("hidden")
  }

  function updateEnvResults(results) {
    if (results.success) {
      envStatus.innerHTML = '<i class="fas fa-check-circle status-success"></i>'
      envResults.innerHTML = `
        <div class="alert alert-success">
          <div class="alert-content">
            <h4 class="alert-title">Configuration Verified</h4>
            <p>All required configuration is present.</p>
          </div>
        </div>
      `
    } else {
      envStatus.innerHTML = '<i class="fas fa-times-circle status-error"></i>'

      let html = ""

      if (results.missing && results.missing.length > 0) {
        html += `
          <div class="alert alert-danger">
            <div class="alert-content">
              <h4 class="alert-title">Missing Required Configuration</h4>
              <ul class="bullet-list">
                ${results.missing.map((name) => `<li>${name}</li>`).join("")}
              </ul>
            </div>
          </div>
        `
      }

      if (results.warnings && results.warnings.length > 0) {
        html += `
          <div class="alert alert-warning">
            <div class="alert-content">
              <h4 class="alert-title">Missing Recommended Configuration</h4>
              <ul class="bullet-list">
                ${results.warnings.map((name) => `<li>${name}</li>`).join("")}
              </ul>
            </div>
          </div>
        `
      }

      envResults.innerHTML = html
    }
  }

  function updateUrlResults(results) {
    if (results.valid) {
      urlStatus.innerHTML = '<i class="fas fa-check-circle status-success"></i>'
      urlResults.innerHTML = `
        <div class="alert alert-success">
          <div class="alert-content">
            <h4 class="alert-title">Valid Supabase URL</h4>
            <p>${SUPABASE_CONFIG.url}</p>
            <p class="mt-1">${results.message}</p>
          </div>
        </div>
      `
    } else {
      urlStatus.innerHTML = '<i class="fas fa-times-circle status-error"></i>'
      urlResults.innerHTML = `
        <div class="alert alert-danger">
          <div class="alert-content">
            <h4 class="alert-title">Invalid Supabase URL</h4>
            <p>${results.message}</p>
            ${SUPABASE_CONFIG.url ? `<p class="mt-1">Current URL: ${SUPABASE_CONFIG.url}</p>` : ""}
          </div>
        </div>
      `
    }
  }

  function updateConnectionResults(results) {
    if (results.success) {
      connectionStatus.innerHTML = '<i class="fas fa-check-circle status-success"></i>'
      connectionResults.innerHTML = `
        <div class="alert alert-success">
          <div class="alert-content">
            <h4 class="alert-title">Connection Successful</h4>
            <p>${results.message}</p>
          </div>
        </div>
      `
    } else {
      connectionStatus.innerHTML = '<i class="fas fa-times-circle status-error"></i>'

      const troubleshootingHtml = `
        <div class="mt-2 p-2 bg-muted rounded-md">
          <p class="font-medium">Troubleshooting Steps</p>
          <ul class="bullet-list">
            <li>Check if your Supabase project is active and not paused</li>
            <li>Verify that your API keys are correct</li>
            <li>Check if your browser is blocking the connection</li>
            <li>Try accessing your Supabase project directly in a new tab</li>
            <li>Check if your network allows connections to Supabase</li>
          </ul>
        </div>
      `

      connectionResults.innerHTML = `
        <div class="alert alert-danger">
          <div class="alert-content">
            <h4 class="alert-title">Connection Failed</h4>
            <p>${results.message}</p>
            ${troubleshootingHtml}
          </div>
        </div>
      `
    }
  }

  function displayManualTestResults(result) {
    let html = `
      <div class="flex items-center mb-2">
        <span class="font-medium mr-2">Result:</span>
        ${
          result.success
            ? '<span class="text-success flex items-center"><i class="fas fa-check-circle mr-1"></i> Success</span>'
            : '<span class="text-danger flex items-center"><i class="fas fa-times-circle mr-1"></i> Failed</span>'
        }
      </div>
    `

    if (result.status) {
      html += `
        <div class="mb-1">
          <span class="font-medium">Status:</span> ${result.status} ${result.statusText}
        </div>
      `
    }

    if (result.error) {
      html += `
        <div class="mb-1 text-danger">
          <span class="font-medium">Error:</span> ${result.error}
        </div>
      `
    }

    html += `
      <details class="mt-2">
        <summary class="cursor-pointer font-medium">Response Details</summary>
        <pre class="mt-2 p-2 bg-gray-100 rounded-md overflow-x-auto max-h-40">${JSON.stringify(result, null, 2)}</pre>
      </details>
    `

    manualTestResults.innerHTML = html
    manualTestResults.classList.remove("hidden")
  }

  function setDiagnosticsLoading(isLoading) {
    if (isLoading) {
      runDiagnosticsButton.disabled = true
      diagnosticsText.classList.add("hidden")
      diagnosticsLoading.classList.remove("hidden")
    } else {
      runDiagnosticsButton.disabled = false
      diagnosticsText.classList.remove("hidden")
      diagnosticsLoading.classList.add("hidden")
    }
  }

  function setManualTestLoading(isLoading) {
    if (isLoading) {
      manualTestButton.disabled = true
      manualTestText.classList.add("hidden")
      manualTestLoading.classList.remove("hidden")
    } else {
      manualTestButton.disabled = false
      manualTestText.classList.remove("hidden")
      manualTestLoading.classList.add("hidden")
    }
  }
})

