import React from 'react';

interface Column<T> {
    header: string;
    accessor: keyof T | ((row: T) => React.ReactNode);
}

interface TableProps<T> {
    data: T[];
    columns: Column<T>[];
    keyExtractor: (row: T) => string;
}

export function Table<T>({ data, columns, keyExtractor }: TableProps<T>) {
    return (
        <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-800">
            <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/50 text-slate-400 border-b border-slate-700">
                    <tr>
                        {columns.map((col, idx) => (
                            <th key={idx} className="px-6 py-4 font-medium">{col.header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="px-6 py-8 text-center text-slate-500">
                                No data available
                            </td>
                        </tr>
                    ) : (
                        data.map((row) => (
                            <tr key={keyExtractor(row)} className="hover:bg-slate-700/50 transition-colors">
                                {columns.map((col, idx) => (
                                    <td key={idx} className="px-6 py-4">
                                        {typeof col.accessor === 'function' 
                                            ? col.accessor(row) 
                                            : (row[col.accessor] as React.ReactNode)}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
