// ==========================================
// HELPER FUNCTIONS
// ==========================================

/* =================================
   NEXORA CALENDAR & NOTIFICATIONS
================================= */

document.addEventListener("DOMContentLoaded", () => {
    initCalendarNotifications();
    initGlobalProfileSync(); // Sync name & photo on load across all pages
});

// Listen for profile changes from other open tabs/windows
window.addEventListener("storage", (e) => {
    if (e.key === "nexora_user_name" || e.key === "nexoraUserName") {
        updateUIProfile(e.newValue || "Alex Reed");
    }
    if (e.key === "nexora_user_photo") {
        updateUIProfilePhoto(e.newValue);
    }
});

// Listen for custom profile update events within the same workspace session
window.addEventListener("nexoraProfileUpdated", (e) => {
    if (e.detail) {
        if (e.detail.name) updateUIProfile(e.detail.name);
        if (e.detail.photo !== undefined) updateUIProfilePhoto(e.detail.photo);
    }
});

function getCalendarEvents() {
    const savedEvents = localStorage.getItem("nexoraCalendarEvents");
    if (!savedEvents) return [];
    try {
        return JSON.parse(savedEvents);
    } catch (error) {
        return [];
    }
}

function initCalendarNotifications() {
    const tasks = JSON.parse(localStorage.getItem("nexoraTasks")) || JSON.parse(localStorage.getItem("nexora_tasks")) || [];
    const events = getCalendarEvents();
    const todayStr = new Date().toISOString().split("T")[0];

    const dueTodayTasks = tasks.filter(t => t.dueDate === todayStr && t.status !== "completed");
    const overdueTasks = tasks.filter(t => t.dueDate && t.dueDate < todayStr && t.status !== "completed");
    const activeEvents = events.filter(e => e.date >= todayStr && e.completed !== true);

    const notificationBtn = document.querySelector(".notification-btn, .notification");
    if (notificationBtn) {
        let badge = notificationBtn.querySelector(".notification-badge");
        const alertCount = dueTodayTasks.length + overdueTasks.length + activeEvents.length;

        if (alertCount > 0) {
            if (!badge) {
                badge = document.createElement("span");
                badge.className = "notification-badge";
                badge.style.cssText = `
                    position: absolute !important;
                    top: 2px !important;
                    right: 2px !important;
                    background: #FF4D4D !important;
                    color: white !important;
                    font-size: 0.65rem !important;
                    font-weight: bold !important;
                    padding: 2px 5px !important;
                    border-radius: 50% !important;
                    line-height: 1 !important;
                    z-index: 9999 !important;
                    pointer-events: none !important;
                `;
                notificationBtn.style.position = "relative";
                notificationBtn.appendChild(badge);
            }
            badge.textContent = alertCount === 1 ? "1" : "1+";
        } else if (badge) {
            badge.remove();
        }

        notificationBtn.onclick = (e) => {
            e.stopPropagation();
            toggleNotificationDropdown(dueTodayTasks, overdueTasks, activeEvents);
        };
    }
}

