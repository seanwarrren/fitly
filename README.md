# fit.ly

A wardrobe-based outfit generator app. Users upload photos of individual clothing items, the backend removes the image background, and the user classifies each garment with metadata (type, color, formality, etc.). Saved garments can later be combined into generated outfits.

This is a class-project MVP — clean, understandable, and not overengineered.

## Tech Stack

| Layer              | Technology                                  |
| ------------------ | ------------------------------------------- |
| Frontend           | Next.js (App Router) + React + TypeScript   |
| Backend            | FastAPI + Python                            |
| Database           | MongoDB Atlas                               |
| Background Removal | rembg                                       |
| Deployment         | Render (frontend + backend)                 |

## Folder Structure

```
fitly/
├── frontend/          # Next.js app
│   ├── src/
│   │   ├── app/       # App Router pages
│   │   ├── components/
│   │   └── lib/       # API helpers, constants
│   └── public/
├── backend/
│   ├── app/
│   │   ├── main.py    # FastAPI entry point
│   │   ├── routes/    # API route modules
│   │   ├── services/  # Business logic
│   │   ├── models/    # Pydantic schemas
│   │   ├── db/        # MongoDB connection
│   │   └── utils/     # Helpers
│   └── uploads/       # Local image storage (MVP)
│       ├── originals/
│       └── processed/
├── render.yaml        # Render Blueprint (IaC)
└── README.md
```

## Architecture

- **Image ingestion is two-stage:** upload/process the image first, then save garment metadata separately.
- **Images are stored on the local filesystem** (`backend/uploads/`) for the MVP — MongoDB stores metadata and relative image paths, not binaries.
- **No authentication yet** — a hardcoded `demo-user` userId is used where needed.
- **Route handlers are thin** — business logic lives in `services/`.

### Image Upload Pipeline

1. The frontend sends a `POST /api/upload` with an image file.
2. The backend validates the file (extension, content type, size).
3. The original image is saved to `backend/uploads/originals/`.
4. `rembg` removes the background and saves a transparent PNG to `backend/uploads/processed/`.
5. The API returns a `fileId` and relative paths for both images.
6. Uploaded images are served as static files so the frontend can display them.

Garment metadata (type, color, formality, etc.) is saved in a **separate** step after the user classifies the garment.

---

## Running Locally

### Prerequisites

- Node.js 18+
- Python 3.10+
- A MongoDB Atlas cluster (free tier works)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API runs at **http://localhost:8000**. Check health at `GET /health`.

> **Note:** The first call to `/api/upload` will be slow (~30 s) because `rembg` downloads its ML model on first use. Subsequent uploads are fast.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs at **http://localhost:3000**.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable       | Description                          | Example                                                                 |
| -------------- | ------------------------------------ | ----------------------------------------------------------------------- |
| `MONGO_URI`    | MongoDB Atlas connection string      | `mongodb+srv://user:pass@cluster.mongodb.net/?appName=fitly`            |
| `FRONTEND_URL` | Deployed frontend URL (for CORS)     | `https://fitly-frontend.onrender.com`                                   |

### Frontend (`frontend/.env.local`)

| Variable                   | Description                      | Example                                                 |
| -------------------------- | -------------------------------- | ------------------------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL` | Deployed backend URL             | `https://fitly-backend.onrender.com`                    |

For local development, use:

```
# backend/.env
MONGO_URI=mongodb+srv://...
FRONTEND_URL=http://localhost:3000

# frontend/.env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

---

## Deploying on Render

This project is configured for deployment on [Render](https://render.com) using GitHub-based continuous deployment. Both the backend and frontend are deployed as separate **Web Services** in the same Render dashboard.

### Option A: One-Click Deploy with Blueprint

The repo includes a `render.yaml` Blueprint file. To use it:

1. Push this repo to GitHub.
2. Go to the [Render Dashboard](https://dashboard.render.com).
3. Click **New** → **Blueprint**.
4. Connect your GitHub repo.
5. Render will detect `render.yaml` and create both services.
6. Set the required environment variables for each service (see below).
7. Deploy.

### Option B: Manual Setup

#### Deploy the Backend

1. In the Render Dashboard, click **New** → **Web Service**.
2. Connect your GitHub repository.
3. Configure:

| Setting         | Value                                               |
| --------------- | --------------------------------------------------- |
| **Name**        | `fitly-backend`                                     |
| **Root Dir**    | `backend`                                           |
| **Runtime**     | Python                                              |
| **Build Cmd**   | `pip install -r requirements.txt`                   |
| **Start Cmd**   | `uvicorn app.main:app --host 0.0.0.0 --port $PORT`  |

4. Add environment variables:

| Key              | Value                                                    |
| ---------------- | -------------------------------------------------------- |
| `MONGO_URI`      | Your MongoDB Atlas connection string                     |
| `FRONTEND_URL`   | `https://fitly-frontend.onrender.com` (your frontend URL)|
| `PYTHON_VERSION` | `3.12.3`                                                 |

