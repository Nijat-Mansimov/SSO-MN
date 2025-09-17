document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const createForm = document.getElementById('createTicketForm');
    const ticketsContainer = document.getElementById('ticketsContainer');
    const filterTabs = document.querySelectorAll('.tab-button');
    let currentFilter = 'all';

    // Update Modal
    const updateModal = document.getElementById('updateModal');
    const updateForm = document.getElementById('updateTicketForm');
    const updateTicketId = document.getElementById('updateTicketId');

    // Profile Modal
    const profileBtn = document.getElementById('profileBtn');
    const profileModal = document.getElementById('profileModal');
    const totalTickets = document.getElementById('totalTickets');
    const completedTickets = document.getElementById('completedTickets');
    const uncompletedTickets = document.getElementById('uncompletedTickets');

    // Popup
    const popup = document.getElementById('customPopup');
    const popupTitle = document.getElementById('popupTitle');
    const popupMessage = document.getElementById('popupMessage');

    const logoutBtn = document.getElementById('logoutBtn');

    // --- Helper Functions ---
    const showPopup = (title, message) => {
        popupTitle.textContent = title;
        popupMessage.textContent = message;
        popup.style.display = 'flex';
    };

    document.getElementById('popupCloseBtn').addEventListener('click', () => {
        popup.style.display = 'none';
    });

    const fetchTickets = async () => {
        try {
            const res = await fetch('http://localhost:4000/api/users/tickets');
            if (!res.ok) throw new Error('Biletlər yüklənərkən xəta baş verdi.');
            const { tickets } = await res.json();
            renderTickets(tickets, currentFilter);
        } catch (err) {
            console.error(err);
            showPopup('Xəta!', err.message);
        }
    };

    const renderTickets = (tickets, filter) => {
        ticketsContainer.innerHTML = '';

        const filtered = tickets.filter(t => filter === 'all' || t.status === filter);
        if (!filtered.length) {
            ticketsContainer.innerHTML = '<p class="no-tickets-message">Bu statusda bilet yoxdur.</p>';
            return;
        }

        filtered.forEach(ticket => {
            const card = document.createElement('div');
            card.className = `ticket-card status-${ticket.status}`;
            card.innerHTML = `
                <h4>#${ticket.id} - ${ticket.type}</h4>
                <p><strong>Təşkilat:</strong> ${ticket.organization}</p>
                <p><strong>Qısa təsvir:</strong> ${ticket.short_description}</p>
                <p><strong>Status:</strong> ${ticket.status === 'uncompleted' ? 'Tamamlanmayıb' : 'Tamamlanıb'}</p>
                <div class="ticket-actions">
                    <button class="btn btn-update" data-id="${ticket.id}"><i class="fas fa-edit"></i> Yenilə</button>
                    <button class="btn btn-delete" data-id="${ticket.id}"><i class="fas fa-trash"></i> Sil</button>
                </div>
            `;
            ticketsContainer.appendChild(card);
        });

        ticketsContainer.querySelectorAll('.btn-delete').forEach(btn => btn.addEventListener('click', handleDelete));
        ticketsContainer.querySelectorAll('.btn-update').forEach(btn => btn.addEventListener('click', handleUpdate));
    };

    // --- Event Handlers ---
    filterTabs.forEach(tab => {
        tab.addEventListener('click', e => {
            document.querySelector('.tab-button.active').classList.remove('active');
            e.currentTarget.classList.add('active');
            currentFilter = e.currentTarget.dataset.status;
            fetchTickets();
        });
    });

    createForm.addEventListener('submit', async e => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(createForm).entries());
        try {
            const res = await fetch('http://localhost:4000/api/users/create', {
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

    const handleDelete = async e => {
        const id = e.currentTarget.dataset.id;
        if (!confirm('Əminsiniz ki, bu bileti silmək istəyirsiniz?')) return;
        try {
            const res = await fetch(`http://localhost:4000/api/users/ticket/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Bilet silinərkən xəta baş verdi.');
            showPopup('Uğurlu!', 'Bilet uğurla silindi!');
            fetchTickets();
        } catch (err) {
            console.error(err);
            showPopup('Xəta!', err.message);
        }
    };

    const handleUpdate = async e => {
        const id = e.currentTarget.dataset.id;
        try {
            const res = await fetch(`http://localhost:4000/api/users/tickets/${id}`);
            if (!res.ok) throw new Error('Bilet məlumatları tapılmadı.');
            const ticket = await res.json();

            updateTicketId.value = ticket.id;
            updateForm.update_type.value = ticket.type;
            updateForm.update_organization.value = ticket.organization;
            updateForm.update_short_description.value = ticket.short_description;
            updateForm.update_description.value = ticket.description;

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
            const res = await fetch(`http://localhost:4000/api/users/ticket/${id}`, {
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
            const res = await fetch('/api/auth/logout', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
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
            const res = await fetch('http://localhost:4000/api/users/profile/stats');
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

    // Close modals when clicking outside
    window.addEventListener('click', e => {
        if (e.target === updateModal) updateModal.style.display = 'none';
        if (e.target === profileModal) profileModal.style.display = 'none';
    });

    // Initial fetch
    fetchTickets();
});