/* =================================
   NOTIFICATION DROPDOWN PANEL
================================= */
function toggleNotificationDropdown(dueToday, overdue, events) {
    let dropdown = document.getElementById("calendarNotificationDropdown");

    if (dropdown) {
        dropdown.remove();
        return;
    }

    dropdown = document.createElement("div");
    dropdown.id = "calendarNotificationDropdown";
    dropdown.style.cssText = `
        position: absolute;
        top: 60px;
        right: 20px;
        width: 340px;
        max-height: 400px;
        overflow-y: auto;
        background: var(--surface, #181D24);
        border: 1px solid var(--border, #2A323D);
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.4);
        padding: 16px;
        z-index: 1000;
        color: var(--text, #F8FAFC);
    `;

    let html = `<h4 style="margin-bottom: 12px; font-size: 0.95rem; display: flex; align-items: center; justify-content: space-between;">
                    <span>Notifications</span>
                    <small style="color: var(--text-muted); font-weight: normal;">Tasks & Events</small>
                </h4>`;

    const totalAlerts = dueToday.length + overdue.length + (events ? events.length : 0);

    if (totalAlerts === 0) {
        html += `<p style="font-size: 0.85rem; color: var(--text-muted); text-align: center; padding: 10px 0;">No pending alerts for today!</p>`;
    } else {
        html += `<div style="max-height: 250px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px;">`;

        overdue.forEach(task => {
            html += `
                <div style="padding: 10px; background: rgba(255, 77, 77, 0.1); border-left: 3px solid #FF4D4D; border-radius: 6px;">
                    <strong style="display: block; font-size: 0.85rem; color: #FF4D4D;">Overdue: ${task.title || "Untitled Task"}</strong>
                    <small style="color: var(--text-muted); font-size: 0.75rem;">Due date was ${task.dueDate} • ${task.project || "General"}</small>
                </div>
            `;
        });

        dueToday.forEach(task => {
            html += `
                <div style="padding: 10px; background: rgba(245, 185, 66, 0.1); border-left: 3px solid #F5B942; border-radius: 6px;">
                    <strong style="display: block; font-size: 0.85rem; color: #F5B942;">Due Today: ${task.title || "Untitled Task"}</strong>
                    <small style="color: var(--text-muted); font-size: 0.75rem;">Scheduled for today • ${task.project || "General"}</small>
                </div>
            `;
        });

        if (events) {
            events.forEach(event => {
                html += `
                    <div style="padding: 10px; background: rgba(124, 92, 252, 0.1); border-left: 3px solid #7C5CFC; border-radius: 6px;">
                        <strong style="display: block; font-size: 0.85rem; color: #9B82FF;">Event: ${event.title || event.name || "Untitled Event"}</strong>
                        <small style="color: var(--text-muted); font-size: 0.75rem;">Date: ${event.date} ${event.time ? "at " + event.time : ""}</small>
                    </div>
                `;
            });
        }

        html += `</div>`;
    }

    dropdown.innerHTML = html;
    document.body.appendChild(dropdown);

    setTimeout(() => {
        document.addEventListener("click", function closeMenu(e) {
            if (!dropdown.contains(e.target) && !e.target.closest(".notification-btn, .notification")) {
                dropdown.remove();
                document.removeEventListener("click", closeMenu);
            }
        });
    }, 100);
}

// 2. Extract Initials from Full Name
function getInitials(name) {
    if (!name || !name.trim()) return 'AR';
    const nameParts = name.trim().split(' ').filter(part => part.length > 0);
    if (nameParts.length === 1) {
        return nameParts[0].slice(0, 2).toUpperCase();
    }
    return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
}

// 3. Global Profile Init & Updaters
function initGlobalProfileSync() {
    const savedName = localStorage.getItem("nexora_user_name") || localStorage.getItem("nexoraUserName") || "Alex Reed";
    const savedPhoto = localStorage.getItem("nexora_user_photo");

    updateUIProfile(savedName);
    if (savedPhoto) {
        updateUIProfilePhoto(savedPhoto);
    }
}

function updateUIProfile(name) {
    const fullNameInput = document.querySelector('#fullName');
    if (fullNameInput && fullNameInput.value !== name) {
        fullNameInput.value = name;
    }

    // Update Header Name
    const userHeaderNames = document.querySelectorAll('.user-info strong, .welcome-card h2');
    userHeaderNames.forEach(el => {
        if (el.tagName === "H2") {
            const firstName = name.trim().split(" ")[0];
            el.textContent = `Welcome back, ${firstName}.`;
        } else {
            el.textContent = name;
        }
    });

    // Update Initials where photo is absent
    const initials = getInitials(name);
    const avatarInitials = document.getElementById('avatarInitials');
    if (avatarInitials) avatarInitials.textContent = initials;

    const largeAvatar = document.querySelector('.large-avatar');
    if (largeAvatar && !localStorage.getItem('nexora_user_photo')) {
        largeAvatar.textContent = initials;
    }

    const headerAvatar = document.getElementById('headerAvatar') || document.querySelector('.user-avatar');
    if (headerAvatar && !headerAvatar.style.backgroundImage) {
        headerAvatar.textContent = initials;
    }
}

function updateUIProfilePhoto(photoUrl) {
    const avatarImg = document.getElementById('avatarImage');
    const avatarInitials = document.getElementById('avatarInitials');
    const headerAvatar = document.getElementById('headerAvatar') || document.querySelector('.user-avatar');

    if (photoUrl) {
        if (avatarImg) {
            avatarImg.src = photoUrl;
            avatarImg.style.display = 'block';
        }
        if (avatarInitials) {
            avatarInitials.style.display = 'none';
        }
        if (headerAvatar) {
            headerAvatar.style.backgroundImage = `url(${photoUrl})`;
            headerAvatar.style.backgroundSize = 'cover';
            headerAvatar.style.backgroundPosition = 'center';
            headerAvatar.textContent = '';
        }
    } else {
        if (avatarImg) avatarImg.style.display = 'none';
        if (avatarInitials) avatarInitials.style.display = 'flex';
    }
}

