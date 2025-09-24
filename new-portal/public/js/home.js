const searchInput = document.getElementById('searchInput');
const filterSelect = document.getElementById('filterSelect');
const cardsContainer = document.getElementById('cardsContainer');
const modeToggle = document.getElementById('modeToggle');
const body = document.body;
const profileToggle = document.getElementById('profileToggle');
const profileView = document.getElementById('profileView');
const closeProfileButton = document.getElementById('closeProfile');
const logoutButton = document.getElementById('logoutButton');
const profileName = document.getElementById('profileName');
const profileEmail = document.getElementById('profileEmail');
const profileId = document.getElementById('profileId');
const profileAdmin = document.getElementById('profileAdmin');
const adminDashboardButton = document.getElementById('adminDashboardButton');
const newsContent = document.getElementById('newsContent');
const securityTipsContent = document.getElementById('securityTipsContent');
const closeTipsButton = document.getElementById('closeTips');
const securityTipsContainer = document.getElementById('securityTips');

// Bütün servislər üçün standart ikon və rəng
const defaultIcon = 'fa-solid fa-layer-group';
const defaultColor = 'bg-primary-color'; // Bu rəngə uyğun olaraq CSS-ə əlavə edin

// Kiber Təhlükəsizlik Məsləhətləri
const securityTips = [
    "Şifrələriniz ən azı 12 simvoldan ibarət olmalı və hərflər, rəqəmlər və xüsusi simvolları ehtiva etməlidir.",
    "İki faktorlu autentifikasiya (2FA) istifadə edin - hesabınıza girişi təsdiqləmək üçün əlavə təhlükəsizlik tədbiri.",
    "Şübhəli e-poçtlar və linklərə klik etməyin - həmişə göndərənin etibarlı olduğunu yoxlayın.",
    "Proqram və əməliyyat sistemlərini müntəzəm olaraq yeniləyin - təhlükəsizlik yeniləmələri həyati əhəmiyyət kəsb edir.",
    "Hərkəslə şəxsi məlumatlarınızı paylaşmayın - həssas məlumatları yalnız etibarlı platformalarda paylaşın.",
    "İstifadə etdiyiniz veb-saytların URL ünvanlarını yoxlayın - phishing hücumlarından qorunmaq üçün https və təhlükəsiz bağlantıları axtarın.",
    "Məlumatlarınızı müntəzəm olaraq ehtiyatda saxlayın - kiberhücum və ya məlumat itkisi halında bərpa etməyi asanlaşdırır.",
    "İş yeri və ev şəbəkələrinizi güclü şifrələrlə qoruyun və müntəzəm olaraq şifrələri dəyişin.",
    "İctimai Wi-Fi şəbəkələrindən istifadə edərkən VPN istifadə edin - məlumatlarınızı şifrələyin.",
    "Hesab fəaliyyətinizi müntəzəm olaraq yoxlayın - şübhəli hərəkətləri müəyyən etmək üçün giriş jurnallarını nəzərdən keçirin."
];

// Xəbərlər Məlumatları
const newsItems = [
    "Bugün hava: 25°C, günəşli. Sabah üçün yağış ehtimalı var.",
    "Yeni kibertəhlükəsizlik tədbirləri tətbiq olunur - bütün istifadəçilər şifrələrini yeniləməlidir.",
    "Şirkətin yeni məhsulu növbəti ay satışa çıxacaq - ətraflı məlumat üçün daxili portalı ziyarət edin.",
    "Təlim sessiyası: Kibertəhlükəsizlik əsasları - növbəti cümə günü saat 14:00-da.",
    "Sistem yeniləməsi: Növbəti həftə sonu bəzi xidmətlər müvəqqəti olaraq əlçatan olmaya bilər.",
    "Yeni ofis prosedurları: Uzaqdan işləmə siyasəti yeniləndi - ətraflı məlumat üçün HR ilə əlaqə saxlayın."
];

// Servisləri API-dən çəkən funksiya
async function fetchServices() {
    try {
        const response = await fetch(`${PORTAL_API}/users/my-services`);
        if (!response.ok) {
            throw new Error('Failed to fetch services');
        }
        const services = await response.json();
        displayServices(services);
    } catch (error) {
        console.error('Error fetching services:', error);
        cardsContainer.innerHTML = '<p class="info-message">Xidmətləri yükləmək mümkün olmadı. Zəhmət olmasa yenidən cəhd edin.</p>';
    }
}

