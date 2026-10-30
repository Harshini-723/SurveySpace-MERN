# SurveySpace — MERN Survey App

A responsive survey app based on the supplied screenshot: lavender page background, centered SurveySpace brand, five randomly selected questions, progress bar, selectable answer cards, submit screen, saved answers, and “Take Another Survey”.

## Project structure

- `client/` — React + Vite frontend
- `server/` — Express + MongoDB backend

## 1. Run locally

Install Node.js (LTS) first. Open a terminal in the `SurveySpace-MERN` folder.

### Terminal 1 — backend

```bash
cd server
npm install
```

Create `server/.env` by copying `.env.example`, then set your MongoDB connection string:

```env
PORT=5000
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/surveyspace?retryWrites=true&w=majority
CLIENT_URL=http://localhost:5173
```

Start the backend:

```bash
npm run dev
```

The API runs at `http://localhost:5000`.

### Terminal 2 — frontend

Open a second terminal in the project folder:

```bash
cd client
npm install
```

Create `client/.env` by copying `.env.example`:

```env
VITE_API_URL=http://localhost:5000
```

Start React:

```bash
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`).

## 2. Create MongoDB Atlas database

1. Sign in to MongoDB Atlas and create a free cluster.
2. In **Database Access**, create a database user and password.
3. In **Network Access**, add the IP access rule required for your deployment. For a simple Render setup, you can temporarily allow `0.0.0.0/0`; use a stronger network policy where available.
4. Open **Connect → Drivers**, choose Node.js, and copy the connection string.
5. Replace the username, password, and database name in `server/.env`. If your password contains special characters, URL-encode them.
6. Never put the MongoDB URI in the React `client` folder or commit either `.env` file.

## 3. Deploy backend to Render

1. Push this project to a GitHub repository.
2. In Render, choose **New → Web Service** and connect the repository.
3. Set **Root Directory** to `server`.
4. Set **Build Command** to `npm install`.
5. Set **Start Command** to `npm start`.
6. Add these environment variables in Render:
   - `MONGODB_URI` = your Atlas connection string
   - `CLIENT_URL` = your deployed Vercel frontend URL (add it after deploying the frontend)
   - `NODE_ENV` = `production`
7. Deploy. Copy the Render service URL, for example `https://your-service.onrender.com`.
8. Check `https://your-service.onrender.com/api/health`.

## 4. Deploy frontend to Vercel

1. In Vercel, choose **Add New → Project** and import the same GitHub repository.
2. Set **Root Directory** to `client`.
3. Framework preset: **Vite**.
4. Add environment variable:
   - `VITE_API_URL` = your Render URL, with no trailing slash, e.g. `https://your-service.onrender.com`
5. Deploy.
6. Copy your Vercel domain and add it to Render's `CLIENT_URL` environment variable. Redeploy the Render service if required.

## Notes

- Frontend and backend are separate deployments: Vercel hosts the React site; Render hosts the Express API; MongoDB Atlas stores submitted survey responses.
- The backend chooses five random questions from its question bank each time the form is opened.
- Submitted responses are stored in the `surveyresponses` collection.
- Do not share your Atlas password or commit `.env` files.
