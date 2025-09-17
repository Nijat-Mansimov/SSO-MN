const searchInput = document.getElementById('searchInput');
const filterSelect = document.getElementById('filterSelect');
const cards = document.querySelectorAll('#cardsContainer .card');
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

// Kiber Təhlükəsizlik Məsləhətləri
const securityTips = [
  "Şifrələriniz ən azı 12 simvoldan ibarət olmalı və hərflər, rəqəmlər və xüsusi simvolları ehtiva etməlidir.",
  "İki faktorlu autentifikasiya (2FA) istifadə edin - hesabınıza girişi təsdiqləmək üçün əlavə təhlükəsizlik tədbiri.",
  "Şübhəli e-poçtlar və linklərə klik etməyin - həmişə göndərənin etibarlı olduğunu yoxlayın.",
  "Proqram və əməliyyat sistemlərini müntəzəm olaraq yeniləyin - təhlükəsizlik yeniləmələri həyati əhəmiyyət kəsb edir.",
  "Herkötlə şəxsi məlumatlarınızı paylaşmayın - həssas məlumatları yalnız etibarlı platformalarda paylaşın.",
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

function applyFilters() {
  const searchTerm = searchInput.value.toLowerCase();
  const filterValue = filterSelect.value;

  cards.forEach(card => {
    const title = card.querySelector('h2').textContent.toLowerCase();
    const desc = card.querySelector('p').textContent.toLowerCase();
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
    const response = await fetch('http://localhost:3000/api/users/me');
    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }
    const user = await response.json();
    profileName.textContent = user.username;
    profileEmail.textContent = user.email;
    profileId.textContent = user.id;
    profileAdmin.textContent = user.isAdmin === 1 ? 'Yes' : 'No';

    // Check if the user is an admin and show the button
    if (user.isAdmin === 1) {
      adminDashboardButton.style.display = 'block';
    } else {
      adminDashboardButton.style.display = 'none';
    }
  } catch (error) {
    console.error('Error fetching profile data:', error);
    profileName.textContent = 'User not found';
    profileEmail.textContent = 'Please log in';
    profileId.textContent = 'N/A';
    profileAdmin.textContent = 'N/A';
    // Ensure the button is hidden if an error occurs
    adminDashboardButton.style.display = 'none';
  }
}

async function handleLogout() {
  try {
    const response = await fetch('http://localhost:3000/api/auth/logout', { method: 'POST' });
    if (response.ok) {
      alert('You have been logged out successfully.');
      window.location.reload();
    } else {
      alert('Logout failed. Please try again.');
    }
  } catch (error) {
    console.error('Error during logout:', error);
    alert('An error occurred during logout.');
  }
}

// Təsadüfi Kiber Təhlükəsizlik Məsləhəti Göstərin
function showRandomSecurityTip() {
  const randomIndex = Math.floor(Math.random() * securityTips.length);
  securityTipsContent.textContent = securityTips[randomIndex];
}

// Xəbərləri Göstərin
function showNews() {
  const randomIndex = Math.floor(Math.random() * newsItems.length);
  const newsItem = newsItems[randomIndex];
  
  // Xəbər sətirini animasiya ilə göstərin
  newsContent.innerHTML = `<span>${newsItem}</span>`;
}

// Əsas Səhifə Yükləndikdə
document.addEventListener('DOMContentLoaded', function() {
  showRandomSecurityTip();
  showNews();
  
  // Hər 30 saniyədən bir yeni xəbər göstərin
  setInterval(showNews, 30000);
});

// Event Listeners
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
  
  // 24 saat ərzində təkrar göstərmə
  localStorage.setItem('tipsHidden', Date.now().toString());
});

// Əgər istifadəçi məsləhətləri bağlıbsa, onları göstərmə
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