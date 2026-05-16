import React, { useEffect, useState } from 'react';
import { StatCard } from '../components/StatCard';
import { ChartCard } from '../components/ChartCard';
import { Activity, ShieldAlert, Key, Users } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import type { SummaryStats, TrafficData } from '../types';

export const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<SummaryStats | null>(null);
    const [traffic, setTraffic] = useState<TrafficData[]>([]);
    const [topConsumers, setTopConsumers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [summaryRes, trafficRes, topRes] = await Promise.all([
                    api.get('/analytics/summary'),
                    api.get('/analytics/traffic'),
                    api.get('/analytics/top-consumers').catch(() => ({ data: { topConsumers: [] } })) // Fallback if not admin
                ]);
                
                setStats(summaryRes.data.summary);
                setTraffic(trafficRes.data.traffic);
                setTopConsumers(topRes.data.topConsumers);
            } catch (error) {
                console.error("Failed to fetch dashboard data");
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (isLoading || !stats) {
        return <div className="animate-pulse flex gap-6"><div className="h-32 w-1/4 bg-slate-800 rounded-xl"></div></div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-2xl font-bold text-slate-100 mb-6">Platform Overview</h1>
            
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Requests" 
                    value={stats.totalRequests.toLocaleString()} 
                    icon={<Activity size={20} className="text-primary" />} 
                />
                <StatCard 
                    title="Blocked Requests" 
                    value={stats.blockedRequests.toLocaleString()} 
                    icon={<ShieldAlert size={20} className="text-rose-400" />} 
                />
                <StatCard 
                    title="Active API Keys" 
                    value={stats.activeApiKeys} 
                    icon={<Key size={20} className="text-emerald-400" />} 
                />
                <StatCard 
                    title="Total Users" 
                    value={stats.activeUsers} 
                    icon={<Users size={20} className="text-amber-400" />} 
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 gap-6">
                <ChartCard title="Traffic Volume (Allowed vs Blocked)">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={traffic} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorAllowed" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorBlocked" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis 
                                dataKey="timestamp" 
                                stroke="#94a3b8" 
                                tick={{fill: '#94a3b8', fontSize: 12}} 
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis 
                                stroke="#94a3b8" 
                                tick={{fill: '#94a3b8', fontSize: 12}}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(1)}k` : value}
                            />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '0.5rem' }}
                                itemStyle={{ color: '#f8fafc' }}
                            />
                            <Area type="monotone" dataKey="allowed" name="Allowed" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorAllowed)" />
                            <Area type="monotone" dataKey="blocked" name="Blocked (Rate Limited)" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorBlocked)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            {/* Top Consumers Table */}
            {topConsumers.length > 0 && (
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm mt-6">
                    <h3 className="text-lg font-semibold text-slate-100 mb-4">Top API Keys by Usage</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-slate-300">
                            <thead className="text-xs uppercase text-slate-400 border-b border-slate-700">
                                <tr>
                                    <th className="px-4 py-3">Key Name</th>
                                    <th className="px-4 py-3">Environment</th>
                                    <th className="px-4 py-3">User</th>
                                    <th className="px-4 py-3">Tier</th>
                                    <th className="px-4 py-3 text-right">Total Requests</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topConsumers.map((consumer) => (
                                    <tr key={consumer._id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                                        <td className="px-4 py-3 font-medium text-slate-200">{consumer.name}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${consumer.environment === 'live' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                                {consumer.environment.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">{consumer.userId?.email || 'N/A'}</td>
                                        <td className="px-4 py-3 capitalize">{consumer.userId?.tier || 'N/A'}</td>
                                        <td className="px-4 py-3 text-right font-mono font-bold text-primary">{consumer.totalRequests.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};
