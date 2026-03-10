# PanelSizer

NEC residential electrical panel sizing calculator. Wraps `Dwelling.py` with a Flask API and a Next.js frontend.

**Stack:** Python / Flask · Next.js 16 · Tailwind CSS v4 · TypeScript

---

## Local Setup

### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 app.py          # runs on http://localhost:8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev             # runs on http://localhost:5173
```

Open **http://localhost:5173**.

---

## Free Hosting (Vercel + Render)

### 1. Push to GitHub
```bash
git init && git add . && git commit -m "initial commit"
gh repo create panelsizer --public --source=. --push
```

### 2. Deploy backend → Render
1. Go to [render.com](https://render.com) → **New Web Service** → connect your repo.
2. Set **Root Directory** to `backend`.
3. **Build command:** `pip install -r requirements.txt`
4. **Start command:** `python3 app.py`
5. Copy the service URL (e.g. `https://panelsizer-api.onrender.com`).

> Note: Render free tier sleeps after inactivity — first request may take ~30 s.

### 3. Deploy frontend → Vercel
1. Go to [vercel.com](https://vercel.com) → **New Project** → import your repo.
2. Set **Root Directory** to `frontend`.
3. Add environment variable:
   ```
   BACKEND_URL=https://panelsizer-api.onrender.com
   ```
4. Deploy.
