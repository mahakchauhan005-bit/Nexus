document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const fullNameInput = document.getElementById('fullname');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');

    // Elements for Google Modal
    const googleSignupBtn = document.getElementById('googleSignupBtn');
    const googleModal = document.getElementById('googleModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const accountListContainer = document.getElementById('accountListContainer');

    // 1. Password Toggle Logic
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function () {
            const isPassword = passwordInput.getAttribute('type') === 'password';
            passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
            this.classList.toggle('fa-eye-slash');
            this.classList.toggle('fa-eye');
        });
    }

    // Helper for inline error messages instead of alerts
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

    // 2. Sign Up Form Submission & Validation
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            let isValid = true;

            const fullNameValue = fullNameInput.value.trim();
            const emailValue = emailInput.value.trim();
            const passwordValue = passwordInput.value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (fullNameValue === '') {
                showInlineError(fullNameInput, 'Full name cannot be empty.');
                isValid = false;
            } else {
                clearInlineError(fullNameInput);
            }

            if (!emailRegex.test(emailValue)) {
                showInlineError(emailInput, 'Please enter a valid email address.');
                isValid = false;
            } else {
                clearInlineError(emailInput);
            }

            if (passwordValue.length < 6) {
                showInlineError(passwordInput, 'Password must be at least 6 characters long.');
                isValid = false;
            } else {
                clearInlineError(passwordInput);
            }

            if (isValid) {
                localStorage.setItem('savedEmail', emailValue);
                localStorage.setItem('userName', fullNameValue);
                localStorage.setItem('userLoggedIn', 'true');
                
                window.location.href = 'dashboard.html';
            }
        });
    }

    // 3. Real-world Google Sign-Up Modal Logic
    if (googleSignupBtn && googleModal) {
        const mockAccounts = [
            "john.doe@gmail.com",
            "nexora.user@gmail.com",
            "developer.alex@gmail.com"
        ];

        googleSignupBtn.addEventListener('click', (e) => {
            e.preventDefault();
            accountListContainer.innerHTML = '';

            // Populate mock accounts into the modal list
            mockAccounts.forEach(account => {
                const item = document.createElement('div');
                item.className = 'account-item';
                item.innerHTML = `<i class="fa-solid fa-circle-user"></i><span>${account}</span>`;
                item.addEventListener('click', () => {
                    localStorage.setItem('savedEmail', account);
                    localStorage.setItem('userName', account.split('@')[0]); // Fallback name from email
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
                const customEmail = prompt('Enter your Google email:');
                if (customEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customEmail.trim())) {
                    localStorage.setItem('savedEmail', customEmail.trim());
                    localStorage.setItem('userName', customEmail.split('@')[0]);
                    localStorage.setItem('userLoggedIn', 'true');
                    window.location.href = 'dashboard.html';
                } else if (customEmail) {
                    alert('Invalid email format.');
                }
            });
            accountListContainer.appendChild(customItem);

            googleModal.style.display = 'flex';
        });

        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => {
                googleModal.style.display = 'none';
            });
        }
    }
});