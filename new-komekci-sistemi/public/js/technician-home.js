const baseUrl = "http://localhost:4000/api/technicians";

let allTickets = [];
let myResolvedTickets = [];
let allResolvedTickets = [];
let selectedTicketId = null;

// DOM elements
const ticketsSection = document.getElementById('tickets-section');
const myResolvedSection = document.getElementById('my-resolved-section');
const allResolvedSection = document.getElementById('all-resolved-section');
const navLinks = document.querySelectorAll('.sidebar-nav a');
const logoutBtn = document.getElementById('logoutBtn');

// All Tickets-related elements
const ticketsSearchInput = document.getElementById('ticketsSearchInput');
const ticketsFilterTabs = document.querySelectorAll('.filter-tabs .tab-button');
const refreshTicketsBtn = document.getElementById('refreshTicketsBtn');
const ticketsBody = document.getElementById("ticketsBody");

// My Resolved Tickets-related elements
const myResolvedSearchInput = document.getElementById('myResolvedSearchInput');
const refreshMyResolvedBtn = document.getElementById('refreshMyResolvedBtn');
const myResolvedBody = document.getElementById("myResolvedBody");

// All Resolved Tickets-related elements
const allResolvedSearchInput = document.getElementById('allResolvedSearchInput');
const refreshAllResolvedBtn = document.getElementById('refreshAllResolvedBtn');
const allResolvedBody = document.getElementById("allResolvedBody");

// Status Modal elements
const statusModal = document.getElementById('statusModal');
const statusCloseBtn = statusModal.querySelector('.close-button');
const statusSelect = document.getElementById('statusSelect');
const confirmStatusBtn = document.getElementById('confirmStatusBtn');
const commentGroup = document.getElementById('commentGroup');
const commentInput = document.getElementById('commentInput');

// View Modal elements
const viewModal = document.getElementById('viewModal');
const viewCloseBtn = viewModal.querySelector('.close-button');
const ticketDetailsContent = document.getElementById('ticketDetailsContent');

// Comment Modal elements
const commentModal = document.getElementById('commentModal');
const commentModalCloseBtn = commentModal.querySelector('.close-button');
const addCommentInput = document.getElementById('addCommentInput');
const confirmCommentBtn = document.getElementById('confirmCommentBtn');

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
        const [ticketsRes, myResolvedRes, allResolvedRes] = await Promise.all([
            fetch(`${baseUrl}/tickets`),
            fetch(`${baseUrl}/tickets/resolved`),
            fetch(`${baseUrl}/tickets/all/resolved`)
        ]);

        if (!ticketsRes.ok || !myResolvedRes.ok || !allResolvedRes.ok) {
            throw new Error('Məlumatlar yüklənərkən xəta baş verdi.');
        }

        const ticketsData = await ticketsRes.json();
        const myResolvedData = await myResolvedRes.json();
        const allResolvedData = await allResolvedRes.json();

        allTickets = ticketsData.tickets;
        myResolvedTickets = myResolvedData.resolvedTickets;
        allResolvedTickets = allResolvedData.resolvedTickets;

        renderTickets();
        renderMyResolved();
        renderAllResolved();
    } catch (error) {
        console.error('Error fetching data:', error);
        showPopup('Xəta!', 'Məlumatlar yüklənərkən xəta baş verdi. Zəhmət olmasa, yenidən cəhd edin.');
    }
}

function renderTickets() {
    const search = ticketsSearchInput.value.toLowerCase();
    const status = document.querySelector('.filter-tabs .tab-button.active').dataset.status;
    ticketsBody.innerHTML = "";

    const filtered = allTickets.filter(t =>
        (status === 'all' || t.status === status) &&
        (t.short_description.toLowerCase().includes(search) || t.description.toLowerCase().includes(search))
    );

    if (filtered.length === 0) {
        ticketsBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Nəticə tapılmadı.</td></tr>';
        return;
    }

    filtered.forEach(t => {
        const row = document.createElement("tr");
        const isCompleted = t.status === 'completed';
        const statusBtnClass = isCompleted ? 'disabled' : '';
        const statusBtnDisabled = isCompleted ? 'disabled' : '';

        row.innerHTML = `
            <td>#${t.id}</td>
            <td>${t.short_description}</td>
            <td>${t.status === 'uncompleted' ? 'Həll edilməmiş' : t.status === 'in_progress' ? 'İcra olunur' : 'Həll edildi'}</td>
            <td>${t.created_by_username}</td>
            <td>
                <button class="btn view-btn" data-id="${t.id}" data-resolved="false">Bax</button>
                <button class="btn status-btn ${statusBtnClass}" data-id="${t.id}" ${statusBtnDisabled}>Status</button>
            </td>
        `;
        ticketsBody.appendChild(row);
    });

    ticketsBody.querySelectorAll('.view-btn').forEach(btn => btn.addEventListener('click', () => openViewModal(btn.dataset.id, false)));
    ticketsBody.querySelectorAll('.status-btn:not(.disabled)').forEach(btn => btn.addEventListener('click', () => openStatusModal(btn.dataset.id)));
}

