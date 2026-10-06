# Deployment Guide: Skin Intelligence Platform 🐳☁️

This guide explains how to run the Skin Intelligence Platform using **Docker containers** (locally) and how to deploy it live on **Cloud Services** (Vercel + Render + Cloud Database).

---

## 1. Quick Local Deployment with Docker (Recommended for Review/Viva)

### Prerequisites:
- Ensure **Docker Desktop** is installed and running on your computer.

### Step 1: Start All Services (One Command)
Open a terminal in the project root directory (`skin-intelligence-platform`) and run:

```bash
docker compose up --build
```

### What Docker Does Automatically:
1. Starts the **PostgreSQL Database** container (`skin_intelligence_db`) on port `5432`.
2. Builds and starts the **Python FastAPI Backend** container (`skin_intelligence_backend`) with all 4 AI/ML models on port `8001`.
3. Builds and starts the **Next.js Frontend** container (`skin_intelligence_frontend`) on port `3000`.

### Step 2: Open in Your Browser
- **User Dashboard & Platform**: [http://localhost:3000](http://localhost:3000)
- **Interactive Backend API Docs**: [http://localhost:8001/docs](http://localhost:8001/docs)

### To Stop the Containers:
Press `Ctrl + C` in the terminal, or run:
```bash
docker compose down
```

---

## 2. Cloud Deployment Guide (Live on Any Device Worldwide)

### Architecture:
- **Frontend**: Hosted on [Vercel](https://vercel.com) (Global CDN).
- **Backend & AI Engine**: Hosted on [Render](https://render.com) (Web Service container).
- **Database**: Hosted on [Supabase](https://supabase.com) or [Neon](https://neon.tech) (Serverless PostgreSQL).

---

### Step-by-Step Cloud Setup:

#### 1. Cloud Database (Supabase / Neon):
1. Create a free account at [Supabase](https://supabase.com) or [Neon](https://neon.tech).
2. Create a new PostgreSQL project.
3. Copy your connection string:
   ```text
   postgresql://postgres:[PASSWORD]@[HOST]:5432/[DB_NAME]
   ```

#### 2. Backend Deployment on Render:
1. Log in to [Render](https://render.com) and click **New + > Web Service**.
2. Connect your GitHub repository.
3. Choose **Docker** as the runtime (or Root Directory `backend` with Python runtime).
4. Set Environment Variables:
   - `DATABASE_URL`: Your Supabase/Neon PostgreSQL connection string.
   - `GOOGLE_AI_STUDIO_API_KEY`: Your Gemini API key (optional).
5. Deploy! Render will give you a public URL (e.g., `https://skin-intelligence-api.onrender.com`).

#### 3. Frontend Deployment on Vercel:
1. Log in to [Vercel](https://vercel.com) and click **Add New > Project**.
2. Select your repository and set the **Root Directory** to `frontend`.
3. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL`: Your Render backend URL (e.g., `https://skin-intelligence-api.onrender.com`).
4. Click **Deploy**. Vercel will give you a live public link (e.g., `https://skin-intelligence.vercel.app`).

Anyone can now access the full application from any phone, tablet, or PC worldwide!
