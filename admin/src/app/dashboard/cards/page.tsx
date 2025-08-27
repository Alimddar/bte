'use client';

import { CardsClient } from './cards-client';
import { useState, useEffect } from 'react';

// Extended PaymentCard type for backend data
interface PaymentMethod {
  id: string;
  provider: string;
  type: string;
  status: string;
  accountNumber?: string;
  expiryDate?: string;
  qrCode?: string;
  credentials: any;
  minAmount: number;
  maxAmount: number;
  commission: number;
  currency: string;
}

export default function CardsPage() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPaymentMethods = async () => {
    try {
      console.log('Fetching payment methods from backend...');
      const response = await fetch('http://localhost:5000/api/payment-methods');
      console.log('Payment methods response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Raw payment methods data:', data);
      
      setPaymentMethods(data);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      setPaymentMethods([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const handleUpdate = async (id: string, updateData: any) => {
    try {
      console.log('Updating payment method:', id, updateData);
      const response = await fetch(`http://localhost:5000/api/payment-methods/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Update result:', result);

      // Refresh the data
      await fetchPaymentMethods();
      
      return { success: true };
    } catch (error) {
      console.error('Error updating payment method:', error);
      return { success: false, error: error.message };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Loading payment methods...</p>
        </div>
      </div>
    );
  }

  return <CardsClient initialCards={paymentMethods} onUpdate={handleUpdate} />;
}
