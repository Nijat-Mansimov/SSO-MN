const baseUrl = "http://localhost:4000/api/managers";

let allTickets = [];
let allResolvedTickets = [];
let allTechnicians = [];
let selectedTicketId = null;

// DOM elements
const ticketsSection = document.getElementById('tickets-section');
const resolvedSection = document.getElementById('resolved-section');
const navLinks = document.querySelectorAll('.sidebar-nav a');
const logoutBtn = document.getElementById('logoutBtn');

// All Tickets-related elements
const ticketsSearchInput = document.getElementById('ticketsSearchInput');
const ticketsFilterTabs = document.querySelectorAll('.filter-tabs .tab-button');
const technicianFilter = document.getElementById('technicianFilter');
const refreshTicketsBtn = document.getElementById('refreshTicketsBtn');
const ticketsBody = document.getElementById("ticketsBody");

// Resolved Tickets-related elements
const resolvedSearchInput = document.getElementById('resolvedSearchInput');
const refreshResolvedBtn = document.getElementById('refreshResolvedBtn');
const resolvedBody = document.getElementById("resolvedBody");

// Assign Modal elements
const assignModal = document.getElementById('assignModal');
const assignCloseBtn = assignModal.querySelector('.close-button');
const technicianSelect = document.getElementById('technicianSelect');
const confirmAssignBtn = document.getElementById('confirmAssignBtn');

// View Modal elements
const viewModal = document.getElementById('viewModal');
const viewCloseBtn = viewModal.querySelector('.close-button');
const ticketDetailsContent = document.getElementById('ticketDetailsContent');

// Popup elements
const popup = document.getElementById('customPopup');
const popupTitle = document.getElementById('popupTitle');
const popupMessage = document.getElementById('popupMessage');
const popupCloseBtn = document.getElementById('popupCloseBtn');
const goToUserHome = document.getElementById("goToUserHome")

// Theme toggle
const darkModeToggle = document.getElementById('darkModeToggle');
darkModeToggle.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode', darkModeToggle.checked);
});

// Utility Functions
const showPopup = (title, message) => {
    popupTitle.textContent = title;
    popupMessage.textContent = message;
    popup.style.display = 'flex';
};

const hidePopup = () => {
    popup.style.display = 'none';
};

// Function to handle navigation between sections
function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

function updateNavActiveState(activeBtn) {
    document.querySelectorAll('.sidebar-nav a').forEach(btn => {
        btn.classList.remove('active');
    });
    activeBtn.classList.add('active');
}

async function fetchData() {
    try {
        const [ticketsRes, resolvedRes, techniciansRes] = await Promise.all([
            fetch(`${baseUrl}/tickets`),
            fetch(`${baseUrl}/tickets/resolved`),
            fetch(`${baseUrl}/technicians`)
        ]);

        if (!ticketsRes.ok || !resolvedRes.ok || !techniciansRes.ok) {
            throw new Error('Məlumatlar yüklənərkən xəta baş verdi.');
        }

        const ticketsData = await ticketsRes.json();
        const resolvedData = await resolvedRes.json();
        const techniciansData = await techniciansRes.json();

        allTickets = ticketsData.tickets;
        allResolvedTickets = resolvedData.resolvedTickets;
        allTechnicians = techniciansData.technicians;

        populateTechnicianFilters();
        renderTickets();
        renderResolved();
    } catch (error) {
        console.error('Error fetching data:', error);
        showPopup('Xəta!', 'Məlumatlar yüklənərkən xəta baş verdi. Zəhmət olmasa, yenidən cəhd edin.');
    }
}

function populateTechnicianFilters() {
    technicianFilter.innerHTML = '<option value="">Bütün HelpDesk əməkdaşları</option>';
    technicianSelect.innerHTML = '';

    allTechnicians.forEach(t => {
        const optionFilter = document.createElement("option");
        optionFilter.value = t.id;
        optionFilter.textContent = t.username;
        technicianFilter.appendChild(optionFilter);

        const optionSelect = document.createElement("option");
        optionSelect.value = t.id;
        optionSelect.textContent = t.username;
        technicianSelect.appendChild(optionSelect);
    });
}

