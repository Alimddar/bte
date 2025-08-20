// navIsAuth.js - Düzeltilmiş Header Authentication Script

// Add Material Icons if not already loaded
if (!document.querySelector('link[href*="material-icons"]')) {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
}

// Add CSS animations
if (!document.querySelector('#navIsAuthStyles')) {
    const style = document.createElement('style');
    style.id = 'navIsAuthStyles';
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
    `;
    document.head.appendChild(style);
}

$(document).ready(function () {
    console.log("navIsAuth.js yüklendi");
    
    // LocalStorage'dan kullanıcı bilgilerini al
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const authToken = localStorage.getItem('authToken');
    
    console.log("Kullanıcı durumu:", currentUser ? "Giriş yapılmış" : "Giriş yapılmamış");
    
    // Auth kontrolü yap
    checkAuth();
    
    function checkAuth() {
        console.log("checkAuth çalışıyor...");
        
        if (currentUser && authToken) {
            // Token kontrolü
            try {
                const tokenData = JSON.parse(atob(authToken));
                if (tokenData.exp > Date.now()) {
                    console.log("Kullanıcı giriş yapmış:", currentUser.username);
                    replaceEntireHeader(currentUser);
                } else {
                    console.log("Token süresi dolmuş");
                    clearAuthData();
                    showDefaultHeader();
                }
            } catch (e) {
                console.error("Token parse hatası:", e);
                showDefaultHeader();
            }
        } else {
            console.log("Giriş yapılmamış");
            showDefaultHeader();
        }
    }
    
    window.replaceEntireHeader = function(user) {
        console.log("replaceEntireHeader çalışıyor, user:", user);
        
        // Find the auth-part div
        const authPart = document.querySelector('.auth-part');
        if (!authPart) {
            console.error("Auth part bulunamadı!");
            return;
        }
        
        // Replace entire content
        authPart.innerHTML = `
            <div id="content">
                <div class="middle">
                    <div class="time">
                        <span id="currentDate">20-08-2025</span> 
                        <span id="currentTime">15:45:58</span>
                    </div>
                    <ul class="socials">
                        <li>
                            <a href="https://www.instagram.com/betbutaaz.resmi/profilecard/?igsh=MTRrc3Fncnhoc3hsZg==" target="_blank">
                                <img src="https://static.inpcdn.com/27,0762ecd30a419a.webp" alt="Instagram">
                            </a>
                        </li>
                        <li>
                            <a href="https://t.me/betbutaaz" target="_blank">
                                <img src="https://static.inpcdn.com/47,0dd44f23c88ca6.webp" alt="Telegram">
                            </a>
                        </li>
                        <li>
                            <a href="https://www.facebook.com/groups/737555120255267" target="_blank">
                                <img src="https://static.inpcdn.com/45,0dd44eadfb0ae5.webp" alt="Facebook">
                            </a>
                        </li>
                        <li>
                            <a href="https://www.youtube.com/@Betbuta" target="_blank">
                                <img src="https://static.inpcdn.com/119,2243d2081bd815.webp" alt="YouTube">
                            </a>
                        </li>
                        <li>
                            <a href="https://betbuta.app/" target="_blank">
                                <img src="https://static.inpcdn.com/46,0dd45acdb67f6f.webp" alt="App Store">
                            </a>
                        </li>
                        <li>
                            <a href="https://betbuta.app/" target="_blank">
                                <img src="https://static.inpcdn.com/47,0dd459b4b226a4.webp" alt="Google Play">
                            </a>
                        </li>
                    </ul>
                    <div class="change-lang">
                        <div class="current-lang">
                            <span class="current-lang">az</span>
                            <img src="../../assets/images/section/az.png" lang="az" style="display: inline;">
                        </div>
                    </div>
                    <div class="actions">
                        <a class="logo" href="./index.html">
                            <img src="../../assets/images/section/logo.png" alt="Logo">
                        </a>
                        <div class="material-icons menu">menu</div>
                        <div class="go-back">
                            <span class="material-icons">arrow_back</span> 
                            <span>Geri Qayıt</span>
                        </div>
                    </div>
                    <div class="user-info" style="display: block;">
                        <ul style="display: flex; align-items: center; gap: 10px; list-style: none; padding: 0; margin: 0;">
                            <li class="request-bonus">
                                <a href="https://betbutabns.xyz/bonus-talep?username=${user.username}&userid=${user.id}">
                                    <img src="../../assets/images/bonus.svg" alt="gift">
                                </a>
                            </li>
                            <li class="username" style="background: #2d2d36; color: white; padding: 8px 15px; border-radius: 4px; height: 40px; display: flex; align-items: center;">
                                <span>Xoş Gəldiniz</span> 
                                <a href="./profile.html" style="color: white; text-decoration: none; margin-left: 5px;">${user.username}</a>
                            </li>
                            <li class="balance" style="background: #2d2d36; color: white; padding: 8px 15px; border-radius: 4px; height: 40px; display: flex; align-items: center; gap: 5px;">
                                <span>Balans : </span> 
                                <span class="amount">${user.balance || '0.00'}</span> 
                                <span class="currency-str">AZN</span> 
                                <span class="material-icons refresh-balance" style="cursor: pointer;" onclick="refreshBalance()">refresh</span>
                            </li>
                            <li>
                                <a class="btn red deposit" href="./depozit.html" style="background: #efc02c; color: white; padding: 8px 15px; border-radius: 4px; text-decoration: none; height: 40px; display: flex; align-items: center; justify-content: center;">Depozit</a>
                            </li>
                            <li>
                                <a class="btn gray account-info light" href="./profile.html" style="background: #dfe6e8; color: #333; padding: 8px 15px; border-radius: 4px; text-decoration: none; height: 40px; display: flex; align-items: center; justify-content: center; gap: 5px;">
                                    <span class="material-icons">person</span> 
                                    <span>Hesabım</span>
                                </a>
                            </li>
                            <li>
                                <div class="logout" onclick="logout()" style="background: #dc3545; color: white; padding: 8px 15px; border-radius: 4px; cursor: pointer; height: 40px; display: flex; align-items: center; justify-content: center;">
                                    <span class="material-icons">power_settings_new</span>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div class="loader" style="display: none;"></div>
                </div>
            </div>
            <div class="language-bar">
                <span>AZ</span>
                <img src="../../assets/images/section/az.png" alt="" />
            </div>
        `;
        
        console.log("Header replaced successfully!");
        
        // Start the clock
        startClock();
    }
    
    window.showDefaultHeader = function() {
        const authPart = document.querySelector('.auth-part');
        if (!authPart) return;
        
        // Restore original login form
        authPart.innerHTML = `
            <div id="content">
                <div class="form-bar">
                    <span class="forgot-password">
                        <a href="" class="password-link">Şifrəmi Unutdum</a>
                    </span>
                    <a href="./register.html" class="btn btn-register">Qeydiyyatdan Keç</a>
                    <form id="loginForm" onsubmit="return handleQuickLogin(event)">
                        <input type="text" class="username" name="username" id="username" placeholder="İstifadəçi adı" required />
                        <input type="password" class="password" name="password" id="password" placeholder="Şifrə" required />
                        <button type="submit" class="btn btn-login">Daxil ol</button>
                    </form>
                </div>
            </div>
            <div class="language-bar">
                <span>AZ</span>
                <img src="../../assets/images/section/az.png" alt="" />
            </div>
        `;
    }
    
    // Giriş yapmış kullanıcı görünümü
    function showAuthenticatedView(formBar, user) {
        console.log("showAuthenticatedView çalışıyor, user:", user);
        // Form bar'a isAuth class'ı ekle
        formBar.classList.add('isAuth');
        
        // İçeriği değiştir
        formBar.innerHTML = `
            <div class="middle">
                <div class="time">
                    <span id="currentDate">20-08-2025</span> 
                    <span id="currentTime">15:45:58</span>
                </div>
                <ul class="socials">
                    <li>
                        <a href="https://www.instagram.com/betbutaaz.resmi/profilecard/?igsh=MTRrc3Fncnhoc3hsZg==" target="_blank">
                            <img src="https://static.inpcdn.com/27,0762ecd30a419a.webp" alt="Instagram">
                        </a>
                    </li>
                    <li>
                        <a href="https://t.me/betbutaaz" target="_blank">
                            <img src="https://static.inpcdn.com/47,0dd44f23c88ca6.webp" alt="Telegram">
                        </a>
                    </li>
                    <li>
                        <a href="https://www.facebook.com/groups/737555120255267" target="_blank">
                            <img src="https://static.inpcdn.com/45,0dd44eadfb0ae5.webp" alt="Facebook">
                        </a>
                    </li>
                    <li>
                        <a href="https://www.youtube.com/@Betbuta" target="_blank">
                            <img src="https://static.inpcdn.com/119,2243d2081bd815.webp" alt="YouTube">
                        </a>
                    </li>
                    <li>
                        <a href="https://betbuta.app/" target="_blank">
                            <img src="https://static.inpcdn.com/46,0dd45acdb67f6f.webp" alt="App Store">
                        </a>
                    </li>
                    <li>
                        <a href="https://betbuta.app/" target="_blank">
                            <img src="https://static.inpcdn.com/47,0dd459b4b226a4.webp" alt="Google Play">
                        </a>
                    </li>
                </ul>
                <div class="change-lang">
                    <div class="current-lang">
                        <span class="current-lang">az</span>
                        <img src="../../assets/images/section/az.png" lang="az" style="display: inline;">
                    </div>
                </div>
                <div class="actions">
                    <a class="logo" href="./index.html">
                        <img src="../../assets/images/section/logo.png" alt="Logo">
                    </a>
                    <div class="material-icons menu">menu</div>
                    <div class="go-back">
                        <span class="material-icons">arrow_back</span> 
                        <span>Geri Qayıt</span>
                    </div>
                </div>
                <div class="user-info" style="display: block;">
                    <ul>
                        <li class="request-bonus">
                            <a href="https://betbutabns.xyz/bonus-talep?username=${user.username}&userid=${user.id}">
                                <img src="../../assets/images/bonus.svg" alt="gift">
                            </a>
                        </li>
                        <li class="username" style="background: #2d2d36; color: white; padding: 8px 15px; border-radius: 4px; height: 40px; display: flex; align-items: center;">
                            <span>Xoş Gəldiniz</span> 
                            <a href="./profile.html" style="color: white; text-decoration: none; margin-left: 5px;">${user.username}</a>
                        </li>
                        <li class="balance" style="background: #2d2d36; color: white; padding: 8px 15px; border-radius: 4px; height: 40px; display: flex; align-items: center; gap: 5px;">
                            <span>Balans : </span> 
                            <span class="amount">${user.balance || '0.00'}</span> 
                            <span class="currency-str">AZN</span> 
                            <span class="material-icons refresh-balance" style="cursor: pointer;" onclick="refreshBalance()">refresh</span>
                        </li>
                        <li>
                            <a class="btn red deposit" href="./depozit.html" style="background: #efc02c; color: white; padding: 8px 15px; border-radius: 4px; text-decoration: none; height: 40px; display: flex; align-items: center; justify-content: center;">Depozit</a>
                        </li>
                        <li>
                            <a class="btn gray account-info light" href="./profile.html" style="background: #dfe6e8; color: #333; padding: 8px 15px; border-radius: 4px; text-decoration: none; height: 40px; display: flex; align-items: center; justify-content: center; gap: 5px;">
                                <span class="material-icons">person</span> 
                                <span>Hesabım</span>
                            </a>
                        </li>
                        <li>
                            <div class="logout" onclick="logout()" style="background: #dc3545; color: white; padding: 8px 15px; border-radius: 4px; cursor: pointer; height: 40px; display: flex; align-items: center; justify-content: center;">
                                <span class="material-icons">power_settings_new</span>
                            </div>
                        </li>
                    </ul>
                </div>
                <div class="loader" style="display: none;"></div>
            </div>
        `;
        
        // Start the clock
        startClock();
        
        // Style ekle
        addAuthStyles();
        
        // Mobile header güncelle
        updateMobileHeader(user);
    }
    
    // Giriş yapmamış kullanıcı görünümü
    function showUnauthenticatedView(formBar) {
        formBar.classList.remove('isAuth');
        
        formBar.innerHTML = `
            <span class="forgot-password">
                <a href="" class="password-link">Şifrəmi Unutdum</a>
            </span>
            <a href="./register.html" class="btn btn-register">Qeydiyyatdan Keç</a>
            <form id="loginForm" onsubmit="return handleQuickLogin(event)">
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
                <button type="submit" class="btn btn-login">Daxil ol</button>
            </form>
        `;
        
        // Mobile header'ı da güncelle
        const mobileButtons = document.querySelector('.mobile-part .btn-groups');
        if (mobileButtons) {
            mobileButtons.innerHTML = `
                <a href="./register.html" class="btn btn-register">Qeydiyyatdan Keç</a>
                <a href="#" onclick="showMobileLogin()" class="btn btn-login">Daxil ol</a>
            `;
        }
    }
    
    // Mobile header güncelleme
    function updateMobileHeader(user) {
        const mobileButtons = document.querySelector('.mobile-part .btn-groups');
        if (mobileButtons) {
            mobileButtons.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; padding: 5px;">
                    <span style="color: #fff; font-weight: 600;">${user.username}</span>
                    <span style="color: #ffffffff; font-size: 14px;">${user.balance || '0.00'} AZN</span>
                </div>
                <button onclick="logout()" style="
                    background: #2d2d2d ;
                    color: white;
                    padding: 5px 10px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                ">Çıxış</button>
            `;
        }
    }
    
    // Style ekle
    function addAuthStyles() {
        if (!document.getElementById('authStyles')) {
            const style = document.createElement('style');
            style.id = 'authStyles';
            style.innerHTML = `
                .isAuth.form-bar {
                    display: flex !important;
                    justify-content: space-between !important;
                    align-items: center !important;
                    width: 100% !important;
                }
                
                .isAuth.form-bar .btn-deposit:hover {
                    background: #e0a800 !important;
                    transform: translateY(-1px);
                }
                
                .isAuth.form-bar .btn-withdraw:hover {
                    background: #e0a800 !important;
                    transform: translateY(-1px);
                }
                
                .isAuth.form-bar .btn-logout:hover {
                    background: #c82333 !important;
                    transform: translateY(-1px);
                }
                
                .notification-toast {
                    position: fixed;
                    top: 80px;
                    right: 20px;
                    padding: 15px 20px;
                    border-radius: 5px;
                    color: white;
                    font-weight: 500;
                    z-index: 10000;
                    animation: slideIn 0.3s ease;
                    min-width: 250px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }
                
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
            `;
            document.head.appendChild(style);
        }
    }
    
    // LocalStorage temizle
    function clearAuthData() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
    }
});