5. Click **Create Web Service**.

#### Deploy the Frontend

1. Click **New** → **Web Service**.
2. Connect the same GitHub repository.
3. Configure:

| Setting         | Value                               |
| --------------- | ----------------------------------- |
| **Name**        | `fitly-frontend`                    |
| **Root Dir**    | `frontend`                          |
| **Runtime**     | Node                                |
| **Build Cmd**   | `npm install && npm run build`      |
| **Start Cmd**   | `npm run start -- -p $PORT`         |

4. Add environment variables:

| Key                        | Value                                        |
| -------------------------- | -------------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL` | `https://fitly-backend.onrender.com`         |
| `NODE_VERSION`             | `20.11.1`                                    |

5. Click **Create Web Service**.

### After Deploying

- **Auto-deploy:** Render automatically deploys on every push to the connected branch (usually `main`).
- **Update env vars:** If your Render URLs differ from the examples above, update `FRONTEND_URL` on the backend and `NEXT_PUBLIC_API_BASE_URL` on the frontend to match.
- **First upload will be slow:** The `rembg` ML model (~170 MB) is downloaded on the first `/api/upload` call. Subsequent uploads are fast.

### MongoDB Atlas

MongoDB Atlas runs independently of Render:

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Create a database user with read/write access.
3. Whitelist `0.0.0.0/0` in **Network Access** so Render can connect (or whitelist Render's static IPs if available).
4. Copy the connection string and set it as `MONGO_URI` in the backend environment variables.

---

## Testing the API

### Upload an image

```bash
curl -X POST http://localhost:8000/api/upload/ \
  -F "file=@/path/to/your/image.jpg"
```

Response:

```json
{
  "success": true,
  "fileId": "a1b2c3d4...",
  "originalImagePath": "/uploads/originals/a1b2c3d4.jpg",
  "processedImagePath": "/uploads/processed/a1b2c3d4.png"
}
```

### Save garment metadata

```bash
curl -X POST http://localhost:8000/api/garments/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Navy T-Shirt",
    "category": "tops",
    "garmentType": "t-shirt",
    "primaryColor": "navy",
    "formality": "casual",
    "thickness": "light",
    "pattern": "solid",
    "weatherSuitability": ["warm", "hot"],
    "notes": "Favorite summer shirt",
    "originalImagePath": "/uploads/originals/a1b2c3d4.jpg",
    "processedImagePath": "/uploads/processed/a1b2c3d4.png"
  }'
```

### List garments

```bash
curl http://localhost:8000/api/garments/demo-user
```

### Delete a garment

```bash
curl -X DELETE http://localhost:8000/api/garments/<garment-id>
```

---

## Known MVP Limitations

| Limitation                        | Detail                                                                                           |
| --------------------------------- | ------------------------------------------------------------------------------------------------ |
| **Image storage is local**        | Images are saved on the backend filesystem (`backend/uploads/`). On Render's free tier, the filesystem is ephemeral — uploaded images will be lost on redeploy. For a production app, migrate to cloud storage (e.g. AWS S3, Cloudinary). |
| **No authentication**             | A hardcoded `demo-user` userId is used everywhere. There is no login, signup, or session management. |
| **Rule-based outfit generation**  | Outfit generation uses simple keyword-matching rules, not an LLM. It matches garment metadata against weather/occasion cues extracted from the prompt. |
| **No image editing**              | There is no cropping, rotation, or manual background editing after upload. |
| **Single user**                   | The app only supports one user (`demo-user`). Multi-user support requires authentication. |
