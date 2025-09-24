document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const ldapLoginCheckbox = document.getElementById('ldapLogin');

    // Tema seçimlərini localStorage-dan yüklə
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        body.classList.remove('light-mode', 'dark-mode');
        body.classList.add(savedTheme);
        themeToggle.checked = savedTheme === 'dark-mode';
    }

    // Tema toggle
    themeToggle.addEventListener('change', () => {
        const newTheme = themeToggle.checked ? 'dark-mode' : 'light-mode';
        body.classList.remove('light-mode', 'dark-mode');
        body.classList.add(newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // Login form submit
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        const useLdap = ldapLoginCheckbox.checked;

        if (!username || !password) {
            alert('Please enter both username and password.');
            return;
        }

        // Endpoint seçimi
        const endpoint = useLdap ? '/auth/ldap-login' : '/auth/login';
        const KOMEKCI_SISTEMI_API2 = KOMEKCI_SISTEMI_API || "http://portal.mnbq.local:4000/api"
        try {
            const response = await fetch(KOMEKCI_SISTEMI_API2 + endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.error || 'Login failed.');
                return;
            }

            // Login uğurlu oldu, roluna görə yönləndir
            const role = data.user.role;
            switch (role) {
                case 'admin':
                    window.location.href = '/admin-home';
                    break;
                case 'manager':
                    window.location.href = '/manager-home';
                    break;
                case 'technician':
                    window.location.href = '/technician-home';
                    break;
                case 'user':
                default:
                    window.location.href = '/user-home';
            }

        } catch (err) {
            console.error('Login request failed:', err);
            alert('An error occurred. Please try again.');
        }
    });
});
