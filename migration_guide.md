# AWS to Render & Vercel Migration Guide

This guide outlines how to migrate your **Distributed Rate Limiter** application from AWS (EC2 and S3) to **Render** (Backend) and **Vercel** (Frontend) to save credits and simplify deployments.

---

## 1. Folder Structure & Architecture Analysis

Here is how your current codebase is structured:

*   **Backend**: A Node.js Express server written in TypeScript. It connects to:
    *   **MongoDB Atlas** (already hosted in the cloud: `mongodb+srv://...`).
    *   **Redis** (currently running as a local container on EC2 via Docker Compose).
*   **Frontend**: A React app built with Vite, TypeScript, and TailwindCSS. It currently talks to the backend using the production environment variable `VITE_API_BASE_URL` pointing to your EC2 public IP (`http://3.6.86.173:3000/api`).
*   **DevOps / CI/CD**:
    *   `docker-compose.yml` orchestrates Node.js, Redis, Prometheus, and Grafana containers.
    *   `.github/workflows/deploy.yml` automates deployment by SSH'ing into your EC2 instance and running `docker-compose up --build -d`.

### ⚠️ Important Trade-off: Prometheus & Grafana
On AWS EC2, you run Prometheus and Grafana in containers. Moving to free-tier Render and Vercel means you will **no longer have self-hosted Grafana dashboard monitoring running in the cloud** because these platforms host single web services, not multi-container docker-compose environments. 
> [!NOTE]
> You can still run Docker Compose locally on your machine to use Grafana and Prometheus for testing, but cloud-based live dashboards will be deactivated once EC2 is terminated.

---

## 2. AWS EC2 & S3: Stop vs. Terminate?

To stop spending credits on AWS, you must clean up your active resources. Here is the difference:

| Action | What happens? | Billing | When to use? |
| :--- | :--- | :--- | :--- |
| **Stop (EC2)** | Shuts down the VM. You can turn it back on later; data on the system drive is kept. | **Partial Charges Apply.** You stop paying for CPU/RAM, but you **still pay** for the EBS Storage Volume (SSD) and Elastic IP (if allocated but not attached to a running VM). | Temporary pauses (e.g. overnight or for a few days if you plan to return). |
| **Terminate (EC2)** | Permanently deletes the VM and its attached storage. | **Fully Stops Billing.** All charges for this instance cease. | When migrating permanently to another host (Render/Vercel) and you have the code saved locally/GitHub. |
| **Delete (S3)** | S3 is passive storage and cannot be "stopped". You must delete files/buckets to stop charges. | **Fully Stops Billing** once the bucket is empty and deleted. | When moving frontend hosting to Vercel. |

### Recommended Action Plan for AWS:
1. **First, complete the Render & Vercel deployment** and verify everything is working perfectly.
2. **Once verified, Terminate the EC2 instance** from your AWS EC2 Console to completely halt charges.
3. **Empty and delete the S3 Bucket** that was hosting your frontend.

---

## 3. Step 1: Set Up Cloud Redis (Upstash)

Since Render's free tier does not easily host a persistent Redis container alongside your backend, the best practice is to use a free cloud Redis provider. We recommend **Upstash Redis** (it has a generous free tier of 10,000 requests/day).

1. Go to [Upstash](https://upstash.com/) and sign up.
2. Create a new **Redis Database** (choose a region close to your Render deployment, e.g., US-East or EU-West).
3. Copy the **Redis URL** (it looks like `rediss://default:yourpassword@your-endpoint.upstash.io:6379`).
4. We have updated your `redisClient.ts` to automatically support a `REDIS_URL` environment variable.

---

## 4. Step 2: Deploy Backend to Render

1. Go to [Render](https://render.com/) and sign up.
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository.
4. Configure the service:
   * **Name**: `distributed-rate-limiter-backend`
   * **Root Directory**: `Backend`
   * **Language**: `Node`
   * **Build Command**: `npm install --include=dev && npm run build`
   * **Start Command**: `npm run start:prod`
5. Click **Advanced** and add the following **Environment Variables**:
   * `PORT`: `3000`
   * `NODE_ENV`: `production`
   * `JWT_SECRET`: `your_secure_random_string`
   * `MONGO_URI`: `mongodb+srv://tejpraval:KfTNMgJpVPturWyK@cluster0.0xs5bzs.mongodb.net/rate-limiter`
   * `REDIS_URL`: *(Your Upstash Redis connection string)*
6. Click **Deploy Web Service**. Render will build and launch your backend. Once it is running, copy the Render URL (e.g., `https://your-backend.onrender.com`).

---

## 5. Step 3: Deploy Frontend to Vercel

1. Go to [Vercel](https://vercel.com/) and sign up.
2. Click **Add New** > **Project** and import your GitHub repository.
3. In the project setup configuration:
   * **Root Directory**: Select `Frontend` (Vercel will auto-detect Vite).
   * **Framework Preset**: `Vite`
4. Expand **Environment Variables** and add:
   * **Key**: `VITE_API_BASE_URL`
   * **Value**: `https://your-backend.onrender.com/api` *(make sure to point to your new Render backend URL with `/api` path)*
5. Click **Deploy**. Vercel will build and host your frontend globally.

---

## 6. Step 4: Clean up GitHub Actions

Because you are no longer using EC2, your `.github/workflows/deploy.yml` script will fail on commits (since the EC2 instance will be stopped or terminated). 

You can safely delete `.github/workflows/deploy.yml` or rename it so GitHub ignores it. Both Vercel and Render automatically sync with your GitHub repository and redeploy on every push to `main`, which makes CI/CD completely automatic and zero-config.
