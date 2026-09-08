# 🚀 BUG HUNT — Vercel & Production Deployment Guide

This guide details how to deploy the **BUG HUNT** technical competition platform for your tournament.

---

## 🏗️ Architecture Overview

| Component | Technology | Deployed On | Why |
| :--- | :--- | :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Monaco Editor | **Vercel** | Global edge CDN, instantaneous load times, free SSL, zero-config SPA routing. |
| **Backend** | Express, SQLite, Socket.IO, Python 3 Runner | **Render / Railway / VPS / ngrok** | Requires persistent disk for SQLite scores, stateful WebSockets for real-time projector & leaderboard broadcasts, and Python 3 runtime for Round 3 code execution. |

---

## Part 1: Deploying Frontend to Vercel

### Method A: Deploy via GitHub (Recommended)

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Deploy Bug Hunt platform"
   git push origin main
   ```

2. **Import to Vercel**:
   * Go to [vercel.com/new](https://vercel.com/new).
   * Import your **`bug-hunt`** repository.
   * In the project configuration:
     * **Framework Preset**: `Vite`
     * **Root Directory**: Click *Edit* and select **`client`** (or leave as root; the root `vercel.json` also handles root builds automatically).
     * **Build Command**: `npm run build`
     * **Output Directory**: `dist`
   * Under **Environment Variables**:
     * Key: `VITE_API_URL`
     * Value: Your deployed backend URL (e.g. `https://bughunt-server.onrender.com` or your ngrok URL `https://xxxx.ngrok-free.app`).
   * Click **Deploy**.

3. **SPA Routing**:
   * The included `vercel.json` handles all SPA rewrites automatically, ensuring direct URLs like `/admin`, `/leaderboard`, `/projector`, and `/verify/:id` load without 404 errors.

---

### Method B: Deploy via Vercel CLI

From your terminal inside the project directory:

```bash
cd client
npx vercel
```
* Follow the interactive prompts (Link to existing project: `N`, Project name: `bug-hunt-2026`).
* When prompted for production deployment:
```bash
npx vercel --prod
```

---

## Part 2: Hosting the Backend for the Competition

Choose the option that best matches your event setup:

### Option 1: Render.com / Railway (Best for Online/Remote Tournaments)

1. Sign up at [Render.com](https://render.com).
2. Click **New +** → **Web Service**.
3. Connect your repository.
4. Set the following settings:
   * **Root Directory**: `server`
   * **Environment**: `Node`
   * **Build Command**: `npm install`
   * **Start Command**: `npm start`
5. Click **Deploy**.
6. Copy the provided URL (e.g. `https://bug-hunt-api.onrender.com`) and add it to your Vercel project's environment variables as `VITE_API_URL`.

---

### Option 2: Organizer Laptop with ngrok / Cloudflare Tunnel (Best for On-Campus / College Lab Events)

If the tournament is held on campus, you can run the server directly on the event organizer's machine. This guarantees zero server costs and keeps the competition database under your physical control.

1. **Start the backend locally**:
   ```bash
   cd server
   npm run dev
   ```
   *(Server starts on `http://localhost:5000`)*

2. **Expose the port using ngrok**:
   ```bash
   ngrok http 5000
   ```
   *(Or using Cloudflare: `cloudflared tunnel --url http://localhost:5000`)*

3. **Connect Vercel**:
   * Copy the public HTTPS URL (e.g. `https://a1b2-c3d4.ngrok-free.app`).
   * In Vercel Project Settings → **Environment Variables**, set:
     ```
     VITE_API_URL = https://a1b2-c3d4.ngrok-free.app
     ```
   * Redeploy the frontend.

All students will access the lightning-fast Vercel website on their lab computers, while submissions and evaluations are processed in real-time by your host machine!

---

## ⚙️ Environment Variables Reference

| Variable | Location | Description | Example |
| :--- | :--- | :--- | :--- |
| `VITE_API_URL` | Vercel (Frontend) | Target backend server URL for API & WebSockets. | `https://bughunt-api.onrender.com` |
| `PORT` | Server | HTTP port for Express server (defaults to 5000). | `5000` |
| `JWT_SECRET` | Server | Secret key for signing organizer admin JWT tokens. | `your_custom_jwt_secret_here` |
| `ADMIN_USERNAME` | Server | Initial admin username (default `admin`). | `organizer2026` |
| `ADMIN_PASSWORD` | Server | Initial admin password (default `admin123`). | `TournamentAdmin#2026` |

---

## 🎯 Tournament Day Checklist

1. [ ] Deploy backend and confirm `GET /api/health` returns `{"status":"online"}`.
2. [ ] Deploy frontend to Vercel and verify `VITE_API_URL` is configured.
3. [ ] Access Admin Command Center:
   - Navigate directly to `https://your-app.vercel.app/#admin` (or press <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>A</kbd> on any page).
   - Sign in with your admin credentials.
   - For security, go to **Event Settings** -> **Administrator Security & Credentials** to change your password before the event starts.
4. [ ] Projector Display: Launch `https://your-app.vercel.app/#projector` on the auditorium screen in full screen (<kbd>F11</kbd>).
5. [ ] Announce participant registration URL: `https://your-app.vercel.app/#register`.
   - Participants only see competition registration and rules (all organizer controls & projector links are hidden from participants).
6. [ ] In the Admin Command Center, press **Start Round 1** when the timer begins!
