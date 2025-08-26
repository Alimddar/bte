let authPart = document.querySelector("#content");
let btnLogin = document.querySelector("#btn-login");

// Ensure config.js is loaded first
const API_BASE_URL = window.API_BASE_URL || 'http://192.168.1.72:5000/api';

let formBarNotAuth = `<div class="form-bar">
  <span class="forgot-password">
    <a href="" class="password-link"> Şifrəmi Unutdum </a>
  </span>
  <div class="btn btn-register">Qeydiyyatdan Keç</div>
  <form action="">
    <input
      type="text"
      class="username"
      name=""
      id=""
      placeholder="İstifadəçi adı"
    />
    <input
      type="password"
      class="password"
      name=""
      id=""
      placeholder="Şifrə"
    />
    <div class="btn btn-login" id="btn-login">Daxil ol</div>
  </form>
</div>`;

function createAuthenticatedNavbar(userData, balanceData) {
  return `<div class="isAuth form-bar">
    <div class="account-information">
      <a href="">
        <i class="fa-solid fa-gift"></i>
      </a>
      <span class="username">
        Xoş gəldin&nbsp;&nbsp; <b>${userData.username || 'İstifadəçi'}</b>
      </span>
      <span class="balance"> Balans: &nbsp;&nbsp; <b>${balanceData.balance || '0.00'}${balanceData.currency || 'AZN'}</b> </span>
    </div>
    <div class="button-group">
      <a href="./depozit.html" class="deposit">Depozit</a>
      <a href="./personal.html" class="account">
        <i class="fa-solid fa-user"></i>
         Hesabım
      </a>
      <button class="sign-out" onclick="logout()">
        <i class="fa-solid fa-power-off"></i>
      </button>
    </div>
  </div>`;
}

function updateMobileNavbarAuth(userData, balanceData) {
  const mobileContent = document.querySelector('.mobile-part .content');
  if (mobileContent) {
    // Enhanced mobile auth - show balance and user info
    mobileContent.innerHTML = `
      <div class="chat-banner">
        <i class="fa-solid fa-comment"></i>
      </div>
      <div class="mobile-auth-display" style="display: flex; align-items: center; gap: 10px;">
        <div class="mobile-balance" style="background: #667eea; color: white; padding: 6px 12px; border-radius: 12px; font-size: 13px; font-weight: 600;">
          ${balanceData.balance || '0.00'} ${balanceData.currency || 'AZN'}
        </div>
        <div class="mobile-user-dropdown" style="position: relative;">
          <div class="mobile-auth-icon" style="background: #ffd43b; border-radius: 50%; padding: 8px; display: inline-flex; cursor: pointer;" onclick="toggleMobileDropdown()">
            <i class="fa-solid fa-user-circle" style="color: #333; font-size: 20px;"></i>
          </div>
          <div class="mobile-dropdown-menu" id="mobileDropdown" style="display: none; position: absolute; top: 100%; right: 0; background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); padding: 10px; margin-top: 5px; min-width: 150px; z-index: 1000;">
            <div style="font-size: 12px; color: #666; margin-bottom: 8px;">Xoş gəldin, <strong>${userData.username || 'İstifadəçi'}</strong></div>
            <a href="./depozit.html" style="display: block; padding: 6px 0; color: #333; text-decoration: none; font-size: 13px; border-bottom: 1px solid #eee;">💰 Depozit</a>
            <a href="./personal.html" style="display: block; padding: 6px 0; color: #333; text-decoration: none; font-size: 13px; border-bottom: 1px solid #eee;">👤 Hesabım</a>
            <button onclick="logout()" style="display: block; width: 100%; padding: 6px 0; background: none; border: none; color: #ff4757; text-align: left; font-size: 13px; cursor: pointer;">🚪 Çıxış</button>
          </div>
        </div>
      </div>
    `;
  }
  
  // Also update sidebar for authenticated state
  const sidebarBtnGroups = document.querySelector('.nav-aside .btn-groups');
  if (sidebarBtnGroups) {
    sidebarBtnGroups.innerHTML = `
      <div class="sidebar-user-info" style="padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; margin-bottom: 20px; color: white;">
        <div class="user-info-header" style="text-align: center; margin-bottom: 15px;">
          <i class="fa-solid fa-user-circle fa-3x" style="color: #ffd43b; margin-bottom: 10px;"></i>
          <div class="user-details">
            <div class="username" style="font-size: 16px; font-weight: 600; margin-bottom: 5px;">${userData.username || 'İstifadəçi'}</div>
            <div class="balance" style="font-size: 14px; opacity: 0.9;">Balans: ${balanceData.balance || '0.00'} ${balanceData.currency || 'AZN'}</div>
          </div>
        </div>
        <div class="sidebar-actions" style="display: flex; flex-direction: column; gap: 8px;">
          <a href="./depozit.html" class="btn btn-deposit" style="background: #ffd43b; color: #333; padding: 10px; border-radius: 8px; text-decoration: none; text-align: center; font-weight: 600; font-size: 14px;">💰 Depozit</a>
          <a href="./personal.html" class="btn btn-account" style="background: rgba(255,255,255,0.2); color: white; padding: 10px; border-radius: 8px; text-decoration: none; text-align: center; font-weight: 500; font-size: 14px;">👤 Hesabım</a>
          <button class="btn btn-logout" onclick="logout()" style="background: #ff4757; color: white; padding: 10px; border-radius: 8px; border: none; font-weight: 500; font-size: 14px; cursor: pointer; width: 100%;">🚪 Çıxış</button>
        </div>
      </div>
    `;
  }
}