// Global fonksiyonlar
window.handleQuickLogin = async function(event) {
    console.log("handleQuickLogin called!");
    if (event) event.preventDefault();
    
    const username = document.getElementById('username')?.value || document.querySelector('.username')?.value;
    const password = document.getElementById('password')?.value || document.querySelector('.password')?.value;
    
    console.log("Username:", username, "Password:", password);
    
    if (!username || !password) {
        alert('İstifadəçi adı və şifrə tələb olunur!');
        return false;
    }
    
    try {
        console.log("Sending login request to backend...");
        // Backend API'ye login isteği gönder
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        }).catch(err => {
            console.error("Fetch error:", err);
            throw err;
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Kullanıcı bilgilerini ve token'ı kaydet
            const userProfile = data.data.user;
            const token = data.data.token;
            
            // Balance bilgisini al
            const balanceResponse = await fetch('http://localhost:5000/api/auth/balance', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (balanceResponse.ok) {
                const balanceData = await balanceResponse.json();
                if (balanceData.success) {
                    userProfile.balance = balanceData.data.balance;
                    userProfile.currency = balanceData.data.currency;
                }
            }
            
            // LocalStorage'a kaydet
            localStorage.setItem('currentUser', JSON.stringify(userProfile));
            localStorage.setItem('authToken', token);
            
            // Başarı bildirimi göster
            showNotification('success', 'Uğurla daxil oldunuz!');
            
            // Navbar'ı güncelle
            console.log("Calling replaceEntireHeader with user:", userProfile);
            replaceEntireHeader(userProfile);
        } else {
            // Hata mesajını göster
            showNotification('error', data.message || 'Giriş uğursuz oldu!');
        }
    } catch (error) {
        console.error('Login error full details:', error);
        console.error('Error type:', error.name);
        console.error('Error message:', error.message);
        
        // Check if it's a network error
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            showNotification('error', 'Backend serverə qoşula bilmirik! Server işləyir və http://localhost:5000 ünvanında çalışır?');
        } else {
            showNotification('error', 'Bağlantı xətası! Backend serveri işləyir?');
        }
    }
    
    return false;
};

