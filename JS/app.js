/* =================================
   NEXUS APP
================================= */

document.addEventListener("DOMContentLoaded", function () {

    // Get saved user name
    const userName = localStorage.getItem("nexusUserName");

    console.log("NEXUS loaded");

    if (userName) {
        console.log("Welcome back, " + userName);
    }

});

// ==========================================
// 1. GLOBAL THEME HANDLER (Runs on ALL Pages)
// ==========================================

function applyTheme(theme) {
    document.body.classList.remove('light-theme', 'dark-theme');

    if (theme === 'light') {
        document.body.classList.add('light-theme');
    } else if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        // System preference check
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (!prefersDark) {
            document.body.classList.add('light-theme');
        }
    }

    localStorage.setItem('nexora_theme', theme);
}

// Initialize theme immediately when app.js loads on any page
(function () {
    const savedTheme = localStorage.getItem('nexora_theme') || 'system';
    applyTheme(savedTheme);
})();

// Listen for live OS system theme changes if set to "system"
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const savedTheme = localStorage.getItem('nexora_theme');
    if (savedTheme === 'system' || !savedTheme) {
        if (!e.matches) {
            document.body.classList.add('light-theme');
        } else {
            document.body.classList.remove('light-theme');
        }
    }
});


// ==========================================
// 2. HELPER FUNCTIONS
// ==========================================

// Toast Notification (Auto-removes after 2 seconds)
function showToast(message) {
    let container = document.getElementById('toast-container');
    
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fade-out');
        toast.addEventListener('animationend', () => toast.remove());
    }, 2000);
}

// Extract Initials from Full Name
function getInitials(name) {
    if (!name || !name.trim()) return '';
    const parts = name.trim().split(' ').filter(p => p.length > 0);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Update Profile Initials & Header Name
function updateUIProfile(name) {
    const avatarElement = document.querySelector('.large-avatar');
    const avatarInitials = document.getElementById('avatarInitials');
    const headerAvatar = document.getElementById('headerAvatar');
    const userHeaderName = document.querySelector('.user-info strong');

    const initials = getInitials(name);
    if (initials) {
        if (avatarElement) avatarElement.textContent = initials;
        if (avatarInitials) avatarInitials.textContent = initials;
        if (headerAvatar && !headerAvatar.style.backgroundImage) {
            headerAvatar.textContent = initials;
        }
    }
    if (userHeaderName && name.trim()) {
        userHeaderName.textContent = name;
    }
}


// ==========================================
// 3. DOM LOADED EVENT LISTENERS (Settings & Interactive UI)
// ==========================================

document.addEventListener('DOMContentLoaded', () => {

    // --- Theme Selector Buttons (Settings Page) ---
    const themeButtons = document.querySelectorAll('.theme-card, .theme-option');
    const savedTheme = localStorage.getItem('nexora_theme') || 'system';

    themeButtons.forEach(button => {
        const buttonText = button.textContent.trim().toLowerCase();
        if (buttonText.includes(savedTheme)) {
            themeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        }

        button.addEventListener('click', () => {
            themeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const selectedText = button.textContent.trim().toLowerCase();
            if (selectedText.includes('light')) applyTheme('light');
            else if (selectedText.includes('dark')) applyTheme('dark');
            else applyTheme('system');

            showToast(`Theme changed to ${button.textContent.trim()}`);
        });
    });

    // --- Profile Form Input & Live Initials ---
    const fullNameInput = document.querySelector('#fullName');
    const savedName = localStorage.getItem('nexora_user_name');
    
    if (savedName && fullNameInput) {
        fullNameInput.value = savedName;
        updateUIProfile(savedName);
    }

    if (fullNameInput) {
        fullNameInput.addEventListener('input', (e) => {
            updateUIProfile(e.target.value);
        });
    }

    // --- Profile Form Save ---
    const profileForm = document.querySelector('.profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const fullName = fullNameInput ? fullNameInput.value : '';
            updateUIProfile(fullName);
            localStorage.setItem('nexora_user_name', fullName);
            showToast("Profile settings saved successfully!");
        });
    }

    // --- Photo Upload Handling ---
    const photoUploadInput = document.getElementById('photoUpload');
    const avatarImg = document.getElementById('avatarImage');
    const avatarInitials = document.getElementById('avatarInitials');
    const headerAvatar = document.getElementById('headerAvatar');

    const savedPhoto = localStorage.getItem('nexora_user_photo');
    if (savedPhoto) {
        if (avatarImg) {
            avatarImg.src = savedPhoto;
            avatarImg.style.display = 'block';
        }
        if (avatarInitials) avatarInitials.style.display = 'none';
        if (headerAvatar) {
            headerAvatar.style.backgroundImage = `url(${savedPhoto})`;
            headerAvatar.style.backgroundSize = 'cover';
            headerAvatar.style.backgroundPosition = 'center';
            headerAvatar.textContent = '';
        }
    }

    if (photoUploadInput) {
        photoUploadInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const imageUrl = e.target.result;
                    if (avatarImg) {
                        avatarImg.src = imageUrl;
                        avatarImg.style.display = 'block';
                    }
                    if (avatarInitials) avatarInitials.style.display = 'none';
                    if (headerAvatar) {
                        headerAvatar.style.backgroundImage = `url(${imageUrl})`;
                        headerAvatar.style.backgroundSize = 'cover';
                        headerAvatar.style.backgroundPosition = 'center';
                        headerAvatar.textContent = '';
                    }
                    localStorage.setItem('nexora_user_photo', imageUrl);
                    showToast("Profile photo updated!");
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // --- Notification Toggles ---
    const toggleSwitches = document.querySelectorAll('.switch input');
    toggleSwitches.forEach(input => {
        input.addEventListener('change', (e) => {
            const toggleItem = e.target.closest('.toggle-item');
            const settingTitle = toggleItem ? toggleItem.querySelector('.toggle-info strong').textContent : 'Setting';
            showToast(`${settingTitle} ${e.target.checked ? 'enabled' : 'disabled'}`);
        });
    });

    // --- Workspace Form Save ---
    const workspaceForm = document.querySelector('.workspace-form');
    if (workspaceForm) {
        workspaceForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showToast("Workspace preferences updated!");
        });
    }

});