function renderMyResolved() {
    const search = myResolvedSearchInput.value.toLowerCase();
    myResolvedBody.innerHTML = "";

    const filtered = myResolvedTickets.filter(t =>
        t.short_description.toLowerCase().includes(search)
    );

    if (filtered.length === 0) {
        myResolvedBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Nəticə tapılmadı.</td></tr>';
        return;
    }

    filtered.forEach(rt => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>#${rt.ticket_id}</td>
            <td>${rt.short_description}</td>
            <td>${new Date(rt.resolved_at).toLocaleString('az-AZ')}</td>
            <td>
                <button class="btn view-btn" data-id="${rt.ticket_id}" data-resolved="true">Bax</button>
                <button class="btn comment-btn" data-id="${rt.ticket_id}">Şərh</button>
            </td>
        `;
        myResolvedBody.appendChild(row);
    });

    myResolvedBody.querySelectorAll('.view-btn').forEach(btn => btn.addEventListener('click', () => openViewModal(btn.dataset.id, true)));
    myResolvedBody.querySelectorAll('.comment-btn').forEach(btn => btn.addEventListener('click', () => openCommentModal(btn.dataset.id)));
}

function renderAllResolved() {
    const search = allResolvedSearchInput.value.toLowerCase();
    allResolvedBody.innerHTML = "";

    const filtered = allResolvedTickets.filter(t =>
        t.short_description.toLowerCase().includes(search) ||
        t.description.toLowerCase().includes(search) ||
        t.comment.toLowerCase().includes(search)
    );

    if (filtered.length === 0) {
        allResolvedBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Nəticə tapılmadı.</td></tr>';
        return;
    }

    filtered.forEach(rt => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>#${rt.ticket_id}</td>
            <td>${rt.short_description}</td>
            <td>${rt.assigned_to_username}</td>
            <td>${new Date(rt.resolved_at).toLocaleString('az-AZ')}</td>
            <td>
                <button class="btn view-btn" data-id="${rt.ticket_id}" data-resolved="all">Bax</button>
            </td>
        `;
        allResolvedBody.appendChild(row);
    });

    allResolvedBody.querySelectorAll('.view-btn').forEach(btn => btn.addEventListener('click', () => openViewModal(btn.dataset.id, 'all')));
}

async function openStatusModal(ticketId) {
    selectedTicketId = ticketId;
    statusSelect.innerHTML = `
        <option value="uncompleted">Həll edilməmiş</option>
        <option value="in_progress">İcra olunur</option>
        <option value="completed">Həll edildi</option>
    `;

    // Fetch current status to set selected option
    const res = await fetch(`${baseUrl}/tickets?id=${ticketId}`);
    const data = await res.json();
    const currentStatus = data.tickets[0].status;
    statusSelect.value = currentStatus;

    if (currentStatus === 'completed') {
        commentGroup.style.display = 'block';
    } else {
        commentGroup.style.display = 'none';
    }

    statusModal.style.display = "flex";
}

