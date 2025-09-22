document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    const contentSections = document.querySelectorAll('.content-section');
    const panelTitle = document.getElementById('panel-title');
    const modeToggle = document.getElementById('mode-toggle');
    const logoutBtn = document.getElementById('logout-btn');

    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const userForm = document.getElementById('user-form');
    const serviceForm = document.getElementById('service-form');
    const closeButton = document.querySelector('.close-button');

    const usersTableBody = document.querySelector('#users-table tbody');
    const servicesTableBody = document.querySelector('#services-table tbody');
    const userServicesTableBody = document.querySelector('#user-services-table tbody');

    const addUserBtn = document.getElementById('add-user-btn');
    const addServiceBtn = document.getElementById('add-service-btn');
    const assignServiceBtn = document.getElementById('assign-service-btn');
    const assignServiceFormContainer = document.querySelector('.assignment-form-container');
    const assignServiceForm = document.getElementById('assign-service-form');
    const assignUserSelect = document.getElementById('assign-user-select');
    const assignServicesSelect = document.getElementById('assign-services-select');

    const notification = document.getElementById('notification');

    const API_BASE_URL = 'http://localhost:3000/api/admins';

    // Global dəyişənlər
    let allUsers = [];
    let allServices = [];

    // Toggle Dark/Light Mode
    modeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const mode = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
        localStorage.setItem('mode', mode);
    });

    const savedMode = localStorage.getItem('mode') || 'light';
    if (savedMode === 'dark') {
        document.body.classList.add('dark-mode');
    }

    // Logout funksiyası
    logoutBtn.addEventListener('click', async () => {
        try {
            await axios.post('http://localhost:3000/api/auth/logout');
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout failed:', error);
            showNotification('Çıxış zamanı xəta baş verdi.', false);
        }
    });

    // Navigasiya funksiyası
    function showSection(sectionId) {
        navItems.forEach(item => {
            if (item.dataset.section) {
                item.classList.remove('active');
                if (item.dataset.section === sectionId) {
                    item.classList.add('active');
                }
            }
        });
        contentSections.forEach(section => {
            section.classList.add('hidden');
            if (section.id === `${sectionId}-section`) {
                section.classList.remove('hidden');
            }
        });
        panelTitle.textContent = sectionId === 'users' ? 'İstifadəçilər' : sectionId === 'services' ? 'Xidmətlər' : 'İstifadəçi Xidmətləri';
    }

    navItems.forEach(item => {
        if (item.dataset.section) {
            item.addEventListener('click', () => {
                showSection(item.dataset.section);
                assignServiceFormContainer.classList.add('hidden');
                if (item.dataset.section === 'user-services') {
                    renderUserServicesTable();
                } else {
                    fetchData(item.dataset.section);
                }
            });
        }
    });

    // API Funksiyaları
    const showNotification = (message, isSuccess = true) => {
        notification.textContent = message;
        notification.classList.remove('hidden', 'success', 'error');
        notification.classList.add(isSuccess ? 'success' : 'error');
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 3000);
    };

    const fetchData = async (section) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/${section}`);
            const data = response.data;
            if (section === 'users') {
                allUsers = data;
                renderUsers(data);
            } else if (section === 'services') {
                allServices = data;
                renderServices(data);
            }
        } catch (error) {
            console.error(`Error fetching ${section}:`, error);
            showNotification('Məlumatlar yüklənərkən xəta baş verdi.', false);
        }
    };

    // İstifadəçi CRUD funksiyaları
    const renderUsers = (users) => {
        usersTableBody.innerHTML = '';
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${user.isAdmin ? '✅' : '❌'}</td>
                <td>${new Date(user.created_at).toLocaleDateString()}</td>
                <td>
                    <button class="edit-button" data-id="${user.id}">Redaktə</button>
                    <button class="delete-button" data-id="${user.id}">Sil</button>
                </td>
            `;
            usersTableBody.appendChild(row);
        });
    };

    addUserBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
        userForm.classList.remove('hidden');
        serviceForm.classList.add('hidden');
        modalTitle.textContent = 'Yeni İstifadəçi Yarat';
        userForm.dataset.mode = 'create';
        userForm.reset();
        document.getElementById('password').required = true;
    });

    usersTableBody.addEventListener('click', async (e) => {
        if (e.target.classList.contains('edit-button')) {
            const userId = e.target.dataset.id;
            modal.classList.remove('hidden');
            userForm.classList.remove('hidden');
            serviceForm.classList.add('hidden');
            modalTitle.textContent = 'İstifadəçini Redaktə Et';
            userForm.dataset.mode = 'update';
            userForm.dataset.id = userId;
            document.getElementById('password').required = false;

            const user = allUsers.find(u => u.id == userId);
            if (user) {
                document.getElementById('username').value = user.username;
                document.getElementById('email').value = user.email;
                document.getElementById('isAdmin').checked = user.isAdmin;
            }

        } else if (e.target.classList.contains('delete-button')) {
            if (confirm('Bu istifadəçini silmək istədiyinizə əminsiniz?')) {
                const userId = e.target.dataset.id;
                try {
                    await axios.delete(`${API_BASE_URL}/users/${userId}`);
                    showNotification('İstifadəçi uğurla silindi. 👍');
                    fetchData('users');
                } catch (error) {
                    console.error('Error deleting user:', error);
                    showNotification('İstifadəçi silinərkən xəta baş verdi.', false);
                }
            }
        }
    });

    userForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value || null;
        const password = document.getElementById('password').value;
        const isAdmin = document.getElementById('isAdmin').checked ? 1 : 0;
        const mode = userForm.dataset.mode;
        const userId = userForm.dataset.id;

        const data = { username, email, isAdmin };
        if (password) {
            data.password = password;
        }

        try {
            if (mode === 'create') {
                await axios.post(`${API_BASE_URL}/users`, { ...data, password });
                showNotification('İstifadəçi uğurla yaradıldı. ✨');
            } else if (mode === 'update') {
                await axios.put(`${API_BASE_URL}/users/${userId}`, data);
                showNotification('İstifadəçi uğurla yeniləndi. ⚙️');
            }
            modal.classList.add('hidden');
            fetchData('users');
        } catch (error) {
            console.error('Form submission error:', error);
            const errorMessage = error.response?.data?.error || 'Xəta baş verdi.';
            showNotification(errorMessage, false);
        }
    });

    // Xidmət CRUD funksiyaları
    const renderServices = (services) => {
    servicesTableBody.innerHTML = '';
    services.forEach(service => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${service.id}</td>
            <td>${service.service_name}</td>
            <td>${service.name}</td>
            <td>${service.url}</td>
            <td>${service.description || 'Yoxdur'}</td>
            <td>
                <button class="edit-button" data-id="${service.id}">Redaktə</button>
                <button class="delete-button" data-id="${service.id}">Sil</button>
            </td>
        `;
        servicesTableBody.appendChild(row);
    });
};

    addServiceBtn.addEventListener('click', () => {
    modal.classList.remove('hidden');
    serviceForm.classList.remove('hidden');
    userForm.classList.add('hidden');
    modalTitle.textContent = 'Yeni Xidmət Yarat';
    serviceForm.dataset.mode = 'create';
    serviceForm.reset();
});

    servicesTableBody.addEventListener('click', async (e) => {
    if (e.target.classList.contains('edit-button')) {
        const serviceId = e.target.dataset.id;
        modal.classList.remove('hidden');
        serviceForm.classList.remove('hidden');
        userForm.classList.add('hidden');
        modalTitle.textContent = 'Xidməti Redaktə Et';
        serviceForm.dataset.mode = 'update';
        serviceForm.dataset.id = serviceId;

        const service = allServices.find(s => s.id == serviceId);
        if (service) {
            document.getElementById('service_name').value = service.service_name;
            document.getElementById('name').value = service.name;
            document.getElementById('url').value = service.url;
            document.getElementById('description').value = service.description || '';
        }
    } else if (e.target.classList.contains('delete-button')) {
        if (confirm('Bu xidməti silmək istədiyinizə əminsiniz?')) {
            const serviceId = e.target.dataset.id;
            try {
                await axios.delete(`${API_BASE_URL}/services/${serviceId}`);
                showNotification('Xidmət uğurla silindi. 🗑️');
                fetchData('services');
            } catch (error) {
                console.error('Error deleting service:', error);
                showNotification('Xidmət silinərkən xəta baş verdi.', false);
            }
        }
    }
});

    serviceForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const service_name = document.getElementById('service_name').value;
    const name = document.getElementById('name').value;
    const url = document.getElementById('url').value;
    const description = document.getElementById('description').value;
    const mode = serviceForm.dataset.mode;
    const serviceId = serviceForm.dataset.id;

    const data = { service_name, name, url, description };

    try {
        if (mode === 'create') {
            await axios.post(`${API_BASE_URL}/services`, data);
            showNotification('Xidmət uğurla yaradıldı. ➕');
        } else if (mode === 'update') {
            await axios.put(`${API_BASE_URL}/services/${serviceId}`, data);
            showNotification('Xidmət uğurla yeniləndi. ✍️');
        }
        modal.classList.add('hidden');
        fetchData('services');
    } catch (error) {
        console.error('Form submission error:', error);
        const errorMessage = error.response?.data?.error || 'Xəta baş verdi.';
        showNotification(errorMessage, false);
    }
});

    // İstifadəçi-Xidmət funksiyaları
    const populateDropdowns = () => {
        assignUserSelect.innerHTML = '<option value="" disabled selected>İstifadəçi seçin...</option>';
        allUsers.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = user.username;
            assignUserSelect.appendChild(option);
        });

        assignServicesSelect.innerHTML = '';
        allServices.forEach(service => {
            const option = document.createElement('option');
            option.value = service.id;
            option.textContent = service.name;
            assignServicesSelect.appendChild(option);
        });
    };

    assignServiceBtn.addEventListener('click', () => {
        populateDropdowns();
        assignServiceFormContainer.classList.remove('hidden');
    });

    document.querySelector('.assignment-form-container .cancel-button').addEventListener('click', () => {
        assignServiceFormContainer.classList.add('hidden');
    });

    // admin.js faylındakı kodun düzəlişi
assignServiceForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userId = assignUserSelect.value;
    const selectedServiceIds = Array.from(assignServicesSelect.options)
                                      .filter(option => option.selected)
                                      .map(option => parseInt(option.value, 10)); // ID'ləri integer'ə çevir

    if (!userId || selectedServiceIds.length === 0) {
        showNotification('İstifadəçi və ən azı bir xidmət seçin.', false);
        return;
    }

    try {
        await axios.post(`${API_BASE_URL}/user-services/assign`, { 
            userId: parseInt(userId, 10), // userId'ni də integer'ə çevir
            serviceIds: selectedServiceIds 
        });
        
        showNotification('Xidmət(lər) istifadəçiyə uğurla təyin edildi. ✅');
        assignServiceFormContainer.classList.add('hidden');
        assignServiceForm.reset();
        renderUserServicesTable();
    } catch (error) {
        console.error('Assign service error:', error);
        const errorMessage = error.response?.data?.error || 'Xəta baş verdi.';
        showNotification(errorMessage, false);
    }
});

    userServicesTableBody.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-button')) {
            if (confirm('Bu xidməti istifadəçidən silmək istədiyinizə əminsiniz?')) {
                const userId = e.target.dataset.userId;
                const serviceId = e.target.dataset.serviceId;
                try {
                    await axios.post(`${API_BASE_URL}/user-services/remove`, { userId, serviceId });
                    showNotification('Xidmət istifadəçidən uğurla silindi. ❌');
                    renderUserServicesTable();
                } catch (error) {
                    console.error('Remove service error:', error);
                    showNotification('Xidmət silinərkən xəta baş verdi.', false);
                }
            }
        }
    });

    const renderUserServicesTable = async () => {
        // Bu funksiya üçün API-nizdə `GET /user-services` endpoint-i olmalıdır.
        // Təqdim etdiyin kodda bu yoxdur, ona görə də fərziyyə olaraq bu endpoint-in mövcudluğunu qəbul edirəm.
        // Əgər yoxdursa, müvafiq kodu server tərəfdə əlavə etməlisiniz.
        try {
            const userServicesResponse = await axios.get(`${API_BASE_URL}/user-services`);
            const userServices = userServicesResponse.data;
            
            userServicesTableBody.innerHTML = '';
            userServices.forEach(item => {
                const user = allUsers.find(u => u.id === item.user_id);
                const service = allServices.find(s => s.id === item.service_id);
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.user_id}</td>
                    <td>${user ? user.username : 'Naməlum'}</td>
                    <td>${item.service_id}</td>
                    <td>${service ? service.service_name : 'Naməlum'}</td>
                    <td>
                        <button class="delete-button" data-user-id="${item.user_id}" data-service-id="${item.service_id}">Sil</button>
                    </td>
                `;
                userServicesTableBody.appendChild(row);
            });
        } catch (error) {
            console.error("Error fetching user services:", error);
            showNotification("İstifadəçi xidmətləri yüklənərkən xəta baş verdi.", false);
        }
    };

    // Modal Bağlama
    closeButton.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });

    // Səhifə yüklənəndə ilkin məlumatları gətir
    const init = async () => {
        // Dropdownlar üçün bütün istifadəçilər və xidmətləri əvvəlcədən yükləyirik
        try {
            await Promise.all([
                fetchData('users'),
                fetchData('services')
            ]);
            showSection('users');
            renderUserServicesTable();
        } catch (error) {
            console.error('Initial data load failed:', error);
            showNotification('Səhifə ilkin məlumatları yükləyə bilmədi.', false);
        }
    };

    init();
});