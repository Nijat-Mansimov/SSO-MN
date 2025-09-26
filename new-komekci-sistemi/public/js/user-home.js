document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const createForm = document.getElementById('createTicketForm');
    const ticketsContainer = document.getElementById('ticketsContainer');
    const filterTabs = document.querySelectorAll('.tab-button');
    const searchInput = document.getElementById('searchInput');
    const updateModal = document.getElementById('updateModal');
    const updateForm = document.getElementById('updateTicketForm');
    const updateTicketId = document.getElementById('updateTicketId');
    const profileBtn = document.getElementById('profileBtn');
    const profileModal = document.getElementById('profileModal');
    const totalTickets = document.getElementById('totalTickets');
    const completedTickets = document.getElementById('completedTickets');
    const uncompletedTickets = document.getElementById('uncompletedTickets');
    const popup = document.getElementById('customPopup');
    const popupTitle = document.getElementById('popupTitle');
    const popupMessage = document.getElementById('popupMessage');
    const logoutBtn = document.getElementById('logoutBtn');
    const ticketsSection = document.getElementById('ticketsSection');
    const createSection = document.getElementById('createSection');
    const ticketsBtn = document.getElementById('ticketsBtn');
    const createBtn = document.getElementById('createBtn');
    const darkModeToggle = document.getElementById('darkModeToggle'); // Added: Dark mode toggle element

    let allTickets = [];
    let currentFilter = 'all';

    // --- Dark mode functionality ---
    // 1. Check for saved preference on page load
    const savedTheme = localStorage.getItem('theme');
    const isDarkMode = savedTheme === 'dark';

    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        darkModeToggle.checked = true;
    } else {
        document.body.classList.remove('dark-mode');
        darkModeToggle.checked = false;
    }

    // 2. Handle toggle change and save preference
    darkModeToggle.addEventListener('change', () => {
        if (darkModeToggle.checked) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark'); // Save dark mode preference
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light'); // Save light mode preference
        }
    });
    // --- End Dark mode functionality ---

    const showPopup = (title, message) => {
        popupTitle.textContent = title;
        popupMessage.textContent = message;
        popup.style.display = 'flex';
    };

    document.getElementById('popupCloseBtn').addEventListener('click', () => {
        popup.style.display = 'none';
    });

    // Navigation logic
    const switchSection = (sectionToShow) => {
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        sectionToShow.classList.add('active');
    };

    const updateNavActiveState = (activeBtn) => {
        document.querySelectorAll('.sidebar-nav a').forEach(btn => {
            btn.classList.remove('active');
        });
        activeBtn.classList.add('active');
    };

    ticketsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        switchSection(ticketsSection);
        updateNavActiveState(ticketsBtn);
        fetchTickets();
    });

    createBtn.addEventListener('click', (e) => {
        e.preventDefault();
        switchSection(createSection);
        updateNavActiveState(createBtn);
    });

    const fetchTickets = async () => {
        try {
            const res = await fetch(KOMEKCI_SISTEMI_API + '/users/tickets');
            if (!res.ok) throw new Error('Biletlər yüklənərkən xəta baş verdi.');
            const { tickets } = await res.json();
            allTickets = tickets;
            renderTickets();
        } catch (err) {
            console.error(err);
            showPopup('Xəta!', err.message);
        }
    };

    const renderTickets = () => {
        ticketsContainer.innerHTML = '';
        const searchTerm = searchInput.value.toLowerCase();
        
        const filtered = allTickets.filter(t => 
            (currentFilter === 'all' || t.status === currentFilter) &&
            (t.organization.toLowerCase().includes(searchTerm) ||
             t.short_description.toLowerCase().includes(searchTerm) ||
             t.id.toString().includes(searchTerm) ||
             t.type.toLowerCase().includes(searchTerm))
        );

        if (!filtered.length) {
            ticketsContainer.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 20px;">Nəticə tapılmadı.</td></tr>';
            return;
        }

        filtered.forEach(ticket => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>#${ticket.id}</td>
                <td>${ticket.type}</td>
                <td>${ticket.organization}</td>
                <td>${ticket.short_description}</td>
                <td>${ticket.status === 'uncompleted' ? 'Tamamlanmayıb' : 'Tamamlanıb'}</td>
                <td>
                    ${ticket.status === 'uncompleted' ? 
                        `<button class="btn btn-update" data-id="${ticket.id}"><i class="fas fa-edit"></i></button>` :
                        '<span style="color: var(--success-color); font-weight: 600;">Həll edildi</span>'
                    }
                </td>
            `;
            ticketsContainer.appendChild(tr);
        });

        // Note: I removed the .btn-delete listeners as there are no delete buttons in your HTML for tickets
        ticketsContainer.querySelectorAll('.btn-update').forEach(btn => btn.addEventListener('click', handleUpdate));
    };

    filterTabs.forEach(tab => {
        tab.addEventListener('click', e => {
            document.querySelector('.tab-button.active').classList.remove('active');
            e.currentTarget.classList.add('active');
            currentFilter = e.currentTarget.dataset.status;
            renderTickets();
        });
    });

    searchInput.addEventListener('input', renderTickets);

    createForm.addEventListener('submit', async e => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(createForm).entries());
        try {
            const res = await fetch(KOMEKCI_SISTEMI_API + '/users/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Yeni bilet yaradılarkən xəta baş verdi.');
            }
            showPopup('Uğurlu!', 'Bilet uğurla yaradıldı!');
            createForm.reset();
            fetchTickets();
        } catch (err) {
            console.error(err);
            showPopup('Xəta!', err.message);
        }
    });

    // Removed handleDelete since delete button is not in HTML.

    const handleUpdate = async e => {
        const id = e.currentTarget.dataset.id;
        try {
            const res = await fetch(`${KOMEKCI_SISTEMI_API}/users/tickets/${id}`);
            if (!res.ok) throw new Error('Bilet məlumatları tapılmadı.');
            const ticket = await res.json();
            updateTicketId.value = ticket.id;
            document.getElementById('update_type').value = ticket.type; // Updated to use direct ID
            document.getElementById('update_organization').value = ticket.organization; // Updated to use direct ID
            document.getElementById('update_short_description').value = ticket.short_description; // Updated to use direct ID
            document.getElementById('update_description').value = ticket.description; // Updated to use direct ID
            updateModal.style.display = 'flex';
        } catch (err) {
            console.error(err);
            showPopup('Xəta!', 'Bilet məlumatlarını yükləmək mümkün olmadı.');
        }
    };

    document.querySelector('#updateModal .close-button').addEventListener('click', () => {
        updateModal.style.display = 'none';
    });

    updateForm.addEventListener('submit', async e => {
        e.preventDefault();
        const id = updateTicketId.value;
        const data = Object.fromEntries(new FormData(updateForm).entries());
        try {
            const res = await fetch(`${KOMEKCI_SISTEMI_API}/users/ticket/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Bilet yenilənərkən xəta baş verdi.');
            }
            updateModal.style.display = 'none';
            showPopup('Uğurlu!', 'Bilet uğurla yeniləndi!');
            fetchTickets();
        } catch (err) {
            console.error(err);
            showPopup('Xəta!', err.message);
        }
    });

    logoutBtn.addEventListener('click', async e => {
        e.preventDefault();
        try {
            const res = await fetch(KOMEKCI_SISTEMI_API + '/auth/logout', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
            if (res.ok) window.location.href = '/login';
            else throw new Error('Çıxış zamanı xəta baş verdi.');
        } catch (err) {
            console.error(err);
            showPopup('Xəta!', err.message);
        }
    });

    profileBtn.addEventListener('click', async e => {
        e.preventDefault();
        try {
            const res = await fetch(KOMEKCI_SISTEMI_API + '/users/profile/stats');
            if (!res.ok) throw new Error('Profil statistikaları yüklənərkən xəta baş verdi.');
            const stats = await res.json();
            totalTickets.textContent = stats.totalTickets;
            completedTickets.textContent = stats.completedTickets;
            uncompletedTickets.textContent = stats.uncompletedTickets;
            profileModal.style.display = 'flex';
        } catch (err) {
            console.error(err);
            showPopup('Xəta!', err.message);
        }
    });

    document.getElementById('profileCloseBtn').addEventListener('click', () => {
        profileModal.style.display = 'none';
    });

    window.addEventListener('click', e => {
        if (e.target === updateModal) updateModal.style.display = 'none';
        if (e.target === profileModal) profileModal.style.display = 'none';
    });

    fetchTickets();
});