function updateMobileNavbarNotAuth() {
  const mobileContent = document.querySelector('.mobile-part .content');
  if (mobileContent) {
    // Enhanced mobile login interface with actual form
    mobileContent.innerHTML = `
      <div class="chat-banner">
        <i class="fa-solid fa-comment"></i>
      </div>
      <div class="mobile-auth-section">
        <div class="mobile-form-toggle" style="display: flex; gap: 5px; margin-bottom: 10px;">
          <button id="mobile-login-tab" class="tab-btn active" style="flex: 1; padding: 8px; background: #ffd43b; color: #333; border: none; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer;">Daxil ol</button>
          <button id="mobile-register-tab" class="tab-btn" style="flex: 1; padding: 8px; background: #f0f0f0; color: #666; border: none; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer;">Qeydiyyat</button>
        </div>
        <div id="mobile-login-form" class="mobile-form-bar" style="display: block;">
          <form style="display: flex; flex-direction: column; gap: 8px;">
            <input type="text" class="username" id="mobile-username" placeholder="İstifadəçi adı" style="padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px;" />
            <input type="password" class="password" id="mobile-password" placeholder="Şifrə" style="padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px;" />
            <button type="button" id="mobile-btn-login" class="btn btn-login" style="background: #ffd43b; color: #333; padding: 10px; border: none; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer;">Daxil ol</button>
          </form>
        </div>
        <div id="mobile-register-form" class="mobile-form-bar" style="display: none;">
          <a href="./register.html" style="display: block; background: #667eea; color: white; padding: 10px; border-radius: 6px; text-decoration: none; text-align: center; font-size: 14px; font-weight: 600;">Qeydiyyatdan Keç</a>
        </div>
      </div>
    `;
    
    // Setup mobile form toggle
    setupMobileFormToggle();
  }
  
  // Also update sidebar for non-authenticated state  
  const sidebarBtnGroups = document.querySelector('.nav-aside .btn-groups');
  if (sidebarBtnGroups) {
    sidebarBtnGroups.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 10px; padding: 10px;">
        <a href="./register.html" class="btn btn-register" style="background: #667eea; color: white; padding: 12px; border-radius: 8px; text-decoration: none; text-align: center; font-weight: 600;">Qeydiyyatdan Keç</a>
        <button class="btn btn-login" onclick="showSidebarLogin()" style="background: #ffd43b; color: #333; padding: 12px; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; width: 100%;">Daxil ol</button>
      </div>
      <div id="sidebar-login-form" style="display: none; padding: 15px; background: #f8f9fa; border-radius: 8px; margin-top: 10px;">
        <form style="display: flex; flex-direction: column; gap: 10px;">
          <input type="text" class="username" id="sidebar-username" placeholder="İstifadəçi adı" style="padding: 10px; border: 1px solid #ddd; border-radius: 6px;" />
          <input type="password" class="password" id="sidebar-password" placeholder="Şifrə" style="padding: 10px; border: 1px solid #ddd; border-radius: 6px;" />
          <button type="button" id="sidebar-btn-login" style="background: #ffd43b; color: #333; padding: 10px; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">Daxil ol</button>
        </form>
      </div>
    `;
  }
}

async function fetchUserData() {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      return data.data.user;
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('isAuth');
      return null;
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    localStorage.removeItem('token');
    localStorage.removeItem('isAuth');
    return null;
  }
}

async function fetchUserBalance() {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/balance`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      return data.data;
    } else {
      return { balance: '0.00', currency: 'AZN' };
    }
  } catch (error) {
    console.error('Error fetching balance:', error);
    return { balance: '0.00', currency: 'AZN' };
  }
}

