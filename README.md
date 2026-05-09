# Distributed Rate Limiting Control Plane for Scalable API Systems

A cloud-native distributed rate limiting system designed to control API traffic, prevent abuse, and maintain system stability under high concurrency.

This project implements a production-style Token Bucket rate limiter using Redis Lua scripting for atomic operations, Dockerized infrastructure, AWS deployment, observability with Prometheus & Grafana, and CI/CD automation using GitHub Actions.

---

## 🚀 Features

- Distributed Token Bucket Rate Limiting
- Atomic Redis Lua Script Operations
- API Key–Based User Tier Limits
- Redis Caching Layer
- MongoDB Request Logging
- Dockerized Infrastructure
- AWS EC2 Cloud Deployment
- Prometheus Metrics Collection
- Grafana Monitoring Dashboard
- GitHub Actions CI/CD Automation
- High-Concurrency Request Handling

---

## 🏗️ System Architecture

```text
Client
   ↓
Node.js + Express API Server
   ↓
Rate Limiter Middleware
   ↓
Redis (Token Storage + Lua Scripts)
   ↓
MongoDB Atlas (Logs + Config)

Monitoring Stack:
Prometheus → Grafana  
```
⚙️ Tech Stack
Backend
Node.js
Express.js
TypeScript
Data Layer
Redis (Lua Scripting)
MongoDB Atlas
Cloud & DevOps
Docker
Docker Compose
AWS EC2
GitHub Actions (CI/CD)
Monitoring
Prometheus
Grafana
Core Concepts
Distributed Systems
Token Bucket Algorithm
Concurrency Control
Atomic Operations
Observability
🔥 Problem Statement

In distributed systems, uncontrolled API traffic can:

overload servers
cause denial-of-service issues
create unfair resource consumption

This project solves that problem by implementing a scalable distributed rate limiter capable of enforcing configurable request limits across multiple services and users.  
