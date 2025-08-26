// Mobile-specific Navigation Authentication System
// This is separate from desktop navIsAuth.js to avoid conflicts

let mobileAuthPart = null;
let mobileBtnLogin = null;

const MOBILE_API_BASE_URL = window.API_BASE_URL || 'http://localhost:5000/api';

// Mobile form bar for non-authenticated users
let mobileFormBarNotAuth = `<div class="mobile-form-bar">
  <span class="forgot-password">
    <a href="" class="password-link"> Şifrəmi Unutdum </a>
  </span>
  <div class="btn btn-register">Qeydiyyatdan Keç</div>
  <form action="" class="mobile-login-form">
    <input
      type="text"
      class="username"
      name=""
      id="mobile-username-input"
      placeholder="İstifadəçi adı"
    />
    <input
      type="password"
      class="password"
      name=""
      id="mobile-password-input"
      placeholder="Şifrə"
    />
    <div class="btn btn-login" id="mobile-btn-login">Daxil ol</div>
  </form>
</div>`;

// Create authenticated navbar for mobile
function createMobileAuthenticatedNavbar(userData, balanceData) {
  return `<div class="mobile-isAuth mobile-form-bar">
    <div class="mobile-account-information">
      <a href="">
        <i class="fa-solid fa-gift"></i>
      </a>
      <span class="username">
        Xoş gəldin&nbsp;&nbsp; <b>${userData.username || 'İstifadəçi'}</b>
      </span>
      <span class="balance"> Balans: &nbsp;&nbsp; <b>${balanceData.balance || '0.00'}${balanceData.currency || 'AZN'}</b> </span>
    </div>
    <div class="mobile-button-group">
      <a href="./depozit.html" class="deposit">Depozit</a>
      <a href="./personal.html" class="account">
        <i class="fa-solid fa-user"></i>
         Hesabım
      </a>
      <button class="mobile-sign-out" onclick="mobileLogout()">
        <i class="fa-solid fa-power-off"></i>
      </button>
    </div>
  </div>`;
}

// Fetch user data for mobile
async function fetchMobileUserData() {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const response = await fetch(`${MOBILE_API_BASE_URL}/auth/profile`, {
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
      return null;
    }
  } catch (error) {
    console.error('Error fetching mobile user data:', error);
    return null;
  }
}

