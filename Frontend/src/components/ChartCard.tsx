import React from 'react';

interface ChartCardProps {
    title: string;
    children: React.ReactNode;
    action?: React.ReactNode;
}

export const ChartCard: React.FC<ChartCardProps> = ({ title, children, action }) => {
    return (
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-slate-100 font-medium">{title}</h3>
                {action && <div>{action}</div>}
            </div>
            <div className="h-72 w-full">
                {children}
            </div>
        </div>
    );
};