async function checkAuth() {
  const token = localStorage.getItem('token');
  const isAuth = localStorage.getItem("isAuth");
  
  if (token && isAuth === "true") {
    try {
      const userData = await fetchUserData();
      const balanceData = await fetchUserBalance();
      
      if (userData && balanceData) {
        authPart.innerHTML = createAuthenticatedNavbar(userData, balanceData);
        updateMobileNavbarAuth(userData, balanceData);
        setupLogoutHandler();
      } else {
        authPart.innerHTML = formBarNotAuth;
        updateMobileNavbarNotAuth();
        setupLoginHandler();
      }
    } catch (error) {
      console.error('Error in checkAuth:', error);
      authPart.innerHTML = formBarNotAuth;
      updateMobileNavbarNotAuth();
      setupLoginHandler();
    }
  } else {
    authPart.innerHTML = formBarNotAuth;
    updateMobileNavbarNotAuth();
    setupLoginHandler();
  }
}

function setupLoginHandler() {
  const loginBtn = document.querySelector('#btn-login');
  if (loginBtn) {
    loginBtn.addEventListener('click', handleLogin);
  }
  
  const registerBtns = document.querySelectorAll('.btn-register');
  registerBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = './register.html';
    });
  });
  
  // Handle registration form if on register page
  const registerFormBtn = document.querySelector('button.register');
  if (registerFormBtn && window.location.pathname.includes('register.html')) {
    registerFormBtn.addEventListener('click', handleRegistration);
  }
}

function setupLogoutHandler() {
  const signOutBtn = document.querySelector('.sign-out');
  if (signOutBtn) {
    signOutBtn.addEventListener('click', logout);
  }
}

async function handleLogin(e) {
  e.preventDefault();
  
  let usernameInput, passwordInput;
  
  // Check which login form was used
  if (e.target.id === 'mobile-btn-login') {
    // Mobile header form
    usernameInput = document.querySelector('#mobile-username');
    passwordInput = document.querySelector('#mobile-password');
  } else if (e.target.id === 'sidebar-btn-login') {
    // Sidebar mobile form
    usernameInput = document.querySelector('#sidebar-username');
    passwordInput = document.querySelector('#sidebar-password');
  } else {
    // Desktop form (fallback)
    usernameInput = document.querySelector('.username');
    passwordInput = document.querySelector('.password');
  }
  
  const username = usernameInput?.value?.trim();
  const password = passwordInput?.value?.trim();
  
  if (!username || !password) {
    alert('Zəhmət olmasa istifadəçi adı və şifrəni daxil edin');
    return;
  }

  try {
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
      
      // Clear form inputs
      if (usernameInput) usernameInput.value = '';
      if (passwordInput) passwordInput.value = '';
      
      // Hide mobile dropdown/forms after successful login
      const mobileDropdown = document.getElementById('mobileDropdown');
      const sidebarLoginForm = document.getElementById('sidebar-login-form');
      if (mobileDropdown) mobileDropdown.style.display = 'none';
      if (sidebarLoginForm) sidebarLoginForm.style.display = 'none';
      
      await checkAuth();
    } else {
      alert(data.message || 'Giriş zamanı xəta baş verdi');
    }
  } catch (error) {
    console.error('Login error:', error);
    alert('Serverlə əlaqə zamanı xəta baş verdi');
  }
}

