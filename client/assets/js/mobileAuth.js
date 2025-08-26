// Mobile Authentication Handler

document.addEventListener('DOMContentLoaded', function() {
    initializeMobileAuth();
});

function initializeMobileAuth() {
    // Create mobile login modal
    createMobileLoginModal();
    
    // Setup mobile navbar buttons
    setupMobileButtons();
}

function createMobileLoginModal() {
    const modalHTML = `
        <div id="mobile-login-modal" class="mobile-login-modal" style="display: none;">
            <div class="mobile-login-content">
                <div class="mobile-login-header">
                    <h3>Daxil ol</h3>
                    <button class="close-modal" id="close-mobile-login">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
                <div class="mobile-login-body">
                    <form id="mobile-login-form">
                        <div class="input-group">
                            <input 
                                type="text" 
                                id="mobile-username" 
                                placeholder="İstifadəçi adı"
                                required
                            />
                        </div>
                        <div class="input-group">
                            <input 
                                type="password" 
                                id="mobile-password" 
                                placeholder="Şifrə"
                                required
                            />
                        </div>
                        <div class="forgot-link">
                            <a href="#">Şifrəmi Unutdum</a>
                        </div>
                        <button type="submit" class="btn-submit">Daxil ol</button>
                    </form>
                    <div class="register-link">
                        Hesabınız yoxdur? 
                        <a href="./register.html">Qeydiyyatdan keç</a>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal styles
    const styles = `
        <style>
            .mobile-login-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10001;
                padding: 20px;
            }
            
            .mobile-login-content {
                background: #fff;
                border-radius: 12px;
                width: 100%;
                max-width: 400px;
                padding: 0;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            }
            
            .mobile-login-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid #eee;
            }
            
            .mobile-login-header h3 {
                margin: 0;
                color: #333;
                font-size: 20px;
            }
            
            .close-modal {
                background: none;
                border: none;
                font-size: 24px;
                color: #999;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .close-modal:hover {
                color: #333;
            }
            
            .mobile-login-body {
                padding: 20px;
            }
            
            .mobile-login-body .input-group {
                margin-bottom: 15px;
            }
            
            .mobile-login-body input {
                width: 100%;
                padding: 12px 15px;
                border: 1px solid #ddd;
                border-radius: 8px;
                font-size: 16px;
                transition: border-color 0.3s;
            }
            
            .mobile-login-body input:focus {
                outline: none;
                border-color: #ffd43b;
                box-shadow: 0 0 0 3px rgba(255, 212, 59, 0.1);
            }
            
            .forgot-link {
                text-align: right;
                margin-bottom: 20px;
            }
            
            .forgot-link a {
                color: #666;
                text-decoration: none;
                font-size: 14px;
            }
            
            .forgot-link a:hover {
                color: #ffd43b;
            }
            
            .btn-submit {
                width: 100%;
                padding: 12px;
                background: linear-gradient(135deg, #ffd43b 0%, #ffbe0b 100%);
                color: #333;
                border: none;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: transform 0.2s, box-shadow 0.2s;
            }
            
            .btn-submit:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(255, 212, 59, 0.4);
            }
            
            .register-link {
                text-align: center;
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                color: #666;
                font-size: 14px;
            }
            
            .register-link a {
                color: #ffd43b;
                text-decoration: none;
                font-weight: 600;
            }
            
            .register-link a:hover {
                text-decoration: underline;
            }
            
            @media (max-width: 480px) {
                .mobile-login-modal {
                    padding: 10px;
                }
                
                .mobile-login-content {
                    max-width: 100%;
                }
            }
        </style>
    `;
    
    // Add to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.head.insertAdjacentHTML('beforeend', styles);
}

function setupMobileButtons() {
    // Use event delegation for dynamic content
    document.addEventListener('click', function(e) {
        // Handle mobile register buttons
        if (e.target.closest('.mobile-part .btn-register')) {
            e.preventDefault();
            window.location.href = './register.html';
        }
        
        // Handle mobile login buttons
        if (e.target.closest('.mobile-part .btn-login')) {
            e.preventDefault();
            showMobileLoginModal();
        }
        
        // Handle sidebar register buttons
        if (e.target.closest('.nav-aside .btn-register')) {
            e.preventDefault();
            window.location.href = './register.html';
        }
        
        // Handle sidebar login buttons
        if (e.target.closest('.nav-aside .btn-login')) {
            e.preventDefault();
            // Close sidebar
            const overlay = document.querySelector('.overlay');
            const navAside = document.querySelector('.nav-aside');
            if (overlay) overlay.classList.remove('active');
            if (navAside) navAside.classList.remove('active');
            
            // Show login modal
            showMobileLoginModal();
        }
    });
    
    // Setup modal close button
    const closeBtn = document.getElementById('close-mobile-login');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeMobileLoginModal);
    }
    
    // Setup modal backdrop click
    const modal = document.getElementById('mobile-login-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeMobileLoginModal();
            }
        });
    }
    
    // Setup login form submission
    const loginForm = document.getElementById('mobile-login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleMobileLogin);
    }
}

function showMobileLoginModal() {
    const modal = document.getElementById('mobile-login-modal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Focus on username input
        setTimeout(() => {
            const usernameInput = document.getElementById('mobile-username');
            if (usernameInput) {
                usernameInput.focus();
            }
        }, 100);
    }
}

function closeMobileLoginModal() {
    const modal = document.getElementById('mobile-login-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
        
        // Clear form
        const form = document.getElementById('mobile-login-form');
        if (form) {
            form.reset();
        }
    }
}

async function handleMobileLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('mobile-username').value.trim();
    const password = document.getElementById('mobile-password').value.trim();
    
    if (!username || !password) {
        alert('Zəhmət olmasa istifadəçi adı və şifrəni daxil edin');
        return;
    }
    
    try {
        const API_BASE_URL = window.API_BASE_URL || 'http://localhost:5000/api';
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('isAuth', 'true');
            
            closeMobileLoginModal();
            
            // Reload to update UI
            window.location.reload();
        } else {
            alert(data.message || 'Giriş zamanı xəta baş verdi');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Serverlə əlaqə zamanı xəta baş verdi');
    }
}

// Also fix sidebar menu register buttons
document.addEventListener('DOMContentLoaded', function() {
    // Fix sidebar register buttons
    const sidebarRegisterBtns = document.querySelectorAll('.nav-aside .btn-register');
    sidebarRegisterBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = './register.html';
        });
    });
    
    // Fix sidebar login buttons
    const sidebarLoginBtns = document.querySelectorAll('.nav-aside .btn-login');
    sidebarLoginBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            // Close sidebar
            const overlay = document.querySelector('.overlay');
            const navAside = document.querySelector('.nav-aside');
            if (overlay) overlay.classList.remove('active');
            if (navAside) navAside.classList.remove('active');
            
            // Show login modal
            showMobileLoginModal();
        });
    });
});