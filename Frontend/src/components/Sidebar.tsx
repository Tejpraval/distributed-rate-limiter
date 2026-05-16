import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Key, Users, Activity, Zap } from 'lucide-react';

export const Sidebar: React.FC = () => {
    const navItems = [
        { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
        { name: 'API Keys', path: '/keys', icon: <Key size={20} /> },
        { name: 'Users', path: '/users', icon: <Users size={20} /> },
        { name: 'Monitoring', path: '/monitoring', icon: <Activity size={20} /> },
        { name: 'Simulator', path: '/simulator', icon: <Zap size={20} /> },
    ];

    return (
        <aside className="w-64 bg-slate-900 border-r border-slate-800 h-screen flex flex-col">
            <div className="p-6">
                <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
                        <Zap size={20} />
                    </div>
                    RateLimit.IO
                </h1>
            </div>
            
            <nav className="flex-1 px-4 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                                isActive 
                                    ? 'bg-primary/10 text-primary' 
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                            }`
                        }
                    >
                        {item.icon}
                        {item.name}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
};
