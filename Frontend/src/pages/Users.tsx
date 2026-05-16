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
    const [isCreating, setIsCreating] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newRole, setNewRole] = useState<'user' | 'admin'>('user');

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

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', { 
                email: newEmail, 
                password: newPassword, 
                role: newRole 
            });
            setNewEmail('');
            setNewPassword('');
            setIsCreating(false);
            fetchUsers();
        } catch (error) {
            console.error("Failed to create user", error);
        }
    };

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
                        onChange={(e) => updateTier((row as any)._id || row.id, e.target.value as 'basic'|'premium')}
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
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">User Management</h1>
                    <p className="text-slate-400 text-sm mt-1">Manage platform users and their rate limiting tiers.</p>
                </div>
                {!isCreating && (
                    <button 
                        onClick={() => setIsCreating(true)}
                        className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                        Create User
                    </button>
                )}
            </div>

            {isCreating && (
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm animate-in slide-in-from-top-4 duration-300">
                    <h3 className="text-lg font-semibold text-slate-100 mb-4">Create New User</h3>
                    <form onSubmit={handleCreate} className="flex flex-wrap gap-4 items-end">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
                            <input 
                                type="email" 
                                value={newEmail}
                                onChange={e => setNewEmail(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-primary"
                                placeholder="user@example.com"
                                required
                            />
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                            <input 
                                type="password" 
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-primary"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <div className="w-40">
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Role</label>
                            <select 
                                value={newRole}
                                onChange={e => setNewRole(e.target.value as 'user'|'admin')}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-primary"
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                            Create
                        </button>
                        <button type="button" onClick={() => setIsCreating(false)} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                            Cancel
                        </button>
                    </form>
                </div>
            )}

            {isLoading ? (
                <div className="h-48 flex items-center justify-center text-slate-400">Loading users...</div>
            ) : (
                <Table data={users} columns={columns} keyExtractor={(row) => row.id} />
            )}
        </div>
    );
};
