import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { verifyToken } from './auth.js';

const router = express.Router();

// Helper function to read JSON files
async function readJsonFile(filename) {
    try {
        const filePath = path.join(process.cwd(), 'data', filename);
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${filename}:`, error);
        return null;
    }
}

// Helper function to write JSON files
async function writeJsonFile(filename, data) {
    try {
        const filePath = path.join(process.cwd(), 'data', filename);
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Error writing ${filename}:`, error);
        return false;
    }
}

// Helper function to mask card number
function maskCardNumber(cardNumber) {
    const cleaned = cardNumber.replace(/\s/g, '');
    return `****-****-****-${cleaned.slice(-4)}`;
}

// Helper function to generate card ID
function generateCardId() {
    return 'card_' + crypto.randomBytes(8).toString('hex');
}

// Helper function to validate card number using Luhn algorithm
function validateCardNumber(cardNumber) {
    const cleaned = cardNumber.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(cleaned)) return false;

    let sum = 0;
    let isEven = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
        let digit = parseInt(cleaned[i]);
        
        if (isEven) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        
        sum += digit;
        isEven = !isEven;
    }

    return sum % 10 === 0;
}

// Helper function to detect card type
function detectCardType(cardNumber) {
    const cleaned = cardNumber.replace(/\s/g, '');
    
    if (/^4/.test(cleaned)) return 'visa';
    if (/^5[1-5]/.test(cleaned)) return 'mastercard';
    if (/^3[47]/.test(cleaned)) return 'amex';
    if (/^6/.test(cleaned)) return 'discover';
    
    return 'unknown';
}

