# Distributed Rate Limiting Control Plane 
**Master Project Documentation**

---

## 1. What Does This Project Actually Do? (The "Netflix" Analogy)

To understand this project, it is crucial to understand *who* your user is. 
If Netflix is a **Consumer Application** (normal everyday people use it to watch movies), your project is an **Enterprise Infrastructure Application** (other Software Engineers and Companies use it to protect their servers).

**The Scenario:**
Imagine a company built an extremely expensive AI Image Generator API. If one malicious person writes a tiny program that asks for 50,000 images per second, the AI servers will immediately catch fire and crash. The company will go bankrupt paying AWS bills.

**Your Project:**
You built the **Bouncer at the club**. Your "Distributed Rate Limiter" sits completely in front of the AI Image Generator. Before the AI even knows someone is asking for an image, the request hits your system.

*   Every client is given a secret `x-api-key`.
*   If a college student (Basic Tier) is paying $5/month, your Bouncer instantly checks MongoDB and Redis, realizes they are basic, and only allows **100 requests per minute**. If they ask for 101, your Bouncer slaps them with a `429 Too Many Requests` error, and the AI server is kept perfectly safe.
*   If Microsoft (Premium Tier) is paying $5,000/month, your Bouncer lets them hit **500 requests per minute**.

You built a highly-scalable, monetization and security gateway.

---

## 2. Why Did We Use These Specific Technologies?

You could write a basic rate limiter using just Javascript arrays, so why did we use all these complex tools?

*   **Redis:** Node.js memory resets every time the server restarts. Normal databases (like MongoDB or PostgreSQL) are too slow; reading/writing to a hard drive takes 50+ milliseconds. Redis saves data purely in **RAM (Memory)**. It can look up a user's token bucket in less than 1 millisecond. We strictly needed Redis for blazing-fast speed.
*   **Lua Scripting:** Imagine two API requests from the exact same user hit the Bouncer at the exact same millisecond. Node.js might check Redis, say "They both have 1 token left!", let both through, and now the user stole an extra request. A Lua Script executes completely *inside* Redis **atomically**. This absolutely guarantees that while one request is taking a token, the other request is completely frozen until the first one is done. It fixes "Race Conditions".
*   **Docker & Docker Compose:** If you handed your code to your friend, it might crash on their Macbook because they have a different version of Node or lack Redis. Docker wraps your Node app and Redis inside isolated "container boxes" where the environment is perfectly frozen. It guarantees it will run exactly the same way on a Windows laptop as it does on an AWS Cloud server.
*   **Prometheus:** A powerful data scraper. Without it, you are flying blind. Prometheus is designed explicitly to grab millions of tiny numeric metrics (like request counts) very efficiently over time without slowing your Node.js app down.
*   **Grafana:** Prometheus just holds raw, ugly numbers. Grafana connects to Prometheus and draws beautiful, live graphical dashboards so human engineers can visualize traffic spikes and system outages instantly.
*   **Curl:** A universal terminal tool that allows developers to forge fake HTTP requests with custom headers (like `x-api-key`). Web browsers cannot do this easily, making `curl` mandatory for API testing.

---

## 3. Directory Breakdown: What Happens if a File Goes Missing?

Here is a breakdown of your `distributed-rate-limiter` repository and the catastrophic results if a file was deleted:

### Infrastructure Files
*   **`docker-compose.yml`**: The blueprint that tells Docker to connect Node, Redis, Prometheus, and Grafana together on a private network.
    *   *If missing:* You cannot start the infrastructure. You would have to manually type 5 massive terminal commands to link containers.
*   **`prometheus.yml`**: Tells the Prometheus container exactly which IP/Port to "scrape" data from.
    *   *If missing:* Grafana will show completely blank charts because Prometheus doesn't know where the Node API is.
*   **`.github/workflows/deploy.yml`**: The CI/CD script that tells GitHub how to SSH into your EC2 server.
    *   *If missing:* Automated deployments break. You are forced to manually SSH into the server to `git pull` every time you update code.

### Backend Application Files (`/Backend`)
*   **`package.json`**: The manifest listing all third-party libraries (Express, Mongoose, Prom-client).
    *   *If missing:* `npm install` fails. Docker cannot build your API image because it doesn't know what libraries to download.
*   **`src/index.ts`**: The "Heart" of the application. It boots the Express server, connects the Database, and routes traffic.
    *   *If missing:* The server crashes instantly. The application literally does not exist.
*   **`src/middleware/rateLimiter.ts`**: The "Brain" of the application. It contains the Lua script and checks if the user has tokens left.
    *   *If missing:* Your API loses its Bouncer. It becomes completely naked and unprotected. Any user can send infinite requests and crash your system.
*   **`src/db.ts`**: Connects Node to the MongoDB cluster over the internet.
    *   *If missing:* The system cannot log requests or look up user access tiers.
*   **`src/redisClient.ts`**: Connects Node to the Redis container cache.
    *   *If missing:* The Lua script cannot run, and the rate limiter completely breaks.
*   **`src/models/User.ts` & `RequestLog.ts`**: Defines the "shape" of the data stored in MongoDB (e.g., that a User *must* have an `apiKey` and a `tier`).
    *   *If missing:* The app cannot cleanly save or retrieve data from the persistent database.
*   **`.env`**: (Excluded from GitHub) Holds your MongoDB usernames, passwords, and server ports.
    *   *If missing:* The server throws crashing errors because it has no passwords to connect to external systems.
