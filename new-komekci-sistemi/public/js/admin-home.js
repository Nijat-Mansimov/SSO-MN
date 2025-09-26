const baseUrl = KOMEKCI_SISTEMI_API + "/admins";

let allTickets = [];
let allUsers = [];
let allTechnicians = [];

// DOM elements
const navLinks = document.querySelectorAll('.sidebar-nav a');
const contentSections = document.querySelectorAll('.content-section');
const logoutBtn = document.getElementById('logoutBtn');
const darkModeToggle = document.getElementById('darkModeToggle');

// Dashboard elements
const totalTicketsEl = document.getElementById('totalTickets');
const resolvedTicketsEl = document.getElementById('resolvedTickets');
const totalUsersEl = document.getElementById('totalUsers');
const totalTechniciansEl = document.getElementById('totalTechnicians');
const statusChartCtx = document.getElementById('statusChart').getContext('2d');
const typeChartCtx = document.getElementById('typeChart').getContext('2d');
const userChartCtx = document.getElementById('userChart').getContext('2d');
const technicianChartCtx = document.getElementById('technicianChart').getContext('2d');
const resolvedTableBody = document.getElementById('resolvedTableBody');
const exportStatsBtn = document.getElementById('exportStatsBtn');

// Users section elements
const usersSearchInput = document.getElementById('usersSearchInput');
const usersBody = document.getElementById('usersBody');

// Technicians section elements
const techniciansSearchInput = document.getElementById('techniciansSearchInput');
const techniciansBody = document.getElementById('techniciansBody');

// Tickets section elements
const ticketsSearchInput = document.getElementById('ticketsSearchInput');
const ticketsFilterTabs = document.querySelectorAll('#tickets-section .tab-button');
const ticketsBody = document.getElementById('ticketsBody');

// Modal & Popup elements
const viewModal = document.getElementById('viewModal');
const viewCloseBtn = viewModal.querySelector('.close-button');
const ticketDetailsContent = document.getElementById('ticketDetailsContent');
const popup = document.getElementById('customPopup');
const popupTitle = document.getElementById('popupTitle');
const popupMessage = document.getElementById('popupMessage');
const popupCloseBtn = document.getElementById('popupCloseBtn');
const goToUserHome = document.getElementById("goToUserHome")

let statusChart, typeChart, userChart, technicianChart;

// Utility Functions
const showPopup = (title, message) => {
    popupTitle.textContent = title;
    popupMessage.textContent = message;
    popup.style.display = 'flex';
};

const hidePopup = () => {
    popup.style.display = 'none';
};

