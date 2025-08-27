'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { CheckCircle, XCircle, ChevronDown, CreditCard, Smartphone, Wallet } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { updateTransactionStatus } from '@/lib/data';
import type { Transaction, User, PaymentCard } from '@/lib/types';

export function TransactionsClient({
  initialTransactions,
  users,
  cards
}: {
  initialTransactions: Transaction[];
  users: User[];
  cards: PaymentCard[];
}) {
  const [transactions, setTransactions] = React.useState(initialTransactions);
  const { toast } = useToast();

  const handleUpdateTransactionStatus = async (transactionId: string, status: 'completed' | 'failed') => {
    try {
      const success = await updateTransactionStatus(transactionId, status);
      
      if (success) {
        setTransactions(prevTransactions =>
          prevTransactions.map(t =>
            t.id === transactionId ? { ...t, status } : t
          )
        );
        toast({
          title: 'Transaction Updated',
          description: `Transaction status has been changed to ${status}.`,
        });
      } else {
        toast({
          title: 'Update Failed',
          description: 'Failed to update transaction status. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while updating the transaction.',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadgeVariant = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'failed':
        return 'destructive';
    }
  };

  const getPaymentMethodIcon = (paymentMethod: string) => {
    switch (paymentMethod) {
      case 'card-deposit':
        return <CreditCard className="w-5 h-5" />;
      case 'm10':
        return <Smartphone className="w-5 h-5" />;
      case 'mpay':
        return <Wallet className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  const getPaymentMethodName = (paymentMethod: string) => {
    switch (paymentMethod) {
      case 'card-deposit':
        return 'Card Deposit';
      case 'm10':
        return 'M10 Transfer';
      case 'mpay':
        return 'MPay Transfer';
      default:
        return paymentMethod;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="hidden md:table-cell text-center">Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length > 0 ? (
                transactions.map(transaction => (
                  <Collapsible asChild key={transaction.id}>
                    <>
                      <TableRow>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div>
                              <p className="font-medium">
                                {transaction.user?.username ? `user_${transaction.user.username}` : 'Unknown User'}
                                {transaction.user?.name && transaction.user?.surname && 
                                  ` (${transaction.user.name} ${transaction.user.surname})`}
                              </p>
                              <p className="text-sm text-muted-foreground">{transaction.transactionReference || `#${transaction.id.toString().substring(0, 8)}`}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">{format(new Date(transaction.createdAt), 'PP')}</TableCell>
                        <TableCell className="text-right font-medium">
                          {new Intl.NumberFormat('az-AZ', { style: 'currency', currency: 'AZN' }).format(transaction.amount)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-center">
                          <Badge variant={getStatusBadgeVariant(transaction.status)}>{transaction.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                           <div className="flex justify-end gap-2">
                            {transaction.status === 'pending' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                                  onClick={() => handleUpdateTransactionStatus(transaction.id.toString(), 'completed')}
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Complete
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                  onClick={() => handleUpdateTransactionStatus(transaction.id.toString(), 'failed')}
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Reject
                                </Button>
                              </>
                            )}
                            </div>
                        </TableCell>
                        <TableCell>
                          <CollapsibleTrigger asChild>
                              <Button variant="ghost" size="icon" className="data-[state=open]:rotate-180">
                                  <ChevronDown className="h-4 w-4" />
                                  <span className="sr-only">Toggle details</span>
                              </Button>
                          </CollapsibleTrigger>
                        </TableCell>
                      </TableRow>
                      <CollapsibleContent asChild>
                          <TableRow>
                              <TableCell colSpan={6}>
                                  <div className="p-4 bg-muted/50 space-y-3">
                                      <div className="flex items-center gap-3">
                                          {getPaymentMethodIcon(transaction.paymentMethod)}
                                          <div>
                                              <p className="font-medium">{getPaymentMethodName(transaction.paymentMethod)}</p>
                                              <p className="text-sm text-muted-foreground">
                                                {transaction.paymentMethod === 'card-deposit' && transaction.paymentCredentials?.senderCard && 
                                                  `Card: ${transaction.paymentCredentials.senderCard}`}
                                                {transaction.paymentMethod === 'm10' && transaction.paymentCredentials?.senderPhone && 
                                                  `From: ${transaction.paymentCredentials.senderPhone}`}
                                                {transaction.paymentMethod === 'mpay' && transaction.paymentCredentials?.senderWallet && 
                                                  `From: ${transaction.paymentCredentials.senderWallet}`}
                                              </p>
                                          </div>
                                      </div>
                                      {transaction.receiptUrl && (
                                        <div className="pt-2">
                                          <p className="text-sm font-medium">Receipt:</p>
                                          <a 
                                            href={transaction.receiptUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-600 hover:underline"
                                          >
                                            View Receipt
                                          </a>
                                        </div>
                                      )}
                                      {transaction.notes && (
                                        <div className="pt-2">
                                          <p className="text-sm font-medium">Notes:</p>
                                          <p className="text-sm text-muted-foreground">{transaction.notes}</p>
                                        </div>
                                      )}
                                  </div>
                              </TableCell>
                          </TableRow>
                      </CollapsibleContent>
                    </>
                  </Collapsible>
                ))
              ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No transactions found.
                    </TableCell>
                  </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
