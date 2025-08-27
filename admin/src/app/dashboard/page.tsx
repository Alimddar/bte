import { fetchTransactions, users, paymentCards } from '@/lib/data';
import { TransactionsClient } from './transactions-client';

export default async function DashboardPage() {
  // Fetch real transactions from API
  const initialTransactions = await fetchTransactions();
  const userList = users;
  const cardList = paymentCards;

  return <TransactionsClient initialTransactions={initialTransactions} users={userList} cards={cardList} />;
}