async function openViewModal(ticketId, type) {
    let ticketDetails;
    try {
        const api = type === 'all'
            ? `${baseUrl}/tickets/all/resolved?id=${ticketId}`
            : type === 'true'
            ? `${baseUrl}/tickets/resolved?id=${ticketId}`
            : `${baseUrl}/tickets?id=${ticketId}`;
        
        const res = await fetch(api);
        if (!res.ok) throw new Error('Sorğu məlumatlarını gətirmək mümkün olmadı.');

        const data = await res.json();
        
        ticketDetails = type === 'true' ? data.resolvedTickets[0] : type === 'all' ? data.resolvedTickets[0] : data.tickets[0];

        if (!ticketDetails) throw new Error('Bilet tapılmadı.');

        let detailsHtml = `
            <p><strong>ID:</strong> #${ticketDetails.id || ticketDetails.ticket_id}</p>
            <p><strong>Növ:</strong> ${ticketDetails.type}</p>
            <p><strong>Təşkilat:</strong> ${ticketDetails.organization}</p>
            <p><strong>Telefon:</strong> ${ticketDetails.phone_number}</p>
            <p><strong>Status:</strong> ${ticketDetails.status === 'uncompleted' ? 'Həll edilməmiş' : ticketDetails.status === 'in_progress' ? 'İcra olunur' : 'Həll edildi'}</p>
            <p><strong>Yaradan:</strong> ${ticketDetails.created_by_username}</p>
            <p><strong>Qısa təsvir:</strong> ${ticketDetails.short_description}</p>
            <p><strong>Ətraflı təsvir:</strong> ${ticketDetails.description}</p>
            <p><strong>Yaradılma tarixi:</strong> ${new Date(ticketDetails.created_at).toLocaleString('az-AZ')}</p>
        `;

        if (type === 'true' || type === 'all') {
            detailsHtml += `
                <p><strong>Həll vaxtı:</strong> ${new Date(ticketDetails.resolved_at).toLocaleString('az-AZ')}</p>
                <p><strong>Şərh:</strong> ${ticketDetails.comment || 'N/A'}</p>
            `;
        }
        if (type === 'all' && ticketDetails.assigned_to_username) {
            detailsHtml += `<p><strong>Həll edən:</strong> ${ticketDetails.assigned_to_username}</p>`;
        }

        ticketDetailsContent.innerHTML = detailsHtml;
        viewModal.style.display = "flex";

    } catch (error) {
        console.error('Error fetching ticket details:', error);
        showPopup('Xəta!', 'Sorğunun məlumatlarını gətirərkən xəta baş verdi.');
    }
}

function openCommentModal(ticketId) {
    selectedTicketId = ticketId;
    commentModal.style.display = 'flex';
}

// Event listeners
statusSelect.addEventListener('change', () => {
    if (statusSelect.value === 'completed') {
        commentGroup.style.display = 'block';
    } else {
        commentGroup.style.display = 'none';
    }
});

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
refreshTicketsBtn.addEventListener("click", fetchData);

myResolvedSearchInput.addEventListener("input", renderMyResolved);
refreshMyResolvedBtn.addEventListener("click", fetchData);

allResolvedSearchInput.addEventListener("input", renderAllResolved);
refreshAllResolvedBtn.addEventListener("click", fetchData);

statusCloseBtn.addEventListener("click", () => {
    statusModal.style.display = "none";
});

viewCloseBtn.addEventListener("click", () => {
    viewModal.style.display = "none";
});

commentModalCloseBtn.addEventListener('click', () => {
    commentModal.style.display = 'none';
});

popupCloseBtn.addEventListener('click', hidePopup);

window.onclick = function(event) {
    if (event.target === statusModal) {
        statusModal.style.display = "none";
    }
    if (event.target === viewModal) {
        viewModal.style.display = "none";
    }
    if (event.target === commentModal) {
        commentModal.style.display = "none";
    }
    if (event.target === popup) {
        hidePopup();
    }
};

confirmStatusBtn.addEventListener("click", async () => {
    const newStatus = statusSelect.value;
    const comment = commentInput.value;

    if (newStatus === 'completed' && !comment) {
        showPopup('Xəta!', 'Sorğu tamamlananda şərh sahəsi boş ola bilməz.');
        return;
    }

    try {
        const res = await fetch(`${baseUrl}/ticket/${selectedTicketId}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus, comment: newStatus === 'completed' ? comment : '' })
        });
        
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.message || 'Status yenilənərkən xəta baş verdi.');
        }

        showPopup('Uğurlu!', data.message);
        statusModal.style.display = "none";
        fetchData();
    } catch (error) {
        console.error('Error updating status:', error);
        showPopup('Xəta!', error.message);
    }
});

confirmCommentBtn.addEventListener('click', async () => {
    const comment = addCommentInput.value;
    if (!comment) {
        showPopup('Xəta!', 'Şərh sahəsi boş ola bilməz.');
        return;
    }

    try {
        const res = await fetch(`${baseUrl}/tickets/${selectedTicketId}/resolved-comment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ comment })
        });
        
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.message || 'Şərh əlavə edilərkən xəta baş verdi.');
        }

        showPopup('Uğurlu!', 'Şərh uğurla əlavə edildi.');
        commentModal.style.display = 'none';
        fetchData();
    } catch (error) {
        console.error('Error adding comment:', error);
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