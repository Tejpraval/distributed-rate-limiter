import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon } from 'lucide-react';

export const Header: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-8">
            <div className="flex-1"></div>
            
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                        <UserIcon size={16} />
                    </div>
                    <span className="font-medium">{user?.email}</span>
                </div>
                
                <button 
                    onClick={logout}
                    className="text-slate-400 hover:text-rose-400 transition-colors p-2 rounded-lg hover:bg-slate-800"
                    title="Sign Out"
                >
                    <LogOut size={20} />
                </button>
            </div>
        </header>
    );
};
