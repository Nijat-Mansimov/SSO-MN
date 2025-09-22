const BASE_URL = "http://localhost:3000/api"

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
            const response = await fetch(BASE_URL + endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

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