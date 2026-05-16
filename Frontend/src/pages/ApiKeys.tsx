import React, { useEffect, useState } from 'react';
import { Table } from '../components/Table';
import { StatusBadge } from '../components/StatusBadge';
import { Key, Plus, Trash2, Copy, Check } from 'lucide-react';
import api from '../services/api';
import type { ApiKey } from '../types';

export const ApiKeys: React.FC = () => {
    const [keys, setKeys] = useState<ApiKey[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [newKeyEnv, setNewKeyEnv] = useState<'live'|'test'>('test');
    
    // Modal state for newly created key
    const [createdRawKey, setCreatedRawKey] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const fetchKeys = async () => {
        try {
            const res = await api.get('/keys');
            setKeys(res.data.keys);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchKeys();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post('/keys', { name: newKeyName, environment: newKeyEnv });
            setCreatedRawKey(res.data.rawKey);
            setNewKeyName('');
            setIsCreating(false);
            fetchKeys();
        } catch (error) {
            console.error("Failed to create key", error);
        }
    };

    const handleRevoke = async (id: string) => {
        if (!confirm('Are you sure you want to revoke this API key? This cannot be undone.')) return;
        try {
            await api.delete(`/keys/${id}`);
            fetchKeys();
        } catch (error) {
            console.error("Failed to revoke key", error);
        }
    };

    const copyToClipboard = () => {
        if (createdRawKey) {
            navigator.clipboard.writeText(createdRawKey);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const columns = [
        { header: 'Name', accessor: 'name' as keyof ApiKey },
        { 
            header: 'Environment', 
            accessor: (row: ApiKey) => (
                <StatusBadge 
                    status={row.environment === 'live' ? 'success' : 'warning'} 
                    text={row.environment.toUpperCase()} 
                />
            )
        },
        { header: 'Masked Key', accessor: (row: ApiKey) => <code className="bg-slate-900 px-2 py-1 rounded text-slate-300 border border-slate-700">{row.maskedKey}</code> },
        { header: 'Created', accessor: (row: ApiKey) => new Date(row.createdAt).toLocaleDateString() },
        { header: 'Total Requests', accessor: (row: ApiKey) => (row.totalRequests || 0).toLocaleString() },
        { 
            header: 'Actions', 
            accessor: (row: any) => (
                <button 
                    onClick={() => handleRevoke(row._id || row.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded transition-colors"
                    title="Revoke Key"
                >
                    <Trash2 size={16} />
                </button>
            )
        }
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">API Keys</h1>
                    <p className="text-slate-400 text-sm mt-1">Manage your programmatic access keys.</p>
                </div>
                <button 
                    onClick={() => setIsCreating(true)}
                    className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
                >
                    <Plus size={18} />
                    Create New Key
                </button>
            </div>

            {isCreating && (
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6 shadow-lg">
                    <h3 className="text-lg font-semibold text-slate-100 mb-4">Create New API Key</h3>
                    <form onSubmit={handleCreate} className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Key Name</label>
                            <input 
                                required
                                value={newKeyName}
                                onChange={e => setNewKeyName(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-primary"
                                placeholder="e.g. Production Mobile App"
                            />
                        </div>
                        <div className="w-48">
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Environment</label>
                            <select 
                                value={newKeyEnv}
                                onChange={e => setNewKeyEnv(e.target.value as 'live'|'test')}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-primary"
                            >
                                <option value="test">Test (Sandbox)</option>
                                <option value="live">Live (Production)</option>
                            </select>
                        </div>
                        <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                            Generate
                        </button>
                        <button type="button" onClick={() => setIsCreating(false)} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                            Cancel
                        </button>
                    </form>
                </div>
            )}

            {createdRawKey && (
                <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-xl mb-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-amber-500/20 rounded-lg text-amber-400">
                            <Key size={24} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-amber-400">Save Your API Key Now!</h3>
                            <p className="text-slate-300 text-sm mt-1">
                                For security reasons, this is the <strong>only time</strong> we will show you the full key. If you lose it, you will need to revoke it and generate a new one.
                            </p>
                            <div className="mt-4 flex items-center gap-2">
                                <code className="flex-1 bg-slate-900 px-4 py-3 rounded-lg border border-amber-500/30 text-amber-200 font-mono text-lg break-all">
                                    {createdRawKey}
                                </code>
                                <button 
                                    onClick={copyToClipboard}
                                    className="bg-slate-800 hover:bg-slate-700 p-3 rounded-lg border border-slate-700 transition-colors text-slate-300"
                                    title="Copy to clipboard"
                                >
                                    {copied ? <Check size={20} className="text-emerald-400" /> : <Copy size={20} />}
                                </button>
                            </div>
                            <button 
                                onClick={() => setCreatedRawKey(null)}
                                className="mt-4 text-sm text-slate-400 hover:text-slate-200 underline"
                            >
                                I have saved my key safely
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isLoading ? (
                <div className="h-48 flex items-center justify-center text-slate-400">Loading keys...</div>
            ) : (
                <Table data={keys} columns={columns} keyExtractor={(row: any) => row._id || row.id} />
            )}
        </div>
    );
};
