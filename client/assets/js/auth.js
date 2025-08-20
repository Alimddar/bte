// auth.js - Backend Authentication Integration
const API_BASE_URL = 'http://localhost:5000/api';

class AuthManager {
    constructor() {
        this.init();
    }

    init() {
        console.log("AuthManager initialized");
        this.checkAuthState();
        this.bindEvents();
    }

    // Check authentication state on page load
    async checkAuthState() {
        const currentUser = this.getCurrentUser();
        const token = this.getToken();

        if (currentUser && token) {
            await this.showAuthenticatedState(currentUser);
        } else {
            this.showUnauthenticatedState();
        }
    }

    // Bind event listeners
    bindEvents() {
        // Login form submission
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Login button click
        const loginBtn = document.querySelector('.btn-login[onclick="handleLogin()"]');
        if (loginBtn) {
            loginBtn.onclick = (e) => this.handleLogin(e);
        }
    }

    // Handle login form submission
    async handleLogin(event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        const username = document.getElementById('username')?.value || document.querySelector('input.username')?.value;
        const password = document.getElementById('password')?.value || document.querySelector('input.password')?.value;

        // Validation
        if (!username || !password) {
            this.showNotification('error', 'İstifadəçi adı və şifrə tələb olunur!');
            return false;
        }

        if (username.length < 3) {
            this.showNotification('error', 'İstifadəçi adı ən az 3 simvol olmalıdır!');
            return false;
        }

        if (password.length < 4) {
            this.showNotification('error', 'Şifrə ən az 4 simvol olmalıdır!');
            return false;
        }

        this.showLoading(true);

        try {
            // Call backend login API
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });

            const data = await response.json();

            if (data.success) {
                // Store user data and token
                this.setCurrentUser(data.data.user);
                this.setToken(data.data.token);

                // Show success notification
                const message = data.data.user.isNewUser 
                    ? `Xoş gəlmisiniz! Hesab yaradıldı: ${data.data.user.username}`
                    : `Xoş gəlmisiniz: ${data.data.user.username}`;
                
                this.showNotification('success', message);

                // Update UI
                await this.showAuthenticatedState(data.data.user);

                // Clear form
                if (document.getElementById('username')) document.getElementById('username').value = '';
                if (document.getElementById('password')) document.getElementById('password').value = '';

            } else {
                this.showNotification('error', data.message || 'Giriş uğursuz oldu!');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('error', 'Bağlantı xətası! Server işləmiyor.');
        } finally {
            this.showLoading(false);
        }

