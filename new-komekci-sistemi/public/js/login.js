document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const errorMessage = document.getElementById('errorMessage');

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        // ✅ Role-based redirect
        switch (data.user.role) {
          case 'user':
            window.location.href = '/user-home';
            break;
          case 'manager':
            window.location.href = '/manager-home';
            break;
          case 'technician':
            window.location.href = '/technician-home';
            break;
          default:
            window.location.href = '/home';
        }
      } else {
        errorMessage.textContent = data.message || 'Login failed';
      }
    } catch (error) {
      console.error(error);
      errorMessage.textContent = 'An error occurred. Try again.';
    }
  });
});