async function handleRegistration(e) {
  e.preventDefault();
  
  // Only run on register page
  if (!window.location.pathname.includes('register.html')) {
    return;
  }
  
  const nameInput = document.querySelector('input[name="name"]');
  const surnameInput = document.querySelector('input[name="surname"]');
  const emailInput = document.querySelector('input[name="email"]');
  const mobileInput = document.querySelector('input[name="mobile"]');
  const usernameInput = document.querySelector('input[name="username"]');
  const passwordInput = document.querySelector('input[name="password"]');
  const repasswordInput = document.querySelector('input[name="repassword"]');
  const agreeCheckbox = document.querySelector('input[type="checkbox"]');
  
  // Basic validation
  const name = nameInput?.value?.trim();
  const surname = surnameInput?.value?.trim();
  const email = emailInput?.value?.trim();
  const mobile = mobileInput?.value?.trim();
  const username = usernameInput?.value?.trim();
  const password = passwordInput?.value?.trim();
  const repassword = repasswordInput?.value?.trim();
  
  if (!name || !surname || !email || !mobile || !username || !password || !repassword) {
    alert('Zəhmət olmasa bütün xanalar doldurulmalıdır');
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

  try {
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
        mobile
      })
    });

    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('isAuth', 'true');
      
      alert('Qeydiyyat uğurlu oldu! İndi ana səhifəyə yönləndirilirsiniz.');
      window.location.href = './index.html';
    } else {
      alert(data.message || 'Qeydiyyat zamanı xəta baş verdi');
    }
  } catch (error) {
    console.error('Registration error:', error);
    alert('Serverlə əlaqə zamanı xəta baş verdi');
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.setItem('isAuth', 'false');
  checkAuth();
}

// Mobile dropdown toggle function
function toggleMobileDropdown() {
  const dropdown = document.getElementById('mobileDropdown');
  if (dropdown) {
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
  }
}

// Close mobile dropdown when clicking outside
document.addEventListener('click', function(e) {
  const dropdown = document.getElementById('mobileDropdown');
  const authIcon = document.querySelector('.mobile-auth-icon');
  if (dropdown && authIcon && !authIcon.contains(e.target) && !dropdown.contains(e.target)) {
    dropdown.style.display = 'none';
  }
});

// Setup mobile form toggle
function setupMobileFormToggle() {
  const loginTab = document.getElementById('mobile-login-tab');
  const registerTab = document.getElementById('mobile-register-tab');
  const loginForm = document.getElementById('mobile-login-form');
  const registerForm = document.getElementById('mobile-register-form');
  const mobileLoginBtn = document.getElementById('mobile-btn-login');
  
  if (loginTab && registerTab && loginForm && registerForm) {
    loginTab.addEventListener('click', () => {
      loginTab.classList.add('active');
      registerTab.classList.remove('active');
      loginForm.style.display = 'block';
      registerForm.style.display = 'none';
      
      loginTab.style.background = '#ffd43b';
      loginTab.style.color = '#333';
      registerTab.style.background = '#f0f0f0';
      registerTab.style.color = '#666';
    });
    
    registerTab.addEventListener('click', () => {
      registerTab.classList.add('active');
      loginTab.classList.remove('active');
      registerForm.style.display = 'block';
      loginForm.style.display = 'none';
      
      registerTab.style.background = '#667eea';
      registerTab.style.color = 'white';
      loginTab.style.background = '#f0f0f0';
      loginTab.style.color = '#666';
    });
  }
  
  // Setup mobile login handler
  if (mobileLoginBtn) {
    mobileLoginBtn.addEventListener('click', handleLogin);
  }
}

// Sidebar login form toggle
function showSidebarLogin() {
  const loginForm = document.getElementById('sidebar-login-form');
  if (loginForm) {
    loginForm.style.display = loginForm.style.display === 'none' ? 'block' : 'none';
    
    // Setup sidebar login handler
    const sidebarLoginBtn = document.getElementById('sidebar-btn-login');
    if (sidebarLoginBtn) {
      sidebarLoginBtn.addEventListener('click', handleLogin);
    }
  }
}