function renderTickets() {
    const search = ticketsSearchInput.value.toLowerCase();
    const status = document.querySelector('.filter-tabs .tab-button.active').dataset.status;
    const technician = technicianFilter.value;
    ticketsBody.innerHTML = "";

    const filtered = allTickets.filter(t =>
        (status === 'all' || t.status === status) &&
        (t.short_description.toLowerCase().includes(search) || t.description.toLowerCase().includes(search)) &&
        (!technician || t.assigned_to == technician)
    );

    if (filtered.length === 0) {
        ticketsBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Nəticə tapılmadı.</td></tr>';
        return;
    }

    filtered.forEach(t => {
        const row = document.createElement("tr");
        const isCompleted = t.status === 'completed';
        const assignBtnHtml = isCompleted
            ? `<button class="btn assign-btn disabled" disabled>Yönləndir</button>`
            : `<button class="btn assign-btn" data-id="${t.id}">Yönləndir</button>`;

        row.innerHTML = `
            <td>#${t.id}</td>
            <td>${t.short_description}</td>
            <td>${t.status === 'uncompleted' ? 'Həll edilməmiş' : t.status === 'in_progress' ? 'İcra olunur' : 'Həll edilmiş'}</td>
            <td>${t.created_by_username}</td>
            <td>${t.assigned_to_username || "Təyin edilməyib"}</td>
            <td>
                <button class="btn view-btn" data-id="${t.id}" data-resolved="false">Bax</button>
                ${assignBtnHtml}
            </td>
        `;
        ticketsBody.appendChild(row);
    });

    ticketsBody.querySelectorAll('.assign-btn').forEach(btn => {
        if (!btn.disabled) {
            btn.addEventListener('click', () => openAssignModal(btn.dataset.id));
        }
    });
    ticketsBody.querySelectorAll('.view-btn').forEach(btn => btn.addEventListener('click', () => openViewModal(btn.dataset.id, btn.dataset.resolved === 'true')));
}

