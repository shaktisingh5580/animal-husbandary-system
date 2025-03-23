import { Chart } from "@/components/ui/chart"
document.addEventListener("DOMContentLoaded", async () => {
  // Import necessary functions (replace with your actual import paths)
  // For example:
  // import { checkAuthAndRedirect, getCurrentUserData, signOut } from './auth.js';
  // Or, if these functions are defined in the same file or globally:
  async function checkAuthAndRedirect() {
    // Implement your authentication check and redirection logic here
    // Return true if authenticated, false otherwise
    return true // Placeholder - replace with actual logic
  }

  async function getCurrentUserData() {
    // Implement your user data fetching logic here
    // Return an object with userData and error properties
    return {
      userData: { first_name: "John", last_name: "Doe", email: "john.doe@example.com", role: "vet" },
      error: null,
    } // Placeholder - replace with actual logic
  }

  async function signOut() {
    // Implement your sign-out logic here
    // Return an object with an error property
    return { error: null } // Placeholder - replace with actual logic
  }

  // Elements
  const sidebar = document.getElementById("sidebar")
  const sidebarToggle = document.getElementById("sidebar-toggle")
  const sidebarClose = document.getElementById("sidebar-close")
  const navList = document.getElementById("nav-list")
  const userName = document.getElementById("user-name")
  const userRole = document.getElementById("user-role")
  const pageTitle = document.getElementById("page-title")
  const loadingIndicator = document.getElementById("loading-indicator")
  const dashboardContent = document.getElementById("dashboard-content")
  const logoutButton = document.getElementById("logout-button")

  // Check if authenticated
  const authCheck = await checkAuthAndRedirect()
  if (!authCheck) return

  // Get role from URL parameter
  const urlParams = new URLSearchParams(window.location.search)
  const role = urlParams.get("role")

  // Get current user data
  let userData = null
  try {
    const { userData: user, error } = await getCurrentUserData()
    if (error) {
      console.error("Error fetching user data:", error)
      showError("Failed to load user data. Please try again later.")
    } else if (!user) {
      console.error("No user data found")
      showError("User data not found. Please try logging in again.")
    } else {
      userData = user
      updateUserInfo(userData)
      loadDashboardContent(userData.role)
    }
  } catch (error) {
    console.error("Unexpected error:", error)
    showError("An unexpected error occurred. Please try again later.")
  }

  // Event listeners
  sidebarToggle.addEventListener("click", toggleSidebar)
  sidebarClose.addEventListener("click", closeSidebar)
  logoutButton.addEventListener("click", handleLogout)

  // Functions
  function toggleSidebar() {
    sidebar.classList.toggle("open")
  }

  function closeSidebar() {
    sidebar.classList.remove("open")
  }

  async function handleLogout() {
    try {
      const { error } = await signOut()
      if (error) {
        console.error("Logout error:", error)
        alert(`Error signing out: ${error}`)
      } else {
        window.location.href = "/login.html"
      }
    } catch (error) {
      console.error("Unexpected logout error:", error)
      alert(`Unexpected error: ${error.message}`)
    }
  }

  function updateUserInfo(user) {
    userName.textContent = user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.email

    userRole.textContent = formatRole(user.role)
  }

  function formatRole(role) {
    if (!role) return ""
    return role.charAt(0).toUpperCase() + role.slice(1)
  }

  function loadDashboardContent(role) {
    // Update navigation based on role
    updateNavigation(role)

    // Set page title
    pageTitle.textContent = `${formatRole(role)} Dashboard`

    // Show dashboard content based on role
    loadRoleSpecificContent(role)

    // Hide loading indicator and show content
    loadingIndicator.classList.add("hidden")
    dashboardContent.classList.remove("hidden")
  }

  function updateNavigation(role) {
    // Clear navigation
    navList.innerHTML = ""

    // Common navigation items
    const commonItems = [
      { label: "Dashboard", icon: "fa-tachometer-alt", url: `/dashboard.html?role=${role}` },
      { label: "Profile", icon: "fa-user", url: "/profile.html" },
      { label: "Chat", icon: "fa-comments", url: "/dashboard/chat.html" },
    ]

    // Role-specific navigation items
    let roleItems = []

    switch (role) {
      case "vet":
        roleItems = [
          { label: "Medicines", icon: "fa-pills", url: "/dashboard/vet/medicines.html" },
          { label: "Inventory", icon: "fa-boxes", url: "/dashboard/vet/inventory.html" },
          { label: "Distribution", icon: "fa-truck", url: "/dashboard/vet/distribution.html" },
          { label: "Requests", icon: "fa-clipboard-list", url: "/dashboard/vet/requests.html" },
          { label: "Settings", icon: "fa-cog", url: "/dashboard/vet/settings.html" },
        ]
        break
      case "farmer":
        roleItems = [
          { label: "Medicines", icon: "fa-pills", url: "/dashboard/farmer/medicines.html" },
          { label: "Requests", icon: "fa-clipboard-list", url: "/dashboard/farmer/requests.html" },
          { label: "Settings", icon: "fa-cog", url: "/dashboard/farmer/settings.html" },
        ]
        break
      case "official":
        roleItems = [
          { label: "Inventory", icon: "fa-boxes", url: "/dashboard/official/inventory.html" },
          { label: "Reports", icon: "fa-chart-bar", url: "/dashboard/official/reports.html" },
          { label: "Analytics", icon: "fa-chart-line", url: "/dashboard/official/analytics.html" },
          { label: "Settings", icon: "fa-cog", url: "/dashboard/official/settings.html" },
        ]
        break
    }

    // Combine and render navigation items
    const allItems = [...commonItems, ...roleItems]

    allItems.forEach((item) => {
      const li = document.createElement("li")
      li.className = "nav-item"

      const a = document.createElement("a")
      a.href = item.url
      a.className = "nav-link"
      if (window.location.pathname === item.url) {
        a.classList.add("active")
      }

      const icon = document.createElement("i")
      icon.className = `fas ${item.icon} nav-icon`

      const span = document.createElement("span")
      span.textContent = item.label

      a.appendChild(icon)
      a.appendChild(span)
      li.appendChild(a)
      navList.appendChild(li)
    })
  }

  function loadRoleSpecificContent(role) {
    // Create dashboard content based on role
    let content = ""

    switch (role) {
      case "vet":
        content = createVetDashboard()
        break
      case "farmer":
        content = createFarmerDashboard()
        break
      case "official":
        content = createOfficialDashboard()
        break
      default:
        content = `<div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle alert-icon"></i>
                    <div class="alert-content">
                      <h4 class="alert-title">Unknown Role</h4>
                      <p>Your user role (${role}) is not recognized. Please contact an administrator.</p>
                    </div>
                  </div>`
    }

    dashboardContent.innerHTML = content
  }

  function createVetDashboard() {
    return `
      <h2 class="section-title">Overview</h2>
      
      <div class="dashboard-grid">
        <div class="stat-card">
          <div class="stat-title">Total Medicines</div>
          <div class="stat-value">24</div>
          <div class="stat-change positive">
            <i class="fas fa-arrow-up"></i>
            <span>3 new this month</span>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-title">Inventory Items</div>
          <div class="stat-value">156</div>
          <div class="stat-change negative">
            <i class="fas fa-arrow-down"></i>
            <span>12 less than last month</span>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-title">Pending Requests</div>
          <div class="stat-value">7</div>
          <div class="stat-change">
            <span>Updated 2 hours ago</span>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-title">Distributions</div>
          <div class="stat-value">18</div>
          <div class="stat-change positive">
            <i class="fas fa-arrow-up"></i>
            <span>5 more than last month</span>
          </div>
        </div>
      </div>
      
      <h2 class="section-title">Recent Requests</h2>
      
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Farmer</th>
              <th>Medicine</th>
              <th>Quantity</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>#REQ-001</td>
              <td>John Doe</td>
              <td>Antibiotic X</td>
              <td>5 units</td>
              <td><span class="badge badge-warning">Pending</span></td>
              <td>
                <div class="table-actions">
                  <button class="btn btn-sm btn-primary">Approve</button>
                  <button class="btn btn-sm btn-outline">Reject</button>
                </div>
              </td>
            </tr>
            <tr>
              <td>#REQ-002</td>
              <td>Jane Smith</td>
              <td>Vaccine Y</td>
              <td>10 units</td>
              <td><span class="badge badge-warning">Pending</span></td>
              <td>
                <div class="table-actions">
                  <button class="btn btn-sm btn-primary">Approve</button>
                  <button class="btn btn-sm btn-outline">Reject</button>
                </div>
              </td>
            </tr>
            <tr>
              <td>#REQ-003</td>
              <td>Robert Johnson</td>
              <td>Supplement Z</td>
              <td>3 units</td>
              <td><span class="badge badge-warning">Pending</span></td>
              <td>
                <div class="table-actions">
                  <button class="btn btn-sm btn-primary">Approve</button>
                  <button class="btn btn-sm btn-outline">Reject</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="action-buttons">
        <a href="/dashboard/vet/requests.html" class="btn btn-primary">
          <i class="fas fa-clipboard-list"></i>
          View All Requests
        </a>
        <a href="/dashboard/vet/add-medicine.html" class="btn btn-secondary">
          <i class="fas fa-plus"></i>
          Add New Medicine
        </a>
      </div>
    `
  }

  function createFarmerDashboard() {
    return `
      <h2 class="section-title">Overview</h2>
      
      <div class="dashboard-grid">
        <div class="stat-card">
          <div class="stat-title">Available Medicines</div>
          <div class="stat-value">18</div>
          <div class="stat-change positive">
            <i class="fas fa-arrow-up"></i>
            <span>2 new this month</span>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-title">My Requests</div>
          <div class="stat-value">3</div>
          <div class="stat-change">
            <span>1 pending approval</span>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-title">Approved Requests</div>
          <div class="stat-value">12</div>
          <div class="stat-change positive">
            <i class="fas fa-arrow-up"></i>
            <span>4 more than last month</span>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-title">Rejected Requests</div>
          <div class="stat-value">2</div>
          <div class="stat-change negative">
            <i class="fas fa-arrow-down"></i>
            <span>1 less than last month</span>
          </div>
        </div>
      </div>
      
      <h2 class="section-title">Recent Medicines</h2>
      
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Available Quantity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Antibiotic X</td>
              <td>Antibiotics</td>
              <td>25 units</td>
              <td>
                <div class="table-actions">
                  <button class="btn btn-sm btn-primary">Request</button>
                  <button class="btn btn-sm btn-outline">Details</button>
                </div>
              </td>
            </tr>
            <tr>
              <td>Vaccine Y</td>
              <td>Vaccines</td>
              <td>50 units</td>
              <td>
                <div class="table-actions">
                  <button class="btn btn-sm btn-primary">Request</button>
                  <button class="btn btn-sm btn-outline">Details</button>
                </div>
              </td>
            </tr>
            <tr>
              <td>Supplement Z</td>
              <td>Supplements</td>
              <td>30 units</td>
              <td>
                <div class="table-actions">
                  <button class="btn btn-sm btn-primary">Request</button>
                  <button class="btn btn-sm btn-outline">Details</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="action-buttons">
        <a href="/dashboard/farmer/medicines.html" class="btn btn-primary">
          <i class="fas fa-pills"></i>
          View All Medicines
        </a>
        <a href="/dashboard/farmer/requests.html" class="btn btn-secondary">
          <i class="fas fa-clipboard-list"></i>
          My Requests
        </a>
      </div>
    `
  }

  function createOfficialDashboard() {
    return `
      <h2 class="section-title">Overview</h2>
      
      <div class="dashboard-grid">
        <div class="stat-card">
          <div class="stat-title">Total Medicines</div>
          <div class="stat-value">32</div>
          <div class="stat-change positive">
            <i class="fas fa-arrow-up"></i>
            <span>5 new this month</span>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-title">Total Inventory</div>
          <div class="stat-value">245</div>
          <div class="stat-change positive">
            <i class="fas fa-arrow-up"></i>
            <span>20 more than last month</span>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-title">Active Veterinarians</div>
          <div class="stat-value">8</div>
          <div class="stat-change">
            <span>No change</span>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-title">Registered Farmers</div>
          <div class="stat-value">42</div>
          <div class="stat-change positive">
            <i class="fas fa-arrow-up"></i>
            <span>3 new this month</span>
          </div>
        </div>
      </div>
      
      <h2 class="section-title">Inventory Status</h2>
      
      <div class="chart-container">
        <canvas id="inventoryChart" width="400" height="200"></canvas>
      </div>
      
      <h2 class="section-title">Recent Reports</h2>
      
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Report ID</th>
              <th>Title</th>
              <th>Generated By</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>#RPT-001</td>
              <td>Monthly Inventory Report</td>
              <td>System</td>
              <td>2023-06-01</td>
              <td>
                <div class="table-actions">
                  <button class="btn btn-sm btn-primary">View</button>
                  <button class="btn btn-sm btn-outline">Download</button>
                </div>
              </td>
            </tr>
            <tr>
              <td>#RPT-002</td>
              <td>Medicine Distribution Analysis</td>
              <td>Dr. Smith</td>
              <td>2023-05-28</td>
              <td>
                <div class="table-actions">
                  <button class="btn btn-sm btn-primary">View</button>
                  <button class="btn btn-sm btn-outline">Download</button>
                </div>
              </td>
            </tr>
            <tr>
              <td>#RPT-003</td>
              <td>Quarterly Usage Statistics</td>
              <td>System</td>
              <td>2023-05-15</td>
              <td>
                <div class="table-actions">
                  <button class="btn btn-sm btn-primary">View</button>
                  <button class="btn btn-sm btn-outline">Download</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="action-buttons">
        <a href="/dashboard/official/reports.html" class="btn btn-primary">
          <i class="fas fa-chart-bar"></i>
          View All Reports
        </a>
        <a href="/dashboard/official/analytics.html" class="btn btn-secondary">
          <i class="fas fa-chart-line"></i>
          Analytics Dashboard
        </a>
      </div>
    `
  }

  function showError(message) {
    loadingIndicator.classList.add("hidden")

    const errorHtml = `
      <div class="alert alert-danger">
        <i class="fas fa-exclamation-triangle alert-icon"></i>
        <div class="alert-content">
          <h4 class="alert-title">Error</h4>
          <p>${message}</p>
          <div class="alert-actions">
            <button onclick="window.location.reload()" class="btn btn-sm btn-primary">
              <i class="fas fa-sync-alt"></i>
              Retry
            </button>
            <a href="/login.html" class="btn btn-sm btn-outline">
              <i class="fas fa-sign-in-alt"></i>
              Back to Login
            </a>
          </div>
        </div>
      </div>
    `

    dashboardContent.innerHTML = errorHtml
    dashboardContent.classList.remove("hidden")
  }

  // Initialize charts if official dashboard is loaded
  if (userData && userData.role === "official") {
    setTimeout(() => {
      initializeCharts()
    }, 100)
  }

  function initializeCharts() {
    const ctx = document.getElementById("inventoryChart")
    if (!ctx) return

    new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Antibiotics", "Vaccines", "Supplements", "Vitamins", "Painkillers", "Others"],
        datasets: [
          {
            label: "Current Stock",
            data: [65, 120, 80, 45, 30, 25],
            backgroundColor: "rgba(59, 130, 246, 0.5)",
            borderColor: "rgba(59, 130, 246, 1)",
            borderWidth: 1,
          },
          {
            label: "Minimum Required",
            data: [40, 80, 60, 30, 20, 15],
            backgroundColor: "rgba(239, 68, 68, 0.5)",
            borderColor: "rgba(239, 68, 68, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    })
  }
})

