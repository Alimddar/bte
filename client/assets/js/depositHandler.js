// Deposit functionality handler
class DepositHandler {
    constructor() {
        this.paymentMethods = {
            'cardtocard': {
                name: 'Card To Card',
                url: './payment/card-deposit.html',
                min: 5,
                max: 10000
            },
            'mpay': {
                name: 'Auto Mpay',
                url: './payment/mpay.html',
                min: 1,
                max: 10000
            },
            'visa': {
                name: 'Visa/Mastercard',
                url: './payment/visa.html',
                min: 5,
                max: 10000
            },
            'm10': {
                name: 'Auto M10',
                url: './payment/m10.html',
                min: 10,
                max: 10000
            }
        };
        
        this.init();
    }
    
    init() {
        this.setupFormHandlers();
    }
    
    setupFormHandlers() {
        const cards = document.querySelectorAll('.card');
        console.log(`Found ${cards.length} payment cards`);
        
        cards.forEach((card, index) => {
            const form = card.querySelector('form');
            const amountInput = card.querySelector('input[name="amount"]');
            const submitButton = card.querySelector('button');
            
            console.log(`Card ${index}: form=${!!form}, input=${!!amountInput}, button=${!!submitButton}`);
            
            if (form && amountInput && submitButton) {
                // Determine payment method based on card index
                let paymentMethod;
                switch(index) {
                    case 0: paymentMethod = 'cardtocard'; break;
                    case 1: paymentMethod = 'mpay'; break;
                    case 2: paymentMethod = 'visa'; break;
                    case 3: paymentMethod = 'm10'; break;
                    default: return;
                }
                
                const method = this.paymentMethods[paymentMethod];
                console.log(`Setting up ${paymentMethod} with limits: ${method.min}-${method.max} AZN`);
                
                // Add input validation
                amountInput.setAttribute('min', method.min);
                amountInput.setAttribute('max', method.max);
                amountInput.placeholder = `${method.min} - ${method.max} AZN`;
                
                // Handle form submission
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    console.log(`Form submit prevented for ${paymentMethod}`);
                    this.handleDeposit(paymentMethod, amountInput.value);
                });
                
                // Also handle button click directly
                submitButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log(`Button clicked for ${paymentMethod}`);
                    this.handleDeposit(paymentMethod, amountInput.value);
                });
                
                // Real-time validation
                amountInput.addEventListener('input', () => {
                    this.validateAmount(amountInput, method, submitButton);
                });
            }
        });
    }
    
    validateAmount(input, method, button) {
        const amount = parseFloat(input.value);
        const isValid = amount >= method.min && amount <= method.max && amount > 0;
        
        // Update input styling
        if (input.value && !isValid) {
            input.style.borderColor = '#ff4757';
            input.style.backgroundColor = '#fff5f5';
        } else {
            input.style.borderColor = '#ddd';
            input.style.backgroundColor = '#fff';
        }
        
        // Enable/disable button
        button.disabled = !isValid || !input.value;
        button.style.opacity = button.disabled ? '0.5' : '1';
        button.style.cursor = button.disabled ? 'not-allowed' : 'pointer';
        
        // Show validation message
        let errorMsg = input.parentElement.querySelector('.error-message');
        if (!isValid && input.value) {
            if (!errorMsg) {
                errorMsg = document.createElement('span');
                errorMsg.className = 'error-message';
                errorMsg.style.color = '#ff4757';
                errorMsg.style.fontSize = '12px';
                errorMsg.style.display = 'block';
                errorMsg.style.marginTop = '5px';
                input.parentElement.appendChild(errorMsg);
            }
            errorMsg.textContent = `Miqdar ${method.min} - ${method.max} AZN arasında olmalıdır`;
        } else if (errorMsg) {
            errorMsg.remove();
        }
    }
    
    handleDeposit(paymentMethod, amount) {
        console.log(`handleDeposit called: method=${paymentMethod}, amount=${amount}`);
        
        const method = this.paymentMethods[paymentMethod];
        const numAmount = parseFloat(amount);
        
        // Validate amount
        if (!amount || numAmount < method.min || numAmount > method.max) {
            alert(`Miqdar ${method.min} - ${method.max} AZN arasında olmalıdır`);
            return;
        }
        
        // Check if user is authenticated
        const token = localStorage.getItem('token');
        console.log(`Token check: ${token ? 'Present' : 'Missing'}`);
        
        if (!token) {
            alert('Zəhmət olmasa əvvəlcə daxil olun');
            window.location.href = './index.html';
            return;
        }
        
        // Store deposit info for payment page
        const depositInfo = {
            method: paymentMethod,
            methodName: method.name,
            amount: numAmount,
            timestamp: Date.now()
        };
        
        console.log('Storing deposit info:', depositInfo);
        localStorage.setItem('depositInfo', JSON.stringify(depositInfo));
        
        // Navigate to payment page
        console.log(`Navigating to: ${method.url}`);
        window.location.href = method.url;
    }
}

// Initialize when page loads
// Use jQuery ready since the page uses jQuery
if (typeof $ !== 'undefined') {
    $(document).ready(function() {
        // Only initialize on deposit page
        if (window.location.pathname.includes('depozit.html')) {
            console.log('Initializing DepositHandler...');
            new DepositHandler();
        }
    });
} else {
    // Fallback if jQuery not loaded
    document.addEventListener('DOMContentLoaded', () => {
        // Only initialize on deposit page
        if (window.location.pathname.includes('depozit.html')) {
            console.log('Initializing DepositHandler (no jQuery)...');
            new DepositHandler();
        }
    });
}