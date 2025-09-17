const baseUrl = "http://localhost:4000/api/managers";

let allTickets = [];
let allResolvedTickets = [];
let allTechnicians = [];
let selectedTicketId = null;

// DOM elements
const ticketsSection = document.getElementById('tickets-section');
const resolvedSection = document.getElementById('resolved-section');
const navLinks = document.querySelectorAll('.nav-item');
const logoutBtn = document.getElementById('logoutBtn');

// All Tickets-related elements
const ticketsSearchInput = document.getElementById('ticketsSearchInput');
const statusFilter = document.getElementById('statusFilter');
const technicianFilter = document.getElementById('technicianFilter');
const refreshTicketsBtn = document.getElementById('refreshBtn');

// Resolved Tickets-related elements
const resolvedSearchInput = document.getElementById('resolvedSearchInput');
const refreshResolvedBtn = document.getElementById('refreshResolvedBtn');

// Assign Modal elements
const assignModal = document.getElementById('assignModal');
const assignCloseBtn = document.querySelector('.assign-close-btn');
const technicianSelect = document.getElementById('technicianSelect');
const confirmAssignBtn = document.getElementById('confirmAssignBtn');

// View Modal elements
const viewModal = document.getElementById('viewModal');
const viewCloseBtn = document.querySelector('.view-close-btn');
const ticketDetailsContent = document.getElementById('ticketDetailsContent');


// Function to handle navigation between sections
function showSection(sectionId) {
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById(sectionId).classList.remove('hidden');

    document.querySelectorAll('.nav-item').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[data-target="${sectionId}"]`).classList.add('active');
}

async function fetchData() {
    try {
        const [ticketsRes, resolvedRes, techniciansRes] = await Promise.all([
            fetch(`${baseUrl}/tickets`),
            fetch(`${baseUrl}/tickets/resolved`),
            fetch(`${baseUrl}/technicians`)
        ]);

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
        alert('Məlumatlar yüklənərkən xəta baş verdi. Zəhmət olmasa, yenidən cəhd edin.');
    }
}

function populateTechnicianFilters() {
    technicianFilter.innerHTML = '<option value="">All Technicians</option>';
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
    const tbody = document.getElementById("ticketsBody");
    const search = ticketsSearchInput.value.toLowerCase();
    const status = statusFilter.value;
    const technician = technicianFilter.value;
    tbody.innerHTML = "";

    const filtered = allTickets.filter(t =>
        (t.short_description.toLowerCase().includes(search) || t.description.toLowerCase().includes(search)) &&
        (!status || t.status === status) &&
        (!technician || t.assigned_to == technician)
    );

    filtered.forEach(t => {
        const row = document.createElement("tr");
        const isCompleted = t.status === 'completed';
        const assignBtnHtml = isCompleted
            ? `<button class="assign-btn disabled" disabled>Assign</button>`
            : `<button class="assign-btn" onclick="openAssignModal(${t.id})">Assign</button>`;

        row.innerHTML = `
            <td>${t.id}</td>
            <td>${t.short_description}</td>
            <td>${t.status}</td>
            <td>${t.created_by_username}</td>
            <td>${t.assigned_to_username || "Unassigned"}</td>
            <td>
                <button class="view-btn" onclick="openViewModal(${t.id}, false)">View</button>
                ${assignBtnHtml}
            </td>
        `;
        tbody.appendChild(row);
    });
}

function renderResolved() {
    const tbody = document.getElementById("resolvedBody");
    const search = resolvedSearchInput.value.toLowerCase();
    tbody.innerHTML = "";

    const filtered = allResolvedTickets.filter(t =>
        t.short_description.toLowerCase().includes(search)
    );

    filtered.forEach(rt => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${rt.ticket_id}</td>
            <td>${rt.short_description}</td>
            <td>${new Date(rt.resolved_at).toLocaleString()}</td>
            <td>${rt.assigned_to_username || "N/A"}</td>
            <td>
                <button class="view-btn" onclick="openViewModal(${rt.ticket_id}, true)">View</button>
            </td>
        `;
        tbody.appendChild(row);
    });
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
        if (!res.ok) throw new Error('Failed to fetch ticket details');
        
        const data = await res.json();
        
        if (isResolved) {
            ticketDetails = data.resolvedTicket;
        } else {
            ticketDetails = data.ticket;
        }
        
        let detailsHtml = `
            <p><strong>ID:</strong> ${ticketDetails.id || ticketDetails.ticket_id}</p>
            <p><strong>Type:</strong> ${ticketDetails.type}</p>
            <p><strong>Organization:</strong> ${ticketDetails.organization}</p>
            <p><strong>Phone:</strong> ${ticketDetails.phone_number}</p>
            <p><strong>Status:</strong> ${ticketDetails.status}</p>
            <p><strong>Created By:</strong> ${ticketDetails.created_by_username}</p>
            <p><strong>Assigned To:</strong> ${ticketDetails.assigned_to_username || "Unassigned"}</p>
            <p><strong>Short Description:</strong> ${ticketDetails.short_description}</p>
            <p><strong>Description:</strong> ${ticketDetails.description}</p>
            <p><strong>Created At:</strong> ${new Date(ticketDetails.created_at).toLocaleString()}</p>
        `;

        if (isResolved) {
            detailsHtml += `
                <p><strong>Resolved At:</strong> ${new Date(ticketDetails.resolved_at).toLocaleString()}</p>
                <p><strong>Comment:</strong> ${ticketDetails.comment || 'N/A'}</p>
            `;
        }

        ticketDetailsContent.innerHTML = detailsHtml;
        viewModal.style.display = "flex";

    } catch (error) {
        console.error('Error fetching ticket details:', error);
        alert("Biletin məlumatlarını gətirərkən xəta baş verdi.");
    }
}

