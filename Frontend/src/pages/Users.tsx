import React, { useEffect, useState } from 'react';
import { Table } from '../components/Table';
import { StatusBadge } from '../components/StatusBadge';
import api from '../services/api';
import type { User } from '../types';
import { useAuth } from '../context/AuthContext';

export const Users: React.FC = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data.users);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const updateTier = async (userId: string, newTier: 'basic' | 'premium') => {
        try {
            await api.put(`/users/${userId}/tier`, { tier: newTier });
            fetchUsers();
        } catch (error) {
            console.error("Failed to update tier", error);
        }
    };

    if (currentUser?.role !== 'admin') {
        return (
            <div className="p-12 text-center text-slate-400 bg-slate-800 rounded-xl border border-slate-700">
                <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
                <p>You must be an administrator to view the user directory.</p>
            </div>
        );
    }

    const columns = [
        { header: 'User ID', accessor: (row: any) => <span className="font-mono text-xs text-slate-400">{row._id || row.id}</span> },
        { header: 'Email', accessor: (row: any) => row.email || <span className="italic text-slate-500">No Email</span> },
        { 
            header: 'Role', 
            accessor: (row: User) => (
                <StatusBadge 
                    status={row.role === 'admin' ? 'warning' : 'neutral'} 
                    text={row.role.toUpperCase()} 
                />
            )
        },
        { 
            header: 'Tier', 
            accessor: (row: User) => (
                <div className="flex items-center gap-2">
                    <StatusBadge 
                        status={row.tier === 'premium' ? 'success' : 'neutral'} 
                        text={row.tier.toUpperCase()} 
                    />
                    <select 
                        value={row.tier}
                        onChange={(e) => updateTier(row.id, e.target.value as 'basic'|'premium')}
                        className="bg-slate-900 border border-slate-700 rounded text-xs px-2 py-1 text-slate-300 outline-none"
                    >
                        <option value="basic">Basic (100 req/min)</option>
                        <option value="premium">Premium (500 req/min)</option>
                    </select>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-slate-100">User Management</h1>
                <p className="text-slate-400 text-sm mt-1">Manage platform users and their rate limiting tiers.</p>
            </div>

            {isLoading ? (
                <div className="h-48 flex items-center justify-center text-slate-400">Loading users...</div>
            ) : (
                <Table data={users} columns={columns} keyExtractor={(row) => row.id} />
            )}
        </div>
    );
};
