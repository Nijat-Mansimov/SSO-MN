document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const errorMessage = document.getElementById("errorMessage");
  const toggle = document.getElementById("darkModeToggle");
  const body = document.body;

  // Restore theme from localStorage
  const currentTheme = localStorage.getItem("theme");
  if (currentTheme === "dark") {
    body.classList.add("dark-mode");
    toggle.checked = true;
  }

  // Toggle Dark Mode
  toggle.addEventListener("change", () => {
    if (toggle.checked) {
      body.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
    } else {
      body.classList.remove("dark-mode");
      localStorage.setItem("theme", "light");
    }
  });

  // Handle Login Form
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Role-based redirect
        switch (data.user.role) {
          case "user":
            window.location.href = "/user-home";
            break;
          case "admin":
            window.location.href = "/admin-home";
            break;
          case "manager":
            window.location.href = "/manager-home";
            break;
          case "technician":
            window.location.href = "/technician-home";
            break;
          default:
            window.location.href = "/home";
        }
      } else {
        errorMessage.textContent = data.message || "Login failed";
      }
    } catch (error) {
      console.error(error);
      errorMessage.textContent = "An error occurred. Try again.";
    }
  });
});