// Test functions for compatibility
function setAuth(value) {
  localStorage.setItem("isAuth", value.toString());
  if (value === false || value === "false") {
    localStorage.removeItem('token');
  }
  checkAuth();
}

function login() {
  console.log('Use handleLogin instead for actual login');
}

// Function to load personal page data
async function loadPersonalPageData() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Zəhmət olmasa daxil olun');
    window.location.href = './index.html';
    return;
  }

  try {
    const [userData, balanceData] = await Promise.all([
      fetchUserData(),
      fetchUserBalance()
    ]);

    if (userData && balanceData) {
      updatePersonalPageData(userData, balanceData);
    }
  } catch (error) {
    console.error('Error loading personal page data:', error);
  }
}

function updatePersonalPageData(userData, balanceData) {
  // Update balance display
  const balanceElement = document.querySelector('.balance-data');
  if (balanceElement) {
    balanceElement.textContent = balanceData.balance || '0.00';
  }

  console.log('Updating personal page with data:', userData, balanceData);

  // Direct mapping approach - more reliable
  const fieldMappings = [
    { selector: 'label:contains("İstifadəçi Adı")', field: 'username', value: userData.username },
    { selector: 'label:contains("Mail Adresi")', field: 'email', value: userData.email },
    { selector: 'label:contains("Ad")', field: 'name', value: userData.name },
    { selector: 'label:contains("Soyad")', field: 'surname', value: userData.surname },
    { selector: 'label:contains("COUNTRY")', field: 'country', value: userData.country },
    { selector: 'label:contains("CITY")', field: 'city', value: userData.city },
    { selector: 'label:contains("Adres")', field: 'address', value: userData.address },
    { selector: 'label:contains("Mobil Telefon")', field: 'mobile', value: userData.mobile },
    { selector: 'label:contains("Doğum Tarixi")', field: 'birthDate', value: userData.birthDate }
  ];

  // Alternative approach: iterate through all data-content divs
  const dataContents = document.querySelectorAll('.data-content');
  dataContents.forEach((container, index) => {
    const label = container.querySelector('label');
    const input = container.querySelector('input[type="text"]');
    
    if (label && input) {
      const labelText = label.textContent.trim();
      console.log(`Processing label ${index}: "${labelText}"`);
      
      // Exact text matching
      if (labelText === 'İstifadəçi Adı') {
        console.log('✅ Found username field, setting:', userData.username);
        input.value = userData.username || '';
      } else if (labelText === 'Mail Adresi') {
        console.log('✅ Found email field, setting:', userData.email);
        input.value = userData.email || '';
      } else if (labelText === 'Ad') {
        console.log('✅ Found name field, setting:', userData.name);
        input.value = userData.name || '';
      } else if (labelText === 'Soyad') {
        console.log('✅ Found surname field, setting:', userData.surname);
        input.value = userData.surname || '';
      } else if (labelText === 'COUNTRY') {
        console.log('✅ Found country field, setting:', userData.country);
        input.value = userData.country || '';
      } else if (labelText === 'CITY') {
        console.log('✅ Found city field, setting:', userData.city);
        input.value = userData.city || '';
      } else if (labelText === 'Adres') {
        console.log('✅ Found address field, setting:', userData.address);
        input.value = userData.address || '';
      } else if (labelText === 'Mobil Telefon') {
        console.log('✅ Found mobile field, setting:', userData.mobile);
        input.value = userData.mobile || '';
      } else if (labelText === 'Doğum Tarixi') {
        console.log('✅ Found birth date field, setting:', userData.birthDate);
        input.value = userData.birthDate || '';
      }
    }
  });
}

// Function to update clock with real-time
function updateClock() {
  const now = new Date();
  
  // Format date as DD-MM-YYYY HH:MM:SS
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  const timeString = `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  
  const clockElement = document.querySelector('.clock');
  if (clockElement) {
    clockElement.textContent = timeString;
  }
}

// Start clock updates
function startClock() {
  updateClock(); // Update immediately
  setInterval(updateClock, 1000); // Update every second
}

// Initialize when page loads
window.onload = () => {
  checkAuth();
  startClock(); // Start the real-time clock
  
  // If on personal page, load personal data
  if (window.location.pathname.includes('personal.html')) {
    loadPersonalPageData();
  }
};