function showSection(sectionId) {
    contentSections.forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

function updateNavActiveState(activeBtn) {
    navLinks.forEach(btn => {
        btn.classList.remove('active');
    });
    activeBtn.classList.add('active');
}

async function fetchDashboardData() {
    try {
        const res = await fetch(`${baseUrl}/statistics`);
        if (!res.ok) throw new Error('Dashboard məlumatları yüklənərkən xəta baş verdi.');
        const data = await res.json();
        
        totalTicketsEl.textContent = data.totalTickets;
        resolvedTicketsEl.textContent = data.resolvedTickets;
        totalUsersEl.textContent = data.totalUsers;
        totalTechniciansEl.textContent = data.totalTechnicians;

        renderCharts(data);
        renderRecentResolved(data.recentResolved);

    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        showPopup('Xəta!', 'Dashboard məlumatları yüklənərkən xəta baş verdi.');
    }
}

async function fetchUsers() {
    try {
        const res = await fetch(`${baseUrl}/users`);
        if (!res.ok) throw new Error('İstifadəçi məlumatları yüklənərkən xəta baş verdi.');
        const data = await res.json();
        allUsers = data.users;
        renderUsers();
    } catch (error) {
        console.error('Error fetching users:', error);
        showPopup('Xəta!', 'İstifadəçi məlumatları yüklənərkən xəta baş verdi.');
    }
}

async function fetchTechnicians() {
    try {
        const res = await fetch(`${baseUrl}/technicians`);
        if (!res.ok) throw new Error('Texnik məlumatları yüklənərkən xəta baş verdi.');
        const data = await res.json();
        allTechnicians = data.technicians;
        renderTechnicians();
    } catch (error) {
        console.error('Error fetching technicians:', error);
        showPopup('Xəta!', 'Texnik məlumatları yüklənərkən xəta baş verdi.');
    }
}

async function fetchTickets() {
    try {
        const res = await fetch(`${baseUrl}/tickets`);
        if (!res.ok) throw new Error('Ticket məlumatları yüklənərkən xəta baş verdi.');
        const data = await res.json();
        allTickets = data.tickets;
        renderTickets();
    } catch (error) {
        console.error('Error fetching tickets:', error);
        showPopup('Xəta!', 'Ticket məlumatları yüklənərkən xəta baş verdi.');
    }
}

function renderCharts(data) {
    if (statusChart) statusChart.destroy();
    statusChart = new Chart(statusChartCtx, {
        type: "pie",
        data: {
            labels: data.statusStats.map(s => s.status),
            datasets: [{
                data: data.statusStats.map(s => s.count),
                backgroundColor: ["#3498db", "#f39c12", "#2ecc71"]
            }]
        }
    });

    if (typeChart) typeChart.destroy();
    typeChart = new Chart(typeChartCtx, {
        type: "doughnut",
        data: {
            labels: data.typeStats.map(t => t.type),
            datasets: [{
                data: data.typeStats.map(t => t.count),
                backgroundColor: ["#9b59b6", "#1abc9c", "#e67e22", "#2c3e50"]
            }]
        }
    });

    if (userChart) userChart.destroy();
    userChart = new Chart(userChartCtx, {
        type: "bar",
        data: {
            labels: data.userStats.map(u => u.username),
            datasets: [{
                label: "Tickets Created",
                data: data.userStats.map(u => u.tickets_created),
                backgroundColor: "#2980b9"
            }]
        },
        options: { responsive: true, indexAxis: 'y' }
    });

    if (technicianChart) technicianChart.destroy();
    technicianChart = new Chart(technicianChartCtx, {
        type: "bar",
        data: {
            labels: data.technicianStats.map(t => t.username),
            datasets: [{
                label: "Tickets Assigned",
                data: data.technicianStats.map(t => t.tickets_assigned),
                backgroundColor: "#16a085"
            }]
        },
        options: { responsive: true, indexAxis: 'y' }
    });
}

function renderRecentResolved(data) {
    resolvedTableBody.innerHTML = "";
    data.forEach(rt => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>#${rt.ticket_id}</td>
            <td>${rt.short_description}</td>
            <td>${rt.status}</td>
            <td>${rt.created_by_username}</td>
            <td>${rt.assigned_to_username || "-"}</td>
            <td>${rt.comment || "-"}</td>
            <td>${new Date(rt.resolved_at).toLocaleString('az-AZ')}</td>
        `;
        resolvedTableBody.appendChild(tr);
    });
}

function renderUsers() {
    const search = usersSearchInput.value.toLowerCase();
    usersBody.innerHTML = "";

    const filtered = allUsers.filter(u => u.username.toLowerCase().includes(search) || u.email.toLowerCase().includes(search));

    if (filtered.length === 0) {
        usersBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Nəticə tapılmadı.</td></tr>';
        return;
    }

    filtered.forEach(u => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${u.id}</td>
            <td>${u.username}</td>
            <td>${u.email}</td>
            <td>${u.role}</td>
            <td>${u.status}</td>
        `;
        usersBody.appendChild(row);
    });
}

function renderTechnicians() {
    const search = techniciansSearchInput.value.toLowerCase();
    techniciansBody.innerHTML = "";

    const filtered = allTechnicians.filter(t => t.username.toLowerCase().includes(search) || t.email.toLowerCase().includes(search));

    if (filtered.length === 0) {
        techniciansBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Nəticə tapılmadı.</td></tr>';
        return;
    }

    filtered.forEach(t => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${t.id}</td>
            <td>${t.username}</td>
            <td>${t.email}</td>
            <td>${t.status}</td>
            <td>${t.resolved_count}</td>
        `;
        techniciansBody.appendChild(row);
    });
}

function renderTickets() {
    const search = ticketsSearchInput.value.toLowerCase();
    const status = document.querySelector('#tickets-section .tab-button.active').dataset.status;
    ticketsBody.innerHTML = "";

    const filtered = allTickets.filter(t =>
        (status === 'all' || t.status === status) &&
        (t.short_description.toLowerCase().includes(search) || t.description.toLowerCase().includes(search))
    );

    if (filtered.length === 0) {
        ticketsBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Nəticə tapılmadı.</td></tr>';
        return;
    }

    filtered.forEach(t => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>#${t.id}</td>
            <td>${t.short_description}</td>
            <td>${t.status}</td>
            <td>${t.created_by_username}</td>
            <td>${t.assigned_to_username || "-"}</td>
            <td>
                <button class="btn view-btn" data-id="${t.id}">Bax</button>
            </td>
        `;
        ticketsBody.appendChild(row);
    });

    ticketsBody.querySelectorAll('.view-btn').forEach(btn => btn.addEventListener('click', () => openViewModal(btn.dataset.id)));
}

