document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('.form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const rememberCheckbox = document.querySelector('input[name="remember"]');
    const togglePassword = document.getElementById('togglePassword');
    
    // Elements for Google Modal
    const googleBtn = document.querySelector('.btn-google');
    const googleModal = document.getElementById('googleModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const accountListContainer = document.getElementById('accountListContainer');

    // 1. Password Toggle
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function () {
            const isPassword = passwordInput.getAttribute('type') === 'password';
            passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
            this.classList.toggle('fa-eye-slash');
            this.classList.toggle('fa-eye');
        });
    }

    // 2. Remember Me Auto-fill
    if (localStorage.getItem('savedEmail') && emailInput && rememberCheckbox) {
        emailInput.value = localStorage.getItem('savedEmail');
        rememberCheckbox.checked = true;
    }

    // Helper for inline error messages instead of alert()
    function showInlineError(inputElement, message) {
        let existingError = inputElement.parentElement.parentElement.querySelector('.error-text');
        if (!existingError) {
            const errorSpan = document.createElement('span');
            errorSpan.className = 'error-text';
            errorSpan.innerText = message;
            inputElement.parentElement.parentElement.appendChild(errorSpan);
        } else {
            existingError.innerText = message;
        }
    }

    function clearInlineError(inputElement) {
        const existingError = inputElement.parentElement.parentElement.querySelector('.error-text');
        if (existingError) existingError.remove();
    }

    // 3. Form Submit Validation
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            let isValid = true;
            const emailValue = emailInput.value.trim();
            const passwordValue = passwordInput.value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(emailValue)) {
                showInlineError(emailInput, 'Please enter a valid email address.');
                isValid = false;
            } else {
                clearInlineError(emailInput);
            }

            if (passwordValue === '') {
                showInlineError(passwordInput, 'Password cannot be empty.');
                isValid = false;
            } else {
                clearInlineError(passwordInput);
            }

            if (isValid) {
                if (rememberCheckbox && rememberCheckbox.checked) {
                    localStorage.setItem('savedEmail', emailValue);
                } else {
                    localStorage.removeItem('savedEmail');
                }
                localStorage.setItem('userLoggedIn', 'true');
                window.location.href = 'dashboard.html';
            }
        });
    }

    // 4. Real-world Google Account Selector Modal Logic
    if (googleBtn && googleModal) {
        const mockAccounts = [
            "john.doe@gmail.com",
            "nexora.user@gmail.com",
            "developer.alex@gmail.com"
        ];

        googleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            accountListContainer.innerHTML = '';

            // Populate mock accounts into the modal list
            mockAccounts.forEach(account => {
                const item = document.createElement('div');
                item.className = 'account-item';
                item.innerHTML = `<i class="fa-solid fa-circle-user"></i><span>${account}</span>`;
                item.addEventListener('click', () => {
                    localStorage.setItem('savedEmail', account);
                    localStorage.setItem('userLoggedIn', 'true');
                    window.location.href = 'dashboard.html';
                });
                accountListContainer.appendChild(item);
            });

            // Option to use another account
            const customItem = document.createElement('div');
            customItem.className = 'account-item';
            customItem.style.borderTop = '1px solid rgba(255,255,255,0.1)';
            customItem.style.marginTop = '8px';
            customItem.innerHTML = `<i class="fa-solid fa-plus"></i><span>Use another account</span>`;
            customItem.addEventListener('click', () => {
                const customEmail = prompt('Enter your Google email:'); // Or replace with a custom input field
                if (customEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customEmail.trim())) {
                    localStorage.setItem('savedEmail', customEmail.trim());
                    localStorage.setItem('userLoggedIn', 'true');
                    window.location.href = 'dashboard.html';
                } else if (customEmail) {
                    alert('Invalid email format.');
                }
            });
            accountListContainer.appendChild(customItem);

            googleModal.style.display = 'flex';
        });

        closeModalBtn.addEventListener('click', () => {
            googleModal.style.display = 'none';
        });
    }
});

/* =================================
   GLOBAL PROFILE SYNC (RUNS ON ALL PAGES)
================================= */
document.addEventListener("DOMContentLoaded", () => {
    applyGlobalProfileToHeader();

    // Listen for storage updates across tabs/pages
    window.addEventListener("storage", (e) => {
        if (["nexora_user_name", "nexoraUserName", "nexora_user_photo"].includes(e.key)) {
            applyGlobalProfileToHeader();
        }
    });

    // Listen for custom dispatch events within the app session
    window.addEventListener("nexoraProfileUpdated", () => {
        applyGlobalProfileToHeader();
    });
});

function applyGlobalProfileToHeader() {
    const savedName = localStorage.getItem("nexora_user_name") || localStorage.getItem("nexoraUserName") || "Alex Reed";
    const savedPhoto = localStorage.getItem("nexora_user_photo");

    // 1. Update Username in Header
    const userHeaderNames = document.querySelectorAll('.user-info strong');
    userHeaderNames.forEach(el => {
        el.textContent = savedName;
    });

    // 2. Calculate Initials (e.g., "ekta" -> "EK")
    const nameParts = savedName.trim().split(" ").filter(p => p.length > 0);
    let initials = nameParts[0] ? nameParts[0][0].toUpperCase() : "A";
    if (nameParts.length > 1) {
        initials += nameParts[nameParts.length - 1][0].toUpperCase();
    } else if (nameParts[0] && nameParts[0].length > 1) {
        initials = nameParts[0].slice(0, 2).toUpperCase();
    }

    // 3. Update Header Avatar across Dashboard, Tasks, Analytics, Calendar, etc.
    const avatars = document.querySelectorAll("#headerAvatar, .user-avatar, .header-avatar");
    avatars.forEach(avatarElement => {
        if (savedPhoto) {
            avatarElement.style.backgroundImage = `url(${savedPhoto})`;
            avatarElement.style.backgroundSize = "cover";
            avatarElement.style.backgroundPosition = "center";
            avatarElement.textContent = "";
        } else {
            avatarElement.style.backgroundImage = "none";
            avatarElement.textContent = initials;
        }
    });
}