// Fetch user balance for mobile
async function fetchMobileUserBalance() {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const response = await fetch(`${MOBILE_API_BASE_URL}/auth/balance`, {
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
    console.error('Error fetching mobile balance:', error);
    return { balance: '0.00', currency: 'AZN' };
  }
}

// Check mobile authentication
async function checkMobileAuth() {
  const token = localStorage.getItem('token');
  const isAuth = localStorage.getItem("isAuth");
  
  // Create mobile auth container if it doesn't exist
  createMobileAuthContainer();
  
  mobileAuthPart = document.querySelector("#mobile-auth-content");
  
  if (!mobileAuthPart) {
    console.log('Mobile auth part not found, creating...');
    return;
  }
  
  if (token && isAuth === "true") {
    try {
      const userData = await fetchMobileUserData();
      const balanceData = await fetchMobileUserBalance();
      
      if (userData && balanceData) {
        mobileAuthPart.innerHTML = createMobileAuthenticatedNavbar(userData, balanceData);
        mobileAuthPart.style.display = 'block';
        setupMobileLogoutHandler();
        hideMobileDefaultButtons();
      } else {
        mobileAuthPart.innerHTML = mobileFormBarNotAuth;
        mobileAuthPart.style.display = 'block';
        setupMobileLoginHandler();
        hideMobileDefaultButtons();
      }
    } catch (error) {
      console.error('Error in checkMobileAuth:', error);
      showMobileDefaultButtons();
    }
  } else {
    showMobileDefaultButtons();
    mobileAuthPart.style.display = 'none';
  }
}

// Create mobile auth container
function createMobileAuthContainer() {
  // Check if we're on mobile
  if (window.innerWidth > 768) return;
  
  // Find mobile content area
  const mobileContent = document.querySelector('.mobile-part .content');
  if (!mobileContent) return;
  
  // Check if container already exists
  if (document.querySelector('#mobile-auth-content')) return;
  
  // Create auth container
  const authContainer = document.createElement('div');
  authContainer.id = 'mobile-auth-content';
  authContainer.style.display = 'none';
  authContainer.style.width = '100%';
  
  // Insert before existing content
  mobileContent.insertBefore(authContainer, mobileContent.firstChild);
}

// Hide default mobile buttons when auth is shown
function hideMobileDefaultButtons() {
  const defaultButtons = document.querySelector('.mobile-part .btn-groups');
  const chatBanner = document.querySelector('.mobile-part .chat-banner');
  
  if (defaultButtons) defaultButtons.style.display = 'none';
  if (chatBanner) chatBanner.style.display = 'none';
}

// Show default mobile buttons
function showMobileDefaultButtons() {
  const defaultButtons = document.querySelector('.mobile-part .btn-groups');
  const chatBanner = document.querySelector('.mobile-part .chat-banner');
  
  if (defaultButtons) defaultButtons.style.display = 'flex';
  if (chatBanner) chatBanner.style.display = 'block';
}

// Setup mobile login handler
function setupMobileLoginHandler() {
  mobileBtnLogin = document.querySelector('#mobile-btn-login');
  if (mobileBtnLogin) {
    mobileBtnLogin.addEventListener('click', handleMobileLogin);
  }
  
  // Mobile register button
  const mobileRegisterBtns = document.querySelectorAll('#mobile-auth-content .btn-register');
  mobileRegisterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = './register.html';
    });
  });
}

// Setup mobile logout handler
function setupMobileLogoutHandler() {
  const mobileSignOutBtn = document.querySelector('.mobile-sign-out');
  if (mobileSignOutBtn) {
    mobileSignOutBtn.addEventListener('click', mobileLogout);
  }
}

// Handle mobile login
async function handleMobileLogin(e) {
  e.preventDefault();
  
  const usernameInput = document.querySelector('#mobile-username-input');
  const passwordInput = document.querySelector('#mobile-password-input');
  
  const username = usernameInput?.value?.trim();
  const password = passwordInput?.value?.trim();
  
  if (!username || !password) {
    alert('Zəhmət olmasa istifadəçi adı və şifrəni daxil edin');
    return;
  }

  try {
    const response = await fetch(`${MOBILE_API_BASE_URL}/auth/login`, {
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
      
      if (usernameInput) usernameInput.value = '';
      if (passwordInput) passwordInput.value = '';
      
      await checkMobileAuth();
      
      // Also update desktop auth if exists
      if (typeof checkAuth === 'function') {
        checkAuth();
      }
    } else {
      alert(data.message || 'Giriş zamanı xəta baş verdi');
    }
  } catch (error) {
    console.error('Mobile login error:', error);
    alert('Serverlə əlaqə zamanı xəta baş verdi');
  }
}

// Mobile logout function
function mobileLogout() {
  localStorage.removeItem('token');
  localStorage.setItem('isAuth', 'false');
  checkMobileAuth();
  
  // Also update desktop auth if exists
  if (typeof checkAuth === 'function') {
    checkAuth();
  }
}

// Initialize mobile auth on page load
document.addEventListener('DOMContentLoaded', function() {
  // Only run on mobile
  if (window.innerWidth <= 768) {
    setTimeout(() => {
      checkMobileAuth();
    }, 100);
  }
});

// Re-check on window resize
let resizeTimer;
window.addEventListener('resize', function() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(function() {
    if (window.innerWidth <= 768) {
      checkMobileAuth();
    }
  }, 250);
});

// Export for external use
window.checkMobileAuth = checkMobileAuth;
window.mobileLogout = mobileLogout;