async function openViewModal(ticketId) {
    try {
        const res = await fetch(`${baseUrl}/tickets?id=${ticketId}`);
        if (!res.ok) throw new Error('Bilet məlumatları yüklənərkən xəta baş verdi.');
        
        const data = await res.json();
        const ticketDetails = data.tickets[0];

        if (!ticketDetails) throw new Error('Bilet tapılmadı.');

        let detailsHtml = `
            <p><strong>ID:</strong> #${ticketDetails.id}</p>
            <p><strong>Növ:</strong> ${ticketDetails.type}</p>
            <p><strong>Təşkilat:</strong> ${ticketDetails.organization}</p>
            <p><strong>Telefon:</strong> ${ticketDetails.phone_number}</p>
            <p><strong>Status:</strong> ${ticketDetails.status}</p>
            <p><strong>Yaradan:</strong> ${ticketDetails.created_by_username}</p>
            <p><strong>Təyin olunan:</strong> ${ticketDetails.assigned_to_username || 'Təyin olunmayıb'}</p>
            <p><strong>Qısa təsvir:</strong> ${ticketDetails.short_description}</p>
            <p><strong>Ətraflı təsvir:</strong> ${ticketDetails.description}</p>
            <p><strong>Yaradılma tarixi:</strong> ${new Date(ticketDetails.created_at).toLocaleString('az-AZ')}</p>
        `;

        ticketDetailsContent.innerHTML = detailsHtml;
        viewModal.style.display = "flex";

    } catch (error) {
        console.error('Error fetching ticket details:', error);
        showPopup('Xəta!', error.message);
    }
}


// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
    fetchDashboardData();

    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (e.currentTarget.id !== 'logoutBtn') {
                e.preventDefault();
                const targetId = e.currentTarget.dataset.target;
                if (targetId) {
                    showSection(targetId);
                    updateNavActiveState(e.currentTarget);

                    if (targetId === 'dashboard-section') fetchDashboardData();
                    if (targetId === 'users-section') fetchUsers();
                    if (targetId === 'technicians-section') fetchTechnicians();
                    if (targetId === 'tickets-section') fetchTickets();
                }
            }
        });
    });

    // Search and Filter
    usersSearchInput.addEventListener("input", renderUsers);
    techniciansSearchInput.addEventListener("input", renderTechnicians);
    ticketsSearchInput.addEventListener("input", renderTickets);
    ticketsFilterTabs.forEach(tab => {
        tab.addEventListener('click', e => {
            document.querySelector('#tickets-section .tab-button.active').classList.remove('active');
            e.currentTarget.classList.add('active');
            renderTickets();
        });
    });

    // Refresh Buttons
    document.getElementById('refreshUsersBtn').addEventListener('click', fetchUsers);
    document.getElementById('refreshTechniciansBtn').addEventListener('click', fetchTechnicians);
    document.getElementById('refreshTicketsBtn').addEventListener('click', fetchTickets);

    // Modal & Popup Events
    viewCloseBtn.addEventListener("click", () => viewModal.style.display = "none");
    popupCloseBtn.addEventListener('click', hidePopup);

    window.onclick = function(event) {
        if (event.target === viewModal) viewModal.style.display = "none";
        if (event.target === popup) hidePopup();
    };

    // Logout
    logoutBtn.addEventListener("click", async () => {
        try {
            const response = await fetch(KOMEKCI_SISTEMI_API + "/auth/logout", {
                method: "POST",
                credentials: "include"
            });
            if (response.ok) {
                window.location.href = "/login";
            } else {
                showPopup("Xəta!", "Çıxış alınmadı. Yenidən cəhd edin.");
            }
        } catch (err) {
            console.error(err);
            showPopup("Xəta!", "Xəta baş verdi!");
        }
    });

    // Excel Export Button
    exportStatsBtn.addEventListener('click', async () => {
        try {
            const res = await fetch(`${baseUrl}/export/statistics`);
            if (!res.ok) throw new Error('Fayl yüklənərkən xəta baş verdi.');
            
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'statistikalar.xlsx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            
            showPopup('Uğurlu!', 'Statistikalar uğurla ixrac edildi.');

        } catch (error) {
            console.error('Export error:', error);
            showPopup('Xəta!', 'Statistikalar ixrac edilərkən xəta baş verdi.');
        }
    });

    goToUserHome.addEventListener('click', async (e) => {
    e.preventDefault();
    window.location.href = '/user-home';

    });

    // Theme Toggle
    // darkModeToggle.addEventListener('change', () => {
    //     document.body.classList.toggle('dark-mode', darkModeToggle.checked);
    // });

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
});

