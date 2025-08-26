// Balance Check Module for Insufficient Balance Notification and Balance Display

class BalanceChecker {
  constructor() {
    this.API_BASE_URL = window.API_BASE_URL || 'http://192.168.1.72:5000/api';
    this.createModalHTML();
    this.initializeEventListeners();
    this.startBalanceUpdates();
  }

  createModalHTML() {
    const modalHTML = `
      <div id="balance-modal" class="balance-modal-overlay" style="display: none;">
        <div class="balance-modal-card">
          <div class="balance-modal-header">
            <i class="fa-solid fa-triangle-exclamation" style="color: #ff6b6b; font-size: 24px;"></i>
            <h3>Balans Yetərsiz</h3>
            <button class="balance-modal-close" id="balance-modal-close">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div class="balance-modal-body">
            <p>Balansınızda yetərli məbləğ yoxdur.</p>
            <p>Balansınızı artırmaq üçün əvvəlcə depozit edin.</p>
            <div class="current-balance">
              <span class="balance-label">Cari Balans:</span>
              <span class="balance-amount" id="current-balance-amount">0.00 AZN</span>
            </div>
          </div>
          <div class="balance-modal-footer">
            <button class="deposit-button" id="deposit-button">
              <i class="fa-solid fa-plus"></i>
              Depozit
            </button>
          </div>
        </div>
      </div>
    `;
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.addModalStyles();
  }

