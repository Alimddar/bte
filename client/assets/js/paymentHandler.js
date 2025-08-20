// Payment page handler
class PaymentHandler {
    constructor() {
        this.depositInfo = null;
        this.init();
    }
    
    init() {
        // Get deposit info from localStorage
        const depositData = localStorage.getItem('depositInfo');
        
        if (!depositData) {
            this.handleMissingDepositInfo();
            return;
        }
        
        try {
            this.depositInfo = JSON.parse(depositData);
            
            // Check if data is not too old (expire after 30 minutes)
            const now = Date.now();
            if (now - this.depositInfo.timestamp > 30 * 60 * 1000) {
                this.handleExpiredDepositInfo();
                return;
            }
            
            this.setupPaymentPage();
            
        } catch (error) {
            console.error('Error parsing deposit info:', error);
            this.handleMissingDepositInfo();
        }
    }
    
    setupPaymentPage() {
        // Update page title and info
        this.updatePageInfo();
        
        // Setup amount fields
        this.setupAmountFields();
        
        // Add back to deposit link
        this.addBackButton();
        
        // Setup form submission
        this.setupFormSubmission();
    }
    
    updatePageInfo() {
        const { methodName, amount } = this.depositInfo;
        
        // Update page title if exists
        const titleElement = document.querySelector('.header') || 
                            document.querySelector('h1') || 
                            document.querySelector('.page-title');
        
        if (titleElement) {
            titleElement.textContent = `${methodName} - ${amount} AZN`;
        }
        
        // Update document title
        document.title = `${methodName} Depozit - ${amount} AZN`;
    }
    
    setupAmountFields() {
        const { amount } = this.depositInfo;
        
        // Update amount display in amount-section
        const amountDisplay = document.getElementById('displayAmount');
        if (amountDisplay) {
            amountDisplay.textContent = `AZN ${amount.toFixed(2)}`;
        }
        
        // Also check for other amount value elements
        const amountValues = document.querySelectorAll('.amount-value');
        amountValues.forEach(element => {
            element.textContent = `AZN ${amount.toFixed(2)}`;
        });
        
        // Hide any amount input fields if they exist
        const amountInputs = document.querySelectorAll('input[id*="amount"], input[name*="amount"], input[placeholder*="Məbləğ"], input[placeholder*="Amount"]');
        amountInputs.forEach(input => {
            const formGroup = input.closest('.form-group') || input.parentElement;
            if (formGroup) {
                formGroup.style.display = 'none';
            }
        });
    }
    
    showAmountSummary() {
        // No longer needed - using existing amount-section
        return;
    }
    
    addBackButton() {
        // Check if back button already exists
        if (document.querySelector('.back-to-deposit')) return;
        
        const backButton = document.createElement('a');
        backButton.href = '../depozit.html';
        backButton.className = 'back-to-deposit';
        backButton.style.cssText = `
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            background: #f8f9fa;
            color: #6c757d;
            text-decoration: none;
            border-radius: 6px;
            font-size: 14px;
            margin-bottom: 16px;
            transition: background-color 0.2s;
        `;
        
        backButton.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H20v-2z"/>
            </svg>
            Depozit səhifəsinə qayıt
        `;
        
        backButton.addEventListener('mouseover', () => {
            backButton.style.backgroundColor = '#e9ecef';
        });
        
        backButton.addEventListener('mouseout', () => {
            backButton.style.backgroundColor = '#f8f9fa';
        });
        
        // Insert at the beginning
        const contentArea = document.querySelector('.content') || 
                           document.querySelector('.container') || 
                           document.body;
        
        contentArea.insertBefore(backButton, contentArea.firstChild);
    }
    
    setupFormSubmission() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handlePaymentSubmission(form);
            });
        });
    }
    
    handlePaymentSubmission(form) {
        const { method, methodName, amount } = this.depositInfo;
        
        // Collect form data (excluding amount since it's predefined)
        const formData = new FormData(form);
        const paymentData = {
            method: method,
            amount: amount,
            timestamp: new Date().toISOString()
        };
        
        // Add other form fields to payment data
        formData.forEach((value, key) => {
            if (!key.includes('amount')) {
                paymentData[key] = value;
            }
        });
        
        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"], button:not([type])');
        if (submitBtn) {
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Emal edilir...';
            submitBtn.disabled = true;
            
            // Simulate processing
            setTimeout(() => {
                // Here you would normally send data to backend
                console.log('Processing payment:', paymentData);
                
                // Show success notification
                this.showSuccessNotification(amount, methodName);
                
                // Clear deposit info
                localStorage.removeItem('depositInfo');
                
                // Redirect after short delay
                setTimeout(() => {
                    window.location.href = '../personal.html';
                }, 2500);
                
            }, 2000);
        }
    }
    
    showSuccessNotification(amount, methodName) {
        // Create success overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            background: white;
            border-radius: 16px;
            padding: 32px;
            text-align: center;
            max-width: 400px;
            animation: slideIn 0.3s ease;
        `;
        
        notification.innerHTML = `
            <div style="font-size: 48px; margin-bottom: 16px;">✅</div>
            <h2 style="color: #28a745; margin-bottom: 12px;">Uğurlu!</h2>
            <p style="color: #333; margin-bottom: 8px; font-size: 18px;">
                <strong>${amount} AZN</strong> məbləğində depozit sorğusu göndərildi
            </p>
            <p style="color: #666; font-size: 14px;">
                ${methodName} üsulu ilə
            </p>
            <p style="color: #999; font-size: 12px; margin-top: 16px;">
                Qısa müddətdə hesabınıza köçürüləcək...
            </p>
        `;
        
        overlay.appendChild(notification);
        document.body.appendChild(overlay);
        
        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateY(-20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    handleMissingDepositInfo() {
        this.showError('Depozit məlumatları tapılmadı', 'Zəhmət olmasa depozit səhifəsindən yenidən başlayın');
    }
    
    handleExpiredDepositInfo() {
        localStorage.removeItem('depositInfo');
        this.showError('Depozit sessiyası bitdi', 'Zəhmət olmasa depozit səhifəsindən yenidən başlayın');
    }
    
    showError(title, message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            text-align: center;
            padding: 40px;
            max-width: 400px;
            margin: 50px auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        `;
        
        errorDiv.innerHTML = `
            <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
            <h2 style="color: #dc3545; margin-bottom: 12px;">${title}</h2>
            <p style="color: #6c757d; margin-bottom: 24px;">${message}</p>
            <a href="../depozit.html" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Depozit səhifəsinə qayıt
            </a>
        `;
        
        document.body.innerHTML = '';
        document.body.appendChild(errorDiv);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on payment pages
    if (window.location.pathname.includes('/payment/')) {
        new PaymentHandler();
    }
});