// Event listeners for modals
assignCloseBtn.addEventListener("click", () => {
    assignModal.style.display = "none";
});

viewCloseBtn.addEventListener("click", () => {
    viewModal.style.display = "none";
});

window.onclick = function(event) {
    if (event.target == assignModal) {
        assignModal.style.display = "none";
    }
    if (event.target == viewModal) {
        viewModal.style.display = "none";
    }
};

confirmAssignBtn.addEventListener("click", async () => {
    const technicianId = technicianSelect.value;
    if (!technicianId) {
        alert("Zəhmət olmasa, bir texnik seçin.");
        return;
    }

    try {
        const res = await fetch(`${baseUrl}/ticket/${selectedTicketId}/assign`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ technicianId })
        });
        
        if (!res.ok) throw new Error('Failed to assign ticket');

        const data = await res.json();
        alert(data.message);
        assignModal.style.display = "none";
        fetchData();
    } catch (error) {
        console.error('Error assigning ticket:', error);
        alert("Tapşırıq təyin edilərkən xəta baş verdi.");
    }
});

// Function to handle logout
logoutBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
        const res = await fetch('/api/auth/logout', {
            method: 'POST'
        });

        if (res.ok) {
            window.location.href = '/login';
        } else {
            alert('Çıxış zamanı xəta baş verdi. Zəhmət olmasa, yenidən cəhd edin.');
        }
    } catch (error) {
        console.error('Logout error:', error);
        alert('Şəbəkə xətası: Çıxış sorğusu göndərilə bilmədi.');
    }
});

// Event listeners for navigation
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        // Prevent default behavior only for internal links, not logout
        if (e.target.closest('.nav-item').id !== 'logoutBtn') {
            e.preventDefault();
            const targetId = e.target.closest('.nav-item').dataset.target;
            if (targetId) {
                showSection(targetId);
            }
        }
    });
});

// Event listeners for filters and refresh buttons
ticketsSearchInput.addEventListener("input", renderTickets);
statusFilter.addEventListener("change", renderTickets);
technicianFilter.addEventListener("change", renderTickets);
refreshTicketsBtn.addEventListener("click", fetchData);

resolvedSearchInput.addEventListener("input", renderResolved);
refreshResolvedBtn.addEventListener("click", fetchData);

// Initial data fetch
fetchData();