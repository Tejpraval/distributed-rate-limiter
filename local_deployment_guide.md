# 💻 Local Deployment & Demonstration Guide

This guide explains how to deploy and run the **Distributed Rate Limiter** project locally on your machine. It also highlights why using a local setup is highly superior to free cloud hosting (like Render/Vercel) when presenting or demonstrating this project.

---

## 🚀 Quick Start Instructions

Follow these steps to run the entire system (Frontend, Backend, Redis, Prometheus, and Grafana) locally.

### 📋 Prerequisites
* Install and open [Docker Desktop](https://www.docker.com/products/docker-desktop/).
* Make sure Node.js (v18 or higher) is installed on your machine.

---

### Step 1: Spin up the Infrastructure (Backend + Databases + Monitoring)
Open your terminal in the root directory `distributed-rate-limiter` and run:
```bash
docker-compose up --build
```
*This command downloads, builds, and starts all the backend containers in a single private Docker network.*

### Step 2: Start the Frontend App
Open a **second, separate terminal window**, navigate to the frontend folder, and boot up the Vite development server:
```bash
cd Frontend
npm install
npm run dev
```

### Step 3: Run the Demo
* **Frontend Dashboard & Simulator:** Open [http://localhost:5173](http://localhost:5173) in your browser.
* **Grafana Monitoring:** Open [http://localhost:3001](http://localhost:3001) (Default Login: Username: `admin` | Password: `admin`).

---

## 📊 Local Port Mapping Reference

| Service | Port | Host Address | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend** | `5173` | `http://localhost:5173` | React UI & Traffic Simulator |
| **Backend API** | `3000` | `http://localhost:3000` | Node.js Express server |
| **Redis Cache** | `6379` | `localhost:6379` | Token bucket Lua scripts memory |
| **Grafana** | `3001` | `http://localhost:3001` | Live metrics visualization |
| **Prometheus** | `9090` | `http://localhost:9090` | Time-series scraping database |

---

## 💡 Why Local is Better than Render/Vercel for Demonstrations

While deploying your project to Render and Vercel is great for sharing a live link on your resume, **running it locally is far superior when actually presenting the project** to interviewers, teachers, or recruiters. Here is why:

### 1. Zero Network Latency (The Geography Factor)
* **Cloud (Render):** If your backend is in Oregon (US-West) and you are testing from India, every API request has to travel across the globe and back, adding **250ms - 300ms** of latency. 
* **Local:** All components run on your local machine (`localhost`), bringing the latency down to **0ms - 1ms**. This makes the traffic simulator run smoothly at extreme speeds.

### 2. High-Throughput (No Request Throttling)
* **Cloud (Render Free Tier):** Under heavy concurrent loads (like generating 100+ requests per second), Render's free tier CPU will immediately throttle your backend, causing the server to lag, delay logs, or even crash.
* **Local:** The backend runs on your machine's full processor power, allowing you to test high-concurrency scenarios without artificial limits.

### 3. Unlimited Redis Requests
* **Cloud (Upstash):** The free tier of Upstash Redis caps you at **10,000 requests per day**. If you run a high-speed traffic simulation, you will exhaust your entire daily limit in a few minutes, crashing your demo.
* **Local:** Your local Redis Docker container is running on your RAM. It has **no limits** and can handle millions of requests for free.

### 4. Full Observability (Grafana + Prometheus)
* **Cloud (Render/Vercel):** Free hosting only supports single stateless containers. You **cannot run Grafana and Prometheus** side-by-side with your backend in the cloud on the free tier.
* **Local:** The Docker Compose file boots up a local Prometheus scraper and Grafana. You can actually open Grafana, run the traffic simulator, and show real-time graphs of incoming traffic, allowed requests, and 429 blocked requests. This is the **ultimate highlight** of this system engineering project!

---

## 🛠️ How to Deliver a Great Presentation (Recruiter / Demo Checklist)

1. Open your browser with **two windows side-by-side**:
   * **Left Window:** The local React Traffic Simulator (`http://localhost:5173/simulator`).
   * **Right Window:** The local Grafana Dashboard (`http://localhost:3001`).
2. Start the simulation at **10-20 Requests Per Second (RPS)**.
3. Show the visitor how the simulator allowed requests match your user's tier (e.g., Basic vs Premium).
4. Watch the **Grafana Dashboard** live-update its graph lines in real-time as traffic scales up.
5. Highlight that you built this using **Redis Lua Scripting** to ensure operations are atomic and prevent race conditions.
