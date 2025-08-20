import express from 'express';
import fs from 'fs/promises';
import path from 'path';

const router = express.Router();
const credentialsPath = path.join(process.cwd(), 'data', 'payment-credentials.json');

// GET /api/payment-methods - Get all payment methods
router.get('/', async (req, res) => {
  try {
    const data = await fs.readFile(credentialsPath, 'utf8');
    const credentials = JSON.parse(data);
    
    // Transform to match frontend PaymentCard type
    const paymentMethods = Object.entries(credentials).map(([key, value]) => ({
      id: key,
      provider: value.name,
      type: value.type,
      status: 'Active',
      accountNumber: value.accountNumber || value.cardNumber || null,
      expiryDate: value.expiryDate || null,
      qrCode: value.qrCode || null,
      credentials: value.credentials,
      minAmount: value.credentials.minAmount,
      maxAmount: value.credentials.maxAmount,
      commission: value.credentials.commission || 0,
      currency: value.credentials.currency || 'AZN'
    }));
    
    res.json(paymentMethods);
  } catch (error) {
    console.error('Error reading payment credentials:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment methods'
    });
  }
});

// PUT /api/payment-methods/:id - Update payment method
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Read current data
    const data = await fs.readFile(credentialsPath, 'utf8');
    const credentials = JSON.parse(data);
    
    if (!credentials[id]) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
    }
    
    // Update the payment method
    credentials[id] = {
      ...credentials[id],
      name: updateData.provider || credentials[id].name,
      accountNumber: updateData.accountNumber || credentials[id].accountNumber,
      cardNumber: updateData.accountNumber || credentials[id].cardNumber,
      expiryDate: updateData.expiryDate || credentials[id].expiryDate,
      qrCode: updateData.qrCode || credentials[id].qrCode,
      credentials: {
        ...credentials[id].credentials,
        minAmount: parseFloat(updateData.minAmount) || credentials[id].credentials.minAmount,
        maxAmount: parseFloat(updateData.maxAmount) || credentials[id].credentials.maxAmount,
        commission: parseFloat(updateData.commission) || credentials[id].credentials.commission || 0,
        currency: updateData.currency || credentials[id].credentials.currency || 'AZN'
      }
    };
    
    // Write back to file
    await fs.writeFile(credentialsPath, JSON.stringify(credentials, null, 2));
    
    res.json({
      success: true,
      message: 'Payment method updated successfully',
      data: credentials[id]
    });
  } catch (error) {
    console.error('Error updating payment method:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment method'
    });
  }
});

export default router;