// Registration Form Handler - Dedicated for register.html page only

document.addEventListener('DOMContentLoaded', function() {
    // Only run on register page
    if (!window.location.pathname.includes('register.html')) {
        return;
    }

    initializeRegistration();
});

function initializeRegistration() {
    // Get the specific registration submit button
    const registerButton = document.querySelector('.btn-content button.register');
    
    if (!registerButton) {
        console.log('Register button not found');
        return;
    }

    // Remove any existing listeners that might have been added
    const newButton = registerButton.cloneNode(true);
    registerButton.parentNode.replaceChild(newButton, registerButton);

    // Add our clean event listener
    newButton.addEventListener('click', handleRegistrationSubmit);

    console.log('Registration handler initialized');
}

async function handleRegistrationSubmit(e) {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Registration submit clicked');

    // Get form inputs
    const nameInput = document.querySelector('input[name="name"]');
    const surnameInput = document.querySelector('input[name="surname"]');
    const emailInput = document.querySelector('input[name="email"]');
    const mobileInput = document.querySelector('input[name="mobile"]');
    const usernameInput = document.querySelector('input[name="username"]');
    const passwordInput = document.querySelector('input[name="password"]');
    const repasswordInput = document.querySelector('input[name="repassword"]');
    const agreeCheckbox = document.querySelector('.agreement input[type="checkbox"]');
    
    // Get birth date values
    const daySelect = document.getElementById('birth-day');
    const monthSelect = document.getElementById('birth-month');
    const yearSelect = document.getElementById('birth-year');
    
    // Get values
    const name = nameInput?.value?.trim();
    const surname = surnameInput?.value?.trim();
    const email = emailInput?.value?.trim();
    const mobile = mobileInput?.value?.trim();
    const username = usernameInput?.value?.trim();
    const password = passwordInput?.value?.trim();
    const repassword = repasswordInput?.value?.trim();
    const birthDay = daySelect?.value;
    const birthMonth = monthSelect?.value;
    const birthYear = yearSelect?.value;

    // Validation
    if (!name || !surname || !email || !mobile || !username || !password || !repassword) {
        alert('Zəhmət olmasa bütün xanaları doldurun');
        return;
    }

    if (!birthDay || !birthMonth || !birthYear) {
        alert('Zəhmət olmasa doğum tarixini seçin');
        return;
    }

    if (password !== repassword) {
        alert('Şifrələr eyni deyil');
        return;
    }

    if (!agreeCheckbox?.checked) {
        alert('Zəhmət olmasa qaydalar və şərtləri qəbul edin');
        return;
    }

    if (password.length < 6) {
        alert('Şifrə ən azı 6 simvoldan ibarət olmalıdır');
        return;
    }

    // Check age (must be 18+)
    const birthDate = new Date(birthYear, birthMonth - 1, birthDay);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    if (age < 18) {
        alert('Qeydiyyat üçün ən azı 18 yaşında olmalısınız');
        return;
    }

    // Get country code
    const countryCode = document.querySelector('select[name="countryCode"]')?.value || '+994';
    const fullMobile = countryCode + mobile;

    // Format birth date
    const formattedBirthDate = `${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`;

    try {
        const API_BASE_URL = window.API_BASE_URL || 'http://localhost:5000/api';
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                password,
                name,
                surname,
                email,
                mobile: fullMobile,
                birthDate: formattedBirthDate
            })
        });

        const data = await response.json();

        if (data.success) {
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('isAuth', 'true');
            
            alert('Qeydiyyat uğurlu oldu! Ana səhifəyə yönləndirilirsiniz.');
            setTimeout(() => {
                window.location.href = './index.html';
            }, 1000);
        } else {
            alert(data.message || 'Qeydiyyat zamanı xəta baş verdi');
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('Serverlə əlaqə zamanı xəta baş verdi');
    }
}