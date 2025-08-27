'use client';

import * as React from 'react';
import { Pencil, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { updateBalance } from '@/lib/data';
import type { Balance, User } from '@/lib/types';

export function BalancesClient({
  initialBalances,
  users,
}: {
  initialBalances: Balance[];
  users: User[];
}) {
  const [balances, setBalances] = React.useState(initialBalances);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editingValue, setEditingValue] = React.useState<string>('');
  const { toast } = useToast();

  const handleEditClick = (userId: string, currentBalance: number) => {
    setEditingId(userId);
    setEditingValue(currentBalance.toString());
  };

  const handleSaveClick = async (userId: string) => {
    const newBalance = parseFloat(editingValue);
    
    if (isNaN(newBalance) || newBalance < 0) {
      toast({
        title: 'Invalid Balance',
        description: 'Please enter a valid positive number',
        variant: 'destructive',
      });
      return;
    }

    try {
      const success = await updateBalance(userId, newBalance);
      
      if (success) {
        // Update local state
        setBalances(prevBalances =>
          prevBalances.map(balance =>
            balance.userId === userId 
              ? { ...balance, balance: newBalance }
              : balance
          )
        );
        
        setEditingId(null);
        setEditingValue('');
        
        toast({
          title: 'Balance Updated',
          description: 'User balance has been successfully updated.',
        });
      } else {
        toast({
          title: 'Update Failed',
          description: 'Failed to update user balance. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating balance:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while updating the balance.',
        variant: 'destructive',
      });
    }
  };

  const handleCancelClick = () => {
    setEditingId(null);
    setEditingValue('');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Balances</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="hidden sm:table-cell text-center">Currency</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {balances.length > 0 ? (
                balances.map(balance => (
                  <TableRow key={balance.userId}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">{balance.userName}</p>
                          <p className="text-sm text-muted-foreground">{users.find(u => u.id === balance.userId)?.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {editingId === balance.userId ? (
                        <Input
                          type="number"
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          className="w-24 text-right"
                          step="0.01"
                          min="0"
                        />
                      ) : (
                        new Intl.NumberFormat('az-AZ', { style: 'currency', currency: 'AZN' }).format(balance.balance)
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-center">
                        {balance.currency}
                    </TableCell>
                    <TableCell className="text-right">
                      {editingId === balance.userId ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                            onClick={() => handleSaveClick(balance.userId)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                            onClick={handleCancelClick}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(balance.userId, balance.balance)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No balances found.
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
