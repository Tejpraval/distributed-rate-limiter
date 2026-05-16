export interface User {
    id: string;
    email: string;
    role: 'admin' | 'user';
    tier: 'basic' | 'premium';
}

export interface ApiKey {
    id: string;
    name: string;
    environment: 'live' | 'test';
    maskedKey: string;
    createdAt: string;
    totalRequests?: number;
    lastUsedAt?: string;
}

export interface TrafficData {
    timestamp: string;
    allowed: number;
    blocked: number;
}

export interface SummaryStats {
    totalRequests: number;
    allowedRequests: number;
    blockedRequests: number;
    activeApiKeys: number;
    activeUsers: number;
}
