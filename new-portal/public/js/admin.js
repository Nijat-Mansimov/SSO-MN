document.addEventListener('DOMContentLoaded', () => {
    const usernamePlaceholder = document.getElementById('usernamePlaceholder');
    const tbody = document.getElementById('usersTableBody');
    const createUserForm = document.getElementById('createUserForm');
    const updateModal = document.getElementById('updateModal');
    const closeModalBtn = document.querySelector('.close-btn');
    const updateUserForm = document.getElementById('updateUserForm');
    const modeToggle = document.getElementById('modeToggle');
    const searchInput = document.getElementById('searchInput');
    const filterSelect = document.getElementById('filterSelect');
    const logoutButton = document.getElementById('logoutButton');

    let allUsers = []; // Store all users to perform filtering and searching locally

    // Fetch and display current admin's username
    async function fetchAdminUsername() {
        try {
            const res = await fetch('/api/users/me');
            if (res.ok) {
                const user = await res.json();
                usernamePlaceholder.textContent = user.username;
            } else {
                usernamePlaceholder.textContent = 'Admin';
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            usernamePlaceholder.textContent = 'Admin';
        }
    }

    // Dark/Light mode toggle
    modeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const icon = modeToggle.querySelector('i');
        if (document.body.classList.contains('dark-mode')) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    });

    // Fetch users and render the table
    async function fetchUsers() {
        try {
            const res = await fetch('/api/admin/users');
            if (!res.ok) throw new Error('Failed to fetch users');
            allUsers = await res.json();
            renderUsers(allUsers);
        } catch(err) {
            alert('İstifadəçilər yüklənərkən xəta baş verdi: ' + err.message);
        }
    }

    // Function to render the users based on the provided array
    function renderUsers(usersToRender) {
        tbody.innerHTML = '';
        usersToRender.forEach(u => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${u.id}</td>
                <td>${u.username}</td>
                <td>${u.email}</td>
                <td>${u.isAdmin ? 'Bəli' : 'Xeyr'}</td>
                <td class="actions-cell">
                    <button class="action-btn update-btn" data-id="${u.id}" data-username="${u.username}" data-email="${u.email}" data-isadmin="${u.isAdmin}">Yenilə</button>
                    <button class="action-btn delete-btn" data-id="${u.id}">Sil</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Apply search and filter logic
    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const filterValue = filterSelect.value;

        const filteredUsers = allUsers.filter(user => {
            const matchesSearch = user.username.toLowerCase().includes(searchTerm) ||
                                user.email.toLowerCase().includes(searchTerm);

            const matchesFilter = filterValue === 'all' ||
                                (filterValue === 'admin' && user.isAdmin) ||
                                (filterValue === 'user' && !user.isAdmin);

            return matchesSearch && matchesFilter;
        });

        renderUsers(filteredUsers);
    }

    // Handle logout
    async function handleLogout() {
        try {
            const res = await fetch('/api/auth/logout', { method: 'POST' });
            if (res.ok) {
                alert('Siz uğurla çıxış etdiniz.');
                window.location.reload();
            } else {
                alert('Çıxış uğursuz oldu. Zəhmət olmasa yenidən cəhd edin.');
            }
        } catch (err) {
            alert('Şəbəkə xətası: ' + err.message);
        }
    }

    // Event listeners
    searchInput.addEventListener('input', applyFilters);
    filterSelect.addEventListener('change', applyFilters);
    logoutButton.addEventListener('click', handleLogout);

    // Create user
    createUserForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const isAdmin = document.getElementById('isAdmin').checked;

        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password, isAdmin })
            });
            const data = await res.json();
            if (res.ok) {
                alert('İstifadəçi uğurla yaradıldı.');
                fetchUsers();
                e.target.reset();
            } else {
                alert('İstifadəçi yaradılması uğursuz oldu: ' + (data.message || 'Bilinməyən xəta.'));
            }
        } catch (err) {
            alert('Şəbəkə xətası: ' + err.message);
        }
    });

    // Handle delete and update button clicks using event delegation
    tbody.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const id = e.target.getAttribute('data-id');
            if (confirm('Bu istifadəçini silmək istədiyinizə əminsiniz?')) {
                try {
                    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
                    const data = await res.json();
                    if (res.ok) {
                        alert('İstifadəçi uğurla silindi.');
                        fetchUsers();
                    } else {
                        alert('Silinmə uğursuz oldu: ' + (data.message || 'Bilinməyən xəta.'));
                    }
                } catch (err) {
                    alert('Şəbəkə xətası: ' + err.message);
                }
            }
        }
        if (e.target.classList.contains('update-btn')) {
            const btn = e.target;
            document.getElementById('updateUserId').value = btn.dataset.id;
            document.getElementById('updateUsername').value = btn.dataset.username;
            document.getElementById('updateEmail').value = btn.dataset.email;
            document.getElementById('updateIsAdmin').checked = btn.dataset.isadmin === 'true';
            document.getElementById('updatePassword').value = '';
            updateModal.classList.add('is-active');
        }
    });

    // Close modal
    closeModalBtn.onclick = () => { updateModal.classList.remove('is-active'); };
    window.onclick = (e) => { if (e.target === updateModal) updateModal.classList.remove('is-active'); };

    // Handle update form submission
    updateUserForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('updateUserId').value;
        const username = document.getElementById('updateUsername').value;
        const email = document.getElementById('updateEmail').value;
        const password = document.getElementById('updatePassword').value || undefined;
        const isAdmin = document.getElementById('updateIsAdmin').checked;

        try {
            const res = await fetch(`/api/admin/users/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password, isAdmin })
            });
            const data = await res.json();
            if (res.ok) {
                alert('İstifadəçi uğurla yeniləndi.');
                updateModal.classList.remove('is-active');
                fetchUsers();
            } else {
                alert('Yenilənmə uğursuz oldu: ' + (data.message || 'Bilinməyən xəta.'));
            }
        } catch (err) {
            alert('Şəbəkə xətası: ' + err.message);
        }
    });

    // Initial load
    fetchAdminUsername();
    fetchUsers();
});