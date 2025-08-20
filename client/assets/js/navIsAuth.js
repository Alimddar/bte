let authPart = document.querySelector("#content");
let btnLogin = document.querySelector("#btn-login");

const API_BASE_URL = 'http://localhost:5000/api';

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
        setupLogoutHandler();
      } else {
        authPart.innerHTML = formBarNotAuth;
        setupLoginHandler();
      }
    } catch (error) {
      console.error('Error in checkAuth:', error);
      authPart.innerHTML = formBarNotAuth;
      setupLoginHandler();
    }
  } else {
    authPart.innerHTML = formBarNotAuth;
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
  const registerFormBtn = document.querySelector('.register');
  if (registerFormBtn) {
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
  
  const usernameInput = document.querySelector('.username');
  const passwordInput = document.querySelector('.password');
  
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
      
      if (usernameInput) usernameInput.value = '';
      if (passwordInput) passwordInput.value = '';
      
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
