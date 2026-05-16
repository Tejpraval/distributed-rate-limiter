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
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [summaryRes, trafficRes] = await Promise.all([
                    api.get('/analytics/summary'),
                    api.get('/analytics/traffic')
                ]);
                
                setStats(summaryRes.data.summary);
                setTraffic(trafficRes.data.traffic);
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
        </div>
    );
};
