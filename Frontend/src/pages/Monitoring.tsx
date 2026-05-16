import React, { useEffect, useState } from 'react';
import { ChartCard } from '../components/ChartCard';
import { StatusBadge } from '../components/StatusBadge';
import { Activity, Database, Server, RefreshCw } from 'lucide-react';
import api from '../services/api';

interface HealthData {
    status: 'healthy' | 'unhealthy';
    services: {
        mongodb: 'connected' | 'disconnected';
        redis: 'connected' | 'disconnected';
    };
    timestamp: string;
}

export const Monitoring: React.FC = () => {
    const [health, setHealth] = useState<HealthData | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const checkHealth = async () => {
        setIsRefreshing(true);
        try {
            const res = await api.get('/monitoring/health');
            setHealth(res.data); // Interceptor unwraps to { status, services, timestamp }
        } catch (error) {
            console.error("Health check failed", error);
        } finally {
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        checkHealth();
        const interval = setInterval(checkHealth, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">Infrastructure Monitoring</h1>
                    <p className="text-slate-400 text-sm mt-1">Real-time health of the control plane systems.</p>
                </div>
                <button 
                    onClick={checkHealth}
                    disabled={isRefreshing}
                    className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
                >
                    <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
                    Refresh Status
                </button>
            </div>

            {health && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-slate-400 font-medium text-sm flex items-center gap-2">
                                <Activity size={18} /> Global System Status
                            </h3>
                        </div>
                        <div className="mt-4">
                            <StatusBadge 
                                status={health.status === 'healthy' ? 'success' : 'error'} 
                                text={health.status.toUpperCase()} 
                            />
                            <p className="text-slate-500 text-xs mt-4">Last checked: {new Date(health.timestamp).toLocaleTimeString()}</p>
                        </div>
                    </div>

                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-slate-400 font-medium text-sm flex items-center gap-2">
                                <Database size={18} /> MongoDB Cluster
                            </h3>
                        </div>
                        <div className="mt-4">
                            <StatusBadge 
                                status={health.services.mongodb === 'connected' ? 'success' : 'error'} 
                                text={health.services.mongodb.toUpperCase()} 
                            />
                            <p className="text-slate-500 text-xs mt-4">Atlas primary replica set</p>
                        </div>
                    </div>

                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-slate-400 font-medium text-sm flex items-center gap-2">
                                <Server size={18} /> Redis Cache
                            </h3>
                        </div>
                        <div className="mt-4">
                            <StatusBadge 
                                status={health.services.redis === 'connected' ? 'success' : 'error'} 
                                text={health.services.redis.toUpperCase()} 
                            />
                            <p className="text-slate-500 text-xs mt-4">Lua Rate Limiter Engine</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