        return false;
    }

    // Refresh balance display
    async refreshBalance() {
        const currentUser = this.getCurrentUser();
        if (currentUser) {
            const balanceData = await this.fetchUserBalance();
            if (balanceData) {
                const balance = `${balanceData.balance.toFixed(2)} ${balanceData.currency}`;
                
                // Update desktop balance
                const balanceElement = document.querySelector('.balance-text');
                if (balanceElement) {
                    balanceElement.innerHTML = `<i class="fa fa-wallet" style="margin-right: 5px;"></i>Balans: ${balance}`;
                }
                
                // Update mobile balance
                const mobileBalance = document.querySelector('.mobile-part .btn-groups div span:last-child');
                if (mobileBalance) {
                    mobileBalance.innerHTML = `<i class="fa fa-wallet" style="margin-right: 3px;"></i>${balance}`;
                }
            }
        }
    }

    // Fetch user balance from backend
    async fetchUserBalance() {
        try {
            const token = this.getToken();
            if (!token) return null;

            const response = await fetch(`${API_BASE_URL}/auth/balance`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (data.success) {
                return data.data;
            }
            return null;
        } catch (error) {
            console.error('Error fetching balance:', error);
            return null;
        }
    }

    // Show authenticated state
    async showAuthenticatedState(user) {
        const formBar = document.querySelector('.form-bar');
        if (!formBar) return;

        // Fetch user balance
        const balanceData = await this.fetchUserBalance();
        const balance = balanceData ? `${balanceData.balance.toFixed(2)} ${balanceData.currency}` : 'Yüklənir...';

        formBar.classList.add('isAuth');
        formBar.innerHTML = `
            <div class="user-info" style="display: flex; align-items: center; gap: 15px; flex-wrap: wrap;">
                <div class="user-details" style="display: flex; gap: 10px;">
                    <span class="welcome-text" style="background: #2d2d36; color: white; padding: 8px 15px; border-radius: 4px; font-size: 14px; height: 40px; display: flex; align-items: center;">
                        Xoş Gəldiniz: <strong>${user.username}</strong>
                    </span>
                    <span class="balance-text" style="background: #2d2d36; color: white; padding: 8px 15px; border-radius: 4px; font-size: 14px; font-weight: bold; height: 40px; display: flex; align-items: center;">
                        <i class="fa fa-wallet" style="margin-right: 5px;"></i>Balans: ${balance}
                    </span>
                </div>
                <div class="user-actions" style="display: flex; gap: 10px;">
                    <a href="./depozit.html" class="btn btn-deposit" style="
                        background: #efc02c;
                        color: white;
                        padding: 8px 15px;
                        border-radius: 4px;
                        text-decoration: none;
                        font-size: 14px;
                        display: inline-flex;
                        align-items: center;
                        gap: 5px;
                        height: 40px;
                    ">
                        <i class="fa fa-plus"></i> Depozit
                    </a>
                    <a href="./profile.html" class="btn btn-profile" style="
                        background: #dfe6e8;
                        color: #333;
                        padding: 8px 15px;
                        border-radius: 4px;
                        text-decoration: none;
                        font-size: 14px;
                        display: inline-flex;
                        align-items: center;
                        gap: 5px;
                        height: 40px;
                    ">
                        <i class="fa fa-user"></i> Hesabım
                    </a>
                    <button onclick="authManager.logout()" class="btn btn-logout" style="
                        background: #dc3545;
                        color: white;
                        padding: 8px 15px;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 14px;
                        display: inline-flex;
                        align-items: center;
                        gap: 5px;
                        height: 40px;
                    ">
                        <i class="fa fa-sign-out-alt"></i> Çıxış
                    </button>
                </div>
            </div>
        `;

        // Update mobile header if exists
        await this.updateMobileHeader(user, balanceData);
    }

    // Show unauthenticated state
    showUnauthenticatedState() {
        const formBar = document.querySelector('.form-bar');
        if (!formBar) return;

        formBar.classList.remove('isAuth');
        formBar.innerHTML = `
            <span class="forgot-password">
                <a href="" class="password-link"> Şifrəmi Unutdum </a>
            </span>
            <a href="./register.html" class="btn btn-register">Qeydiyyatdan Keç</a>
            <form id="loginForm">
                <input
                    type="text"
                    class="username"
                    name="username"
                    id="username"
                    placeholder="İstifadəçi adı"
                    required
                />
                <input
                    type="password"
                    class="password"
                    name="password"
                    id="password"
                    placeholder="Şifrə"
                    required
                />
                <div class="btn btn-login" onclick="authManager.handleLogin(event)">Daxil ol</div>
            </form>
        `;

        // Rebind events
        this.bindEvents();

        // Update mobile header
        this.updateMobileHeaderUnauthenticated();
    }

    // Update mobile header for authenticated user
    async updateMobileHeader(user, balanceData) {
        const mobileButtons = document.querySelector('.mobile-part .btn-groups');
        if (mobileButtons) {
            const balance = balanceData ? `${balanceData.balance.toFixed(2)} ${balanceData.currency}` : 'Yüklənir...';
            
            mobileButtons.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; padding: 5px; color: white; text-align: center;">
                    <span style="font-weight: 600; font-size: 12px;">${user.username}</span>
                    <span style="color: #00d4aa; font-size: 11px; font-weight: bold;">
                        <i class="fa fa-wallet" style="margin-right: 3px;"></i>${balance}
                    </span>
                </div>
                <button onclick="authManager.logout()" style="
                    background: #dc3545;
                    color: white;
                    padding: 5px 10px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                ">Çıxış</button>
            `;
        }
    }

    // Update mobile header for unauthenticated user
    updateMobileHeaderUnauthenticated() {
        const mobileButtons = document.querySelector('.mobile-part .btn-groups');
        if (mobileButtons) {
            mobileButtons.innerHTML = `
                <a href="./register.html" class="btn btn-register">Qeydiyyatdan Keç</a>
                <a href="#" onclick="authManager.showMobileLogin()" class="btn btn-login">Daxil ol</a>
            `;
        }
    }

    // Logout function
    logout() {
        if (confirm('Çıxmaq istədiyinizdən əminsiniz?')) {
            this.clearAuthData();
            this.showNotification('success', 'Uğurla çıxış edildi!');
            
            setTimeout(() => {
                this.showUnauthenticatedState();
            }, 500);
        }
    }

    // Storage helpers
    getCurrentUser() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    }

    setCurrentUser(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    }

    getToken() {
        return localStorage.getItem('authToken');
    }

    setToken(token) {
        localStorage.setItem('authToken', token);
    }

    clearAuthData() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
    }

    // Show notification
    showNotification(type, message) {
        const notification = document.createElement('div');
        notification.className = 'auth-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            max-width: 300px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            background: ${type === 'success' ? '#28a745' : '#dc3545'};
        `;

        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span>${type === 'success' ? '✓' : '✗'}</span>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    // Show loading spinner
    showLoading(show) {
        let loader = document.getElementById('authLoader');
        
        if (show) {
            if (!loader) {
                loader = document.createElement('div');
                loader.id = 'authLoader';
                loader.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 9999;
                `;
                loader.innerHTML = `
                    <div style="
                        background: white;
                        padding: 20px;
                        border-radius: 10px;
                        text-align: center;
                        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    ">
                        <div class="spinner" style="
                            border: 3px solid #f3f3f3;
                            border-top: 3px solid #007bff;
                            border-radius: 50%;
                            width: 30px;
                            height: 30px;
                            animation: spin 1s linear infinite;
                            margin: 0 auto 10px;
                        "></div>
                        <p style="margin: 0; color: #333;">Giriş edilir...</p>
                    </div>
                `;
                document.body.appendChild(loader);
            }
        } else {
            if (loader) {
                loader.remove();
            }
        }
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .form-bar.isAuth {
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
        flex-wrap: wrap !important;
    }
    
    .btn:hover {
        opacity: 0.9;
        transform: translateY(-1px);
        transition: all 0.2s ease;
    }
`;
document.head.appendChild(style);

// Initialize AuthManager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.authManager = new AuthManager();
});

// Backward compatibility - keep the old function name
function handleLogin(event) {
    if (window.authManager) {
        window.authManager.handleLogin(event);
    }
}

// Expose useful functions globally
window.refreshBalance = function() {
    if (window.authManager) {
        return window.authManager.refreshBalance();
    }
};

window.getUserBalance = function() {
    if (window.authManager) {
        return window.authManager.fetchUserBalance();
    }
};