export type User = {
  id: string;
  name: string;
  email: string;
  joinedDate: string;
};

export type Transaction = {
  id: string;
  userId: string;
  user: {
    id: string;
    username: string;
    email?: string;
    name?: string;
    surname?: string;
  };
  amount: number;
  paymentMethod: 'card-deposit' | 'm10' | 'mpay';
  status: 'pending' | 'completed' | 'failed';
  paymentCredentials?: any;
  receiptUrl?: string;
  transactionReference?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type Balance = {
  userId: string;
  userName: string;
  balance: number;
  currency: string;
};

export type PaymentCard = {
    id: string;
    provider: string;
    lastFour: string;
    expiryDate: string;
    status: 'Active' | 'Inactive';
};
