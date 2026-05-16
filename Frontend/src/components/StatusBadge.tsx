import React from 'react';

interface StatusBadgeProps {
    status: 'success' | 'warning' | 'error' | 'neutral';
    text: string;
}

const styles = {
    success: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
    warning: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
    error: 'bg-rose-400/10 text-rose-400 border-rose-400/20',
    neutral: 'bg-slate-400/10 text-slate-400 border-slate-400/20',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, text }) => {
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
            {text}
        </span>
    );
};