// Servis kartını yaradan funksiya
function createServiceCard(service) {
    const card = document.createElement('div');
    const serviceUrl = service.url || '#';
    const serviceName = service.name || service.service_name || 'Naməlum Xidmət';
    const serviceDescription = service.description || 'Bu xidmət haqqında məlumat yoxdur.';
    const status = service.status === 'inactive' ? 'inactive' : 'active';

    card.className = `card ${status}`;
    card.setAttribute('data-status', status);

    card.innerHTML = `
        <div class="card-icon-wrapper"><i class="${defaultIcon}"></i></div>
        <div class="card-content">
            <h2 class="card-title">${serviceName}</h2>
            <p class="card-description">${serviceDescription}</p>
        </div>
        <a href="${serviceUrl}" class="card-link-button" target="_blank">
            Daxil ol
        </a>
    `;

    return card;
}

// Servisləri səhifədə göstərən funksiya
function displayServices(services) {
    cardsContainer.innerHTML = '';
    if (services.length === 0) {
        cardsContainer.innerHTML = '<p class="info-message">Sizə təyin olunmuş heç bir xidmət yoxdur.</p>';
        return;
    }
    services.forEach(service => {
        const card = createServiceCard(service);
        cardsContainer.appendChild(card);
    });
    applyFilters();
}

// Axtarış və Filtrasiya funksiyası
function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const filterValue = filterSelect.value;
    const cards = cardsContainer.querySelectorAll('.card');

    cards.forEach(card => {
        const title = card.querySelector('.card-title').textContent.toLowerCase();
        const desc = card.querySelector('.card-description').textContent.toLowerCase();
        const status = card.getAttribute('data-status');

        const matchesSearch = title.includes(searchTerm) || desc.includes(searchTerm);
        const matchesFilter =
            filterValue === 'all' ||
            (filterValue === 'active' && status === 'active') ||
            (filterValue === 'inactive' && status === 'inactive');

        card.style.display = (matchesSearch && matchesFilter) ? 'flex' : 'none';
    });
}

function toggleMode() {
    body.classList.toggle('dark-mode');
    const icon = modeToggle.querySelector('i');
    if (body.classList.contains('dark-mode')) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
}

async function fetchProfileData() {
    try {
        const response = await fetch(PORTAL_API + '/users/me');
        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }
        const user = await response.json();
        profileName.textContent = user.username;
        profileEmail.textContent = user.email;
        profileId.textContent = user.id;
        profileAdmin.textContent = user.isAdmin === 1 ? 'Bəli' : 'Xeyr';
    } catch (error) {
        console.error('Error fetching profile data:', error);
        profileName.textContent = 'İstifadəçi tapılmadı';
        profileEmail.textContent = 'Zəhmət olmasa daxil olun';
        profileId.textContent = 'Mövcud deyil';
        profileAdmin.textContent = 'Mövcud deyil';
    }
}

async function handleLogout() {
    try {
        const response = await fetch(PORTAL_API + '/auth/logout', { method: 'POST' });
        if (response.ok) {
            alert('Sistemdən uğurla çıxış etdiniz.');
            window.location.reload();
        } else {
            alert('Çıxış uğursuz oldu. Zəhmət olmasa yenidən cəhd edin.');
        }
    } catch (error) {
        console.error('Error during logout:', error);
        alert('Çıxış zamanı xəta baş verdi.');
    }
}

function showRandomSecurityTip() {
    const randomIndex = Math.floor(Math.random() * securityTips.length);
    securityTipsContent.textContent = securityTips[randomIndex];
}

function showNews() {
    const randomIndex = Math.floor(Math.random() * newsItems.length);
    const newsItem = newsItems[randomIndex];
    
    newsContent.innerHTML = `<span>${newsItem}</span>`;
}

document.addEventListener('DOMContentLoaded', function() {
    fetchServices();
    showRandomSecurityTip();
    showNews();
    
    setInterval(showNews, 30000);
});

searchInput.addEventListener('input', applyFilters);
filterSelect.addEventListener('change', applyFilters);
modeToggle.addEventListener('click', toggleMode);

profileToggle.addEventListener('click', () => {
    profileView.classList.add('active');
    fetchProfileData();
});

closeProfileButton.addEventListener('click', () => {
    profileView.classList.remove('active');
});

logoutButton.addEventListener('click', handleLogout);

adminDashboardButton.addEventListener('click', () => {
    window.location.href = 'admin';
});

closeTipsButton.addEventListener('click', () => {
    securityTipsContainer.classList.add('hidden');
    localStorage.setItem('tipsHidden', Date.now().toString());
});

const tipsHiddenTime = localStorage.getItem('tipsHidden');
if (tipsHiddenTime) {
    const hiddenTime = parseInt(tipsHiddenTime);
    const currentTime = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    
    if (currentTime - hiddenTime < twentyFourHours) {
        securityTipsContainer.classList.add('hidden');
    } else {
        localStorage.removeItem('tipsHidden');
    }
}