window.logout = function() {
    if (confirm('Çıxmaq istədiyinizdən əminsiniz?')) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
        
        // Bildirim göster
        showNotification('success', 'Uğurla çıxış edildi!');
        
        // Header'ı default'a döndür
        showDefaultHeader();
    }
};

// Alias for compatibility
window.handleLogin = function(event) {
    return window.handleQuickLogin(event);
};

window.showNotification = function(type, message) {
    const notification = document.createElement('div');
    notification.className = 'notification-toast';
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
        <div style="display: flex; align-items: center;">
            <span style="margin-right: 10px;">
                ${type === 'success' ? '✓' : '✗'}
            </span>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
};

// Kullanıcı bilgilerini al
window.getCurrentUser = function() {
    return JSON.parse(localStorage.getItem('currentUser'));
};

window.isUserLoggedIn = function() {
    const user = getCurrentUser();
    const token = localStorage.getItem('authToken');
    return !!(user && token);
};

// Clock functionality
function startClock() {
    function updateClock() {
        const now = new Date();
        
        // Format date as DD-MM-YYYY
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        const dateStr = `${day}-${month}-${year}`;
        
        // Format time as HH:MM:SS
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const timeStr = `${hours}:${minutes}:${seconds}`;
        
        // Update elements if they exist
        const dateElement = document.getElementById('currentDate');
        const timeElement = document.getElementById('currentTime');
        
        if (dateElement) dateElement.textContent = dateStr;
        if (timeElement) timeElement.textContent = timeStr;
    }
    
    // Update immediately
    updateClock();
    
    // Update every second
    setInterval(updateClock, 1000);
}

// Refresh balance functionality
window.refreshBalance = async function() {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        
        const response = await fetch('http://localhost:5000/api/auth/balance', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        if (data.success) {
            const amountElement = document.querySelector('.amount');
            if (amountElement) {
                amountElement.textContent = data.data.balance.toFixed(2);
            }
            
            // Update localStorage
            const user = getCurrentUser();
            if (user) {
                user.balance = data.data.balance.toFixed(2);
                localStorage.setItem('currentUser', JSON.stringify(user));
            }
        }
    } catch (error) {
        console.error('Error refreshing balance:', error);
    }
};