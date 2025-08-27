'use client';

import { BalancesClient } from './balances-client';
import { useState, useEffect } from 'react';
import type { Balance, User } from '@/lib/types';

export default function BalancesPage() {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        console.log('Fetching balances and users from backend...');
        
        // Fetch balances and users in parallel
        const [balancesResponse, usersResponse] = await Promise.all([
          fetch('http://localhost:5001/api/balances'),
          fetch('http://localhost:5001/api/users')
        ]);

        console.log('Balances response status:', balancesResponse.status);
        console.log('Users response status:', usersResponse.status);
        
        if (!balancesResponse.ok) {
          throw new Error(`Balances API error: HTTP ${balancesResponse.status}`);
        }
        
        if (!usersResponse.ok) {
          throw new Error(`Users API error: HTTP ${usersResponse.status}`);
        }
        
        const balancesData = await balancesResponse.json();
        const usersData = await usersResponse.json();
        
        console.log('Raw balances data:', balancesData);
        console.log('Raw users data:', usersData);

        // Transform users data
        const transformedUsers = usersData.map((user: any) => ({
          id: user.id.toString(),
          name: user.name ? `${user.name} ${user.surname || ''}`.trim() : user.username,
          email: user.email || `${user.username}@example.com`,
          joinedDate: user.createdAt || new Date().toISOString(),
        }));

        setBalances(balancesData);
        setUsers(transformedUsers);
        
        console.log('Set balances:', balancesData);
        console.log('Set users:', transformedUsers);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        setBalances([]);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Loading balances...</p>
        </div>
      </div>
    );
  }

  return <BalancesClient initialBalances={balances} users={users} />;
}