// 4. Apply Selected Theme
function applyTheme(theme) {
    document.body.classList.remove('light-theme', 'dark-theme');

    if (theme === 'light') {
        document.body.classList.add('light-theme');
    } else if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (!prefersDark) {
            document.body.classList.add('light-theme');
        }
    }
    localStorage.setItem('nexora_theme', theme);
}


// ==========================================
// MAIN DOM INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {

    // --------------------------------------
    // 1. Theme Management
    // --------------------------------------
    const themeButtons = document.querySelectorAll('.theme-card, .theme-option');
    const savedTheme = localStorage.getItem('nexora_theme') || 'system';

    applyTheme(savedTheme);

    themeButtons.forEach(button => {
        const buttonText = button.textContent.trim().toLowerCase();
        
        if (buttonText.includes(savedTheme)) {
            themeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        }

        button.addEventListener('click', () => {
            themeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const selectedTheme = button.textContent.trim().toLowerCase();
            
            if (selectedTheme.includes('light')) applyTheme('light');
            else if (selectedTheme.includes('dark')) applyTheme('dark');
            else applyTheme('system');

            if (typeof showToast === "function") showToast(`Theme changed to ${button.textContent.trim()}`);
        });
    });

    // --------------------------------------
    // 2. Profile Name Input & Dynamic Preview
    // --------------------------------------
    const fullNameInput = document.querySelector('#fullName');
    const savedName = localStorage.getItem('nexora_user_name') || localStorage.getItem('nexoraUserName');
    if (savedName) {
        if (fullNameInput) fullNameInput.value = savedName;
        updateUIProfile(savedName);
    }

    if (fullNameInput) {
        fullNameInput.addEventListener('input', (e) => {
            updateUIProfile(e.target.value);
        });
    }

    // --------------------------------------
    // 3. Profile Form Submission
    // --------------------------------------
    const profileForm = document.querySelector('.profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const fullName = fullNameInput ? fullNameInput.value.trim() : '';
            if (fullName) {
                localStorage.setItem('nexora_user_name', fullName);
                localStorage.setItem('nexoraUserName', fullName);
                updateUIProfile(fullName);

                // Dispatch global event for instant cross-tab & cross-module sync
                window.dispatchEvent(new CustomEvent("nexoraProfileUpdated", { detail: { name: fullName } }));
            }

            if (typeof showToast === "function") showToast("Profile settings saved successfully!");
        });
    }

    // --------------------------------------
    // 4. Photo Upload Handling
    // --------------------------------------
    const photoUploadInput = document.getElementById('photoUpload');
    const savedPhoto = localStorage.getItem('nexora_user_photo');
    if (savedPhoto) {
        updateUIProfilePhoto(savedPhoto);
    }

    if (photoUploadInput) {
        photoUploadInput.addEventListener('change', (event) => {
            const file = event.target.files[0];

            if (file) {
                const reader = new FileReader();

                reader.onload = (e) => {
                    const imageUrl = e.target.result;

                    updateUIProfilePhoto(imageUrl);
                    localStorage.setItem('nexora_user_photo', imageUrl);

                    // Dispatch global event for instant photo sync
                    window.dispatchEvent(new CustomEvent("nexoraProfileUpdated", { detail: { photo: imageUrl } }));

                    if (typeof showToast === "function") showToast("Profile photo updated!");
                };

                reader.readAsDataURL(file);
            }
        });
    }

    // --------------------------------------
    // 5. Interactive Notification Switches
    // --------------------------------------
    const toggleSwitches = document.querySelectorAll('.switch input');
    toggleSwitches.forEach(input => {
        input.addEventListener('change', (e) => {
            const toggleItem = e.target.closest('.toggle-item');
            const settingTitle = toggleItem ? toggleItem.querySelector('.toggle-info strong').textContent : 'Setting';
            const isChecked = e.target.checked;

            if (typeof showToast === "function") showToast(`${settingTitle} ${isChecked ? 'enabled' : 'disabled'}`);
        });
    });

    // --------------------------------------
    // 6. Workspace Form Submission
    // --------------------------------------
    const workspaceForm = document.querySelector('.workspace-form');
    if (workspaceForm) {
        workspaceForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (typeof showToast === "function") showToast("Workspace preferences updated!");
        });
    }
});