  addModalStyles() {
    const styles = `
      <style>
        .balance-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 10000;
          backdrop-filter: blur(5px);
        }

        .balance-modal-card {
          background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          width: 90%;
          max-width: 450px;
          padding: 0;
          animation: modalSlideIn 0.3s ease-out;
          border: 2px solid #ffd43b;
        }

        @keyframes modalSlideIn {
          from {
            transform: translateY(-50px) scale(0.9);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }

        .balance-modal-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 24px 24px 16px 24px;
          border-bottom: 1px solid #e9ecef;
          position: relative;
        }

        .balance-modal-header h3 {
          flex: 1;
          margin: 0;
          color: #2c3e50;
          font-size: 20px;
          font-weight: 600;
        }

        .balance-modal-close {
          background: none;
          border: none;
          font-size: 20px;
          color: #6c757d;
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          transition: all 0.2s;
          position: absolute;
          right: 16px;
          top: 16px;
        }

        .balance-modal-close:hover {
          background-color: #f8f9fa;
          color: #495057;
        }

        .balance-modal-body {
          padding: 20px 24px;
          text-align: center;
        }

        .balance-modal-body p {
          margin: 0 0 12px 0;
          color: #495057;
          font-size: 16px;
          line-height: 1.6;
        }

        .current-balance {
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 10px;
          padding: 16px;
          margin-top: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .balance-label {
          color: #6c757d;
          font-weight: 500;
          font-size: 14px;
        }

        .balance-amount {
          color: #2c3e50;
          font-weight: 700;
          font-size: 16px;
        }

        .balance-modal-footer {
          padding: 16px 24px 24px 24px;
          text-align: center;
        }

        .deposit-button {
          background: linear-gradient(135deg, #ffd43b 0%, #ffbe0b 100%);
          color: #2c3e50;
          border: none;
          padding: 14px 32px;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 4px 12px rgba(255, 212, 59, 0.4);
          display: inline-flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          justify-content: center;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .deposit-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(255, 212, 59, 0.6);
          background: linear-gradient(135deg, #ffbe0b 0%, #ffd43b 100%);
        }

        .deposit-button:active {
          transform: translateY(0);
          box-shadow: 0 4px 12px rgba(255, 212, 59, 0.4);
        }

        @media (max-width: 480px) {
          .balance-modal-card {
            width: 95%;
            margin: 20px;
          }
          
          .balance-modal-header {
            padding: 20px 20px 12px 20px;
          }
          
          .balance-modal-body {
            padding: 16px 20px;
          }
          
          .balance-modal-footer {
            padding: 12px 20px 20px 20px;
          }

          .current-balance {
            flex-direction: column;
            gap: 8px;
            text-align: center;
          }
        }
      </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', styles);
  }

  initializeEventListeners() {
    document.addEventListener('click', (e) => {
      // Close modal events
      if (e.target.id === 'balance-modal-close' || e.target.closest('#balance-modal-close')) {
        this.closeModal();
      }
      
      if (e.target.id === 'balance-modal' && e.target.classList.contains('balance-modal-overlay')) {
        this.closeModal();
      }

      // Deposit button click
      if (e.target.id === 'deposit-button' || e.target.closest('#deposit-button')) {
        this.redirectToDeposit();
      }

      // Sports betting buttons - check for insufficient balance
      if (this.isSportsBettingButton(e.target)) {
        e.preventDefault();
        this.checkBalanceAndShowModal();
      }
    });

    // Escape key to close modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal();
      }
    });
  }

  isSportsBettingButton(element) {
    if (!element) return false;
    
    const link = element.closest('a');
    if (!link) return false;

    const text = link.textContent.trim();
    const sportsBettingTexts = [
      'İDMAN MƏRCLƏRİ',
      'Canlı Mərc',
      'E-SPORTS', 
      'SLOT',
      'MINIGAMES',
      'CANLI KAZİNO',
      'VİRTUAL',
      'RACİNG'
    ];

    return sportsBettingTexts.some(sportText => text.includes(sportText)) ||
           link.querySelector('.jetX') !== null;
  }

  async checkBalanceAndShowModal() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // User not logged in, redirect to login or show login modal
        alert('Zəhmət olmasa əvvəlcə daxil olun');
        return;
      }

      const balanceData = await this.fetchUserBalance();
      const currentBalance = parseFloat(balanceData.balance) || 0;
      
      // Check if balance is insufficient (you can adjust this threshold)
      const minimumRequired = 1.00; // Minimum 1 AZN required
      
      if (currentBalance < minimumRequired) {
        this.showModal(balanceData);
      } else {
        // Balance is sufficient, proceed with normal navigation
        console.log('Balance sufficient, proceeding...');
        // You can add normal navigation logic here
      }
      
    } catch (error) {
      console.error('Error checking balance:', error);
      this.showModal({ balance: '0.00', currency: 'AZN' });
    }
  }

  async fetchUserBalance() {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token');

    const response = await fetch(`${this.API_BASE_URL}/auth/balance`, {
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
  }

  showModal(balanceData) {
    const modal = document.getElementById('balance-modal');
    const balanceAmount = document.getElementById('current-balance-amount');
    
    if (modal && balanceAmount) {
      balanceAmount.textContent = `${balanceData.balance || '0.00'} ${balanceData.currency || 'AZN'}`;
      modal.style.display = 'flex';
      
      // Add body scroll lock
      document.body.style.overflow = 'hidden';
      
      // Focus trap for accessibility
      const depositButton = document.getElementById('deposit-button');
      if (depositButton) {
        setTimeout(() => depositButton.focus(), 100);
      }
    }
  }

  closeModal() {
    const modal = document.getElementById('balance-modal');
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  }

  redirectToDeposit() {
    this.closeModal();
    // Redirect to deposit page
    window.location.href = './depozit.html';
  }

  // Start periodic balance updates for authenticated users
  startBalanceUpdates() {
    // Update immediately if authenticated
    this.updateAllBalanceDisplays();
    
    // Set interval for automatic updates every 30 seconds
    setInterval(() => {
      if (window.isAuthenticated && window.isAuthenticated()) {
        this.updateAllBalanceDisplays();
      }
    }, 30000);
  }

  // Update all balance displays on the page
  async updateAllBalanceDisplays() {
    try {
      const token = localStorage.getItem('token');
      if (!token || !window.isAuthenticated()) return;

      const balanceData = await this.fetchUserBalance();
      const balanceText = `${balanceData.balance || '0.00'} ${balanceData.currency || 'AZN'}`;
      
      // Update various balance display elements
      const balanceSelectors = [
        '.balance-data',           // Personal page balance
        '.balance-amount .balance-data', // Personal page balance amount
        '.mobile-balance',         // Mobile header balance
        '.balance',                // Sidebar balance
        '.current-balance-amount'  // Modal balance
      ];
      
      balanceSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          if (element) {
            element.textContent = balanceData.balance || '0.00';
          }
        });
      });

      // Update navbar balance displays specifically
      const navbarBalanceElements = document.querySelectorAll('.isAuth .balance b');
      navbarBalanceElements.forEach(element => {
        if (element) {
          element.textContent = balanceText;
        }
      });

      // Update mobile dropdown balance
      const mobileBalanceDisplay = document.querySelector('.mobile-balance');
      if (mobileBalanceDisplay) {
        mobileBalanceDisplay.textContent = balanceText;
      }

      // Update sidebar user details
      const sidebarBalanceElement = document.querySelector('.sidebar-user-info .balance');
      if (sidebarBalanceElement) {
        sidebarBalanceElement.textContent = `Balans: ${balanceText}`;
      }

      console.log('Balance displays updated:', balanceText);
      
    } catch (error) {
      console.error('Error updating balance displays:', error);
    }
  }

  // Force refresh balance (can be called manually)
  async refreshBalance() {
    await this.updateAllBalanceDisplays();
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.balanceChecker = new BalanceChecker();
});

// Also initialize if DOM is already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.balanceChecker = new BalanceChecker();
  });
} else {
  window.balanceChecker = new BalanceChecker();
}