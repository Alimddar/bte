'use client';

import { UserManagementClient } from './user-management-client';
import { useState, useEffect } from 'react';
import type { User } from '@/lib/types';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        console.log('Fetching users from backend...');
        const response = await fetch('http://localhost:5000/api/users');
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const userData = await response.json();
        console.log('Raw user data from backend:', userData);
        console.log('Number of users:', userData.length);
        
        // Transform backend user data to match frontend User type
        const transformedUsers = userData.map((user: any) => ({
          id: user.id.toString(),
          name: user.name ? `${user.name} ${user.surname || ''}`.trim() : user.username,
          email: user.email || `${user.username}@example.com`,
          joinedDate: user.createdAt || new Date().toISOString(),
        }));
        
        console.log('Transformed users:', transformedUsers);
        setUsers(transformedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        console.error('Error details:', error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Loading users...</p>
        </div>
      </div>
    );
  }

  return <UserManagementClient initialUsers={users} />;
}