function renderResolved() {
    const search = resolvedSearchInput.value.toLowerCase();
    resolvedBody.innerHTML = "";

    const filtered = allResolvedTickets.filter(t =>
        t.short_description.toLowerCase().includes(search)
    );

    if (filtered.length === 0) {
        resolvedBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Nəticə tapılmadı.</td></tr>';
        return;
    }

    filtered.forEach(rt => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>#${rt.ticket_id}</td>
            <td>${rt.short_description}</td>
            <td>${new Date(rt.resolved_at).toLocaleString('az-AZ')}</td>
            <td>${rt.assigned_to_username || "N/A"}</td>
            <td>
                <button class="btn view-btn" data-id="${rt.ticket_id}" data-resolved="true">Bax</button>
            </td>
        `;
        resolvedBody.appendChild(row);
    });

    resolvedBody.querySelectorAll('.view-btn').forEach(btn => btn.addEventListener('click', () => openViewModal(btn.dataset.id, btn.dataset.resolved === 'true')));
}

function openAssignModal(ticketId) {
    selectedTicketId = ticketId;
    assignModal.style.display = "flex";
}

async function openViewModal(ticketId, isResolved) {
    let ticketDetails;
    try {
        const api = isResolved
            ? `${baseUrl}/ticket/${ticketId}/resolved`
            : `${baseUrl}/tickets/${ticketId}`;

        const res = await fetch(api);
        if (!res.ok) throw new Error('Bilet məlumatlarını gətirmək mümkün olmadı.');

        const data = await res.json();
        ticketDetails = isResolved ? data.resolvedTicket : data.ticket;

        let detailsHtml = `
            <p><strong>ID:</strong> #${ticketDetails.id || ticketDetails.ticket_id}</p>
            <p><strong>Növ:</strong> ${ticketDetails.type}</p>
            <p><strong>Təşkilat:</strong> ${ticketDetails.organization}</p>
            <p><strong>Telefon:</strong> ${ticketDetails.phone_number}</p>
            <p><strong>Status:</strong> ${ticketDetails.status === 'uncompleted' ? 'Həll edilməmiş' : ticketDetails.status === 'in_progress' ? 'İcra olunur' : 'Həll edilmiş'}</p>
            <p><strong>Yaradan:</strong> ${ticketDetails.created_by_username}</p>
            <p><strong>Təyin olunub:</strong> ${ticketDetails.assigned_to_username || "Təyin edilməyib"}</p>
            <p><strong>Qısa təsvir:</strong> ${ticketDetails.short_description}</p>
            <p><strong>Ətraflı təsvir:</strong> ${ticketDetails.description}</p>
            <p><strong>Yaradılma tarixi:</strong> ${new Date(ticketDetails.created_at).toLocaleString('az-AZ')}</p>
        `;

        if (isResolved) {
            detailsHtml += `
                <p><strong>Həll vaxtı:</strong> ${new Date(ticketDetails.resolved_at).toLocaleString('az-AZ')}</p>
                <p><strong>Şərh:</strong> ${ticketDetails.comment || 'N/A'}</p>
            `;
        }

        ticketDetailsContent.innerHTML = detailsHtml;
        viewModal.style.display = "flex";

    } catch (error) {
        console.error('Error fetching ticket details:', error);
        showPopup('Xəta!', 'Sorğu məlumatlarını gətirərkən xəta baş verdi.');
    }
}

// Event listeners
ticketsFilterTabs.forEach(tab => {
    tab.addEventListener('click', e => {
        document.querySelector('.filter-tabs .tab-button.active').classList.remove('active');
        e.currentTarget.classList.add('active');
        renderTickets();
    });
});

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        if (e.currentTarget.id !== 'logoutBtn') {
            e.preventDefault();
            const targetId = e.currentTarget.dataset.target;
            if (targetId) {
                showSection(targetId);
                updateNavActiveState(e.currentTarget);
                fetchData();
            }
        }
    });
});

ticketsSearchInput.addEventListener("input", renderTickets);
technicianFilter.addEventListener("change", renderTickets);
refreshTicketsBtn.addEventListener("click", fetchData);

resolvedSearchInput.addEventListener("input", renderResolved);
refreshResolvedBtn.addEventListener("click", fetchData);

assignCloseBtn.addEventListener("click", () => {
    assignModal.style.display = "none";
});

viewCloseBtn.addEventListener("click", () => {
    viewModal.style.display = "none";
});

popupCloseBtn.addEventListener('click', hidePopup);

window.onclick = function(event) {
    if (event.target === assignModal) {
        assignModal.style.display = "none";
    }
    if (event.target === viewModal) {
        viewModal.style.display = "none";
    }
    if (event.target === popup) {
        hidePopup();
    }
};

confirmAssignBtn.addEventListener("click", async () => {
    const technicianId = technicianSelect.value;
    if (!technicianId) {
        showPopup('Xəta!', "Zəhmət olmasa, bir texnik seçin.");
        return;
    }

    try {
        const res = await fetch(`${baseUrl}/ticket/${selectedTicketId}/assign`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ technicianId })
        });
        
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.message || 'Sorğu yönləndirilərkən xəta baş verdi.');
        }

        showPopup('Uğurlu!', data.message);
        assignModal.style.display = "none";
        fetchData();
    } catch (error) {
        console.error('Error assigning ticket:', error);
        showPopup('Xəta!', error.message);
    }
});

logoutBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
        const res = await fetch('/api/auth/logout', { method: 'POST' });
        if (res.ok) {
            window.location.href = '/login';
        } else {
            throw new Error('Çıxış zamanı xəta baş verdi.');
        }
    } catch (error) {
        console.error('Logout error:', error);
        showPopup('Xəta!', 'Şəbəkə xətası: Çıxış sorğusu göndərilə bilmədi.');
    }
});

goToUserHome.addEventListener('click', async (e) => {
    e.preventDefault();
    window.location.href = '/user-home';

});

fetchData();