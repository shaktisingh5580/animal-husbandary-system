import { checkAuthAndRedirect } from "./auth.js"

document.addEventListener("DOMContentLoaded", () => {
  // Check if user is logged in
  checkAuthAndRedirect()

  // Add event listeners for any interactive elements on the home page
  const ctaButtons = document.querySelectorAll(".cta-buttons .btn")
  ctaButtons.forEach((button) => {
    button.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-2px)"
    })

    button.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0)"
    })
  })

  // Feature cards hover effect is already handled by CSS

  // Add any additional home page functionality here
})

