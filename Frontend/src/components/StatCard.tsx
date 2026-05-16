import React from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: {
        value: number;
        isPositive: boolean;
    };
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend }) => {
    return (
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-slate-400 font-medium text-sm">{title}</h3>
                <div className="text-slate-500">{icon}</div>
            </div>
            <div className="flex items-end justify-between mt-auto">
                <span className="text-3xl font-bold text-slate-100">{value}</span>
                {trend && (
                    <span className={`text-sm font-medium ${trend.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {trend.isPositive ? '+' : ''}{trend.value}%
                    </span>
                )}
            </div>
        </div>
    );
};
