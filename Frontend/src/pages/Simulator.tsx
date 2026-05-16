import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Settings, AlertTriangle, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

interface RequestResult {
    id: number;
    status: number;
    timestamp: number;
}

export const Simulator: React.FC = () => {
    const [apiKey, setApiKey] = useState('');
    const [rps, setRps] = useState(5);
    const [isRunning, setIsRunning] = useState(false);
    const [results, setResults] = useState<RequestResult[]>([]);
    
    // Stats
    const [allowed, setAllowed] = useState(0);
    const [blocked, setBlocked] = useState(0);

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const reqIdRef = useRef(0);
    const isRunningRef = useRef(false);

    const fireRequest = async () => {
        if (!isRunningRef.current) return;
        
        reqIdRef.current += 1;
        const id = reqIdRef.current;
        
        try {
            await api.get('/external/test', {
                headers: { 'x-api-key': apiKey.trim() }
            });
            
            if (!isRunningRef.current) return;
            
            setResults(prev => [{ id, status: 200, timestamp: Date.now() }, ...prev].slice(0, 50));
            setAllowed(prev => prev + 1);
        } catch (error: any) {
            if (!isRunningRef.current) return;
            
            const status = error.status || 500;
            setResults(prev => [{ id, status, timestamp: Date.now() }, ...prev].slice(0, 50));
            if (status === 429) {
                setBlocked(prev => prev + 1);
            }
        }
    };

    const toggleSimulation = () => {
        if (!apiKey.trim()) {
            alert('Please enter an API Key first.');
            return;
        }
        if (isRunning) {
            isRunningRef.current = false;
            if (intervalRef.current) clearInterval(intervalRef.current);
            setIsRunning(false);
        } else {
            isRunningRef.current = true;
            setIsRunning(true);
            const intervalMs = 1000 / rps;
            intervalRef.current = setInterval(fireRequest, intervalMs);
        }
    };

    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    const resetStats = () => {
        setAllowed(0);
        setBlocked(0);
        setResults([]);
        reqIdRef.current = 0;
    };

    const total = allowed + blocked;
    const blockRate = total > 0 ? Math.round((blocked / total) * 100) : 0;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 h-full flex flex-col">
            <div>
                <h1 className="text-2xl font-bold text-slate-100">Traffic Simulator</h1>
                <p className="text-slate-400 text-sm mt-1">Generate live API traffic to test rate limiting behavior.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Control Panel */}
                <div className="lg:col-span-1 bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm flex flex-col gap-6">
                    <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                        <Settings size={20} /> Simulation Settings
                    </h3>
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">API Key to Test</label>
                        <input 
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            disabled={isRunning}
                            placeholder="rl_test_..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-primary disabled:opacity-50 font-mono text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Requests Per Second (RPS)</label>
                        <div className="flex items-center gap-4">
                            <input 
                                type="range" 
                                min="1" 
                                max="20" 
                                value={rps}
                                onChange={(e) => setRps(parseInt(e.target.value))}
                                disabled={isRunning}
                                className="flex-1 accent-primary"
                            />
                            <span className="text-slate-300 font-mono w-12 text-right">{rps}/s</span>
                        </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-slate-700 flex gap-4">
                        <button 
                            onClick={toggleSimulation}
                            className={`flex-1 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
                                isRunning 
                                    ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20' 
                                    : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
                            }`}
                        >
                            {isRunning ? <><Square size={18} fill="currentColor"/> Stop</> : <><Play size={18} fill="currentColor"/> Start</>}
                        </button>
                        <button 
                            onClick={resetStats}
                            disabled={isRunning}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors disabled:opacity-50"
                        >
                            Reset
                        </button>
                    </div>
                </div>

                {/* Live Stats */}
                <div className="lg:col-span-2 grid grid-cols-2 gap-6">
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col justify-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-10">
                            <CheckCircle2 size={100} className="text-emerald-400" />
                        </div>
                        <h3 className="text-slate-400 font-medium mb-2">Allowed Requests</h3>
                        <span className="text-5xl font-bold text-emerald-400">{allowed}</span>
                    </div>
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col justify-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-10">
                            <AlertTriangle size={100} className="text-rose-400" />
                        </div>
                        <h3 className="text-slate-400 font-medium mb-2">Rate Limited (429)</h3>
                        <span className="text-5xl font-bold text-rose-400">{blocked}</span>
                        <span className="text-sm font-medium text-rose-400/80 mt-2">{blockRate}% Block Rate</span>
                    </div>

                    {/* Live Log Terminal */}
                    <div className="col-span-2 bg-[#0A0A0A] p-4 rounded-xl border border-slate-800 h-64 overflow-hidden flex flex-col font-mono text-sm shadow-inner relative">
                        <div className="absolute top-0 left-0 w-full p-2 bg-slate-800 border-b border-slate-700 text-slate-400 text-xs flex justify-between px-4 z-10">
                            <span>Live Request Log</span>
                            <span>Showing last 50</span>
                        </div>
                        <div className="flex-1 overflow-y-auto pt-8 flex flex-col gap-1">
                            {results.length === 0 ? (
                                <span className="text-slate-600 italic">Waiting for simulation to start...</span>
                            ) : (
                                results.map(r => (
                                    <div key={r.id} className="flex gap-4 border-b border-slate-800/50 pb-1 pr-2">
                                        <span className="text-slate-500">[{new Date(r.timestamp).toISOString().split('T')[1].slice(0,-1)}]</span>
                                        <span className="text-slate-400 shrink-0">REQ #{r.id.toString().padStart(4, '0')}</span>
                                        <span className="flex-1 truncate">GET /api/external/test</span>
                                        {r.status === 200 ? (
                                            <span className="text-emerald-400 font-bold shrink-0">200 OK</span>
                                        ) : r.status === 429 ? (
                                            <span className="text-rose-400 font-bold shrink-0">429 LIMIT</span>
                                        ) : (
                                            <span className="text-amber-400 font-bold shrink-0">{r.status} ERR</span>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