// Get payment credentials for a specific method
router.get('/credentials/:method', async (req, res) => {
    try {
        const { method } = req.params;
        const credentials = await readJsonFile('payment-credentials.json');
        
        if (!credentials || !credentials[method]) {
            return res.status(404).json({
                success: false,
                message: 'Payment method not found'
            });
        }

        // Remove sensitive data before sending to frontend
        const publicData = {
            name: credentials[method].name,
            type: credentials[method].type,
            accountNumber: credentials[method].accountNumber,
            cardNumber: credentials[method].cardNumber,
            expiryDate: credentials[method].expiryDate,
            qrCode: credentials[method].qrCode,
            settings: credentials[method].settings,
            commission: credentials[method].credentials.commission,
            minAmount: credentials[method].credentials.minAmount,
            maxAmount: credentials[method].credentials.maxAmount,
            currency: credentials[method].credentials.currency
        };

        res.json({
            success: true,
            data: publicData
        });
    } catch (error) {
        console.error('Get credentials error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Process payment (VISA/Card payment from visa.html)
router.post('/process/card', verifyToken, async (req, res) => {
    try {
        const { amount, cardData, saveCard } = req.body;
        const userId = req.userId;

        // Validation
        if (!amount || amount < 5 || amount > 10000) {
            return res.status(400).json({
                success: false,
                message: 'Invalid amount. Must be between 5 and 10000 AZN'
            });
        }

        if (!cardData || !cardData.cardNumber || !cardData.cardHolder || !cardData.expiry || !cardData.cvv) {
            return res.status(400).json({
                success: false,
                message: 'All card fields are required'
            });
        }

        // Validate card number
        if (!validateCardNumber(cardData.cardNumber)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid card number'
            });
        }

        // Generate transaction ID
        const transactionId = 'txn_' + crypto.randomBytes(12).toString('hex');
        
        // Simulate payment processing (replace with real payment gateway integration)
        const paymentResult = await processCardPayment({
            transactionId,
            amount,
            cardData,
            userId
        });

        if (paymentResult.success) {
            // Save card if requested
            if (saveCard) {
                await saveUserCard(userId, cardData);
            }

            res.json({
                success: true,
                message: 'Payment processed successfully',
                data: {
                    transactionId,
                    amount,
                    currency: 'AZN',
                    status: 'completed',
                    cardSaved: saveCard
                }
            });
        } else {
            res.status(400).json({
                success: false,
                message: paymentResult.message || 'Payment failed'
            });
        }
    } catch (error) {
        console.error('Process card payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Process M10 payment
router.post('/process/m10', verifyToken, async (req, res) => {
    try {
        const { amount, phone } = req.body;
        const userId = req.userId;

        if (!amount || amount < 1 || amount > 2000) {
            return res.status(400).json({
                success: false,
                message: 'Invalid amount. Must be between 1 and 2000 AZN'
            });
        }

        if (!phone) {
            return res.status(400).json({
                success: false,
                message: 'Phone number is required'
            });
        }

        const transactionId = 'txn_m10_' + crypto.randomBytes(12).toString('hex');
        
        // Simulate M10 payment processing
        const paymentResult = await processM10Payment({
            transactionId,
            amount,
            phone,
            userId
        });

        res.json({
            success: paymentResult.success,
            message: paymentResult.message,
            data: paymentResult.success ? {
                transactionId,
                amount,
                currency: 'AZN',
                status: 'pending', // M10 payments usually require SMS confirmation
                smsRequired: true
            } : null
        });
    } catch (error) {
        console.error('Process M10 payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Process MPay payment
router.post('/process/mpay', verifyToken, async (req, res) => {
    try {
        const { amount, walletId } = req.body;
        const userId = req.userId;

        if (!amount || amount < 2 || amount > 3000) {
            return res.status(400).json({
                success: false,
                message: 'Invalid amount. Must be between 2 and 3000 AZN'
            });
        }

        if (!walletId) {
            return res.status(400).json({
                success: false,
                message: 'Wallet ID is required'
            });
        }

        const transactionId = 'txn_mpay_' + crypto.randomBytes(12).toString('hex');
        
        // Simulate MPay payment processing
        const paymentResult = await processMPayPayment({
            transactionId,
            amount,
            walletId,
            userId
        });

        res.json({
            success: paymentResult.success,
            message: paymentResult.message,
            data: paymentResult.success ? {
                transactionId,
                amount,
                currency: 'AZN',
                status: 'completed'
            } : null
        });
    } catch (error) {
        console.error('Process MPay payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get user's saved cards
router.get('/cards', verifyToken, async (req, res) => {
    try {
        const savedCards = await readJsonFile('saved-cards.json');
        
        if (!savedCards) {
            return res.json({
                success: true,
                data: { cards: [] }
            });
        }

        res.json({
            success: true,
            data: { cards: savedCards.cards }
        });
    } catch (error) {
        console.error('Get saved cards error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Delete a saved card
router.delete('/cards/:cardNumber', verifyToken, async (req, res) => {
    try {
        const { cardNumber } = req.params;
        
        const savedCards = await readJsonFile('saved-cards.json');
        if (!savedCards) {
            return res.status(404).json({
                success: false,
                message: 'Card not found'
            });
        }

        const cardIndex = savedCards.cards.findIndex(card => 
            card.cardNumber === cardNumber
        );

        if (cardIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Card not found'
            });
        }

        savedCards.cards.splice(cardIndex, 1);
        await writeJsonFile('saved-cards.json', savedCards);

        res.json({
            success: true,
            message: 'Card deleted successfully'
        });
    } catch (error) {
        console.error('Delete card error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Helper function to save user card
async function saveUserCard(userId, cardData) {
    try {
        const savedCards = await readJsonFile('saved-cards.json');
        if (!savedCards) return false;
        
        const newCard = {
            cardNumber: cardData.cardNumber,
            expiryDate: cardData.expiry,
            cvv: cardData.cvv,
            bankName: cardData.bank || 'Unknown'
        };

        savedCards.cards.push(newCard);
        await writeJsonFile('saved-cards.json', savedCards);
        
        return true;
    } catch (error) {
        console.error('Save card error:', error);
        return false;
    }
}

// Simulate payment processing functions
async function processCardPayment(paymentData) {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate 95% success rate
    const success = Math.random() > 0.05;
    
    return {
        success,
        message: success ? 'Payment processed successfully' : 'Payment declined by bank'
    };
}

async function processM10Payment(paymentData) {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const success = Math.random() > 0.1;
    
    return {
        success,
        message: success ? 'SMS sent to your phone for confirmation' : 'M10 service temporarily unavailable'
    };
}

async function processMPayPayment(paymentData) {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const success = Math.random() > 0.08;
    
    return {
        success,
        message: success ? 'Payment processed via MPay' : 'Insufficient funds in MPay wallet'
    };
}

export default router;