// const BASE_URL = "http://172.22.61.7:3000/api"

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const ldapLoginCheckbox = document.getElementById('ldapLogin'); // Get the new checkbox

    // Load saved theme preference from local storage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        body.classList.remove('light-mode', 'dark-mode');
        body.classList.add(savedTheme);
        if (savedTheme === 'dark-mode') {
            themeToggle.checked = true;
        }
    }

    // Toggle theme on button click
    themeToggle.addEventListener('change', () => {
        if (themeToggle.checked) {
            body.classList.remove('light-mode');
            body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark-mode');
        } else {
            body.classList.remove('dark-mode');
            body.classList.add('light-mode');
            localStorage.setItem('theme', 'light-mode');
        }
    });

    // Form submission logic with login request
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        const useLdap = ldapLoginCheckbox.checked; // Get the state of the LDAP checkbox

        if (!username || !password) {
            alert('Please enter both username and password.');
            return;
        }

        // Determine the correct API endpoint based on the checkbox
        const endpoint = useLdap ? '/auth/ldap-login' : '/auth/login';
        
        try {
            console.log(KOMEKCI_SISTEMI_API)
            const response = await fetch(KOMEKCI_SISTEMI_API + endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
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
            if (!response.ok) {
                alert(data.error || 'Login failed.');
                return;
            }

            // Login successful
            alert('Login successful! Welcome, ' + data.user.username);

            // Optionally redirect user
            window.location.href = '/'; // change as needed

        } catch (err) {
            console.error('Login request failed:', err);
            alert('An error occurred. Please try again.');
        }
    });
});
